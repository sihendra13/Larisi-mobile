// RADAR — Edge Function: silaris-chat
// Supabase Edge Function (Deno runtime) — powered by Gemini 2.0 Flash
//
// ─── Deploy Instructions ──────────────────────────────────────────────────────
// 1. Set secret API key:
//      supabase secrets set GEMINI_API_KEY=AIza_xxx...
//
// 2. Deploy function:
//      supabase functions deploy silaris-chat --no-verify-jwt
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
  if (!GROQ_API_KEY) {
    console.error("[silaris-chat] GROQ_API_KEY tidak ditemukan di secrets");
    return new Response(JSON.stringify({ error: "GROQ_API_KEY not set" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let body: {
    messages?:      Array<{ role: string; content: string }>;
    systemPrompt?:  string;
    campaignData?:  Record<string, unknown>;
    autoInsight?:   boolean;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const messages     = body.messages     || [];
  const systemPrompt = body.systemPrompt || "";
  const campaignData = body.campaignData || null;
  const autoInsight  = body.autoInsight  || false;

  // ── Build single system message (Gemini OpenAI-compat hanya support 1 system role) ──
  // Gabungkan systemPrompt + campaignData menjadi satu system message
  let fullSystemContent = systemPrompt;
  if (campaignData) {
    fullSystemContent += "\n\n=== DATA CAMPAIGN YANG SEDANG DIANALISA ===\n"
      + JSON.stringify(campaignData, null, 2)
      + "\n===========================================";
  }

  const chatMessages: Array<{ role: string; content: string }> = [];

  // Satu system message gabungan
  if (fullSystemContent.trim()) {
    chatMessages.push({ role: "system", content: fullSystemContent });
  }

  // History chat dari client (sudah dalam format {role, content})
  for (const m of messages) {
    chatMessages.push({
      role:    m.role === "ai" ? "assistant" : m.role,
      content: m.content,
    });
  }

  // Kalau auto-insight dan belum ada pesan user sama sekali, tambah trigger
  if (autoInsight && !messages.length) {
    chatMessages.push({
      role:    "user",
      content: "Analisa campaign ini dan berikan insight langsung sesuai format yang sudah kamu ketahui.",
    });
  }

  if (!chatMessages.length || chatMessages.every(m => m.role === "system")) {
    return new Response(JSON.stringify({ error: "No user messages to process" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  console.log("[silaris-chat] Sending to Groq:", {
    model:        GROQ_MODEL,
    msgCount:     chatMessages.length,
    autoInsight,
    hasCampaign:  !!campaignData,
  });

  try {
    const groqResp = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages:    chatMessages,
        max_tokens:  1000,
        temperature: 0.3,
      }),
    });

    if (!groqResp.ok) {
      const errText = await groqResp.text();
      console.error("[silaris-chat] Groq HTTP error", groqResp.status, errText);
      throw new Error(`Groq API error ${groqResp.status}: ${errText}`);
    }

    const groqData = await groqResp.json();
    const reply = groqData?.choices?.[0]?.message?.content?.trim() || "";

    if (!reply) {
      console.error("[silaris-chat] Empty reply from Groq. Full response:", JSON.stringify(groqData));
      throw new Error("Empty response from Groq");
    }

    console.log("[silaris-chat] OK, reply length:", reply.length);

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[silaris-chat] Groq Error:", msg);

    return new Response(
      JSON.stringify({ reply: null, error: msg, debug: true }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
