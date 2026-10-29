/* Atelier : l'éditeur. Tout se passe dans le navigateur ; le projet est gardé sur cet appareil. */
(function () {
  "use strict";
  var K = window.SiteKit, BL = window.Blocs, B = BL.B;
  var $ = function (id) { return document.getElementById(id); };
  var Q = function (s, r) { return (r || document).querySelector(s); };
  var QA = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tactile = matchMedia("(pointer: coarse)").matches;
  var etroit = function () { return innerWidth < 900; };
  var CLE = "atelier:projet", CLE_VISITE = "atelier:visite", CLE_AVANT = "atelier:projet-precedent";

  /* ===================== Outils ===================== */
  function h(tag, a, kids) {
    var el = document.createElement(tag);
    if (a) Object.keys(a).forEach(function (k) {
      var v = a[k]; if (v == null || v === false) return;
      if (k === "class") el.className = v; else if (k === "text") el.textContent = v; else if (k === "html") el.innerHTML = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v); else if (k === "style") el.style.cssText = v;
      else el.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c != null && c !== false) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }
  function svg(d, cls) { return '<svg viewBox="0 0 24 24" class="' + (cls || "") + '" aria-hidden="true">' + d + "</svg>"; }
  var I = {
    poignee: '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>',
    haut: '<path d="m6 15 6-6 6 6"/>', bas: '<path d="m6 9 6 6 6-6"/>', copie: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    corbeille: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', reglage: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', oeil: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    variante: '<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="7" rx="2"/><rect x="13" y="13" width="8" height="7" rx="2"/>',
    ok: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', fleche: '<path d="M9 6l6 6-6 6"/>', son: '<path d="M4 10v4h4l5 4V6L8 10Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 8"/>', lien: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    telecharger: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', crayon: '<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>'
  };
  function uid() { return Math.random().toString(36).slice(2, 7) + Date.now().toString(36).slice(-3); }
  function copie(o) { return JSON.parse(JSON.stringify(o)); }
  function debounce(f, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { f.apply(s, a); }, ms); }; }
  function lire(o, ch) { return ch.split(".").reduce(function (x, k) { return x == null ? x : x[k]; }, o); }
  function ecrire(o, ch, v) { var p = ch.split("."), d = p.pop(), x = o; p.forEach(function (k) { if (x[k] == null) x[k] = /^\d+$/.test(k) ? [] : {}; x = x[k]; }); x[d] = v; }
  function slug(t) { return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " et ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  function heure() { var d = new Date(); return d.getHours() + "h" + ("0" + d.getMinutes()).slice(-2); }

  /* ===================== Médias (photos) : IndexedDB, sinon mémoire ===================== */
  var MEDIAS = {};
  var IDB = {
    db: null,
    ouvrir: function () {
      return new Promise(function (ok) {
        try {
          var r = indexedDB.open("atelier", 1);
          r.onupgradeneeded = function () { r.result.createObjectStore("medias"); };
          r.onsuccess = function () { IDB.db = r.result; ok(); };
          r.onerror = function () { ok(); };
        } catch (e) { ok(); }
      });
    },
    mettre: function (id, v) { try { if (IDB.db) IDB.db.transaction("medias", "readwrite").objectStore("medias").put(v, id); } catch (e) {} },
    tout: function () {
      return new Promise(function (ok) {
        if (!IDB.db) return ok({});
        try {
          var o = {}, st = IDB.db.transaction("medias").objectStore("medias"), c = st.openCursor();
          c.onsuccess = function () { var x = c.result; if (x) { o[x.key] = x.value; x.continue(); } else ok(o); };
          c.onerror = function () { ok(o); };
        } catch (e) { ok({}); }
      });
    }
  };
  function lireImage(fichier, max) {
    return new Promise(function (ok, ko) {
      var url = URL.createObjectURL(fichier), img = new Image();
      img.onload = function () {
        var r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * r); c.height = Math.round(img.naturalHeight * r);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        var d = c.toDataURL("image/webp", .84); if (d.indexOf("data:image/webp") !== 0) d = c.toDataURL("image/jpeg", .84);
        ok({ data: d, img: img, canvas: c });
      };
      img.onerror = function () { URL.revokeObjectURL(url); ko(); };
      img.src = url;
    });
  }
  function ajouterMedia(data) { var id = "m" + uid(); MEDIAS[id] = data; IDB.mettre(id, data); return id; }
  function choisirFichier(multi) {
    return new Promise(function (ok) {
      var inp = $(multi ? "fichier-multi" : "fichier"); inp.value = "";
      inp.onchange = function () { ok([].slice.call(inp.files || [])); };
      inp.click();
    });
  }
  function couleurDe(canvas) {
    var t = 48, c = document.createElement("canvas"); c.width = c.height = t;
    var x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(canvas, 0, 0, t, t);
    var px = x.getImageData(0, 0, t, t).data, cases = {}, best = null, sc = 0;
    for (var i = 0; i < px.length; i += 4) {
      var r = px[i], g = px[i + 1], b = px[i + 2], a = px[i + 3]; if (a < 140) continue;
      var mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx > 235 && mn > 225) continue;
      var k = (r >> 4) + "," + (g >> 4) + "," + (b >> 4), o = cases[k] || (cases[k] = { n: 0, r: 0, g: 0, b: 0 });
      o.n++; o.r += r; o.g += g; o.b += b;
    }
    Object.keys(cases).forEach(function (k) {
      var o = cases[k], r = o.r / o.n, g = o.g / o.n, b = o.b / o.n, mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
      var s = o.n * (.35 + sat) * (mx < 40 ? .6 : 1); if (s > sc) { sc = s; best = [r, g, b]; }
    });
    return best ? "#" + best.map(function (v) { return ("0" + Math.round(v).toString(16)).slice(-2); }).join("") : null;
  }

  /* ===================== Projet ===================== */
  var HOR = {
    marsam: function () { return semaine([0, 1, 1, 1, 1, 1, 0], "09:00", "19:00"); },
    lunsam: function () { return semaine([1, 1, 1, 1, 1, 1, 0], "09:00", "19:00"); },
    tous: function () { return semaine([1, 1, 1, 1, 1, 1, 1], "11:00", "23:00"); },
    pause: function () { return semaine([0, 1, 1, 1, 1, 1, 0], "08:00", "19:30", "12:30", "14:30"); },
    resto: function () { return semaine([0, 1, 1, 1, 1, 1, 0], "12:00", "22:30", "14:00", "19:00"); },
    matin: function () { return semaine([0, 1, 1, 1, 1, 1, 1], "06:30", "19:30"); },
    tard: function () { return semaine([1, 1, 1, 1, 1, 1, 1], "08:00", "22:00"); }
  };
  var HOR_METIER = { barbier: "marsam", coiffure: "marsam", institut: "marsam", boucherie: "pause", snack: "tous", restaurant: "resto", boulangerie: "matin", epicerie: "tard", fleuriste: "marsam", autre: "lunsam" };
  function semaine(o, a, f, pa, pf) { return o.map(function (x) { return { o: !!x, a: a, f: f, p: !!pa, pa: pa || "12:00", pf: pf || "14:00" }; }); }
  function projetVide() {
    return {
      v: 1, cree: Date.now(),
      infos: { nom: "", metier: "barbier", ville: "Troyes", adresse: "", cp: "", tel: "", email: "", insta: "", facebook: "", tiktok: "", forme: "", responsable: "", siret: "", mediateur: "", horaires: HOR.marsam() },
      theme: { c1: "#0B63CE", police: "moderne", fond: "clair", rayon: "doux", anim: true },
      logo: null, domaine: "", publi: { hebergeur: "" },
      entete: { v: "classique", cta: { t: "Réserver", a: "resa" }, tel: true, fixe: true, logoSeul: false },
      pied: { v: "complet", texte: "", credit: true },
      pages: [{ id: "accueil", nom: "Accueil", sections: [] }]
    };
  }
  var FOND_DEF = { reservation: "teinte", commande: "teinte", avis: "teinte", contact: "teinte", fidelite: "auto" };
  var MENU_DEF = { prestations: 1, produits: 1, reservation: 1, commande: 1, galerie: 1, horaires: 1, contact: 1 };
  function ctxPour(Px, edition, pageId) { return { P: Px, edition: !!edition, media: function (id) { return MEDIAS[id] || null; }, M: BL.M[Px.infos.metier] || BL.M.autre, metier: Px.infos.metier, pageId: pageId }; }
  function nouvelleSection(t, v, Px) {
    var b = B[t], c = ctxPour(Px || P), d = b.defaut(c);
    var menu = MENU_DEF[t] ? ((t === "prestations" || t === "produits") && d.titre && d.titre.length < 16 ? d.titre : b.ancre || "") : "";
    return { id: uid(), t: t, v: v || b.variantes[0][0], d: d, s: { fond: FOND_DEF[t] || "auto", esp: "m" }, menu: menu, ex: t !== "espace" && t !== "horaires" && t !== "acces" && t !== "contact" && t !== "reseaux" };
  }
  function construire(Px, objectif) {
    var vus = {};
    Px.pages = [{ id: "accueil", nom: "Accueil", sections: BL.recette(Px.infos.metier, objectif).map(function (x) {
      var p = x.split(":"), s = nouvelleSection(p[0], p[1], Px);
      if (vus[s.menu]) s.menu = ""; vus[s.menu] = 1;
      return s;
    }) }];
    Px.entete.cta = objectif === "rdv" ? { t: Px.infos.metier === "restaurant" ? "Réserver" : "Réserver", a: "resa" } : objectif === "commande" ? { t: "Commander", a: "cmd" } : { t: "Appeler", a: "tel" };
    return Px;
  }

  var P = projetVide();
  var etat = { page: "accueil", sel: null, app: innerWidth < 760 ? "tel" : "ordi", mode: "edition", panneau: null, apres: null };
  $("appareil").setAttribute("data-app", etat.app);

  /* ===================== Historique et sauvegarde ===================== */
  var HIST = { pile: [], pos: -1 };
  function memoriser() {
    var j = JSON.stringify(P); if (HIST.pile[HIST.pos] === j) return;
    HIST.pile = HIST.pile.slice(0, HIST.pos + 1); HIST.pile.push(j);
    if (HIST.pile.length > 120) HIST.pile.shift();
    HIST.pos = HIST.pile.length - 1; majHisto();
  }
  var memoriserPlusTard = debounce(memoriser, 650);
  function majHisto() { $("btn-annuler").disabled = HIST.pos <= 0; $("btn-retablir").disabled = HIST.pos >= HIST.pile.length - 1; }
  function voyager(sens) {
    memoriser();
    var n = HIST.pos + sens; if (n < 0 || n >= HIST.pile.length) return;
    HIST.pos = n; P = JSON.parse(HIST.pile[n]); majHisto();
    if (!trouverPage(etat.page)) etat.page = "accueil";
    if (etat.sel && etat.sel !== "entete" && etat.sel !== "pied" && !trouver(etat.sel)) etat.sel = null;
    toutRendre(); sauver();
    toast(sens < 0 ? "Action annulée" : "Action rétablie");
  }
  var sauver = debounce(function () {
    try { localStorage.setItem(CLE, JSON.stringify(P)); $("etat").textContent = "Enregistré à " + heure(); $("etat").classList.remove("erreur"); }
    catch (e) { $("etat").textContent = "Pas de sauvegarde sur cet appareil"; $("etat").classList.add("erreur"); }
  }, 400);
  function change(opts) {
    opts = opts || {};
    if (opts.vite) memoriserPlusTard(); else memoriser();
    sauver(); majVerif();
    if (etat.panneau === "structure" && !opts.sansPanneau) rendrePanneau();
  }

  /* ===================== Recherche dans le projet ===================== */
  function trouverPage(id) { return P.pages.filter(function (p) { return p.id === id; })[0] || BL.pagesLegales(P).filter(function (p) { return p.id === id; })[0] || null; }
  function pageCourante() { return trouverPage(etat.page) || P.pages[0]; }
  function trouver(id) { for (var i = 0; i < P.pages.length; i++) for (var j = 0; j < P.pages[i].sections.length; j++) if (P.pages[i].sections[j].id === id) return P.pages[i].sections[j]; return null; }
  function pageDe(id) { return P.pages.filter(function (p) { return p.sections.some(function (s) { return s.id === id; }); })[0]; }
  function nomBloc(s) { return s === "entete" ? "En-tête" : s === "pied" ? "Pied de page" : (B[s.t] ? B[s.t].nom : s.t); }

  /* ===================== Rendu du site ===================== */
  var site = $("site"), sortPage = null;
  function opts() { return { mode: etat.mode === "edition" ? "edition" : "apercu", toast: notif, calque: $("calque"), anim: P.theme.anim && etat.mode !== "edition" }; }
  function themer(el, Px) {
    el.setAttribute("style", BL.varsTheme(Px.theme)); el.setAttribute("data-fond", Px.theme.fond);
  }
  function rendreSite(arrivee) {
    var c = ctxPour(P, etat.mode === "edition", etat.page), page = pageCourante();
    themer(site, P);
    site.classList.toggle("ed", etat.mode === "edition");
    site.classList.toggle("anim", !!(P.theme.anim && etat.mode !== "edition"));
    if (site._io) { site._io.disconnect(); site._io = null; }
    QA("[data-sec], .s-entete, .s-pied", site).forEach(function (b) { if (b._kit) b._kit(); });
    var corps;
    if (page.html) corps = page.html;
    else corps = page.sections.map(function (s) { return BL.section(s, c); }).join("") || (etat.mode === "edition" ? '<div class="ed-vide"><p><b>Cette page est vide.</b> Glissez une section ici, ou touchez « Ajouter ».</p></div>' : "");
    var top = site.scrollTop;
    site.innerHTML = BL.entete(c) + '<main id="sections" data-page="' + page.id + '">' + corps + "</main>" + BL.pied(c);
    if (!arrivee) site.scrollTop = top;
    decorer();
    K.activer(site, P, opts());
    if (site._io === undefined) site._io = null;
    brancherPage();
    $("url").textContent = P.domaine || (slug(P.infos.nom) || "votre-commerce") + ".fr";
    $("nom-page").textContent = page.nom;
  }
  function rendreSection(id) {
    var s = trouver(id), old = Q('[data-sec="' + id + '"]', site); if (!s || !old) return rendreSite();
    if (old._kit) old._kit();
    var t = document.createElement("div"); t.innerHTML = BL.section(s, ctxPour(P, etat.mode === "edition", etat.page));
    var n = t.firstElementChild; old.replaceWith(n);
    decorerSection(n); K.activerBloc(n, P, opts());
    if (P.theme.anim && etat.mode !== "edition") n.classList.add("vu");
  }
  var rendrePlusTard = {};
  function rendreSectionBientot(id) { clearTimeout(rendrePlusTard[id]); rendrePlusTard[id] = setTimeout(function () { rendreSection(id); }, 160); }
  function toutRendre() { rendreSite(); rendreInspecteur(); rendrePanneau(); majVerif(); }

  /* ---------- Décor d'édition : textes modifiables, barre d'outils, insertion ---------- */
  function decorer() {
    if (etat.mode !== "edition") return;
    QA("[data-sec]", site).forEach(decorerSection);
    QA(".s-entete, .s-pied", site).forEach(function (g) { g.setAttribute("data-nom", g.classList.contains("s-entete") ? "En-tête" : "Pied de page"); g.classList.toggle("sel", etat.sel === g.getAttribute("data-glob")); });
  }
  function decorerSection(el) {
    if (etat.mode !== "edition") return;
    var id = el.getAttribute("data-sec"), s = trouver(id); if (!s) return;
    var masque = s.s.mob === false ? " · masquée sur téléphone" : s.s.ord === false ? " · masquée sur ordinateur" : "";
    el.setAttribute("data-nom", nomBloc(s) + masque);
    el.classList.toggle("ed-ex", !!s.ex && (s.t === "avis" || s.t === "prestations" || s.t === "produits" || s.t === "reservation" || s.t === "commande"));
    el.classList.toggle("sel", etat.sel === id);
    QA("[data-k]", el).forEach(function (t) { editable(t, !tactile || etat.sel === id); });
    QA("details", el).forEach(function (d) { d.open = true; });
    if (!Q(":scope > .ed-plus", el)) el.appendChild(h("button", { type: "button", class: "ed-plus", "aria-label": "Ajouter une section ici", title: "Ajouter une section ici", html: svg(I.plus) }));
    var ob = Q(":scope > .ed-outils", el); if (ob) ob.remove();
    if (etat.sel === id) el.appendChild(barreOutils(s));
  }
  function editable(t, oui) {
    if (oui) { t.setAttribute("contenteditable", supportePlain ? "plaintext-only" : "true"); t.setAttribute("spellcheck", "true"); }
    else t.removeAttribute("contenteditable");
  }
  var supportePlain = (function () { var d = document.createElement("div"); d.setAttribute("contenteditable", "plaintext-only"); return d.contentEditable === "plaintext-only"; })();
  function barreOutils(s) {
    var b = B[s.t], i = pageCourante().sections.indexOf(s), n = pageCourante().sections.length;
    var bt = function (cls, ic, lab, f, dis) { return h("button", { type: "button", class: cls, title: lab, "aria-label": lab, html: svg(ic), disabled: !!dis, onclick: function (e) { e.stopPropagation(); f(); } }); };
    return h("div", { class: "ed-outils", contenteditable: "false" }, [
      h("span", { class: "ed-poignee", title: "Glisser pour déplacer", "aria-hidden": "true", html: svg(I.poignee) }),
      bt("", I.haut, "Monter", function () { deplacer(s.id, -1); }, i <= 0),
      bt("", I.bas, "Descendre", function () { deplacer(s.id, 1); }, i >= n - 1),
      b.variantes.length > 1 ? bt("", I.variante, "Autre mise en page", function () { varianteSuivante(s); }) : null,
      bt("", I.copie, "Dupliquer", function () { dupliquer(s.id); }),
      bt("ed-suppr", I.corbeille, "Supprimer", function () { supprimer(s.id); })
    ]);
  }

  /* ---------- Clics et saisie sur la page ---------- */
  site.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (a && site.contains(a)) {
      e.preventDefault();
      var href = a.getAttribute("href") || "";
      if (etat.mode === "edition" && a.isContentEditable) href = "";
      if (href) {
      if (href.indexOf("#page-") === 0) { allerPage(href.slice(6)); return; }
      if (href.indexOf("#s-") === 0) { var cible = Q(href, site); if (cible) defilerVers(cible); else { var id = href.slice(3), pg = pageDe(id); if (pg) { allerPage(pg.id); setTimeout(function () { var c2 = Q(href, site); if (c2) defilerVers(c2); }, 60); } } return; }
      if (etat.mode !== "edition" && href !== "#") { toast("Sur le vrai site, ce bouton ouvre : " + (href.indexOf("tel:") === 0 ? "un appel au " + href.slice(4) : href.indexOf("https://www.google.com/maps") === 0 ? "l'itinéraire dans Google Maps" : href)); return; }
      if (etat.mode !== "edition") return;
      }
    }
    if (etat.mode !== "edition") return;
    if (e.target.closest(".ed-plus")) { var sec = e.target.closest("[data-sec]"); etat.apres = sec.getAttribute("data-sec"); ouvrirPanneau("ajouter"); return; }
    if (e.target.closest("summary")) e.preventDefault();
    var im = e.target.closest("[data-img]"), s2 = e.target.closest("[data-sec]"), g = e.target.closest("[data-glob]");
    if (im && s2 && etat.sel === s2.getAttribute("data-sec")) { changerImage(trouver(s2.getAttribute("data-sec")), im.getAttribute("data-img")); return; }
    if (s2) choisir(s2.getAttribute("data-sec")); else if (g) choisir(g.getAttribute("data-glob"));
  });
  site.addEventListener("pointerdown", function (e) {
    if (etat.mode !== "edition") return;
    var s2 = e.target.closest("[data-sec]");
    if (s2 && etat.sel !== s2.getAttribute("data-sec") && e.target.closest("[data-k]") && !tactile) choisir(s2.getAttribute("data-sec"), { garderFocus: true });
  });
  site.addEventListener("input", function (e) {
    var t = e.target.closest && e.target.closest("[data-k][contenteditable]"); if (!t) return;
    var sec = t.closest("[data-sec]"), s = sec && trouver(sec.getAttribute("data-sec")); if (!s) return;
    var k = t.getAttribute("data-k"), v = texteDe(t).replace(/\n$/, "");
    if (!estLong(s, k)) v = v.replace(/\n/g, " ");
    ecrire(s.d, k, v); s.ex = false; sec.classList.remove("ed-ex");
    var f = Q('#inspecteur [data-champ="' + k + '"]'); if (f && document.activeElement !== f) f.value = v;
    change({ vite: true, sansPanneau: true });
  });
  site.addEventListener("keydown", function (e) {
    var t = e.target.closest && e.target.closest("[data-k][contenteditable]"); if (!t) return;
    var sec = t.closest("[data-sec]"), s = sec && trouver(sec.getAttribute("data-sec"));
    if (e.key === "Enter" && (!s || !estLong(s, t.getAttribute("data-k")))) { e.preventDefault(); t.blur(); }
    if (e.key === "Escape") t.blur();
  });
  site.addEventListener("paste", function (e) {
    var t = e.target.closest && e.target.closest("[data-k][contenteditable]"); if (!t || supportePlain) return;
    e.preventDefault(); document.execCommand("insertText", false, (e.clipboardData || window.clipboardData).getData("text/plain"));
  });
  site.addEventListener("focusout", function (e) { if (e.target.closest && e.target.closest("[data-k]")) memoriser(); });
  function texteDe(el) {
    var r = "";
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 3) r += n.nodeValue;
      else if (n.nodeName === "BR") r += "\n";
      else if (n.nodeType === 1) { var t = texteDe(n); r += (/^(DIV|P)$/.test(n.nodeName) && r && !/\n$/.test(r) ? "\n" : "") + t; }
    });
    return r;
  }
  function estLong(s, k) {
    var nomC = k.split(".").pop(), b = B[s.t]; if (!b) return false;
    var def = b.champs.filter(function (c) { return c.k === nomC; })[0];
    if (!def) b.champs.forEach(function (c) { if (c.type === "liste") c.champs.forEach(function (x) { if (x.k === nomC) def = x; }); });
    return def && def.type === "long";
  }
  function defilerVers(el) {
    if (!el) return;
    var ent = Q(".s-entete.fixe", site), dec = ent && !el.classList.contains("s-entete") ? ent.offsetHeight : 0, top = 0, x = el;
    while (x && x !== site) { top += x.offsetTop; x = x.offsetParent; }
    site.scrollTo({ top: Math.max(0, top - dec), behavior: calme ? "auto" : "smooth" });
  }

  /* ---------- Sélection ---------- */
  function choisir(id, o) {
    o = o || {};
    if (etat.sel === id && !o.force) { if (etat.panneau !== "inspecteur" && etroit()) ouvrirInspecteur(true); return; }
    etat.sel = id;
    QA("[data-sec], [data-glob]", site).forEach(function (x) { x.classList.remove("sel"); var ob = Q(":scope > .ed-outils", x); if (ob) ob.remove(); });
    if (id === "entete" || id === "pied") { var g = Q('[data-glob="' + id + '"]', site); if (g) g.classList.add("sel"); }
    else if (id) { var el = Q('[data-sec="' + id + '"]', site); if (el) { el.classList.add("sel"); el.appendChild(barreOutils(trouver(id))); if (tactile) QA("[data-k]", el).forEach(function (t) { editable(t, true); }); } }
    if (tactile) QA("[data-sec]:not(.sel) [data-k][contenteditable]", site).forEach(function (t) { editable(t, false); });
    rendreInspecteur();
    if (etat.panneau === "structure") rendrePanneau();
    if (id && etroit()) ouvrirInspecteur(false);
  }

  /* ===================== Actions sur les sections ===================== */
  function sections() { return pageCourante().sections || []; }
  function ajouter(t, v, index, o) {
    o = o || {};
    var pg = pageCourante(); if (!pg.sections) { allerPage("accueil"); pg = pageCourante(); }
    var s = nouvelleSection(t, v);
    if (index == null) { var ap = etat.apres || (etat.sel && trouver(etat.sel) ? etat.sel : null); index = ap ? pg.sections.findIndex(function (x) { return x.id === ap; }) + 1 : pg.sections.length; }
    if (index < 0) index = pg.sections.length;
    var vus = {}; pg.sections.forEach(function (x) { vus[x.menu] = 1; }); if (vus[s.menu]) s.menu = "";
    pg.sections.splice(index, 0, s); etat.apres = null;
    rendreSite(); choisir(s.id, { force: true });
    var el = Q('[data-sec="' + s.id + '"]', site);
    if (el) { defilerVers(el); el.classList.add("ed-nouveau"); setTimeout(function () { el.classList.remove("ed-nouveau"); }, 1200); }
    change(); if (!o.silence) toast("Section « " + B[t].nom + " » ajoutée");
    if (etat.panneau === "ajouter") rendrePanneau();
    if (etroit() && etat.panneau && etat.panneau !== "inspecteur") fermerPanneau();
    return s;
  }
  function deplacer(id, d) {
    var a = sections(), i = a.findIndex(function (x) { return x.id === id; }), j = i + d; if (i < 0 || j < 0 || j >= a.length) return;
    var x = a.splice(i, 1)[0]; a.splice(j, 0, x);
    var vieux = Q('[data-sec="' + id + '"]', site), voisin = Q('[data-sec="' + a[d < 0 ? j + 1 : j - 1].id + '"]', site);
    var avant = vieux.getBoundingClientRect().top;
    if (d < 0) voisin.before(vieux); else voisin.after(vieux);
    if (!calme) { var apres = vieux.getBoundingClientRect().top; vieux.animate([{ transform: "translateY(" + (avant - apres) + "px)" }, { transform: "none" }], { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" }); }
    decorerSection(vieux); decorerSection(voisin); rendreEntete();
    change();
  }
  function dupliquer(id) {
    var a = sections(), i = a.findIndex(function (x) { return x.id === id; }); if (i < 0) return;
    var c = copie(a[i]); c.id = uid(); c.menu = ""; a.splice(i + 1, 0, c);
    rendreSite(); choisir(c.id, { force: true }); change(); toast("Section dupliquée");
  }
  function supprimer(id) {
    var pg = pageDe(id); if (!pg) return;
    var i = pg.sections.findIndex(function (x) { return x.id === id; }), s = pg.sections[i];
    var el = Q('[data-sec="' + id + '"]', site);
    function fin() { pg.sections.splice(i, 1); if (etat.sel === id) etat.sel = null; rendreSite(); rendreInspecteur(); change(); toast("Section « " + B[s.t].nom + " » supprimée", "Annuler", function () { voyager(-1); }); }
    if (el && !calme) { el.style.overflow = "hidden"; var a = el.animate([{ opacity: 1, height: el.offsetHeight + "px" }, { opacity: 0, height: "0px", paddingTop: 0, paddingBottom: 0 }], { duration: 280, easing: "ease-in" }); a.onfinish = fin; } else fin();
  }
  function varianteSuivante(s) {
    var v = B[s.t].variantes, i = v.findIndex(function (x) { return x[0] === s.v; });
    s.v = v[(i + 1) % v.length][0]; transition(function () { rendreSection(s.id); }); rendreInspecteur(); change();
    toast("Mise en page : " + v[(i + 1) % v.length][1]);
  }
  function transition(f) { if (document.startViewTransition && !calme) document.startViewTransition(f); else f(); }
  function rendreEntete() { var c = ctxPour(P, etat.mode === "edition", etat.page), old = Q(".s-entete", site); if (!old) return; var t = document.createElement("div"); t.innerHTML = BL.entete(c); var n = t.firstElementChild; old.replaceWith(n); K.activer(site, P, opts()); decorer(); }

  /* ---------- Glisser-déposer ---------- */
  function brancherPage() {
    if (sortPage) { sortPage.destroy(); sortPage = null; }
    var main = $("sections"); if (!main || etat.mode !== "edition" || pageCourante().html) return;
    sortPage = Sortable.create(main, {
      group: { name: "page", put: ["biblio"] }, handle: ".ed-poignee", draggable: "[data-sec]", animation: calme ? 0 : 200, easing: "cubic-bezier(.2,.8,.2,1)",
      forceFallback: true, fallbackOnBody: true, ghostClass: "ed-fantome", chosenClass: "ed-choisi", dragClass: "ed-traine", scroll: site, scrollSensitivity: 90, scrollSpeed: 14, emptyInsertThreshold: 60,
      onAdd: function (ev) {
        var t = ev.item.getAttribute("data-type"), idx = QA("[data-sec]", main).filter(function (x) { return x.compareDocumentPosition(ev.item) & Node.DOCUMENT_POSITION_FOLLOWING; }).length;
        ev.item.remove(); if (t) ajouter(t, null, idx);
      },
      onUpdate: function () {
        var ordre = QA("[data-sec]", main).map(function (x) { return x.getAttribute("data-sec"); }), pg = pageCourante();
        pg.sections.sort(function (a, b) { return ordre.indexOf(a.id) - ordre.indexOf(b.id); });
        QA("[data-sec]", main).forEach(decorerSection); rendreEntete(); change(); toast("Section déplacée");
      }
    });
  }

  /* ===================== Pages ===================== */
  function allerPage(id) {
    if (!trouverPage(id)) return;
    etat.page = id; etat.sel = null;
    transition(function () { rendreSite(true); site.scrollTop = 0; });
    rendreInspecteur(); if (etat.panneau === "structure" || etat.panneau === "pages") rendrePanneau();
  }
  function menuPages() {
    var m = $("menu-pages"), b = $("btn-page");
    if (!m.hidden) { m.hidden = true; b.setAttribute("aria-expanded", "false"); return; }
    m.textContent = "";
    var item = function (p, sous) { return h("button", { type: "button", role: "menuitem", class: p.id === etat.page ? "actif" : "", onclick: function () { m.hidden = true; b.setAttribute("aria-expanded", "false"); allerPage(p.id); } }, [p.nom, sous ? h("small", { text: sous }) : null]); };
    P.pages.forEach(function (p) { m.appendChild(item(p)); });
    m.appendChild(h("hr")); BL.pagesLegales(P).forEach(function (p) { m.appendChild(item(p, "créée automatiquement")); });
    m.appendChild(h("hr")); m.appendChild(h("button", { type: "button", role: "menuitem", onclick: function () { m.hidden = true; ouvrirPanneau("pages"); } }, ["Gérer les pages"]));
    var r = b.getBoundingClientRect(); m.style.left = r.left + "px"; m.style.top = r.bottom + 6 + "px"; m.hidden = false; b.setAttribute("aria-expanded", "true");
  }
  $("btn-page").addEventListener("click", menuPages);
  document.addEventListener("pointerdown", function (e) { var m = $("menu-pages"); if (!m.hidden && !m.contains(e.target) && !$("btn-page").contains(e.target)) { m.hidden = true; $("btn-page").setAttribute("aria-expanded", "false"); } });

  /* ===================== Appareils, zoom, règle ===================== */
  var APP = { tel: [390, 844], tablette: [820, 1180], ordi: [1280, 800] };
  function cadrer() {
    var eb = $("etabli"), ap = $("appareil"), mobile = innerWidth < 600;
    var pad = mobile ? 0 : 28, regle = mobile ? 0 : 26, W = eb.clientWidth - pad * 2, Hh = eb.clientHeight - pad * 2 - regle - (mobile ? 0 : 8);
    var w = APP[etat.app][0], hh = APP[etat.app][1], z, cadre = etat.app === "tel" ? 28 : etat.app === "tablette" ? 30 : 0, barre = etat.app === "ordi" ? 38 : 0;
    if (mobile && etat.app === "tel") { w = W; z = 1; ap.style.width = W + "px"; ap.style.height = Hh + "px"; ap.style.zoom = 1; ap.classList.add("nu"); }
    else {
      ap.classList.remove("nu");
      if (etat.app === "tel") z = Math.min(1, W / (w + cadre), Hh / (hh + cadre));
      else z = Math.min(1, W / (w + cadre));
      var hauteur = etat.app === "tel" ? hh + cadre : Math.max(400, Hh / z);
      if (etat.app === "tablette") hauteur = Math.min(hh + cadre, Hh / z);
      ap.style.width = (w + cadre) + "px"; ap.style.height = hauteur + "px"; ap.style.zoom = z;
    }
    etat.zoom = z; ap.style.setProperty("--z", z);
    var rg = $("regle-grad"), pxEl = $("regle-px");
    rg.style.width = (w * z) + "px"; rg.style.setProperty("--pas", (50 * z) + "px");
    pxEl.textContent = w + " px" + (z < 1 ? ", affiché à " + Math.round(z * 100) + " %" : "");
  }
  QA("#appareils button").forEach(function (b) { b.addEventListener("click", function () { changerAppareil(b.getAttribute("data-app")); }); });
  function changerAppareil(a) {
    if (a === etat.app) return;
    QA("#appareils button").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-app") === a ? "true" : "false"); });
    transition(function () { etat.app = a; $("appareil").setAttribute("data-app", a); cadrer(); });
  }
  addEventListener("resize", debounce(cadrer, 80));

  /* ===================== Toasts et notifications ===================== */
  function toast(texte, action, f) {
    var t = h("div", { class: "toast", role: "status" }, [h("span", { text: texte }), action ? h("button", { type: "button", text: action, onclick: function () { f(); t.remove(); } }) : null]);
    $("toasts").appendChild(t);
    setTimeout(function () { t.classList.add("part"); setTimeout(function () { t.remove(); }, 400); }, action ? 6000 : 2600);
    while ($("toasts").children.length > 3) $("toasts").firstChild.remove();
  }
  function notif(titre, texte) {
    var n = P.infos.nom || "Votre commerce", logo = P.logo && MEDIAS[P.logo];
    var el = h("div", { class: "notif" }, [h("span", { class: "notif-ic", html: logo ? '<img src="' + logo + '" alt="">' : K.e(n.charAt(0).toUpperCase()) }), h("p", {}, [h("b", { text: titre }), h("span", { text: texte })]), h("time", { text: "maintenant" })]);
    $("calque").appendChild(el); setTimeout(function () { el.classList.add("part"); setTimeout(function () { el.remove(); }, 500); }, 4200);
    toast("C'est ce que verra le commerçant sur son téléphone.");
  }

  /* ===================== Panneaux ===================== */
  var TITRES = { ajouter: "Ajouter une section", structure: "Plan de la page", style: "Style", infos: "Infos du commerce", pages: "Pages", domaine: "Adresse du site", verifier: "Avant la mise en ligne", aide: "Aide" };
  function ouvrirPanneau(p) {
    if (etat.mode !== "edition") quitterApercu();
    if (etat.panneau === p && p !== "ajouter") return fermerPanneau();
    etat.panneau = p; $("app").setAttribute("data-panneau", p);
    QA("#rail button").forEach(function (b) { b.classList.toggle("actif", b.getAttribute("data-p") === p); });
    $("panneau-titre").textContent = TITRES[p]; rendrePanneau();
    $("panneau").classList.add("ouvert");
    if (etroit()) $("inspecteur").classList.remove("ouvert", "peek");
    setTimeout(cadrer, 260);
  }
  function fermerPanneau() {
    etat.panneau = null; etat.apres = null; $("app").removeAttribute("data-panneau"); $("panneau").classList.remove("ouvert");
    QA("#rail button").forEach(function (b) { b.classList.remove("actif"); }); setTimeout(cadrer, 260);
  }
  QA("#rail button").forEach(function (b) { b.addEventListener("click", function () { ouvrirPanneau(b.getAttribute("data-p")); }); });
  $("panneau-fermer").addEventListener("click", fermerPanneau);
  function rendrePanneau() {
    var c = $("panneau-corps"); if (!etat.panneau) return;
    var y = c.scrollTop; c.textContent = "";
    ({ ajouter: pAjouter, structure: pStructure, style: pStyle, infos: pInfos, pages: pPages, domaine: pDomaine, verifier: pVerifier, aide: pAide })[etat.panneau](c);
    c.scrollTop = y;
  }

  /* ---------- Ajouter ---------- */
  var sortBiblio = [];
  function pAjouter(c) {
    sortBiblio.forEach(function (s) { s.destroy(); }); sortBiblio = [];
    if (etat.apres && trouver(etat.apres)) c.appendChild(h("p", { class: "p-info" }, ["La section sera ajoutée après « " + nomBloc(trouver(etat.apres)) + " ». ", h("button", { type: "button", class: "btn-lien", text: "Ajouter à la fin", onclick: function () { etat.apres = null; rendrePanneau(); } })]));
    else c.appendChild(h("p", { class: "p-aide", text: tactile ? "Touchez une section pour l'ajouter, ou maintenez-la puis glissez-la sur la page." : "Glissez une section sur la page à l'endroit voulu, ou cliquez pour l'ajouter." }));
    var champ = h("input", { class: "p-recherche", type: "search", placeholder: "Chercher : horaires, photos, avis…", "aria-label": "Chercher une section" });
    c.appendChild(champ);
    var zones = [];
    BL.CATS.forEach(function (cat) {
      var g = h("div", { class: "biblio" });
      Object.keys(B).forEach(function (t) {
        if (B[t].cat !== cat[0]) return;
        var b = B[t], deja = P.pages.some(function (p) { return p.sections.some(function (s) { return s.t === t; }); });
        g.appendChild(h("button", { type: "button", class: "tuile", "data-type": t, "data-q": slug(b.nom + " " + b.desc), onclick: function () { ajouter(t); } }, [
          h("span", { class: "tuile-v", html: BL.vignette(t) }), h("span", { class: "tuile-t" }, [h("b", { text: b.nom }), h("small", { text: b.desc })]), deja ? h("i", { class: "tuile-deja", title: "Déjà sur votre site", html: svg(I.ok) }) : null
        ]));
      });
      var bloc = h("section", { class: "p-groupe" }, [h("h3", { text: cat[1] }), g]);
      zones.push(bloc); c.appendChild(bloc);
      sortBiblio.push(Sortable.create(g, { group: { name: "biblio", pull: "clone", put: false }, sort: false, forceFallback: true, fallbackOnBody: true, animation: 150, delay: 180, delayOnTouchOnly: true, dragClass: "tuile-traine", ghostClass: "tuile-fantome",
        onStart: function () { $("app").classList.add("glisse"); }, onEnd: function () { $("app").classList.remove("glisse"); } }));
    });
    champ.addEventListener("input", function () {
      var q = slug(champ.value);
      zones.forEach(function (z) { var vis = 0; QA(".tuile", z).forEach(function (t) { var ok = !q || t.getAttribute("data-q").indexOf(q) > -1; t.hidden = !ok; if (ok) vis++; }); z.hidden = !vis; });
    });
  }

  /* ---------- Plan de la page ---------- */
  var sortPlan = null;
  function pStructure(c) {
    if (sortPlan) { sortPlan.destroy(); sortPlan = null; }
    var pg = pageCourante();
    c.appendChild(h("p", { class: "p-aide", text: "L'ordre de vos sections, de haut en bas. Glissez pour réorganiser." }));
    var fixe = function (id, nom) { return h("button", { type: "button", class: "plan-l plan-fixe" + (etat.sel === id ? " actif" : ""), onclick: function () { choisir(id); defilerVers(Q('[data-glob="' + id + '"]', site)); } }, [h("span", { class: "plan-nom", text: nom }), h("small", { text: "sur toutes les pages" })]); };
    c.appendChild(fixe("entete", "En-tête"));
    if (pg.html) { c.appendChild(h("p", { class: "p-info", text: "Cette page est créée automatiquement à partir de vos infos. Complétez l'onglet Infos pour la remplir." })); c.appendChild(fixe("pied", "Pied de page")); return; }
    var l = h("ol", { class: "plan" });
    pg.sections.forEach(function (s) {
      var masq = s.s.mob === false ? "masquée sur téléphone" : s.s.ord === false ? "masquée sur ordinateur" : "";
      l.appendChild(h("li", { class: "plan-l" + (etat.sel === s.id ? " actif" : ""), "data-id": s.id }, [
        h("span", { class: "plan-poignee", html: svg(I.poignee), "aria-hidden": "true" }),
        h("button", { type: "button", class: "plan-nom-b", onclick: function () { choisir(s.id); var el = Q('[data-sec="' + s.id + '"]', site); if (el) defilerVers(el); } }, [h("span", { class: "plan-nom", text: nomBloc(s) }), h("small", { text: [B[s.t].variantes.filter(function (v) { return v[0] === s.v; })[0][1], s.menu ? "dans le menu : " + s.menu : "", masq, s.ex && (s.t === "avis" || s.t === "prestations" || s.t === "produits") ? "contenu d'exemple" : ""].filter(Boolean).join(", ") })]),
        h("button", { type: "button", class: "ico ico--s", title: "Supprimer", "aria-label": "Supprimer " + nomBloc(s), html: svg(I.corbeille), onclick: function () { supprimer(s.id); } })
      ]));
    });
    c.appendChild(l);
    sortPlan = Sortable.create(l, { handle: ".plan-poignee", animation: 180, forceFallback: true, fallbackOnBody: true, ghostClass: "plan-fantome",
      onEnd: function () { var o = QA("li", l).map(function (x) { return x.getAttribute("data-id"); }); pg.sections.sort(function (a, b) { return o.indexOf(a.id) - o.indexOf(b.id); }); rendreSite(); change({ sansPanneau: true }); } });
    c.appendChild(fixe("pied", "Pied de page"));
    c.appendChild(h("button", { type: "button", class: "btn-2 btn-plein", html: svg(I.plus) + "Ajouter une section", onclick: function () { ouvrirPanneau("ajouter"); } }));
  }

  /* ---------- Style ---------- */
  var COUL = ["#0B63CE", "#1B1E22", "#8C1D2C", "#2F6B4F", "#B4532A", "#9C7A2E", "#7A3E52", "#3D4F9F", "#0E7C86", "#C08A1E"];
  var AMBIANCES = [
    ["Enseigne de quartier", { police: "enseigne", fond: "clair", rayon: "carre" }],
    ["Maison chic", { police: "elegant", fond: "creme", rayon: "doux" }],
    ["Artisan", { police: "artisan", fond: "creme", rayon: "rond" }],
    ["Nuit", { police: "moderne", fond: "sombre", rayon: "doux" }],
    ["Classique", { police: "classique", fond: "clair", rayon: "carre" }],
    ["Net et simple", { police: "simple", fond: "gris", rayon: "doux" }]
  ];
  function theme(k, v) { P.theme[k] = v; transition(function () { rendreSite(); }); change(); rendrePanneau(); }
  function pStyle(c) {
    var T = P.theme, M = BL.M[P.infos.metier] || BL.M.autre;
    c.appendChild(groupe("Ambiances toutes prêtes", [h("div", { class: "ambiances" }, AMBIANCES.map(function (a) {
      var pol = BL.POLICES[a[1].police], f = BL.FONDS[a[1].fond], actif = T.police === a[1].police && T.fond === a[1].fond && T.rayon === a[1].rayon;
      return h("button", { type: "button", class: "ambiance" + (actif ? " actif" : ""), style: "--af:" + f.fond + ";--ae:" + f.encre + ";--ac:" + T.c1 + ";--ar:" + BL.RAYONS[a[1].rayon].r, onclick: function () { Object.assign(P.theme, a[1]); transition(function () { rendreSite(); }); change(); rendrePanneau(); toast("Ambiance « " + a[0] + " » appliquée"); } }, [
        h("span", { class: "amb-ex", style: "font-family:" + pol.titre + ";font-weight:" + pol.poids + ";text-transform:" + pol.casse + ";font-stretch:" + pol.large, text: P.infos.nom ? P.infos.nom.slice(0, 14) : "Chez Sam" }), h("span", { class: "amb-btn" }), h("small", { text: a[0] })
      ]);
    }))]));
    var pers = h("label", { class: "pastille pastille-perso" + (COUL.concat(M.couleurs).indexOf(T.c1) < 0 ? " actif" : ""), title: "Autre couleur", style: "--p:" + (COUL.concat(M.couleurs).indexOf(T.c1) < 0 ? T.c1 : "conic-gradient(#e03131,#f08c00,#2f9e44,#1971c2,#9c36b5,#e03131)") }, [h("input", { type: "color", value: T.c1, "aria-label": "Choisir une autre couleur", oninput: debounce(function (e) { P.theme.c1 = e.target.value; rendreSite(); change({ vite: true }); }, 60), onchange: function () { rendrePanneau(); } })]);
    var past = function (col) { return h("button", { type: "button", class: "pastille" + (T.c1.toLowerCase() === col.toLowerCase() ? " actif" : ""), style: "--p:" + col, "aria-label": col, title: col, onclick: function () { theme("c1", col); } }); };
    c.appendChild(groupe("Couleur principale", [
      h("p", { class: "p-mini", text: "Conseillées pour votre métier" }), h("div", { class: "pastilles" }, M.couleurs.map(past)),
      h("p", { class: "p-mini", text: "Toutes les couleurs" }), h("div", { class: "pastilles" }, COUL.filter(function (x) { return M.couleurs.indexOf(x) < 0; }).map(past).concat([pers])),
      P.logo ? h("button", { type: "button", class: "btn-2 btn-plein", text: "Prendre la couleur de mon logo", onclick: function () { var im = new Image(); im.onload = function () { var col = couleurDe(im); if (col) { theme("c1", col); toast("Couleur tirée de votre logo"); } }; im.src = MEDIAS[P.logo]; } }) : null,
      contrasteInfo()
    ]));
    c.appendChild(groupe("Écriture des titres", [h("div", { class: "polices" }, Object.keys(BL.POLICES).map(function (k) {
      var p = BL.POLICES[k];
      return h("button", { type: "button", class: "police" + (T.police === k ? " actif" : ""), onclick: function () { theme("police", k); } }, [h("span", { style: "font-family:" + p.titre + ";font-weight:" + p.poids + ";text-transform:" + p.casse + ";font-stretch:" + p.large + ";letter-spacing:" + p.esp, text: "Aa" }), h("small", { text: p.nom })]);
    }))]));
    c.appendChild(groupe("Fond des pages", [segments(Object.keys(BL.FONDS).map(function (k) { return [k, BL.FONDS[k].nom, BL.FONDS[k].fond]; }), T.fond, function (v) { theme("fond", v); }, true)]));
    c.appendChild(groupe("Coins", [segments(Object.keys(BL.RAYONS).map(function (k) { return [k, BL.RAYONS[k].nom]; }), T.rayon, function (v) { theme("rayon", v); })]));
    c.appendChild(groupe("Mouvement", [interrupteur("Les sections apparaissent en douceur quand on fait défiler", T.anim, function (v) { P.theme.anim = v; change(); toast(v ? "Visible dans l'aperçu" : "Animations coupées"); })]));
  }
  function contrasteInfo() {
    var r = BL.contraste(P.theme.c1, "#FFFFFF"), r2 = BL.contraste(P.theme.c1, "#15181C");
    if (Math.max(r, r2) >= 4.5) return h("p", { class: "p-ok", html: svg(I.ok) + "Bonne lisibilité : le texte sur cette couleur reste facile à lire." });
    return h("p", { class: "p-alerte", text: "Couleur peu contrastée : les textes posés dessus seront moins lisibles. L'Atelier ajuste automatiquement les textes en couleur." });
  }

  /* ---------- Infos ---------- */
  function infos(k, v, o) { P.infos[k] = v; o = o || {}; (o.lent ? rendreSiteBientot : rendreSite)(); change({ vite: true }); }
  var rendreSiteBientot = debounce(function () { rendreSite(); }, 220);
  function pInfos(c) {
    var i = P.infos;
    var ch = function (k, lab, a) { a = a || {}; return texte(lab, i[k], function (v) { infos(k, v, { lent: true }); if (a.apres) a.apres(v); }, a); };
    var logo = h("div", { class: "logo-l" }, [
      h("div", { class: "logo-v", html: P.logo && MEDIAS[P.logo] ? '<img src="' + MEDIAS[P.logo] + '" alt="Votre logo">' : '<span>' + K.e((i.nom || "?").charAt(0).toUpperCase()) + "</span>" }),
      h("div", {}, [h("button", { type: "button", class: "btn-2", text: P.logo ? "Changer de logo" : "Ajouter mon logo", onclick: function () { choisirFichier().then(function (f) { if (!f[0]) return; lireImage(f[0], 600).then(function (r) { P.logo = ajouterMedia(r.data); var col = couleurDe(r.canvas); rendreSite(); change(); rendrePanneau(); if (col) toast("Logo ajouté. Utiliser sa couleur ?", "Oui", function () { theme("c1", col); }); else toast("Logo ajouté"); }); }); } }),
        P.logo ? h("button", { type: "button", class: "btn-lien", text: "Retirer", onclick: function () { P.logo = null; rendreSite(); change(); rendrePanneau(); } }) : null])
    ]);
    c.appendChild(groupe("Votre commerce", [
      ch("nom", "Nom du commerce", { ph: "Chez Sam", max: 40, apres: function () { $("url").textContent = P.domaine || (slug(P.infos.nom) || "votre-commerce") + ".fr"; } }),
      choix("Métier", BL.ORDRE_METIERS.map(function (m) { return [m, BL.M[m].nom]; }), i.metier, function (v) { infos("metier", v); toast("Métier changé. Les nouvelles sections suivront ce métier."); }),
      logo
    ]));
    c.appendChild(groupe("Coordonnées", [
      ch("tel", "Téléphone", { type: "tel", ph: "06 12 34 56 78", verif: function (v) { return !v || v.replace(/\D/g, "").length >= 10 ? "" : "Un numéro français compte 10 chiffres."; } }),
      ch("email", "E-mail", { type: "email", ph: "contact@chez-sam.fr", verif: function (v) { return !v || /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v) ? "" : "Cette adresse e-mail semble incomplète."; } }),
      ch("adresse", "Adresse", { ph: "12 rue Émile Zola" }),
      h("div", { class: "rang" }, [ch("cp", "Code postal", { ph: "10000", max: 5, mode: "numeric" }), ch("ville", "Ville", { ph: "Troyes" })])
    ]));
    c.appendChild(groupe("Horaires", [editeurHoraires(i.horaires, function () { rendreSite(); change({ vite: true }); }), h("p", { class: "p-mini", text: "Ils servent partout : « ouvert maintenant », créneaux de rendez-vous, heures de retrait." })]));
    c.appendChild(groupe("Réseaux sociaux", [ch("insta", "Instagram", { ph: "@chezsam" }), ch("facebook", "Facebook", { ph: "chezsam.troyes ou lien complet" }), ch("tiktok", "TikTok", { ph: "@chezsam" })]));
    c.appendChild(groupe("Mentions légales", [
      h("p", { class: "p-mini", text: "Obligatoires sur un site professionnel. L'Atelier rédige les pages pour vous à partir de ces infos." }),
      choix("Forme juridique", [["", "Choisir…"], ["Entreprise individuelle (micro-entreprise)", "Micro-entreprise"], ["Entreprise individuelle", "Entreprise individuelle"], ["EURL", "EURL"], ["SARL", "SARL"], ["SASU", "SASU"], ["SAS", "SAS"]], i.forme, function (v) { infos("forme", v); }),
      ch("responsable", "Nom du responsable", { ph: "Prénom Nom" }),
      ch("siret", "Numéro SIRET", { ph: "14 chiffres", mode: "numeric", verif: function (v) { return !v || siretOk(v) ? "" : "Ce numéro SIRET ne semble pas valide : vérifiez les 14 chiffres."; } }),
      ch("mediateur", "Médiateur de la consommation", { ph: "Nom et site du médiateur" }),
      h("button", { type: "button", class: "btn-lien", text: "Voir la page Mentions légales", onclick: function () { allerPage("mentions"); } })
    ]));
  }
  function siretOk(v) { var d = v.replace(/\s/g, ""); if (!/^\d{14}$/.test(d)) return false; var s = 0; for (var i = 0; i < 14; i++) { var n = +d[13 - i]; if (i % 2) { n *= 2; if (n > 9) n -= 9; } s += n; } return s % 10 === 0 || /^356000000/.test(d); }
  function editeurHoraires(H, apres) {
    var box = h("div", { class: "hor-ed" });
    function dessiner() {
      box.textContent = "";
      var pre = h("div", { class: "hor-pre" }, [["marsam", "Mar–sam, 9h–19h"], ["lunsam", "Lun–sam, 9h–19h"], ["pause", "Avec pause midi"], ["tous", "7j/7, 11h–23h"], ["resto", "Midi et soir"]].map(function (p) {
        return h("button", { type: "button", class: "puce", text: p[1], onclick: function () { var n = HOR[p[0]](); for (var j = 0; j < 7; j++) H[j] = n[j]; dessiner(); apres(); } });
      }));
      box.appendChild(pre);
      H.forEach(function (j, i) {
        var l = h("div", { class: "hor-l" + (j.o ? "" : " ferme") }, [
          h("label", { class: "hor-j" }, [h("input", { type: "checkbox", checked: j.o, onchange: function (e) { j.o = e.target.checked; dessiner(); apres(); } }), h("span", { text: K.JOURS[i] })]),
          j.o ? h("span", { class: "hor-h" }, [heureInp(j, "a"), h("i", { text: "à" }), heureInp(j, "f")]) : h("span", { class: "hor-ferme", text: "Fermé" }),
          j.o ? h("button", { type: "button", class: "hor-pause" + (j.p ? " on" : ""), title: "Pause dans la journée", text: j.p ? "Pause" : "+ pause", onclick: function () { j.p = !j.p; dessiner(); apres(); } }) : h("span")
        ]);
        box.appendChild(l);
        if (j.o && j.p) box.appendChild(h("div", { class: "hor-l hor-l--p" }, [h("span", { class: "hor-j", text: "fermé de" }), h("span", { class: "hor-h" }, [heureInp(j, "pa"), h("i", { text: "à" }), heureInp(j, "pf")]), h("span")]));
      });
      box.appendChild(h("button", { type: "button", class: "btn-lien", text: "Copier le premier jour ouvert sur tous les jours ouverts", onclick: function () { var r = H.filter(function (x) { return x.o; })[0]; if (!r) return; H.forEach(function (x) { if (x.o) { x.a = r.a; x.f = r.f; x.p = r.p; x.pa = r.pa; x.pf = r.pf; } }); dessiner(); apres(); } }));
    }
    function heureInp(j, k) { return h("input", { type: "time", value: j[k], step: 900, "aria-label": { a: "Ouverture", f: "Fermeture", pa: "Début de la pause", pf: "Fin de la pause" }[k], onchange: function (e) { j[k] = e.target.value; apres(); } }); }
    dessiner(); return box;
  }

  /* ---------- Pages ---------- */
  var MODELES_PAGE = [["Contact", ["contact:formulaire", "horaires:carte", "acces:plan"]], ["La carte", ["prestations:ardoise"]], ["Photos", ["galerie:mosaique"]], ["Réserver", ["reservation:etapes"]], ["Page vide", ["texte:gauche"]]];
  var sortPages = null;
  function pPages(c) {
    if (sortPages) { sortPages.destroy(); sortPages = null; }
    c.appendChild(h("p", { class: "p-aide", text: "Une seule page suffit souvent. Ajoutez-en si vous avez beaucoup à montrer : le menu se met à jour tout seul." }));
    var l = h("ol", { class: "plan" });
    P.pages.forEach(function (p, i) {
      var nomI = h("input", { class: "page-nom", value: p.nom, "aria-label": "Nom de la page", maxlength: 24, oninput: function (e) { p.nom = e.target.value || "Page"; rendreEntete(); $("nom-page").textContent = pageCourante().nom; change({ vite: true, sansPanneau: true }); } });
      l.appendChild(h("li", { class: "plan-l" + (etat.page === p.id ? " actif" : ""), "data-id": p.id }, [
        i ? h("span", { class: "plan-poignee", html: svg(I.poignee), "aria-hidden": "true" }) : h("span", { class: "plan-poignee plan-poignee--off", html: svg('<path d="M4 11 12 4l8 7M6 9.5V20h12V9.5"/>'), title: "Page d'accueil" }),
        nomI,
        h("button", { type: "button", class: "ico ico--s", title: "Voir la page", "aria-label": "Voir " + p.nom, html: svg(I.oeil), onclick: function () { allerPage(p.id); } }),
        i ? h("button", { type: "button", class: "ico ico--s", title: "Supprimer la page", "aria-label": "Supprimer " + p.nom, html: svg(I.corbeille), onclick: function () { confirmer("Supprimer la page « " + p.nom + " » ?", "Ses " + p.sections.length + " sections seront supprimées. Vous pourrez annuler juste après.", "Supprimer", function () { P.pages.splice(P.pages.indexOf(p), 1); if (etat.page === p.id) etat.page = "accueil"; toutRendre(); change(); toast("Page supprimée", "Annuler", function () { voyager(-1); }); }); } }) : h("span")
      ]));
    });
    c.appendChild(l);
    sortPages = Sortable.create(l, { handle: ".plan-poignee:not(.plan-poignee--off)", filter: "input", preventOnFilter: false, animation: 180, forceFallback: true, fallbackOnBody: true, ghostClass: "plan-fantome",
      onMove: function (ev) { return ev.related !== l.firstElementChild; },
      onEnd: function () { var o = QA("li", l).map(function (x) { return x.getAttribute("data-id"); }); P.pages.sort(function (a, b) { return o.indexOf(a.id) - o.indexOf(b.id); }); rendreSite(); change(); } });
    c.appendChild(groupe("Ajouter une page", [h("div", { class: "modeles" }, MODELES_PAGE.map(function (m) {
      return h("button", { type: "button", class: "puce", html: svg(I.plus) + K.e(m[0]), onclick: function () {
        var p = { id: uid(), nom: m[0] === "Page vide" ? "Nouvelle page" : m[0], sections: m[1].map(function (x) { var q = x.split(":"), s = nouvelleSection(q[0], q[1]); s.menu = ""; return s; }) };
        P.pages.push(p); change(); allerPage(p.id); rendrePanneau(); toast("Page « " + p.nom + " » ajoutée au menu");
      } });
    }))]));
    c.appendChild(groupe("Pages créées pour vous", BL.pagesLegales(P).map(function (p) {
      return h("button", { type: "button", class: "plan-l plan-fixe" + (etat.page === p.id ? " actif" : ""), onclick: function () { allerPage(p.id); } }, [h("span", { class: "plan-nom", text: p.nom }), h("small", { text: "remplie à partir de vos infos, liée en bas de chaque page" })]);
    })));
  }

  /* ---------- Adresse du site (nom de domaine) ---------- */
  var DISPO = {};
  var VIDES = ["le", "la", "les", "l", "de", "du", "des", "d", "et", "a", "au", "aux", "chez", "the"];
  function propositions() {
    var i = P.infos, n = slug(i.nom), v = slug(i.ville), m = slug((BL.M[i.metier] || {}).nom || "").split("-")[0];
    if (!n) return [];
    var mots = n.split("-"), court = mots.filter(function (w) { return VIDES.indexOf(w) < 0; }).join("-") || n, sans = function (x) { return x.replace(/-/g, ""); };
    var METIERS_MOTS = ["boucherie", "boucher", "barbier", "barber", "barbershop", "salon", "coiffure", "coiffeur", "institut", "beaute", "snack", "restaurant", "resto", "boulangerie", "patisserie", "epicerie", "fleuriste", "fleurs", "autre", "activite"];
    var coeur = court.split("-").filter(function (w) { return METIERS_MOTS.indexOf(w) < 0; }).join("-") || court;
    var base = [n, sans(n), court, sans(court), coeur, sans(coeur)];
    if (m && court.indexOf(m) < 0) base.push(m + "-" + sans(coeur), sans(m + coeur));
    if (m && coeur !== court) base.push(m + "-" + sans(coeur));
    if (v) base.push(sans(coeur) + "-" + v, coeur + "-" + v, sans(coeur + v));
    var vus = {}, r = [];
    base.forEach(function (b) { b = b.replace(/^-+|-+$/g, "").slice(0, 40); if (b.length < 3 || vus[b]) return; vus[b] = 1; r.push(b); });
    var out = [];
    r.forEach(function (b) { [".fr", ".com"].forEach(function (t) { var x = note(b + t, b, t, v); if (b === sans(coeur) && coeur.length < 4) x.score -= 25; out.push(x); }); });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 12);
  }
  function note(d, b, t, v) {
    var s = 50, tags = [];
    if (b.length <= 12) { s += 18; tags.push("Court"); } else if (b.length > 22) s -= 15;
    if (b.indexOf("-") < 0) { s += 8; tags.push("Sans tiret"); } else s -= 4 * (b.split("-").length - 1);
    if (v && b.indexOf(v) > -1) { s += 6; tags.push("Avec la ville"); }
    if (t === ".fr") { s += 10; tags.push("Extension française"); }
    return { d: d, score: s, tags: tags };
  }
  function verifierDomaine(d) {
    DISPO[d] = "verif"; majDomaine(d);
    var url = "https://dns.google/resolve?name=" + encodeURIComponent(d) + "&type=NS";
    return fetch(url, { headers: { accept: "application/dns-json" } }).then(function (r) { return r.json(); }).catch(function () {
      return fetch("https://cloudflare-dns.com/dns-query?name=" + encodeURIComponent(d) + "&type=NS", { headers: { accept: "application/dns-json" } }).then(function (r) { return r.json(); });
    }).then(function (j) {
      DISPO[d] = j.Status === 3 ? "libre" : j.Status === 0 ? "pris" : "inconnu";
    }).catch(function () { DISPO[d] = "inconnu"; }).then(function () { majDomaine(d); });
  }
  function majDomaine(d) {
    var el = Q('[data-dom="' + CSS.escape(d) + '"] .dom-etat'); if (!el) return;
    var e = DISPO[d] || "";
    el.className = "dom-etat " + e;
    el.textContent = { verif: "Vérification…", libre: "Probablement libre", pris: "Déjà pris", inconnu: "À vérifier chez un registraire" }[e] || "";
  }
  function dire(d) {
    if (!("speechSynthesis" in window)) { toast("La lecture à voix haute n'est pas disponible sur cet appareil"); return; }
    var t = d.replace(/\./g, " point ").replace(/-/g, " tiret "), u = new SpeechSynthesisUtterance(t); u.lang = "fr-FR"; u.rate = .95;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
  function pDomaine(c) {
    c.appendChild(h("p", { class: "p-aide", text: "C'est l'adresse que vos clients tapent, et celle que vous dites au téléphone. Courte, sans tiret si possible, et facile à épeler." }));
    if (P.domaine) c.appendChild(h("div", { class: "dom-choisi" }, [h("small", { text: "Adresse choisie" }), h("b", { text: P.domaine }), h("span", { text: "E-mail possible : contact@" + P.domaine }), h("button", { type: "button", class: "btn-lien", text: "Changer", onclick: function () { P.domaine = ""; change(); rendrePanneau(); $("url").textContent = (slug(P.infos.nom) || "votre-commerce") + ".fr"; } })]));
    if (!P.infos.nom) { c.appendChild(h("p", { class: "p-info", text: "Indiquez d'abord le nom de votre commerce dans l'onglet Infos." })); return; }
    var liste = h("ul", { class: "doms" }), props = propositions();
    function ligne(p) {
      return h("li", { class: "dom" + (P.domaine === p.d ? " actif" : ""), "data-dom": p.d }, [
        h("div", { class: "dom-t" }, [h("b", { text: p.d }), h("span", { class: "dom-tags", text: p.tags.join(", ") }), h("span", { class: "dom-etat" })]),
        h("div", { class: "dom-act" }, [
          h("button", { type: "button", class: "ico ico--s", title: "Écouter comment il se dit", "aria-label": "Écouter " + p.d, html: svg(I.son), onclick: function () { dire(p.d); } }),
          h("button", { type: "button", class: "btn-2 btn--s", text: "Vérifier", onclick: function () { verifierDomaine(p.d); } }),
          h("button", { type: "button", class: "btn btn--s", text: "Choisir", onclick: function () { P.domaine = p.d; $("url").textContent = p.d; change(); rendrePanneau(); toast("Adresse choisie : " + p.d); } })
        ])
      ]);
    }
    props.forEach(function (p) { liste.appendChild(ligne(p)); });
    c.appendChild(groupe("Nos propositions", [liste, h("button", { type: "button", class: "btn-2 btn-plein", text: "Vérifier toutes les adresses", onclick: function () { var k = 0; props.forEach(function (p) { if (!DISPO[p.d] || DISPO[p.d] === "inconnu") setTimeout(function () { verifierDomaine(p.d); }, (k++) * 250); }); } })]));
    setTimeout(function () { props.forEach(function (p) { majDomaine(p.d); }); }, 0);
    var perso = h("input", { class: "p-recherche", placeholder: "votre-idee.fr", "aria-label": "Tester votre propre adresse", spellcheck: "false" });
    var res = h("ul", { class: "doms" });
    c.appendChild(groupe("Tester votre idée", [h("div", { class: "rang rang--b" }, [perso, h("button", { type: "button", class: "btn btn--s", text: "Tester", onclick: function () {
      var v = perso.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, ""); if (!v) return; if (v.indexOf(".") < 0) v += ".fr";
      if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(slug(v.split(".")[0]) + "." + v.split(".").slice(1).join("."))) { toast("Utilisez seulement des lettres, des chiffres et des tirets"); return; }
      v = slug(v.split(".")[0]) + "." + v.split(".").slice(1).join(".");
      res.textContent = ""; var p = note(v, v.split(".")[0], "." + v.split(".").slice(1).join("."), slug(P.infos.ville)); res.appendChild(ligne(p)); verifierDomaine(v);
    } })]), res]));
    c.appendChild(groupe("Bon à savoir", [
      h("p", { class: "p-mini", text: "Le .fr est l'extension la plus naturelle pour un commerce en France. Le .com est connu de tous." }),
      h("p", { class: "p-mini", text: "Méfiez-vous des extensions très bon marché la première année (.shop, .store…) : chez certains registraires, le renouvellement coûte ensuite plusieurs dizaines d'euros par an." }),
      h("p", { class: "p-mini", text: "La vérification interroge l'annuaire public des noms de domaine (DNS de Google) : seul le nom testé est envoyé. « Probablement libre » se confirme au moment de l'achat." })
    ]));
  }

  /* ---------- Vérifier ---------- */
  function photos() { var n = 0; if (P.logo) n++; JSON.stringify(P.pages).replace(/"(m[a-z0-9]{6,})"/g, function (x, id) { if (MEDIAS[id]) n++; }); return n; }
  function controles() {
    var i = P.infos, ex = [];
    P.pages.forEach(function (p) { p.sections.forEach(function (s) { if (s.ex && (s.t === "prestations" || s.t === "produits" || s.t === "reservation" || s.t === "commande")) ex.push(s); }); });
    var avisEx = []; P.pages.forEach(function (p) { p.sections.forEach(function (s) { if (s.ex && s.t === "avis") avisEx.push(s); }); });
    return [
      { ok: !!i.nom.trim(), t: "Le nom de votre commerce", f: function () { ouvrirPanneau("infos"); } },
      { ok: i.tel.replace(/\D/g, "").length >= 10, t: "Votre numéro de téléphone", f: function () { ouvrirPanneau("infos"); } },
      { ok: !!(i.adresse && i.ville), t: "Votre adresse complète", f: function () { ouvrirPanneau("infos"); } },
      { ok: K.aDesHoraires(i.horaires), t: "Vos horaires", f: function () { ouvrirPanneau("infos"); } },
      { ok: !ex.length, t: ex.length ? "Vos vrais prix (" + ex.map(nomBloc).join(", ") + " : contenu d'exemple)" : "Vos vrais prix", f: function () { if (ex[0]) { allerPage(pageDe(ex[0].id).id); setTimeout(function () { choisir(ex[0].id, { force: true }); defilerVers(Q('[data-sec="' + ex[0].id + '"]', site)); }, 80); } } },
      { ok: !avisEx.length, t: avisEx.length ? "De vrais avis clients (les avis d'exemple ne seront pas publiés)" : "De vrais avis clients", f: function () { if (avisEx[0]) { allerPage(pageDe(avisEx[0].id).id); setTimeout(function () { choisir(avisEx[0].id, { force: true }); defilerVers(Q('[data-sec="' + avisEx[0].id + '"]', site)); }, 80); } } },
      { ok: photos() >= 3, t: "Au moins 3 vraies photos (" + photos() + " pour l'instant)", f: function () { var s = null; P.pages.forEach(function (p) { p.sections.forEach(function (x) { if (!s && (x.t === "galerie" || x.t === "heros")) s = x; }); }); if (s) { allerPage(pageDe(s.id).id); setTimeout(function () { choisir(s.id, { force: true }); defilerVers(Q('[data-sec="' + s.id + '"]', site)); }, 80); } } },
      { ok: !!P.logo, t: "Votre logo (facultatif)", opt: true, f: function () { ouvrirPanneau("infos"); } },
      { ok: !!(i.forme && i.responsable && siretOk(i.siret || "")), t: "Les infos des mentions légales (forme, responsable, SIRET)", f: function () { ouvrirPanneau("infos"); setTimeout(function () { var g = QA("#panneau-corps .groupe"); if (g.length) g[g.length - 1].scrollIntoView({ behavior: "smooth" }); }, 120); } },
      { ok: !!P.domaine, t: "L'adresse de votre site", f: function () { ouvrirPanneau("domaine"); } }
    ];
  }
  function score() { var c = controles().filter(function (x) { return !x.opt; }); return Math.round(100 * c.filter(function (x) { return x.ok; }).length / c.length); }
  function majVerif() { var s = score(), a = $("anneau"); a.style.strokeDashoffset = 88 - 88 * s / 100; $("anneau-pct").textContent = s; a.classList.toggle("fini", s === 100); }
  function pVerifier(c) {
    var s = score();
    c.appendChild(h("div", { class: "verif-tete" }, [h("b", { text: s + " %" }), h("span", { text: s === 100 ? "Tout est prêt. Votre site peut partir en ligne." : "Encore quelques infos et votre site sera complet." })]));
    c.appendChild(h("ul", { class: "verif" }, controles().map(function (x) {
      return h("li", { class: x.ok ? "ok" : "" }, [h("span", { class: "verif-c", html: x.ok ? svg(I.ok) : "" }), h("span", { class: "verif-t", text: x.t }), x.ok ? null : h("button", { type: "button", class: "btn-lien", text: "Compléter", onclick: x.f })]);
    })));
    c.appendChild(h("button", { type: "button", class: "btn btn-plein", text: "Mettre en ligne", onclick: publier }));
  }

  /* ---------- Aide ---------- */
  function pAide(c) {
    c.appendChild(groupe("Prise en main", [
      h("button", { type: "button", class: "btn-2 btn-plein", text: "Revoir la visite guidée", onclick: function () { fermerPanneau(); visite(); } }),
      h("ul", { class: "astuces" }, [
        ["Écrire", "Cliquez sur un texte de la page et tapez directement."],
        ["Déplacer", "Attrapez la poignée d'une section et glissez-la, ou utilisez les flèches."],
        ["Changer de mise en page", "Le bouton à deux colonnes dans la barre de la section fait défiler les variantes."],
        ["Photos", "Cliquez sur une section, puis sur la photo pour la remplacer."],
        ["Tout retrouver", "Ctrl K (ou Cmd K) ouvre la recherche d'actions."]
      ].map(function (a) { return h("li", {}, [h("b", { text: a[0] }), h("span", { text: a[1] })]); }))
    ]));
    c.appendChild(groupe("Raccourcis clavier", [h("ul", { class: "raccourcis" }, [["Ctrl Z", "Annuler"], ["Ctrl Maj Z", "Rétablir"], ["Ctrl K", "Chercher une action"], ["Suppr", "Supprimer la section choisie"], ["Ctrl D", "Dupliquer la section"], ["Alt ↑ ↓", "Monter, descendre la section"], ["Échap", "Désélectionner, fermer"]].map(function (r) { return h("li", {}, [h("kbd", { text: r[0] }), h("span", { text: r[1] })]); }))]));
    c.appendChild(groupe("Votre projet", [
      h("p", { class: "p-mini", text: "Votre projet est enregistré sur cet appareil, dans ce navigateur. Pour le garder ailleurs, téléchargez-le." }),
      h("button", { type: "button", class: "btn-2 btn-plein", html: svg(I.telecharger) + "Télécharger le projet (.json)", onclick: exporterJSON }),
      h("button", { type: "button", class: "btn-2 btn-plein", text: "Ouvrir un projet (.json)", onclick: importerJSON }),
      h("button", { type: "button", class: "btn-2 btn-plein", html: svg(I.lien) + "Copier le lien du projet", onclick: copierLien }),
      h("button", { type: "button", class: "btn-lien btn-danger", text: "Recommencer un nouveau site", onclick: function () { confirmer("Recommencer un nouveau site ?", "Le projet actuel sera remplacé. Téléchargez-le avant si vous voulez le garder.", "Recommencer", function () { assistant({}); }); } })
    ]));
  }

  /* ===================== Inspecteur ===================== */
  var sortListes = [];
  function ouvrirInspecteur(plein) { var i = $("inspecteur"); i.classList.add(plein ? "ouvert" : "peek"); if (plein) i.classList.remove("peek"); }
  function rendreInspecteur() {
    var ins = $("inspecteur"); sortListes.forEach(function (s) { s.destroy(); }); sortListes = [];
    var y = (Q(".ins-corps", ins) || {}).scrollTop || 0;
    ins.textContent = ""; $("app").classList.toggle("avec-ins", !!etat.sel && etat.mode === "edition");
    if (!etat.sel || etat.mode !== "edition") {
      ins.classList.remove("peek"); if (etroit()) ins.classList.remove("ouvert");
      ins.appendChild(h("div", { class: "ins-vide" }, [
        h("h2", { text: "Réglages" }),
        h("p", { text: "Cliquez sur une section de la page pour régler ses textes, ses photos, sa mise en page et son fond." }),
        h("button", { type: "button", class: "btn-2 btn-plein", text: "Régler l'en-tête", onclick: function () { choisir("entete"); } }),
        h("button", { type: "button", class: "btn-2 btn-plein", text: "Ajouter une section", onclick: function () { ouvrirPanneau("ajouter"); } }),
        h("button", { type: "button", class: "btn-2 btn-plein", text: "Changer le style", onclick: function () { ouvrirPanneau("style"); } }),
        h("p", { class: "p-mini", html: "Astuce : <kbd>Ctrl</kbd> <kbd>K</kbd> pour chercher n'importe quelle action." })
      ]));
      return;
    }
    var id = etat.sel, s = id === "entete" || id === "pied" ? id : trouver(id); if (!s) { etat.sel = null; return rendreInspecteur(); }
    var onglet = ins.getAttribute("data-onglet") || "contenu";
    var tete = h("div", { class: "ins-tete" }, [
      h("div", { class: "poignee-feuille", "aria-hidden": "true" }),
      h("button", { type: "button", class: "ins-titre", onclick: function () { if (etroit()) { ins.classList.toggle("ouvert"); ins.classList.toggle("peek", !ins.classList.contains("ouvert")); } } }, [h("small", { text: "Section choisie" }), h("b", { text: nomBloc(s) })]),
      h("button", { type: "button", class: "ico", "aria-label": "Fermer les réglages", html: svg(I.x), onclick: function () { choisir(null); } })
    ]);
    ins.appendChild(tete);
    var corps = h("div", { class: "ins-corps" });
    if (typeof s === "string") { (s === "entete" ? insEntete : insPied)(corps); }
    else {
      var tabs = h("div", { class: "seg seg--plein", role: "tablist" }, [["contenu", "Contenu"], ["apparence", "Apparence"]].map(function (o) {
        return h("button", { type: "button", role: "tab", "aria-selected": onglet === o[0] ? "true" : "false", text: o[1], onclick: function () { ins.setAttribute("data-onglet", o[0]); rendreInspecteur(); } });
      }));
      corps.appendChild(tabs);
      if (s.ex && (s.t === "avis" || s.t === "prestations" || s.t === "produits" || s.t === "reservation" || s.t === "commande")) corps.appendChild(h("p", { class: "p-alerte", text: s.t === "avis" ? "Ces avis sont des exemples : remplacez-les par de vrais avis, recopiés mot pour mot. Tant que ce n'est pas fait, ils ne sont pas publiés." : "Prix d'exemple : remplacez-les par les vôtres." }));
      if (onglet === "contenu") insContenu(corps, s); else insApparence(corps, s);
      var pg = pageCourante().sections || [], idx = pg.indexOf(s);
      corps.appendChild(h("div", { class: "ins-actions" }, [
        h("button", { type: "button", class: "btn-2", html: svg(I.haut), "aria-label": "Monter", title: "Monter", disabled: idx <= 0, onclick: function () { deplacer(s.id, -1); rendreInspecteur(); } }),
        h("button", { type: "button", class: "btn-2", html: svg(I.bas), "aria-label": "Descendre", title: "Descendre", disabled: idx >= pg.length - 1, onclick: function () { deplacer(s.id, 1); rendreInspecteur(); } }),
        h("button", { type: "button", class: "btn-2", html: svg(I.copie) + "Dupliquer", onclick: function () { dupliquer(s.id); } }),
        h("button", { type: "button", class: "btn-2 btn-danger", html: svg(I.corbeille) + "Supprimer", onclick: function () { supprimer(s.id); } })
      ]));
    }
    ins.appendChild(corps); corps.scrollTop = y;
    if (!etroit()) ins.classList.add("ouvert");
  }
  function maj(s, chemin, v, texteLent) {
    ecrire(s.d, chemin, v); s.ex = false;
    if (texteLent) rendreSectionBientot(s.id); else transition(function () { rendreSection(s.id); });
    if (chemin === "titre" && (s.t === "prestations" || s.t === "produits")) {}
    change({ vite: !!texteLent });
  }
  function insContenu(c, s) {
    var b = B[s.t];
    if (b.variantes.length > 1) c.appendChild(groupe("Mise en page", [segments(b.variantes, s.v, function (v) { s.v = v; transition(function () { rendreSection(s.id); }); change(); })]));
    b.champs.forEach(function (def) { c.appendChild(champ(def, s, def.k)); });
  }
  function champ(def, s, chemin) {
    var v = lire(s.d, chemin), lent = function (x) { maj(s, chemin, x, true); }, vite = function (x) { maj(s, chemin, x, false); };
    switch (def.type) {
      case "texte": return texte(def.label, v, lent, { ph: def.ph, max: def.max, champ: chemin });
      case "long": return texte(def.label, v, lent, { long: true, ph: def.ph, champ: chemin });
      case "nombre": return nombre(def.label, v, def, vite);
      case "date": return texte(def.label, v, vite, { type: "datetime-local" });
      case "segments": return h("div", { class: "champ" }, [h("span", { class: "champ-l", text: def.label }), segments(def.options, String(v), vite)]);
      case "inter": return interrupteur(def.label, !!v, vite);
      case "note": return h("p", { class: "p-mini p-note" }, [def.texte, def.action ? h("button", { type: "button", class: "btn-lien", text: " Ouvrir les infos", onclick: function () { ouvrirPanneau(def.action); } }) : null]);
      case "bouton": return champBouton(def, s, chemin, v || { t: "", a: "tel" });
      case "image": return champImage(def.label, v, function (id) { vite(id); rendreInspecteur(); }, function () { return changerImage(s, chemin); });
      case "images": return champImages(def, s, chemin, v || []);
      case "liste": return champListe(def, s, chemin, v || []);
    }
    return h("span");
  }
  function texte(label, v, f, o) {
    o = o || {};
    var inp = o.long ? h("textarea", { rows: 3 }) : h("input", { type: o.type || "text", inputmode: o.mode || null, maxlength: o.max || null });
    inp.value = v == null ? "" : v; if (o.ph) inp.placeholder = o.ph; if (o.champ) inp.setAttribute("data-champ", o.champ);
    var err = h("p", { class: "champ-err", role: "status" });
    inp.addEventListener("input", function () { f(inp.value); if (o.verif) err.textContent = ""; if (o.long) autoTaille(inp); });
    inp.addEventListener("change", function () { if (o.verif) err.textContent = o.verif(inp.value); memoriser(); });
    if (o.long) setTimeout(function () { autoTaille(inp); }, 0);
    var l = h("label", { class: "champ" }, [h("span", { class: "champ-l", text: label }), inp, err]);
    if (o.verif && v) err.textContent = o.verif(v);
    return l;
  }
  function autoTaille(t) { t.style.height = "auto"; t.style.height = Math.min(260, t.scrollHeight + 2) + "px"; }
  function nombre(label, v, def, f) {
    var val = +v || def.min || 0;
    var aff = h("output", { text: val + (def.suffixe ? " " + def.suffixe : "") });
    var moins = h("button", { type: "button", class: "ico ico--s", "aria-label": "Moins", text: "−", onclick: function () { val = Math.max(def.min, val - def.pas); f(val); aff.textContent = val + (def.suffixe ? " " + def.suffixe : ""); } });
    var plus = h("button", { type: "button", class: "ico ico--s", "aria-label": "Plus", text: "+", onclick: function () { val = Math.min(def.max, val + def.pas); f(val); aff.textContent = val + (def.suffixe ? " " + def.suffixe : ""); } });
    return h("div", { class: "champ champ--n" }, [h("span", { class: "champ-l", text: label }), h("div", { class: "pas" }, [moins, aff, plus])]);
  }
  function segments(opts, v, f, pastilles) {
    return h("div", { class: "seg seg--plein seg--wrap", role: "radiogroup" }, opts.map(function (o) {
      return h("button", { type: "button", role: "radio", "aria-checked": String(o[0]) === String(v) ? "true" : "false", onclick: function (e) { QA("button", e.currentTarget.parentNode).forEach(function (x) { x.setAttribute("aria-checked", x === e.currentTarget ? "true" : "false"); }); f(o[0]); } }, [o[2] && pastilles ? h("i", { class: "seg-p", style: "--p:" + o[2] }) : null, o[1]]);
    }));
  }
  function interrupteur(label, v, f) {
    var inp = h("input", { type: "checkbox", role: "switch", checked: !!v, onchange: function () { f(inp.checked); } });
    return h("label", { class: "inter" }, [h("span", { text: label }), inp]);
  }
  function choix(label, opts, v, f) {
    var sel = h("select", { onchange: function () { f(sel.value); } }, opts.map(function (o) { return h("option", { value: o[0], text: o[1], selected: o[0] === v }); }));
    return h("label", { class: "champ" }, [h("span", { class: "champ-l", text: label }), sel]);
  }
  function groupe(titre, kids) { return h("section", { class: "groupe" }, [titre ? h("h3", { text: titre }) : null].concat(kids)); }
  function actions(courante) {
    var o = [["resa", "Ouvrir la prise de rendez-vous"], ["cmd", "Ouvrir la commande"], ["prest", "Aller aux tarifs"], ["tel", "Appeler le commerce"], ["itin", "Ouvrir l'itinéraire"]];
    P.pages.forEach(function (p) { if (p.id !== "accueil" || P.pages.length > 1) o.push(["page:" + p.id, "Ouvrir la page « " + p.nom + " »"]); });
    (P.pages[0].sections || []).forEach(function (s) { o.push(["sec:" + s.id, "Aller à : " + nomBloc(s)]); });
    o.push(["url:", "Ouvrir un lien internet"]);
    var cur = courante.indexOf("url:") === 0 ? "url:" : courante;
    if (!o.some(function (x) { return x[0] === cur; })) o.unshift([cur, "Action actuelle"]);
    return o;
  }
  function champBouton(def, s, chemin, b) {
    var url = h("input", { type: "url", placeholder: "https://…", value: b.a.indexOf("url:") === 0 ? b.a.slice(4) : "", oninput: function () { maj(s, chemin + ".a", "url:" + url.value, true); } });
    url.hidden = b.a.indexOf("url:") !== 0;
    var sel = h("select", { onchange: function () { url.hidden = sel.value !== "url:"; maj(s, chemin + ".a", sel.value === "url:" ? "url:" + url.value : sel.value, false); } }, actions(b.a).map(function (o) { return h("option", { value: o[0], text: o[1], selected: o[0] === (b.a.indexOf("url:") === 0 ? "url:" : b.a) }); }));
    return h("div", { class: "champ champ-bouton" }, [h("span", { class: "champ-l", text: def.label }),
      (function () { var i = h("input", { value: b.t || "", placeholder: "Texte du bouton (vide = pas de bouton)", "data-champ": chemin + ".t", oninput: function () { maj(s, chemin + ".t", i.value, true); } }); return i; })(),
      h("span", { class: "champ-sous", text: "Quand on clique :" }), sel, url]);
  }
  function changerImage(s, chemin) {
    return choisirFichier().then(function (f) {
      if (!f[0]) return;
      $("etat").textContent = "Préparation de la photo…";
      return lireImage(f[0], 1800).then(function (r) { var id = ajouterMedia(r.data); ecrire(s.d, chemin, id); s.ex = false; rendreSection(s.id); rendreInspecteur(); change(); toast("Photo ajoutée"); })
        .catch(function () { toast("Cette image n'a pas pu être lue. Essayez un fichier JPG ou PNG."); });
    });
  }
  function champImage(label, id, set, pick) {
    var src = id && MEDIAS[id];
    return h("div", { class: "champ" }, [h("span", { class: "champ-l", text: label }), h("div", { class: "img-champ" }, [
      h("button", { type: "button", class: "img-v", "aria-label": "Choisir une photo", html: src ? '<img src="' + src + '" alt="">' : svg(I.photo), onclick: pick }),
      h("div", {}, [h("button", { type: "button", class: "btn-2 btn--s", text: src ? "Remplacer" : "Choisir une photo", onclick: pick }), src ? h("button", { type: "button", class: "btn-lien", text: "Retirer", onclick: function () { set(null); } }) : null])
    ])]);
  }
  function champImages(def, s, chemin, arr) {
    var g = h("div", { class: "imgs" });
    arr.forEach(function (id, i) {
      var src = id && MEDIAS[id];
      g.appendChild(h("div", { class: "imgs-i" + (src ? "" : " vide"), "data-i": i }, [
        h("button", { type: "button", class: "imgs-b", "aria-label": src ? "Remplacer la photo " + (i + 1) : "Ajouter la photo " + (i + 1), html: src ? '<img src="' + src + '" alt="">' : svg(I.plus), onclick: function () { changerImage(s, chemin + "." + i); } }),
        h("button", { type: "button", class: "imgs-x", "aria-label": "Retirer la photo " + (i + 1), html: svg(I.x), onclick: function () { arr.splice(i, 1); s.ex = false; rendreSection(s.id); rendreInspecteur(); change(); } })
      ]));
    });
    var st = Sortable.create(g, { animation: 160, forceFallback: true, fallbackOnBody: true, ghostClass: "plan-fantome", onEnd: function () { var o = QA(".imgs-i", g).map(function (x) { return arr[+x.getAttribute("data-i")]; }); arr.length = 0; o.forEach(function (x) { arr.push(x); }); rendreSection(s.id); rendreInspecteur(); change(); } });
    sortListes.push(st);
    return h("div", { class: "champ" }, [h("span", { class: "champ-l", text: def.label + " (" + arr.filter(function (x) { return x && MEDIAS[x]; }).length + ")" }), g,
      h("button", { type: "button", class: "btn-2 btn-plein", html: svg(I.plus) + "Ajouter plusieurs photos", onclick: function () {
        choisirFichier(true).then(function (fs) {
          if (!fs.length) return; $("etat").textContent = "Préparation des photos…";
          Promise.all(fs.slice(0, 24).map(function (f) { return lireImage(f, 1600).catch(function () { return null; }); })).then(function (rs) {
            var ids = rs.filter(Boolean).map(function (r) { return ajouterMedia(r.data); });
            var vides = []; arr.forEach(function (x, i) { if (!x || !MEDIAS[x]) vides.push(i); });
            ids.forEach(function (id) { if (vides.length) arr[vides.shift()] = id; else arr.push(id); });
            s.ex = false; rendreSection(s.id); rendreInspecteur(); change(); toast(ids.length + " photo" + (ids.length > 1 ? "s" : "") + " ajoutée" + (ids.length > 1 ? "s" : ""));
          });
        });
      } }),
      h("p", { class: "p-mini", text: "Glissez les vignettes pour changer l'ordre." })]);
  }
  function champListe(def, s, chemin, arr) {
    var l = h("ol", { class: "liste" });
    arr.forEach(function (it, i) {
      var titre = (it[def.titre] || "").trim() || "Élément " + (i + 1);
      var d = h("details", { class: "liste-i", "data-i": i }, [
        h("summary", {}, [h("span", { class: "liste-poignee", html: svg(I.poignee), "aria-hidden": "true" }), h("span", { class: "liste-t", text: titre }), it.prix != null && it.prix !== "" && def.champs.some(function (c) { return c.k === "prix"; }) ? h("small", { text: K.prix(it.prix) }) : null,
          h("button", { type: "button", class: "ico ico--s", "aria-label": "Supprimer « " + titre + " »", html: svg(I.corbeille), onclick: function (e) { e.preventDefault(); arr.splice(i, 1); maj(s, chemin, arr, false); rendreInspecteur(); } })])
      ]);
      def.champs.forEach(function (sd) { d.appendChild(champ(sd, s, chemin + "." + i + "." + sd.k)); });
      l.appendChild(d);
    });
    sortListes.push(Sortable.create(l, { handle: ".liste-poignee", animation: 160, forceFallback: true, fallbackOnBody: true, ghostClass: "plan-fantome",
      onEnd: function () { var o = QA(".liste-i", l).map(function (x) { return arr[+x.getAttribute("data-i")]; }); arr.length = 0; o.forEach(function (x) { arr.push(x); }); maj(s, chemin, arr, false); rendreInspecteur(); } }));
    return h("div", { class: "champ" }, [h("span", { class: "champ-l", text: def.label }), l, h("button", { type: "button", class: "btn-2 btn-plein", html: svg(I.plus) + K.e(def.ajout), onclick: function () {
      var n = {}; def.champs.forEach(function (c) { n[c.k] = c.type === "nombre" ? (c.k === "note" ? 5 : 30) : c.type === "image" ? null : ""; });
      arr.push(n); maj(s, chemin, arr, false); rendreInspecteur();
      setTimeout(function () { var dd = QA("#inspecteur .liste-i"); var last = dd[dd.length - 1]; if (last) { last.open = true; var f = Q("input, textarea", last); if (f) f.focus(); } }, 30);
    } })]);
  }
  function insApparence(c, s) {
    c.appendChild(groupe("Fond", [segments([["auto", "Comme la page"], ["clair", "Blanc"], ["teinte", "Teinté"], ["couleur", "Couleur"], ["sombre", "Sombre"]], s.s.fond || "auto", function (v) { s.s.fond = v; transition(function () { rendreSection(s.id); }); change(); })]));
    if (s.t !== "annonce") c.appendChild(groupe("Espace autour", [segments([["s", "Serré"], ["m", "Normal"], ["l", "Aéré"]], s.s.esp || "m", function (v) { s.s.esp = v; rendreSection(s.id); change(); })]));
    var lab = h("input", { value: s.menu || "", placeholder: "Ex. Tarifs", maxlength: 18, oninput: function () { s.menu = lab.value.trim(); rendreEntete(); change({ vite: true }); } });
    c.appendChild(groupe("Lien dans le menu", [h("label", { class: "champ" }, [h("span", { class: "champ-l", text: "Texte du lien (vide = pas dans le menu)" }), lab])].concat(P.pages.length > 1 ? [h("p", { class: "p-mini", text: "Avec plusieurs pages, le menu affiche les pages." })] : [])));
    c.appendChild(groupe("Visible sur", [
      interrupteur("Téléphone", s.s.mob !== false, function (v) { s.s.mob = v; if (!v && s.s.ord === false) s.s.ord = true; rendreSection(s.id); change(); rendreInspecteur(); }),
      interrupteur("Ordinateur et tablette", s.s.ord !== false, function (v) { s.s.ord = v; if (!v && s.s.mob === false) s.s.mob = true; rendreSection(s.id); change(); rendreInspecteur(); })
    ]));
  }
  function insEntete(c) {
    var E = P.entete, re = function () { rendreSite(); change(); };
    c.appendChild(groupe("Mise en page", [segments([["classique", "Logo à gauche"], ["centre", "Logo au centre"], ["minimal", "Sans menu"]], E.v, function (v) { E.v = v; re(); })]));
    c.appendChild(groupe("Bouton en haut à droite", [
      (function () { var i = h("input", { value: E.cta.t, placeholder: "Vide = pas de bouton", oninput: function () { E.cta.t = i.value; rendreEntete(); change({ vite: true }); } }); return h("label", { class: "champ" }, [h("span", { class: "champ-l", text: "Texte" }), i]); })(),
      choix("Quand on clique", actions(E.cta.a).filter(function (o) { return o[0] !== "url:"; }), E.cta.a, function (v) { E.cta.a = v; rendreEntete(); change(); })
    ]));
    c.appendChild(groupe("Options", [
      interrupteur("Afficher le téléphone (sur ordinateur)", E.tel, function (v) { E.tel = v; re(); }),
      interrupteur("Reste visible en haut quand on défile", E.fixe, function (v) { E.fixe = v; re(); }),
      interrupteur("Logo seul, sans le nom", E.logoSeul, function (v) { E.logoSeul = v; re(); })
    ]));
    c.appendChild(h("p", { class: "p-mini p-note" }, ["Le nom, le logo et le téléphone viennent de l'onglet Infos. ", h("button", { type: "button", class: "btn-lien", text: "Ouvrir les infos", onclick: function () { ouvrirPanneau("infos"); } })]));
  }
  function insPied(c) {
    var F = P.pied, re = function () { rendreSite(); change(); };
    c.appendChild(groupe("Mise en page", [segments([["complet", "Complet"], ["simple", "Une ligne"]], F.v, function (v) { F.v = v; re(); })]));
    c.appendChild(texte("Petit texte de présentation", F.texte, function (v) { F.texte = v; rendreSiteBientot(); change({ vite: true }); }, { long: true, ph: "Une phrase sur votre commerce" }));
    c.appendChild(groupe("", [interrupteur("Mention « Site créé avec Mokrani Studio »", F.credit, function (v) { F.credit = v; re(); })]));
    c.appendChild(h("p", { class: "p-mini p-note", text: "Les liens Mentions légales et Confidentialité sont toujours présents : ils sont obligatoires." }));
  }

  /* ===================== Aperçu ===================== */
  function apercu() {
    if (etat.mode === "apercu") return quitterApercu();
    etat.mode = "apercu"; $("app").setAttribute("data-mode", "apercu"); $("btn-apercu").querySelector("span").textContent = "Modifier";
    fermerPanneau(); rendreInspecteur(); transition(function () { rendreSite(); cadrer(); });
    site.scrollTop = 0; toast("Aperçu : votre site tel que vos clients le verront");
  }
  function quitterApercu() {
    if (etat.mode === "edition") return;
    etat.mode = "edition"; $("app").setAttribute("data-mode", "edition"); $("btn-apercu").querySelector("span").textContent = "Aperçu";
    transition(function () { rendreSite(); cadrer(); }); rendreInspecteur();
  }
  $("btn-apercu").addEventListener("click", apercu);

  /* ===================== Fenêtres ===================== */
  function confirmer(titre, texte, ok, f) {
    var d = $("confirmer"), c = $("conf-corps"); c.textContent = "";
    c.appendChild(h("h2", { text: titre })); c.appendChild(h("p", { text: texte }));
    c.appendChild(h("div", { class: "fen-act" }, [h("button", { type: "button", class: "btn-2", text: "Garder", onclick: function () { d.close(); } }), h("button", { type: "button", class: "btn btn-danger-plein", text: ok, onclick: function () { d.close(); f(); } })]));
    d.showModal();
  }
  QA("dialog.fenetre").forEach(function (d) { d.addEventListener("click", function (e) { if (e.target === d) d.close(); }); });

  /* ---------- Mettre en ligne ---------- */
  function publier() {
    var d = $("publier"), c = $("pub-corps"), s = score(), aResa = P.pages.some(function (p) { return p.sections.some(function (x) { return x.t === "reservation" || x.t === "commande"; }); });
    var F = [["Vitrine", "350 €", "Être trouvé et bien présenté"], ["Réservation", "490 €", "Vos clients réservent ou commandent seuls"], ["Sur mesure", "dès 690 €", "L'outil exact de votre métier"]];
    var choixF = aResa ? "Réservation" : "Vitrine";
    c.textContent = "";
    c.appendChild(h("div", { class: "fen-tete" }, [h("h2", { id: "pub-titre", text: "Mettre votre site en ligne" }), h("button", { type: "button", class: "ico", "aria-label": "Fermer", html: svg(I.x), onclick: function () { d.close(); } })]));
    c.appendChild(h("p", { class: "fen-lead", text: "Vous avez construit le site. Ali, de Mokrani Studio, s'occupe du reste : l'adresse web, l'hébergement, la réservation reliée à votre téléphone et les vérifications." }));
    var liste = controles().filter(function (x) { return !x.ok && !x.opt; });
    c.appendChild(h("div", { class: "pub-bloc" }, [h("div", { class: "pub-score" }, [h("b", { text: s + " %" }), h("span", { text: liste.length ? "Il manque " + liste.length + " élément" + (liste.length > 1 ? "s" : "") + ". Vous pouvez envoyer quand même : on complétera ensemble." : "Votre site est complet." })]),
      liste.length ? h("ul", { class: "pub-manque" }, liste.map(function (x) { return h("li", {}, [h("span", { text: x.t }), h("button", { type: "button", class: "btn-lien", text: "Compléter", onclick: function () { d.close(); x.f(); } })]); })) : null]));
    c.appendChild(h("div", { class: "pub-bloc" }, [h("h3", { text: "Adresse du site" }), P.domaine ? h("p", { class: "pub-dom" }, [h("b", { text: P.domaine }), h("button", { type: "button", class: "btn-lien", text: "Changer", onclick: function () { d.close(); ouvrirPanneau("domaine"); } })]) : h("p", {}, [h("span", { text: "Pas encore choisie. " }), h("button", { type: "button", class: "btn-lien", text: "Choisir une adresse", onclick: function () { d.close(); ouvrirPanneau("domaine"); } })])]));
    var formules = h("div", { class: "formules", role: "radiogroup" }, F.map(function (f) {
      return h("button", { type: "button", role: "radio", class: "formule", "aria-checked": f[0] === choixF ? "true" : "false", onclick: function (e) { choixF = f[0]; QA(".formule", formules).forEach(function (x) { x.setAttribute("aria-checked", x === e.currentTarget ? "true" : "false"); }); } }, [h("b", { text: f[0] }), h("span", { class: "formule-p", text: f[1] }), h("small", { text: f[2] })]);
    }));
    c.appendChild(h("div", { class: "pub-bloc" }, [h("h3", { text: "Formule" }), formules, P.pages.length > 1 ? h("p", { class: "p-mini", text: "Votre site a " + P.pages.length + " pages : Ali vous dira si cela change le tarif." }) : null, h("p", { class: "p-mini", text: "Payé une fois. Hébergement : 50 € la première année, environ 5 € par mois ensuite." })]));
    var envoi = h("div", { class: "pub-envoi" });
    c.appendChild(envoi);
    function dessinerEnvoi() {
      envoi.textContent = "";
      envoi.appendChild(h("button", { type: "button", class: "btn btn-plein", text: "Envoyer ma demande à Ali", onclick: function () {
        lienProjet().then(function (l) {
          var msg = "Bonjour Ali, j'ai créé mon site dans l'Atelier : " + (P.infos.nom || "mon commerce") + (P.domaine ? ", adresse souhaitée " + P.domaine : "") + ". Formule : " + choixF + ". Mon projet : " + l;
          var u = "../?formule=" + encodeURIComponent(choixF) + "&commerce=" + encodeURIComponent(P.infos.nom || "") + "&msg=" + encodeURIComponent(msg) + "#contact";
          window.open(u, "_blank", "noopener");
          envoi.appendChild(h("p", { class: "p-ok", html: svg(I.ok) + "Le formulaire de contact s'est ouvert, déjà rempli. Ajoutez votre nom et votre numéro, puis envoyez." }));
        });
      } }));
      envoi.appendChild(h("div", { class: "pub-autres" }, [
        h("button", { type: "button", class: "btn-2", html: svg(I.lien) + "Copier le lien du projet", onclick: copierLien }),
        h("button", { type: "button", class: "btn-2", html: svg(I.telecharger) + "Télécharger le site (.html)", onclick: exporterHTML }),
        h("button", { type: "button", class: "btn-2", html: svg(I.telecharger) + "Télécharger le projet (.json)", onclick: exporterJSON })
      ]));
      envoi.appendChild(h("p", { class: "p-mini", text: "Le lien du projet contient vos textes et réglages, pas vos photos. Pour les photos, envoyez le fichier du projet." }));
    }
    dessinerEnvoi();
    d.showModal();
  }
  $("btn-publier").addEventListener("click", publier);

  /* ---------- Partage, import, export ---------- */
  function b64url(buf) { var s = "", b = new Uint8Array(buf); for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function deB64url(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function lienProjet() {
    var j = JSON.stringify(P), base = location.href.split("#")[0];
    if ("CompressionStream" in window) {
      var st = new Blob([j]).stream().pipeThrough(new CompressionStream("deflate-raw"));
      return new Response(st).arrayBuffer().then(function (buf) { return base + "#p=z" + b64url(buf); });
    }
    return Promise.resolve(base + "#p=j" + b64url(new TextEncoder().encode(j)));
  }
  function lireLienProjet(v) {
    var u = deB64url(v.slice(1));
    if (v.charAt(0) === "z") return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text().then(JSON.parse);
    return Promise.resolve(JSON.parse(new TextDecoder().decode(u)));
  }
  function copierLien() {
    lienProjet().then(function (l) {
      (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(function () { toast("Lien copié : il rouvre ce projet sur n'importe quel appareil (sans les photos)"); }, function () { prompt("Copiez ce lien :", l); });
    });
  }
  function telecharger(nom, contenu, type) { var a = h("a", { href: URL.createObjectURL(new Blob([contenu], { type: type })), download: nom }); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
  function exporterJSON() {
    var m = {}; JSON.stringify(P).replace(/"(m[a-z0-9]{6,})"/g, function (x, id) { if (MEDIAS[id]) m[id] = MEDIAS[id]; });
    telecharger((slug(P.infos.nom) || "mon-site") + "-atelier.json", JSON.stringify({ atelier: 1, projet: P, medias: m }), "application/json");
    toast("Projet téléchargé, photos comprises");
  }
  function importerJSON() {
    var inp = $("fichier-json"); inp.value = "";
    inp.onchange = function () {
      var f = inp.files[0]; if (!f) return;
      f.text().then(function (t) {
        var o = JSON.parse(t); if (!o.projet || !o.projet.pages) throw 0;
        Object.keys(o.medias || {}).forEach(function (id) { MEDIAS[id] = o.medias[id]; IDB.mettre(id, o.medias[id]); });
        charger(o.projet); toast("Projet ouvert");
      }).catch(function () { toast("Ce fichier n'est pas un projet de l'Atelier"); });
    };
    inp.click();
  }
  function enB64(url) { return fetch(url).then(function (r) { return r.arrayBuffer(); }).then(function (b) { var s = "", u = new Uint8Array(b); for (var i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(s); }); }
  function exporterHTML() {
    var pol = BL.POLICES[P.theme.police];
    Promise.all([fetch("site.css").then(function (r) { return r.text(); }), fetch("runtime.js").then(function (r) { return r.text(); }), pol.fichier ? enB64(pol.fichier) : Promise.resolve("")]).then(function (r) {
      var css = r[0].replace(/\/\*polices:debut\*\/[\s\S]*?\/\*polices:fin\*\//, ""), face = r[2] ? '@font-face{font-family:"' + pol.famille + '";font-weight:100 900;font-stretch:62% 125%;font-display:swap;src:url(data:font/woff2;base64,' + r[2] + ') format("woff2")}' : "";
      var Pexp = copie(P); Pexp.pages.forEach(function (p) { p.sections = p.sections.filter(function (s) { return !(s.t === "avis" && s.ex); }); });
      var c = ctxPour(Pexp, false, "accueil"), i = P.infos;
      var mains = Pexp.pages.map(function (p, k) { return '<main data-page="' + p.id + '"' + (k ? " hidden" : "") + ">" + p.sections.map(function (s) { return BL.section(s, c); }).join("") + "</main>"; }).join("") +
        BL.pagesLegales(Pexp).map(function (p) { return '<main data-page="' + p.id + '" hidden>' + p.html + "</main>"; }).join("");
      var ld = { "@context": "https://schema.org", "@type": "LocalBusiness", name: i.nom, telephone: i.tel || undefined, email: i.email || undefined, url: P.domaine ? "https://" + P.domaine : undefined,
        address: i.adresse ? { "@type": "PostalAddress", streetAddress: i.adresse, postalCode: i.cp, addressLocality: i.ville, addressCountry: "FR" } : undefined,
        openingHoursSpecification: [] };
      var EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      for (var j = 0; j < 7; j++) K.plages(i.horaires, j).forEach(function (pl) { var f = function (x) { var hh = Math.floor(x), mm = Math.round((x - hh) * 60); return ("0" + hh).slice(-2) + ":" + ("0" + mm).slice(-2); }; ld.openingHoursSpecification.push({ "@type": "OpeningHoursSpecification", dayOfWeek: EN[j], opens: f(pl[0]), closes: f(pl[1]) }); });
      var heros = null; P.pages[0].sections.forEach(function (s) { if (!heros && s.t === "heros") heros = s; });
      var desc = (heros && heros.d.texte) || (BL.M[i.metier] || BL.M.autre).accroche, titre = (i.nom || "Mon commerce") + (i.ville ? ", " + (BL.M[i.metier] || BL.M.autre).nom.toLowerCase() + " à " + i.ville : "");
      var Pmin = { infos: { horaires: i.horaires, tel: i.tel, email: i.email, nom: i.nom } };
      var html = '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + K.e(titre) + '</title>\n<meta name="description" content="' + K.e(desc) + '">\n<meta property="og:title" content="' + K.e(titre) + '">\n<meta property="og:description" content="' + K.e(desc) + '">\n<meta name="theme-color" content="' + K.e(P.theme.c1) + '">\n' +
        '<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, "\\u003c") + "<\/script>\n<style>" + face + css + "\nbody{margin:0;background:" + BL.FONDS[P.theme.fond].fond + "}html{scroll-padding-top:80px}\n</style>\n</head>\n<body>\n" +
        '<div class="site' + (P.theme.anim ? " anim" : "") + '" style="' + BL.varsTheme(P.theme) + '" data-fond="' + P.theme.fond + '">' + BL.entete(c) + mains + BL.pied(c) + "</div>\n" +
        "<script>" + r[1] + "<\/script>\n<script>(function(){var r=document.querySelector('.site'),P=" + JSON.stringify(Pmin).replace(/</g, "\\u003c") + ";SiteKit.activer(r,P,{mode:'export',anim:" + (!!P.theme.anim) + "});SiteKit.routeur(r);})();<\/script>\n</body>\n</html>\n";
      telecharger((slug(i.nom) || "mon-site") + ".html", html, "text/html");
      toast("Site téléchargé : ouvrez le fichier pour le voir en vrai");
    }).catch(function () { toast("Le téléchargement a échoué. Réessayez."); });
  }

  /* ===================== Recherche d'actions (Ctrl K) ===================== */
  function commandes() {
    var l = [];
    Object.keys(B).forEach(function (t) { l.push(["Ajouter : " + B[t].nom, B[t].desc, function () { ajouter(t); }]); });
    [["ajouter", "Ouvrir la bibliothèque de sections"], ["structure", "Voir le plan de la page"], ["style", "Changer la couleur, l'écriture, le fond"], ["infos", "Modifier le nom, le téléphone, les horaires, l'adresse"], ["pages", "Ajouter ou renommer une page"], ["domaine", "Trouver une adresse web (nom de domaine)"], ["verifier", "Vérifier ce qu'il manque avant la mise en ligne"], ["aide", "Aide et raccourcis"]].forEach(function (p) { l.push([p[1], "Panneau", function () { ouvrirPanneau(p[0]); }]); });
    l.push(["Voir l'aperçu", "Le site comme vos clients le verront", apercu]);
    l.push(["Vue téléphone", "", function () { changerAppareil("tel"); }], ["Vue tablette", "", function () { changerAppareil("tablette"); }], ["Vue ordinateur", "", function () { changerAppareil("ordi"); }]);
    l.push(["Mettre en ligne", "Envoyer votre site à Mokrani Studio", publier], ["Télécharger le site (.html)", "", exporterHTML], ["Copier le lien du projet", "", copierLien], ["Revoir la visite guidée", "", visite]);
    AMBIANCES.forEach(function (a) { l.push(["Ambiance : " + a[0], "Style", function () { Object.assign(P.theme, a[1]); rendreSite(); change(); }]); });
    P.pages.concat(BL.pagesLegales(P)).forEach(function (p) { l.push(["Aller à la page : " + p.nom, "", function () { allerPage(p.id); }]); });
    sections().forEach(function (s) { l.push(["Modifier : " + nomBloc(s), "Section de la page", function () { choisir(s.id, { force: true }); defilerVers(Q('[data-sec="' + s.id + '"]', site)); }]); });
    return l;
  }
  function palette() {
    var d = $("palette"), q = $("palette-q"), ul = $("palette-l"), tout = commandes(), sel = 0, vis = [];
    function dessiner() {
      var m = slug(q.value).split("-").filter(Boolean);
      vis = tout.filter(function (c) { var t = slug(c[0] + " " + c[1]); return m.every(function (x) { return t.indexOf(x) > -1; }); }).slice(0, 9);
      sel = Math.min(sel, Math.max(0, vis.length - 1)); ul.textContent = "";
      vis.forEach(function (c, i) { ul.appendChild(h("li", { role: "option", "aria-selected": i === sel ? "true" : "false", onclick: function () { d.close(); c[2](); }, onmousemove: function () { if (sel !== i) { sel = i; dessiner(); } } }, [h("b", { text: c[0] }), c[1] ? h("small", { text: c[1] }) : null])); });
      if (!vis.length) ul.appendChild(h("li", { class: "vide", text: "Aucune action ne correspond. Essayez « horaires », « photo » ou « couleur »." }));
    }
    q.value = ""; q.oninput = function () { sel = 0; dessiner(); };
    q.onkeydown = function (e) {
      if (e.key === "ArrowDown") { sel = Math.min(vis.length - 1, sel + 1); dessiner(); e.preventDefault(); }
      else if (e.key === "ArrowUp") { sel = Math.max(0, sel - 1); dessiner(); e.preventDefault(); }
      else if (e.key === "Enter" && vis[sel]) { d.close(); vis[sel][2](); }
    };
    dessiner(); d.showModal(); q.focus();
  }
  $("btn-palette").addEventListener("click", palette);

  /* ===================== Clavier ===================== */
  document.addEventListener("keydown", function (e) {
    var tape = e.target.closest && e.target.closest("input, textarea, select, [contenteditable]");
    var mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); palette(); return; }
    if (Q("dialog[open]")) return;
    if (mod && e.key.toLowerCase() === "z" && !tape) { e.preventDefault(); voyager(e.shiftKey ? 1 : -1); return; }
    if (mod && e.key.toLowerCase() === "y" && !tape) { e.preventDefault(); voyager(1); return; }
    if (tape) return;
    var s = etat.sel && trouver(etat.sel);
    if (e.key === "Escape") { if (etat.mode === "apercu") quitterApercu(); else if (etat.sel) choisir(null); else if (etat.panneau) fermerPanneau(); }
    else if ((e.key === "Delete" || e.key === "Backspace") && s) { e.preventDefault(); supprimer(s.id); }
    else if (mod && e.key.toLowerCase() === "d" && s) { e.preventDefault(); dupliquer(s.id); }
    else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown") && s) { e.preventDefault(); deplacer(s.id, e.key === "ArrowUp" ? -1 : 1); rendreInspecteur(); }
  });
  $("btn-annuler").addEventListener("click", function () { voyager(-1); });
  $("btn-retablir").addEventListener("click", function () { voyager(1); });

  /* ===================== Assistant de départ ===================== */
  var AS = null;
  function assistant(pre) {
    pre = pre || {};
    var Pn = projetVide(); Pn.infos.nom = pre.nom || ""; Pn.infos.metier = pre.metier || "barbier";
    if (pre.c1) Pn.theme.c1 = pre.c1; else Pn.theme.c1 = BL.M[Pn.infos.metier].couleurs[0];
    Pn.theme.police = pre.police || BL.M[Pn.infos.metier].police;
    Pn.infos.horaires = HOR[HOR_METIER[Pn.infos.metier]]();
    AS = { P: Pn, pas: 0, obj: BL.M[Pn.infos.metier].objectif, policeTouchee: !!pre.police, couleurTouchee: !!pre.c1, horTouche: false };
    var d = $("assistant"); dessinerAs(); d.showModal();
    setTimeout(function () { var f = Q("#as-corps input"); if (f && !tactile) f.focus(); }, 60);
  }
  var ETAPES = ["Votre commerce", "Où vous trouver", "Vos horaires", "Votre style", "Votre priorité"];
  var apercuAs = debounce(function () {
    if (!AS) return;
    var Pt = construire(copie(AS.P), AS.obj), el = $("as-site"), c = ctxPour(Pt, false, "accueil");
    themer(el, Pt);
    el.innerHTML = BL.entete(c) + "<main>" + Pt.pages[0].sections.slice(0, 4).map(function (s) { return BL.section(s, c); }).join("") + "</main>";
    K.activer(el, Pt, { mode: "apercu" });
  }, 120);
  function dessinerAs() {
    var A = AS, Pn = A.P, corps = $("as-corps"), i = Pn.infos;
    $("as-progres").innerHTML = ETAPES.map(function (t, k) { return '<li class="' + (k < A.pas ? "fait" : k === A.pas ? "cours" : "") + '"><span>' + t + "</span></li>"; }).join("");
    corps.textContent = "";
    var titre = function (t, s) { corps.appendChild(h("h1", { class: "as-titre", id: "as-titre", text: t })); if (s) corps.appendChild(h("p", { class: "as-sous", text: s })); };
    var re = function () { apercuAs(); };
    if (A.pas === 0) {
      titre("Créons le site de votre commerce", "Cinq questions rapides, puis vous modifiez tout ce que vous voulez directement sur la page.");
      var nom = h("input", { class: "as-grand", value: i.nom, placeholder: "Nom de votre commerce", maxlength: 40, autocomplete: "organization", "aria-label": "Nom de votre commerce", oninput: function () { i.nom = nom.value; re(); } });
      corps.appendChild(nom);
      corps.appendChild(h("p", { class: "as-q", text: "Votre métier" }));
      corps.appendChild(h("div", { class: "as-metiers" }, BL.ORDRE_METIERS.map(function (m) {
        return h("button", { type: "button", class: "as-metier" + (i.metier === m ? " actif" : ""), "aria-pressed": i.metier === m ? "true" : "false", onclick: function () {
          i.metier = m; A.obj = BL.M[m].objectif;
          if (!A.couleurTouchee) Pn.theme.c1 = BL.M[m].couleurs[0];
          if (!A.policeTouchee) Pn.theme.police = BL.M[m].police;
          if (!A.horTouche) i.horaires = HOR[HOR_METIER[m]]();
          dessinerAs(); re();
        } }, [h("span", { html: BL.icone(BL.M[m].icone, "as-ic") }), h("small", { text: BL.M[m].nom })]);
      })));
    } else if (A.pas === 1) {
      titre("Où vous trouver ?", "Ces infos apparaissent sur le site : bouton Appeler, itinéraire, horaires.");
      var ch = function (k, lab, ph, a) { a = a || {}; var inp = h("input", { value: i[k], placeholder: ph, type: a.type || "text", inputmode: a.mode || null, maxlength: a.max || null, autocomplete: a.auto || null, oninput: function () { i[k] = inp.value; re(); } }); return h("label", { class: "champ" }, [h("span", { class: "champ-l", text: lab }), inp]); };
      corps.appendChild(ch("tel", "Téléphone", "06 12 34 56 78", { type: "tel", auto: "tel" }));
      corps.appendChild(ch("adresse", "Adresse", "12 rue Émile Zola", { auto: "street-address" }));
      corps.appendChild(h("div", { class: "rang" }, [ch("cp", "Code postal", "10000", { mode: "numeric", max: 5, auto: "postal-code" }), ch("ville", "Ville", "Troyes", { auto: "address-level2" })]));
    } else if (A.pas === 2) {
      titre("Vos horaires", "Choisissez un modèle, puis ajustez. Ils servent pour « ouvert maintenant » et les créneaux de réservation.");
      corps.appendChild(editeurHoraires(i.horaires, function () { A.horTouche = true; re(); }));
    } else if (A.pas === 3) {
      titre("Votre style", "Vous pourrez tout changer ensuite dans l'onglet Style.");
      corps.appendChild(h("p", { class: "as-q", text: "Couleur" }));
      var cols = BL.M[i.metier].couleurs.concat(COUL.filter(function (x) { return BL.M[i.metier].couleurs.indexOf(x) < 0; })).slice(0, 10);
      corps.appendChild(h("div", { class: "pastilles" }, cols.map(function (col) { return h("button", { type: "button", class: "pastille" + (Pn.theme.c1 === col ? " actif" : ""), style: "--p:" + col, "aria-label": col, onclick: function () { Pn.theme.c1 = col; A.couleurTouchee = true; dessinerAs(); re(); } }); }).concat([
        h("label", { class: "pastille pastille-perso" + (cols.indexOf(Pn.theme.c1) < 0 ? " actif" : ""), style: "--p:" + (cols.indexOf(Pn.theme.c1) < 0 ? Pn.theme.c1 : "conic-gradient(#e03131,#f08c00,#2f9e44,#1971c2,#9c36b5,#e03131)"), title: "Autre couleur" }, [h("input", { type: "color", value: Pn.theme.c1, "aria-label": "Autre couleur", onchange: function (e) { Pn.theme.c1 = e.target.value; A.couleurTouchee = true; dessinerAs(); re(); } })])
      ])));
      corps.appendChild(h("p", { class: "as-q", text: "Écriture des titres" }));
      corps.appendChild(h("div", { class: "polices" }, Object.keys(BL.POLICES).map(function (k) {
        var p = BL.POLICES[k];
        return h("button", { type: "button", class: "police" + (Pn.theme.police === k ? " actif" : ""), onclick: function () { Pn.theme.police = k; A.policeTouchee = true; dessinerAs(); re(); } }, [h("span", { style: "font-family:" + p.titre + ";font-weight:" + p.poids + ";text-transform:" + p.casse + ";font-stretch:" + p.large + ";letter-spacing:" + p.esp, text: "Aa" }), h("small", { text: p.nom })]);
      })));
      corps.appendChild(h("p", { class: "as-q", text: "Logo (facultatif)" }));
      corps.appendChild(h("div", { class: "logo-l" }, [h("div", { class: "logo-v", html: Pn.logo && MEDIAS[Pn.logo] ? '<img src="' + MEDIAS[Pn.logo] + '" alt="">' : "<span>" + K.e((i.nom || "?").charAt(0).toUpperCase()) + "</span>" }),
        h("button", { type: "button", class: "btn-2", text: Pn.logo ? "Changer" : "Ajouter mon logo", onclick: function () { choisirFichier().then(function (f) { if (!f[0]) return; lireImage(f[0], 600).then(function (r) { Pn.logo = ajouterMedia(r.data); var col = couleurDe(r.canvas); if (col && !A.couleurTouchee) Pn.theme.c1 = col; dessinerAs(); re(); }); }); } }),
        h("small", { class: "p-mini", text: "La couleur du site est tirée de votre logo." })]));
    } else {
      titre("Que doit faire votre site en premier ?", "On place les bonnes sections, dans le bon ordre. Vous pourrez en ajouter d'autres.");
      corps.appendChild(h("div", { class: "as-objs", role: "radiogroup" }, [
        ["rdv", "Prendre des rendez-vous", i.metier === "restaurant" ? "Vos clients réservent une table, de jour comme de nuit." : "Vos clients choisissent une prestation et un créneau, seuls."],
        ["commande", "Recevoir des commandes", "Vos clients composent leur commande et passent la chercher."],
        ["carte", "Montrer ma carte et mes prix", "Une belle carte, des photos, et comment venir."],
        ["vitrine", "Être trouvé et rassurer", "Qui vous êtes, ce que vous faites, où et quand vous trouver."]
      ].map(function (o) {
        return h("button", { type: "button", role: "radio", class: "as-obj", "aria-checked": A.obj === o[0] ? "true" : "false", onclick: function () { A.obj = o[0]; dessinerAs(); re(); } }, [h("b", { text: o[1] }), h("span", { text: o[2] })]);
      })));
    }
    $("as-retour").hidden = A.pas === 0;
    $("as-passer").hidden = A.pas === 0 || A.pas === 4;
    $("as-suite").textContent = A.pas === 4 ? "Créer mon site" : "Continuer";
    re();
  }
  $("as-retour").addEventListener("click", function () { if (AS.pas > 0) { AS.pas--; dessinerAs(); } });
  $("as-passer").addEventListener("click", function () { AS.pas++; dessinerAs(); });
  $("as-suite").addEventListener("click", function () {
    if (AS.pas === 0 && !AS.P.infos.nom.trim()) { var n = Q("#as-corps .as-grand"); n.focus(); n.classList.add("secoue"); setTimeout(function () { n.classList.remove("secoue"); }, 500); n.placeholder = "Indiquez le nom de votre commerce"; return; }
    if (AS.pas < 4) { AS.pas++; dessinerAs(); var f = Q("#as-corps input"); if (f && !tactile && AS.pas === 1) f.focus(); return; }
    var Pn = construire(AS.P, AS.obj); AS = null; $("assistant").close();
    try { var avant = localStorage.getItem(CLE); if (avant) localStorage.setItem(CLE_AVANT, avant); } catch (e) {}
    charger(Pn, true);
  });
  $("assistant").addEventListener("cancel", function (e) { if (!P.pages[0].sections.length) e.preventDefault(); });

  /* ===================== Chargement et visite ===================== */
  function charger(Pn, arrivee) {
    P = Pn; etat.page = "accueil"; etat.sel = null; HIST = { pile: [], pos: -1 }; memoriser(); sauver();
    QA("#appareils button").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-app") === etat.app ? "true" : "false"); });
    cadrer(); rendreSite(true); rendreInspecteur(); majVerif();
    if (etat.panneau) rendrePanneau();
    if (arrivee && !calme) {
      var secs = QA("[data-sec]", site), ent = Q(".s-entete", site);
      if (ent) ent.animate([{ opacity: 0, transform: "translateY(-12px)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
      secs.forEach(function (s, k) { s.animate([{ opacity: 0, transform: "translateY(42px) scale(.985)" }, { opacity: 1, transform: "none" }], { duration: 700, delay: 140 + k * 110, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }); });
      var etapes = secs.map(function (s) { return nomBloc(trouver(s.getAttribute("data-sec"))).toLowerCase(); });
      var k = 0, msg = $("etabli-aide"); msg.classList.add("vu");
      var t = setInterval(function () { if (k >= etapes.length) { clearInterval(t); msg.textContent = "Votre site est prêt."; setTimeout(function () { msg.classList.remove("vu"); }, 1600); return; } msg.textContent = "Pose de la section " + etapes[k++] + "…"; }, 110);
      setTimeout(function () { var deja = false; try { deja = localStorage.getItem(CLE_VISITE); } catch (e) {} if (!deja) visite(); }, 140 + secs.length * 110 + 900);
    }
  }
  var VISITE = [
    [function () { return Q("[data-sec] [data-k]", site); }, "Cliquez sur n'importe quel texte de la page et tapez : il change tout de suite."],
    [function () { return Q('#rail [data-p="ajouter"]'); }, "Ajoutez des sections : galerie, avis, horaires, commande… Glissez-les sur la page ou touchez-les."],
    [function () { var s = Q("[data-sec]:not(.b-annonce)", site); if (s) choisir(s.getAttribute("data-sec"), { force: true }); return Q(".ed-outils", site); }, "Chaque section a sa barre : la poignée pour la déplacer, les flèches, une autre mise en page, dupliquer, supprimer."],
    [function () { return etroit() ? Q("#inspecteur .ins-tete") : Q("#inspecteur"); }, "Ici, tous les réglages de la section choisie : textes, prix, photos, fond, place dans le menu."],
    [function () { return Q("#appareils"); }, "Vérifiez votre site sur téléphone, tablette et ordinateur."],
    [function () { return Q('#rail [data-p="verifier"]'); }, "Ce cercle se remplit à mesure que votre site est complet : téléphone, horaires, vrais prix, photos…"],
    [function () { return $("btn-publier"); }, "Quand tout est prêt, envoyez votre site : Mokrani Studio s'occupe de la mise en ligne."]
  ];
  function visite() {
    var v = $("visite"), k = 0;
    function fin() { v.hidden = true; try { localStorage.setItem(CLE_VISITE, "1"); } catch (e) {} removeEventListener("resize", placer); }
    function placer() {
      var cible = VISITE[k][0](); if (!cible || !cible.getClientRects().length) { k++; if (k >= VISITE.length) return fin(); return placer(); }
      var r = cible.getBoundingClientRect(), m = 6, trou = $("visite-trou"), bulle = $("visite-bulle");
      var t = Math.max(8, r.top - m), l = Math.max(8, r.left - m), w = Math.min(innerWidth - 16, r.width + m * 2), hh = Math.min(innerHeight - 16 - (t - r.top + m), r.height + m * 2);
      trou.style.cssText = "top:" + t + "px;left:" + l + "px;width:" + w + "px;height:" + Math.max(30, Math.min(hh, innerHeight * .7)) + "px";
      $("visite-texte").textContent = VISITE[k][1]; $("visite-pas").textContent = (k + 1) + " sur " + VISITE.length;
      $("visite-suivant").textContent = k === VISITE.length - 1 ? "C'est parti" : "Suivant";
      var bw = Math.min(340, innerWidth - 24); bulle.style.width = bw + "px";
      var bh = bulle.offsetHeight || 140, top = r.bottom + 14, left = Math.min(Math.max(12, r.left), innerWidth - bw - 12);
      if (top + bh > innerHeight - 12) top = Math.max(12, r.top - bh - 14);
      if (top < 12 || (top + bh > innerHeight - 12)) { top = innerHeight / 2 - bh / 2; left = Math.min(innerWidth - bw - 12, r.right + 14); if (left + bw > innerWidth - 12) left = 12; }
      bulle.style.top = top + "px"; bulle.style.left = left + "px";
    }
    $("visite-suivant").onclick = function () { k++; if (k >= VISITE.length) fin(); else placer(); };
    $("visite-passer").onclick = fin;
    v.hidden = false; setTimeout(placer, 30); addEventListener("resize", placer);
  }

  /* ===================== Démarrage ===================== */
  function depuisApercu(hash) {
    try {
      var d = JSON.parse(decodeURIComponent(hash)), map = { barbier: "barbier", boucherie: "boucherie", snack: "snack", boulangerie: "boulangerie", autre: "autre" }, pol = { moderne: "moderne", elegant: "elegant", simple: "simple" };
      return { nom: d.n || "", metier: map[d.m] || "barbier", c1: /^#[0-9a-f]{6}$/i.test(d.c) ? d.c : null, police: pol[d.s] || null };
    } catch (e) { return {}; }
  }
  IDB.ouvrir().then(IDB.tout).then(function (m) {
    Object.assign(MEDIAS, m);
    var hash = location.hash, sauve = null;
    try { sauve = JSON.parse(localStorage.getItem(CLE) || "null"); } catch (e) {}
    cadrer();
    if (hash.indexOf("#p=") === 0) {
      lireLienProjet(hash.slice(3)).then(function (Pn) {
        try { if (sauve) localStorage.setItem(CLE_AVANT, JSON.stringify(sauve)); } catch (e) {}
        history.replaceState(null, "", location.pathname); charger(Pn);
        toast("Projet partagé ouvert." + (sauve ? " Votre projet précédent est gardé." : ""), sauve ? "Le reprendre" : null, function () { charger(sauve); });
      }).catch(function () { toast("Ce lien de projet est abîmé."); if (sauve) charger(sauve); else assistant({}); });
    } else if (hash.indexOf("#apercu=") === 0) {
      history.replaceState(null, "", location.pathname); assistant(depuisApercu(hash.slice(8)));
      if (sauve) { P = sauve; rendreSite(); }
    } else if (sauve && sauve.pages) { charger(sauve); $("etat").textContent = "Projet repris"; }
    else assistant({});
  });
  window.addEventListener("beforeunload", function () { try { localStorage.setItem(CLE, JSON.stringify(P)); } catch (e) {} });
})();
