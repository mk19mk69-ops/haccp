/* Serveur de liens courts de l'Atelier (Cloudflare Worker + KV « PROJETS »).
   POST /p        : range un projet, renvoie { code } (7 caractères, ex. K7P2QXM)
   GET  /p/CODE   : rend le projet
   Seul le site de Mokrani Studio peut enregistrer. Un projet est gardé 1 an. */
const ORIGINES = ["https://mk19mk69-ops.github.io", "https://mokranistudio.fr", "https://www.mokranistudio.fr", "https://mokranistudio.pages.dev"];
const ALPHA = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const MAX = 8e6;

function code(n) {
  const b = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(b, x => ALPHA[x % ALPHA.length]).join("");
}
function json(o, s, h) { return new Response(JSON.stringify(o), { status: s, headers: { ...h, "content-type": "application/json" } }); }

export default {
  async fetch(req, env) {
    const o = req.headers.get("Origin") || "";
    const h = { "Access-Control-Allow-Origin": ORIGINES.includes(o) ? o : ORIGINES[0], "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "content-type", "Vary": "Origin" };
    if (req.method === "OPTIONS") return new Response(null, { headers: h });
    const u = new URL(req.url);
    if (req.method === "POST" && u.pathname === "/p") {
      if (!ORIGINES.includes(o)) return json({ erreur: "origine" }, 403, h);
      const t = await req.text();
      if (t.length > MAX) return json({ erreur: "trop gros" }, 413, h);
      try { const j = JSON.parse(t); if (!j.projet || !j.projet.pages) throw 0; } catch { return json({ erreur: "projet" }, 400, h); }
      let c = code(7);
      for (let i = 0; i < 4 && (await env.PROJETS.get(c)) !== null; i++) c = code(7);
      await env.PROJETS.put(c, t, { expirationTtl: 31536000 });
      return json({ code: c }, 200, h);
    }
    const m = u.pathname.match(/^\/p\/([2-9A-Z]{6,8})$/);
    if (req.method === "GET" && m) {
      const v = await env.PROJETS.get(m[1]);
      return v ? new Response(v, { headers: { ...h, "content-type": "application/json", "cache-control": "public, max-age=300" } }) : json({ erreur: "introuvable" }, 404, h);
    }
    return json({ erreur: "inconnu" }, 404, h);
  }
};
