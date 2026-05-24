// RADAR — Edge Function: postforme-proxy
// Proxy umum untuk semua PostForMe API call
// API key PostForMe TIDAK pernah keluar ke browser
//
// ─── Deploy ───────────────────────────────────────────────────
// supabase functions deploy postforme-proxy --no-verify-jwt
// (POSTFORME_API_KEY sudah di-set lewat postforme-auth sebelumnya)
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
  const allowOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin":  allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

const PFM_BASE = "https://api.postforme.dev";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: getCors(req) });

  const POSTFORME_API_KEY = Deno.env.get("POSTFORME_API_KEY") || "";
  if (!POSTFORME_API_KEY) {
    return json({ error: "POSTFORME_API_KEY not set" }, 500, req);
  }

  let body: { endpoint?: string; method?: string; body?: unknown } = {};
  try { body = await req.json(); } catch { /* empty ok */ }

  const { endpoint, method = "GET", body: reqBody } = body;
  if (!endpoint) return json({ error: "endpoint required" }, 400, req);

  try {
    const url = `${PFM_BASE}${endpoint}`;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${POSTFORME_API_KEY}`,
        "Content-Type":  "application/json",
      },
    };

    // Sertakan body untuk non-GET
    if (method !== "GET" && reqBody !== undefined) {
      (fetchOptions as RequestInit & { body: string }).body = JSON.stringify(reqBody);
    }

    const resp = await fetch(url, fetchOptions);

    // Coba parse JSON, fallback ke text
    let data: unknown;
    try { data = await resp.json(); }
    catch { data = { raw: await resp.text() }; }

    return json(data, resp.ok ? 200 : resp.status, req);

  } catch (e) {
    return json({ error: String(e) }, 500, req);
  }
});

function json(data: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...(req ? getCors(req) : {}), "Content-Type": "application/json" },
  });
}
