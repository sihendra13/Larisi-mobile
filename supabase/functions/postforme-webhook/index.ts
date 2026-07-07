import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "npm:web-push"

// ── Verifikasi signature webhook PostForMe (skema Svix) ─────────────────────
// Secret yang dikembalikan PostForMe saat create webhook berformat "whsec_..."
// — ini konvensi standar Svix (dipakai juga oleh Stripe & platform lain yang
// pakai Svix sebagai webhook delivery service). Skema Svix:
//   headers: svix-id, svix-timestamp, svix-signature (space-separated "v1,<base64>")
//   signed content: "{svix-id}.{svix-timestamp}.{rawBody}"
//   HMAC-SHA256 pakai secret setelah "whsec_" di-strip lalu base64-decode
// Referensi: https://docs.svix.com/receiving/verifying-payloads/how-manual
//
// Fallback: kalau header svix-* tidak ada (berarti asumsi Svix salah), tetap
// fail-open + log supaya bisa dicek header asli dari traffic nyata pertama,
// BUKAN langsung reject — sampai skema ini confirmed dari 1 event nyata.
async function hmacSha256Base64(secretBytes: Uint8Array, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  return Uint8Array.from(bin, c => c.charCodeAt(0))
}

async function verifySignature(req: Request, rawBody: string, secret: string): Promise<{ valid: boolean; reason: string }> {
  if (!secret) return { valid: true, reason: "NO_SECRET_CONFIGURED_SKIP_VERIFY" }

  const svixId = req.headers.get("svix-id") || req.headers.get("webhook-id")
  const svixTimestamp = req.headers.get("svix-timestamp") || req.headers.get("webhook-timestamp")
  const svixSignature = req.headers.get("svix-signature") || req.headers.get("webhook-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return { valid: false, reason: `NO_SVIX_HEADERS_FOUND (seen: ${Array.from(req.headers.keys()).join(",")})` }
  }

  try {
    const secretBytes = base64ToBytes(secret.startsWith("whsec_") ? secret.slice(6) : secret)
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`
    const expected = await hmacSha256Base64(secretBytes, signedContent)

    // svix-signature bisa berisi beberapa "v1,<base64>" dipisah spasi (versi rotasi secret)
    const candidates = svixSignature.split(" ").map(s => s.split(",")[1]).filter(Boolean)
    if (candidates.includes(expected)) {
      return { valid: true, reason: "MATCHED_SVIX_SIGNATURE" }
    }
    return { valid: false, reason: `SVIX_SIGNATURE_MISMATCH (expected=${expected}, got=${svixSignature})` }
  } catch (e: any) {
    return { valid: false, reason: `SVIX_VERIFY_ERROR: ${e.message}` }
  }
}

serve(async (req: Request) => {
  const rawBody = await req.text()
  console.log("[postforme-webhook] HEADERS:", JSON.stringify(Object.fromEntries(req.headers.entries())))
  console.log("[postforme-webhook] BODY:", rawBody)

  const secret = Deno.env.get("POSTFORME_WEBHOOK_SECRET") || ""
  const sigResult = await verifySignature(req, rawBody, secret)
  if (!sigResult.valid) {
    // Fase awal: log tapi tetap proses (fail-open) sampai header/algoritma asli
    // confirmed dari traffic nyata. Setelah confirmed, ganti baris ini jadi
    // `return new Response('Bad signature', { status: 403 })`.
    console.warn("[postforme-webhook] Signature check gagal (fail-open sementara):", sigResult.reason)
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  // Parse defensif untuk 2 kemungkinan envelope shape:
  // Shape A: { event_type: 'social.post.result.created', data: {...} }
  // Shape B: object Social Post Result langsung di root (tanpa wrapper)
  const eventType = payload.event_type || payload.type || null
  const result = payload.data || payload

  if (eventType && eventType !== "social.post.result.created") {
    console.log("[postforme-webhook] Event type diabaikan:", eventType)
    return new Response("OK (ignored event type)", { status: 200 })
  }

  const postId = result.post_id
  const success = result.success
  const platformUrl = result.platform_data?.url || null
  const errorInfo = result.error || null

  if (!postId) {
    console.error("[postforme-webhook] post_id tidak ditemukan di payload:", JSON.stringify(payload))
    return new Response("Missing post_id", { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )

  // Match campaign via post_id (bukan platform_post_id — post_id adalah
  // PostForMe's own post ID, sama seperti field di webhook payload)
  const { data: campaign, error: campErr } = await supabase
    .from("campaigns")
    .select("id, user_id, platforms, post_url")
    .eq("post_id", postId)
    .maybeSingle()

  if (campErr) {
    console.error("[postforme-webhook] DB error saat cari campaign:", campErr.message)
    return new Response("DB error", { status: 500 })
  }
  if (!campaign) {
    console.warn("[postforme-webhook] Tidak ada campaign dengan post_id:", postId)
    return new Response("OK (no matching campaign)", { status: 200 })
  }
  if (!campaign.user_id) {
    console.warn("[postforme-webhook] Campaign ditemukan tapi user_id null, skip notify:", campaign.id)
    return new Response("OK (anon campaign, skip notify)", { status: 200 })
  }

  const platformLabel = (Array.isArray(campaign.platforms) && campaign.platforms[0]) || "media sosial"
  const title = success ? "Campaign berhasil tayang! 🎉" : "Campaign gagal tayang"
  const body = success
    ? `Kontenmu sudah live di ${platformLabel}.`
    : `Ada masalah saat publish ke ${platformLabel}: ${errorInfo?.message || "coba cek dashboard"}`

  // ── Insert ke notifications (in-app, dibaca realtime oleh client) ──
  const { error: notifErr } = await supabase.from("notifications").insert({
    user_id: campaign.user_id,
    campaign_id: campaign.id,
    type: "campaign_published",
    title,
    body,
    platform: platformLabel,
    post_url: platformUrl || campaign.post_url,
    success: !!success,
    error_message: errorInfo ? JSON.stringify(errorInfo) : null,
  })
  if (notifErr) {
    console.error("[postforme-webhook] Gagal insert notification:", notifErr.message)
    // Tetap lanjut coba kirim push walau insert notif gagal
  }

  // ── Kirim Web Push ke semua device milik user ini ──
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("user_id", campaign.user_id)

  if (subs && subs.length > 0) {
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY") ?? ""
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY") ?? ""
    webpush.setVapidDetails("mailto:halo@larisi.id", vapidPublic, vapidPrivate)

    const pushPayload = JSON.stringify({ title, body, url: platformUrl || campaign.post_url || "/" })

    await Promise.all(
      subs.map(async (sub: { id: string; endpoint: string; p256dh: string; auth_key: string }) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
            pushPayload
          )
          await supabase.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("id", sub.id)
        } catch (e: any) {
          console.error("[postforme-webhook] Push gagal ke subscription", sub.id, ":", e.message)
          if (e.statusCode === 410 || e.statusCode === 404) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id)
          }
        }
      })
    )
  } else {
    console.log("[postforme-webhook] User tidak punya push_subscriptions, skip push (in-app notif tetap terkirim)")
  }

  return new Response("OK", { status: 200 })
})
