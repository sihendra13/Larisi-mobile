// Edge Function: ai-kreatif
// Proxy ke Runware API untuk generate foto produk profesional
// RUNWARE_API_KEY disimpan sebagai Supabase Secret — tidak pernah ke browser
//
// ─── Deploy ───────────────────────────────────────────────────
// supabase secrets set RUNWARE_API_KEY=your_key_here
// supabase functions deploy ai-kreatif --no-verify-jwt
// ─────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const RUNWARE_API_KEY = Deno.env.get("RUNWARE_API_KEY");
    if (!RUNWARE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RUNWARE_API_KEY belum di-set di Supabase Secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64 } = await req.json();

    let seedImageUUID: string | null = null;

    // ── Step 1: Upload foto jika ada (img2img) ──
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const uploadResp = await fetch("https://api.runware.ai/v1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          { taskType: "authentication", apiKey: RUNWARE_API_KEY },
          { taskType: "imageUpload", taskUUID: crypto.randomUUID(), image: base64Data },
        ]),
      });

      const uploadData = await uploadResp.json();
      const uploadResult = uploadData?.data?.find((r: any) => r.taskType === "imageUpload") || uploadData?.[0];
      seedImageUUID = uploadResult?.imageUUID || null;

      if (!seedImageUUID) {
        const errMsg = uploadData?.errors?.[0]?.message || "Gagal upload foto ke Runware";
        return new Response(
          JSON.stringify({ error: errMsg }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Step 2: Generate 3 style sekaligus dalam 1 request ──
    const inferenceTasks = Object.entries(stylePrompts).map(([_, stylePrompt]) => ({
      taskType: "imageInference",
      taskUUID: crypto.randomUUID(),
      model: "runware:101@1",
      positivePrompt: stylePrompt,
      negativePrompt: "blurry, low quality, distorted, watermark, text, deformed",
      width: 1024,
      height: 1024,
      steps: 28,
      CFGScale: 3.5,
      outputFormat: "JPEG",
      includeCost: true,
      ...(seedImageUUID ? { seedImage: seedImageUUID, strength: 0.75 } : {}),
    }));

    const payload = [
      { taskType: "authentication", apiKey: RUNWARE_API_KEY },
      ...inferenceTasks,
    ];

    const genResp = await fetch("https://api.runware.ai/v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const genData = await genResp.json();

    if (genData?.errors?.length) {
      const errMsg = genData.errors[0]?.message || "Runware error";
      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = (genData?.data || []).filter((r: any) => r.taskType === "imageInference" && r.imageURL);
    const imageUrls = results.map((r: any) => r.imageURL);
    const totalCost = results.reduce((sum: number, r: any) => sum + (r.cost || 0), 0);

    console.log(`[ai-kreatif] ${imageUrls.length} gambar, cost: $${totalCost.toFixed(6)}`);

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
