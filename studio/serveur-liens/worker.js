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
    /* Fiche Google (facultatif) : il faut le secret GOOGLE_CLE (clé « Places API (New) ») */
    if (req.method === "GET" && (u.pathname === "/suggestions" || u.pathname === "/fiche")) {
      if (!ORIGINES.includes(o)) return json({ erreur: "origine" }, 403, h);
      if (!env.GOOGLE_CLE) return json({ erreur: "pas de clé Google" }, 501, h);
      const cle = u.pathname + "?" + (u.searchParams.get("q") || u.searchParams.get("id") || "").toLowerCase().slice(0, 120);
      const deja = await env.PROJETS.get("g:" + cle);
      if (deja) return new Response(deja, { headers: { ...h, "content-type": "application/json" } });
      let sortie;
      if (u.pathname === "/suggestions") {
        const q = (u.searchParams.get("q") || "").slice(0, 120);
        if (q.length < 3) return json([], 200, h);
        const r = await fetch("https://places.googleapis.com/v1/places:autocomplete", { method: "POST", headers: { "content-type": "application/json", "X-Goog-Api-Key": env.GOOGLE_CLE },
          body: JSON.stringify({ input: q, languageCode: "fr", regionCode: "fr", locationBias: { circle: { center: { latitude: 48.2973, longitude: 4.0744 }, radius: 50000 } } }) });
        const d = await r.json();
        sortie = (d.suggestions || []).filter(x => x.placePrediction).slice(0, 6).map(x => ({ id: x.placePrediction.placeId, nom: x.placePrediction.structuredFormat?.mainText?.text || x.placePrediction.text?.text || "", ligne: x.placePrediction.structuredFormat?.secondaryText?.text || "", source: "google" }));
      } else {
        const id = (u.searchParams.get("id") || "").replace(/[^A-Za-z0-9_-]/g, "");
        const r = await fetch("https://places.googleapis.com/v1/places/" + id + "?languageCode=fr", { headers: { "X-Goog-Api-Key": env.GOOGLE_CLE,
          "X-Goog-FieldMask": "id,displayName,formattedAddress,addressComponents,nationalPhoneNumber,regularOpeningHours,primaryType,types,websiteUri,rating,userRatingCount" } });
        const p = await r.json();
        const comp = t => (p.addressComponents || []).find(c => (c.types || []).includes(t))?.longText || "";
        sortie = { id: p.id, nom: p.displayName?.text || "", adresse: [comp("street_number"), comp("route")].filter(Boolean).join(" "), cp: comp("postal_code"), ville: comp("locality"),
          ligne: p.formattedAddress || "", tel: p.nationalPhoneNumber || "", web: p.websiteUri || "", note: p.rating || null, avis: p.userRatingCount || null,
          horaires: horairesGoogle(p.regularOpeningHours), metier: metierGoogle(p.primaryType, p.types || [], p.displayName?.text || ""), source: "google" };
      }
      const txt = JSON.stringify(sortie);
      await env.PROJETS.put("g:" + cle, txt, { expirationTtl: 86400 });
      return new Response(txt, { headers: { ...h, "content-type": "application/json" } });
    }
    return json({ erreur: "inconnu" }, 404, h);
  }
};

/* Horaires Google (dimanche = 0) vers le modèle de l'Atelier (lundi = 0) */
function horairesGoogle(oh) {
  if (!oh || !oh.periods) return null;
  const z = n => String(n).padStart(2, "0"), hm = t => z(t.hour || 0) + ":" + z(t.minute || 0);
  const sem = [0, 1, 2, 3, 4, 5, 6].map(() => ({ o: false, a: "09:00", f: "19:00", p: false, pa: "12:00", pf: "14:00", plages: [] }));
  for (const per of oh.periods) { if (!per.open) continue; const j = (per.open.day + 6) % 7; sem[j].plages.push([hm(per.open), per.close ? hm(per.close) : "23:59"]); }
  return sem.map(J => {
    const pl = J.plages.sort((a, b) => a[0].localeCompare(b[0])); delete J.plages;
    if (!pl.length) return J;
    J.o = true; J.a = pl[0][0]; J.f = pl[pl.length - 1][1];
    if (pl.length > 1) { J.p = true; J.pa = pl[0][1]; J.pf = pl[1][0]; }
    return J;
  });
}
function metierGoogle(t, types, nom) {
  const all = [t, ...types].join(" ");
  if (/barb/i.test(nom) || /barber/.test(all)) return "barbier";
  if (/bakery/.test(all)) return "boulangerie";
  if (/butcher/.test(all)) return "boucherie";
  if (/hair/.test(all)) return "coiffure";
  if (/beauty|nail|spa/.test(all)) return "institut";
  if (/florist/.test(all)) return "fleuriste";
  if (/grocery|supermarket|convenience|market/.test(all)) return "epicerie";
  if (/fast_food|hamburger|kebab|sandwich|pizza/.test(all)) return "snack";
  if (/restaurant|cafe|bar/.test(all)) return "restaurant";
  return "autre";
}
