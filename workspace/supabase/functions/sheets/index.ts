// BrandOn Studio: copies the finance data to Google Sheets after every change.
// Called by a Database Webhook on the "finance" table (insert, update, delete).
import { createClient } from "jsr:@supabase/supabase-js@2";

const SHEETS_URL = Deno.env.get("SHEETS_URL") ?? "";     // the Apps Script web app address
const SHEETS_TOKEN = Deno.env.get("SHEETS_TOKEN") ?? "";  // the same secret word you put in the Apps Script
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  const p = await req.json().catch(() => ({}));
  const col = p?.record?.col ?? p?.old_record?.col;
  if (col === "fin_meta" || !SHEETS_URL) return new Response("skip");

  // Wait a moment so a burst of edits becomes one send
  await new Promise((r) => setTimeout(r, 1500));
  const { data, error } = await sb.from("finance").select("col,id,data");
  if (error) return new Response("read failed", { status: 500 });

  let ok = false;
  try {
    const res = await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "content-type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token: SHEETS_TOKEN, docs: data }),
      redirect: "follow",
    });
    ok = res.ok && (await res.text()).includes("ok");
  } catch (e) { console.error(e); }

  await sb.from("finance").upsert({ col: "fin_meta", id: "sync", data: { at: new Date().toISOString(), ok }, updated_at: new Date().toISOString() });
  return new Response(ok ? "ok" : "failed");
});
