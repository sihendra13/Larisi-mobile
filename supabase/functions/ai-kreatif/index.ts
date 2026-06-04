// Edge Function: ai-kreatif
// Proxy ke Runware API untuk generate foto produk profesional
// RUNWARE_API_KEY disimpan sebagai Supabase Secret — tidak pernah ke browser
//
// ─── Deploy ───────────────────────────────────────────────────
// supabase secrets set RUNWARE_API_KEY=your_key_here
// supabase functions deploy ai-kreatif --no-verify-jwt
// ─────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8080",
  "https://mobile.larisi.id",
  "https://larisi-mobile.pages.dev",
];

function getCors(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin":  allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

const stylePrompts: Record<string, string> = {
  studio:    "professional product photography, clean white studio background, soft box lighting, sharp focus, commercial photography, high resolution",
  lifestyle: "product lifestyle photography, warm wooden table, soft morning sunlight, cozy atmosphere, bokeh background, natural tones, Instagram aesthetic",
  flatlay:   "flat lay product photography, top down bird eye view, minimalist pastel background, neat symmetrical arrangement, clean composition, fashion magazine style",
};

serve(async (req: Request) => {
  const corsHeaders = getCors(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const HUGGINGFACE_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
    if (!HUGGINGFACE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "HUGGINGFACE_API_KEY belum di-set di Supabase Secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image input base64 tidak boleh kosong" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = {
      "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
      "x-wait-for-model": "true",
    };

    const url = "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5";

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Request 3 styles in parallel
    const promises = Object.entries(stylePrompts).map(async ([styleKey, stylePrompt]) => {
      const seed = Math.floor(Math.random() * 999999) + 1;
      const bodyObj = {
        inputs: cleanBase64,
        parameters: {
          prompt: stylePrompt,
          negative_prompt: "blurry, low quality, distorted, watermark, text, deformed",
          seed,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          strength: 0.75
        }
      };

      const resp = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyObj)
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error(`[hf-${styleKey}] error:`, resp.status, errText);
        throw new Error(`HF error (${styleKey}): ${resp.status} - ${errText}`);
      }

      const buffer = await resp.arrayBuffer();
      const base64Str = encode(new Uint8Array(buffer));
      return `data:image/png;base64,${base64Str}`;
    });

    const imageUrls = await Promise.all(promises);
    console.log(`[ai-kreatif] Berhasil generate ${imageUrls.length} gambar via HuggingFace`);

    return new Response(
      JSON.stringify({ images: imageUrls }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e: any) {
    console.error("[ai-kreatif] error:", e);
    return new Response(
      JSON.stringify({ error: `Server error: ${e.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
