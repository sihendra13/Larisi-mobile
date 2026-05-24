// RADAR — Edge Function: ai-insight
// Supabase Edge Function (Deno runtime)
//
// ─── Deploy Instructions ──────────────────────────────────────────────────────
// 1. Install Supabase CLI:
//      brew install supabase/tap/supabase
//
// 2. Login & link project:
//      supabase login
//      supabase link --project-ref mojzmlrdihenvfhrwopd
//
// 3. Set secret API key (JANGAN pernah taruh di frontend):
//      supabase secrets set CLAUDE_API_KEY=sk-ant-api03-xxx
//
// 4. Deploy function:
//      supabase functions deploy ai-insight --no-verify-jwt
//
// 5. Test dari terminal:
//      curl -X POST https://mojzmlrdihenvfhrwopd.supabase.co/functions/v1/ai-insight \
//        -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
//        -H "Content-Type: application/json" \
//        -d '{"totalCampaign":2,"totalReach":50000,"platformTerkuat":"ig"}'
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY");
  if (!CLAUDE_API_KEY) {
    return new Response(JSON.stringify({ error: "CLAUDE_API_KEY not set" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let body: {
    campaigns?:       Array<Record<string, unknown>>;
    totalReach?:      number;
    platformTerkuat?: string;
    totalCampaign?:   number;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const {
    campaigns       = [],
    totalReach      = 0,
    platformTerkuat = "—",
    totalCampaign   = 0,
  } = body;

  // Build campaign summary for prompt (max 5 campaigns)
  const campSummary = (campaigns as Array<Record<string, unknown>>)
    .slice(0, 5)
    .map((c) => {
      const nama      = String(c.nama_campaign || "Campaign");
      const lokasi    = String(c.kecamatan    || "—");
      const kategori  = String(c.kategori     || "—");
      const platforms = Array.isArray(c.platforms) ? c.platforms.join(", ") : "—";
      const reachMin  = Number(c.estimated_reach_min || 0);
      const reachMax  = Number(c.estimated_reach_max || 0);
      return `- ${nama} | Lokasi: ${lokasi} | Kategori: ${kategori} | Platform: ${platforms} | Reach est: ${reachMin}–${reachMax}`;
    })
    .join("\n");

  const reachFormatted = totalReach >= 1_000_000
    ? (totalReach / 1_000_000).toFixed(1) + " juta"
    : totalReach >= 1_000
    ? Math.round(totalReach / 1_000) + " ribu"
    : String(totalReach);

  const prompt = `Kamu adalah RADAR AI — co-pilot iklan lokal untuk UMKM Indonesia.

Data campaign pengguna:
- Total campaign: ${totalCampaign}
- Total estimasi jangkauan: ${reachFormatted} orang
- Platform terkuat: ${platformTerkuat.toUpperCase()}
- Daftar campaign (maks. 5):
${campSummary || "  (belum ada campaign)"}

Tugas kamu: Tulis ringkasan insight dalam 3 poin singkat (bullet, bahasa Indonesia, informal tapi profesional). Fokus pada:
1. Pujian atas pencapaian yang ada (reach, konsistensi, atau platform terbaik)
2. Satu peluang optimasi konkret berdasarkan data di atas
3. Satu rekomendasi aksi yang bisa langsung dilakukan hari ini

Format output: langsung bullet points, tidak perlu intro/outro, tidak lebih dari 120 kata total. Gunakan <strong> untuk penekanan penting.`;

  try {
    const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!claudeResp.ok) {
      const errText = await claudeResp.text();
      throw new Error(`Claude API error ${claudeResp.status}: ${errText}`);
    }

    const claudeData = await claudeResp.json();
    const insight = claudeData?.content?.[0]?.text?.trim() || "";

    if (!insight) throw new Error("Empty response from Claude");

    return new Response(JSON.stringify({ insight }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ai-insight] Claude API error:", msg);

    // Return fallback so frontend doesn't crash
    return new Response(
      JSON.stringify({
        insight: null,
        error:   msg,
      }),
      {
        status: 200, // return 200 so frontend handles fallback gracefully
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
