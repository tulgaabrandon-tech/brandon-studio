// BrandOn Studio: the Telegram bot's webhook. Links a person's Telegram to their profile.
// Deploy with "Enforce JWT verification" turned OFF (Telegram can't send a Supabase token).
import { createClient } from "jsr:@supabase/supabase-js@2";

const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const SECRET = Deno.env.get("TELEGRAM_SECRET") ?? "";
const APP = (Deno.env.get("APP_URL") ?? "").replace(/\/$/, "");
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function reply(chat: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
  });
}

Deno.serve(async (req) => {
  if (SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== SECRET) return new Response("no", { status: 401 });
  const u = await req.json().catch(() => null);
  const m = u?.message;
  if (!m?.text || !m.chat?.id) return new Response("ok");

  const start = /^\/start\s+([\w-]+)/.exec(m.text);
  if (start) {
    const code = start[1];
    const { data } = await sb.from("docs").select("id,data").eq("col", "people").eq("data->>tgCode", code).maybeSingle();
    if (!data) {
      await reply(m.chat.id, "Энэ холбоос хүчингүй болсон байна. BrandOn Studio дотроос нэрээ дараад \"Telegram холбох\"-ыг дахин дарна уу.");
      return new Response("ok");
    }
    const next = { ...data.data, tgChat: m.chat.id };
    delete next.tgCode;
    await sb.from("docs").update({ data: next, updated_at: new Date().toISOString() }).eq("col", "people").eq("id", data.id);
    await reply(m.chat.id, `Сайн уу, ${data.data.name}! BrandOn Studio холбогдлоо. Шинэ ажил, засвар, батламж, асуулт, зар бүрийг энд мэдэгдэнэ.`);
    return new Response("ok");
  }
  await reply(m.chat.id, `Би зөвхөн мэдэгдэл илгээдэг. Студи рүү орох: ${APP || "BrandOn Studio"}`);
  return new Response("ok");
});
