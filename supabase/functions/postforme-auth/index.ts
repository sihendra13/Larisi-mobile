// RADAR — Edge Function: postforme-auth
// Proxy untuk PostForMe API — menghindari CORS di browser
//
// ─── Deploy ───────────────────────────────────────────────────
// supabase functions deploy postforme-auth --no-verify-jwt
// supabase secrets set POSTFORME_API_KEY=pfm_live_7Yz9QbXMP3tUuQVY47gFa7
// ─────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

const PFM_BASE = "https://api.postforme.dev";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  const POSTFORME_API_KEY = Deno.env.get("POSTFORME_API_KEY") || "";
  if (!POSTFORME_API_KEY) {
    return json({ error: "POSTFORME_API_KEY not set" }, 500);
  }

  let body: { platform?: string; redirect_uri?: string; external_id?: string } = {};
  try { body = await req.json(); } catch { /* empty body ok */ }

  const { platform, redirect_uri, external_id } = body;
  if (!platform) return json({ error: "platform required" }, 400);

  try {
    const resp = await fetch(`${PFM_BASE}/v1/social-accounts/auth-url`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${POSTFORME_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({ platform, redirect_uri, external_id }),
    });

    const data = await resp.json();
    return json(data, resp.ok ? 200 : resp.status);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
