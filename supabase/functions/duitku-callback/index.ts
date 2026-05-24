import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import md5 from "npm:md5"

// ── Email konfirmasi ke user via Resend ───────────────────────────────────────
async function sendConfirmationEmail(email: string, plan: string, expiresAt: Date) {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    console.log('[Callback] RESEND_API_KEY belum diset, skip kirim email')
    return
  }

  const planLabel = plan.toUpperCase()
  const expStr = expiresAt.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  const html = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a0533;padding:28px 32px;text-align:center;">
            <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:1px;">LARISI</div>
            <div style="color:#c9a7f7;font-size:13px;margin-top:4px;">Platform Iklan Lokal Terpercaya</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 24px;">
            <div style="font-size:28px;text-align:center;margin-bottom:8px;">🎉</div>
            <h2 style="margin:0 0 8px;font-size:20px;color:#1a0533;text-align:center;">Pembayaran Berhasil!</h2>
            <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;text-align:center;">
              Akun Anda telah berhasil diupgrade ke <strong>Paket ${planLabel}</strong>.<br>
              Nikmati semua fitur premium Larisi sekarang.
            </p>

            <!-- Plan info box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ff;border-radius:12px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <div style="display:flex;justify-content:space-between;">
                    <table width="100%"><tr>
                      <td style="font-size:13px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Paket Aktif</td>
                      <td style="font-size:13px;color:#7c3aed;font-weight:700;text-align:right;">Masa Aktif Hingga</td>
                    </tr><tr>
                      <td style="font-size:20px;font-weight:800;color:#1a0533;padding-top:4px;">${planLabel}</td>
                      <td style="font-size:14px;font-weight:700;color:#1a0533;text-align:right;padding-top:4px;">${expStr}</td>
                    </tr></table>
                  </div>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="https://app.larisi.id" style="display:inline-block;background:#1a0533;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:10px;">
                    Buka Dashboard Larisi
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:11px;color:#aaa;line-height:1.6;">
              Pembayaran diproses oleh Duitku payment gateway resmi mitra Larisi.<br>
              Jika ada pertanyaan, hubungi kami di <a href="mailto:halo@larisi.id" style="color:#7c3aed;">halo@larisi.id</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Larisi <noreply@larisi.id>'
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: `✅ Pembayaran Berhasil - Paket ${planLabel} Aktif`,
        html,
      }),
    })
    const resJson = await res.json()
    if (res.ok) {
      console.log('[Callback] Email konfirmasi terkirim ke', email)
    } else {
      console.error('[Callback] Resend error:', JSON.stringify(resJson))
    }
  } catch (e) {
    // Email gagal tidak boleh menghentikan proses upgrade
    console.error('[Callback] Gagal kirim email konfirmasi:', e.message)
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  try {
    // Duitku may send JSON or application/x-www-form-urlencoded
    let body: Record<string, string> = {}
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text()
      for (const pair of text.split('&')) {
        const [k, v] = pair.split('=')
        if (k) body[decodeURIComponent(k)] = decodeURIComponent(v || '')
      }
    } else {
      body = await req.json()
    }

    const {
      merchantCode,
      amount,
      merchantOrderId,
      additionalParam,
      resultCode,
      signature: incomingSignature,
    } = body

    const apiKey = Deno.env.get('DUITKU_API_KEY') || ''

    // Verifikasi signature: md5(merchantCode + amount + merchantOrderId + apiKey)
    const expectedSignature = md5(merchantCode + amount + merchantOrderId + apiKey)
    if (incomingSignature !== expectedSignature) {
      console.error('[Callback] Signature tidak valid. Got:', incomingSignature, 'Expected:', expectedSignature)
      return new Response('Bad signature', { status: 403 })
    }

    // resultCode '00' = sukses
    if (resultCode !== '00') {
      console.log('[Callback] Pembayaran belum sukses, resultCode:', resultCode)
      return new Response('OK', { status: 200 })
    }

    // Parse additionalParam untuk ambil userId dan plan
    let userId = '', plan = 'pro'
    try {
      const extra = JSON.parse(additionalParam || '{}')
      userId = extra.userId || ''
      plan = extra.plan || 'pro'
    } catch (_) {}

    if (!userId) {
      console.error('[Callback] userId kosong di additionalParam')
      return new Response('Missing userId', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Hitung tanggal kadaluarsa 30 hari dari sekarang
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        selected_plan: plan,
        plan_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateErr) {
      console.error('[Callback] Gagal update plan:', updateErr.message)
      return new Response('DB error', { status: 500 })
    }

    console.log('[Callback] Subscription berhasil diupgrade:', userId, '->', plan, 'expires:', expiresAt.toISOString())

    // Ambil email user lalu kirim konfirmasi (tidak blocking — gagal tidak masalah)
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId)
      const userEmail = authUser?.user?.email
      if (userEmail) {
        await sendConfirmationEmail(userEmail, plan, expiresAt)
      }
    } catch (emailErr) {
      console.error('[Callback] Gagal ambil email user:', emailErr.message)
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('[Callback] Error:', error.message)
    return new Response('Error', { status: 500 })
  }
})
