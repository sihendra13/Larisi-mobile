import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import md5 from "npm:md5"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { plan, amount, email, name, phone, orderId, userId } = await req.json()

    const merchantCode = Deno.env.get('DUITKU_MERCHANT_CODE') || 'D22755'
    // Guard: pastikan name tidak null/undefined/"null" agar email Duitku tidak tampil "Hi null,"
    const safeName = (name && name !== 'null' && String(name).trim()) ? String(name).trim() : 'Pelanggan Larisi'
    const apiKey = Deno.env.get('DUITKU_API_KEY') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''

    // Signature v2: merchantCode + merchantOrderId + paymentAmount + apiKey
    const signature = md5(merchantCode + orderId + String(amount) + apiKey)

    // Callback ke Supabase Edge Function agar subscription ter-upgrade otomatis
    const callbackUrl = supabaseUrl
      ? supabaseUrl.replace('/rest/v1', '') + '/functions/v1/duitku-callback'
      : 'https://larisi.id/callback'

    const duitkuUrl = 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry'

    const payload = {
      merchantCode,
      paymentAmount: parseInt(amount),
      merchantOrderId: orderId,
      productDetails: `Langganan Paket ${plan.toUpperCase()}`,
      email: email,
      phoneNumber: phone || '081234567890',
      customerVaName: safeName,
      callbackUrl,
      returnUrl: 'https://app.larisi.id',
      expiryPeriod: 60,
      signature: signature,
      paymentMethod: "VA",
      // Embed userId dan plan agar callback bisa upgrade subscription
      additionalParam: JSON.stringify({ userId: userId || '', plan }),
      itemDetails: [{
          name: `Paket ${plan.toUpperCase()}`,
          price: parseInt(amount),
          quantity: 1
      }]
    }

    const response = await fetch(duitkuUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (result.paymentUrl) {
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
    } else {
        const errorMsg = result.resultMessage || result.responseMessage || JSON.stringify(result)
        return new Response(JSON.stringify({
            error: `Duitku: ${errorMsg}`,
            details: result
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
