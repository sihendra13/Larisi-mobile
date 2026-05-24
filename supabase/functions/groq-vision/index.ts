// RADAR — Edge Function: groq-vision
// Analisis gambar dengan Groq Vision API untuk mendeteksi kategori konten.
//
// ─── Deploy ───────────────────────────────────────────────────
// supabase functions deploy groq-vision --no-verify-jwt
// ─────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:3000",
  "https://larisi.vercel.app",
  "https://app.larisi.id",
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

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Model vision yang tersedia di Groq — coba urutan ini
const VISION_MODELS = [
  "llama-3.2-11b-vision-preview",
  "llama-3.2-90b-vision-preview",
  "meta-llama/llama-4-scout-17b-16e-instruct",
];

// Label English → Indonesian category
const LABEL_MAP: Record<string, string> = {
  food:        "makanan",
  drink:       "minuman",
  beverage:    "minuman",
  clothing:    "pakaian",
  fashion:     "pakaian",
  vehicle:     "kendaraan",
  electronics: "elektronik",
  gadget:      "elektronik",
  property:    "properti",
  house:       "properti",
  cosmetics:   "kosmetik",
  skincare:    "kosmetik",
  baby:        "bayi",
  plant:       "tanaman",
  animal:      "hewan",
  pet:         "hewan",
  person:      "manusia",
  people:      "manusia",
  document:    "dokumen",
  furniture:   "furniture",
  sport:       "olahraga",
  sports:      "olahraga",
  art:         "seni",
  craft:       "seni",
  // Indonesian juga (jaga-jaga)
  makanan:    "makanan",
  minuman:    "minuman",
  pakaian:    "pakaian",
  kendaraan:  "kendaraan",
  elektronik: "elektronik",
  properti:   "properti",
  kosmetik:   "kosmetik",
  bayi:       "bayi",
  tanaman:    "tanaman",
  hewan:      "hewan",
  manusia:    "manusia",
  dokumen:    "dokumen",
  olahraga:   "olahraga",
  seni:       "seni",
};

const VALID_CATS = new Set(Object.values(LABEL_MAP));

const PROMPT = `Look at this image carefully. What is the MAIN SUBJECT?

Choose the single best matching label:
- food (burger, rice, cake, any food item)
- drink (coffee, tea, juice, any beverage)
- clothing (shirt, dress, hijab, pants, any fashion item)
- vehicle (car, motorcycle, bicycle, scooter)
- electronics (phone, laptop, camera, gadget)
- property (house, building, apartment, room interior)
- cosmetics (makeup, lipstick, skincare product, beauty item)
- baby (baby product, diaper, toy, stroller)
- plant (flower, tree, leaf, garden)
- animal (cat, dog, bird, pet)
- person (face, selfie, people, human)
- document (book, paper, certificate, text)
- furniture (chair, table, sofa, cabinet)
- sport (exercise, gym, shoes, sports equipment)
- art (painting, craft, artwork, handmade)

Reply with ONE WORD only. Example: food`;

async function callGroq(
  apiKey: string,
  model: string,
  imageBase64: string,
  mime: string,
): Promise<{ raw: string; status: number; error?: string }> {
  const resp = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text",      text: PROMPT },
            { type: "image_url", image_url: { url: `data:${mime};base64,${imageBase64}` } },
          ],
        },
      ],
      max_tokens:  20,
      temperature: 0,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return { raw: "", status: resp.status, error: errText };
  }

  type GroqResp = { choices?: Array<{ message?: { content?: string } }> };
  const data = await resp.json() as GroqResp;
  const raw  = (data?.choices?.[0]?.message?.content || "").trim().toLowerCase();
  return { raw, status: 200 };
}

function parseCategory(raw: string): string {
  // Coba exact match pada kata-kata dalam respons
  const words = raw.split(/[\s,.:;!?()\-]+/).filter(Boolean);
  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, "");
    if (LABEL_MAP[clean]) return LABEL_MAP[clean];
  }
  // Fallback: scan substring untuk label yang lebih panjang (multi-word?)
  for (const [label, cat] of Object.entries(LABEL_MAP)) {
    if (raw.includes(label)) return cat;
  }
  return "general";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCors(req) });
  }

  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
  if (!GROQ_API_KEY) {
    return json({ error: "GROQ_API_KEY not set", category: "general" }, 500, req);
  }

  let body: { image?: string; mime?: string } = {};
  try { body = await req.json(); } catch { /* empty ok */ }

  const { image, mime = "image/jpeg" } = body;
  if (!image) return json({ error: "image required", category: "general" }, 400, req);
  if (image.length > 4_000_000) return json({ error: "image too large", category: "general" }, 413, req);

  // Coba model satu per satu sampai berhasil
  for (const model of VISION_MODELS) {
    try {
      const result = await callGroq(GROQ_API_KEY, model, image, mime);

      console.log(`[groq-vision] model=${model} status=${result.status} raw="${result.raw}"`);

      if (result.status !== 200 || !result.raw) {
        console.warn(`[groq-vision] model ${model} failed (${result.status}): ${result.error || "empty"}`);
        continue; // coba model berikutnya
      }

      const category = parseCategory(result.raw);
      console.log(`[groq-vision] parsed → ${category}`);

      // Kembalikan juga _raw dan _model untuk debug di frontend
      return json({ category, _raw: result.raw, _model: model }, 200, req);

    } catch (e) {
      console.error(`[groq-vision] model ${model} exception:`, String(e));
      continue;
    }
  }

  // Semua model gagal
  console.error("[groq-vision] semua model gagal");
  return json({ category: "general", _error: "all models failed" }, 200, req);
});

function json(data: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...(req ? getCors(req) : {}), "Content-Type": "application/json" },
  });
}
