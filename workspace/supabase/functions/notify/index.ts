// BrandOn Studio: sends Telegram messages when work moves.
// Called by a Database Webhook on the "docs" table (insert and update).
import { createClient } from "jsr:@supabase/supabase-js@2";

const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const APP = (Deno.env.get("APP_URL") ?? "").replace(/\/$/, "");
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

type Doc = Record<string, any>;
const esc = (s: unknown) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));

async function get(col: string, id: string): Promise<Doc | null> {
  if (!id) return null;
  const { data } = await sb.from("docs").select("data").eq("col", col).eq("id", id).maybeSingle();
  return (data?.data as Doc) ?? null;
}
async function nameOf(id: string) { return (await get("people", id))?.name ?? "?"; }

async function send(personId: string, text: string, taskId?: string) {
  const p = await get("people", personId);
  if (!p?.tgChat || !TOKEN) return;
  const body: Doc = { chat_id: p.tgChat, text, parse_mode: "HTML", disable_web_page_preview: true };
  if (APP) body.reply_markup = { inline_keyboard: [[{ text: "Нээх", url: taskId ? `${APP}/#task=${taskId}` : `${APP}/` }]] };
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
}

Deno.serve(async (req) => {
  let payload: Doc;
  try { payload = await req.json(); } catch { return new Response("bad request", { status: 400 }); }
  const { type, record: r, old_record: o } = payload;
  if (!r) return new Response("ok");

  try {
    if (r.col === "tasks") {
      const t: Doc = r.data ?? {}, ot: Doc | null = o?.data ?? null;
      const proj = (await get("projects", t.project)) ?? {};
      const head = `<b>${esc(t.title)}</b>\n${esc(proj.client)}`;

      // New task, or task given to someone else
      if ((type === "INSERT" || (ot && ot.who !== t.who)) && t.who && t.who !== t.by) {
        await send(t.who, `Шинэ ажил ирлээ\n${head}\nХугацаа: ${esc(t.due)}\nӨгсөн: ${esc(await nameOf(t.by))}`, r.id);
      }
      // Work sent for review: tell the project's PM
      if (ot && ot.status !== "review" && t.status === "review" && proj.pm) {
        await send(proj.pm, `${esc(await nameOf(t.who))} ажлаа хянуулахаар илгээлээ\n${head}`, r.id);
      }
      // PM decided: approved or sent back
      const v = t.versions?.[t.versions.length - 1], ov = ot?.versions?.[ot.versions.length - 1];
      if (ot && v?.decision && (!ov || ov.decision !== v.decision || (ot.versions?.length ?? 0) !== t.versions.length)) {
        if (v.decision === "changes") await send(t.who, `${esc(await nameOf(proj.pm))} засвар хүссэн (${v.comments?.length ?? 0} тэмдэглэл)\n${head}`, r.id);
        if (v.decision === "approved") await send(t.who, `Батлагдлаа\n${head}`, r.id);
      }
      // A new question or answer on the task
      const th = t.thread ?? [], oth = ot?.thread ?? [];
      if (th.length > oth.length) {
        const m = th[th.length - 1];
        const to = m.by === t.who ? proj.pm : t.who;
        if (to && to !== m.by) await send(to, `${esc(await nameOf(m.by))} асууж байна\n${head}\n\n«${esc(m.text)}»`, r.id);
      }
    }

    // A new announcement: tell everyone in its audience
    if (r.col === "ann" && type === "INSERT") {
      const a: Doc = r.data ?? {};
      const { data: people } = await sb.from("docs").select("id,data").eq("col", "people");
      for (const p of people ?? []) {
        if (p.id === a.by) continue;
        if (a.aud === "all" || a.aud === p.data?.role) await send(p.id, `Зар: <b>${esc(a.title)}</b>\n${esc(a.text)}`);
      }
    }
  } catch (e) {
    console.error(e);
  }
  return new Response("ok");
});
