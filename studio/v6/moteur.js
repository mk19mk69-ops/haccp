/* Mokrani Studio, version 5 : la page d'accueil utilise le même moteur que l'Atelier. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var BL = window.Blocs, K = window.SiteKit, T = window.Trouver;
  var $ = function (id) { return document.getElementById(id); };
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SERVEUR_LIENS = "https://atelier-liens.cf-liens.workers.dev";
  if (!BL || !K) return;
  window.MS_ETAT = null;
  BL.PHOTOS_BASE = "../v5/atelier/photos/";

  /* ===================== Petit moteur (mêmes règles que l'Atelier) ===================== */
  function semaine(o, a, f, pa, pf) { return o.map(function (x) { return { o: !!x, a: a, f: f, p: !!pa, pa: pa || "12:00", pf: pf || "14:00" }; }); }
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
  var FOND_DEF = { reservation: "teinte", commande: "teinte", avis: "teinte", contact: "teinte", fidelite: "auto" };
  var MENU_DEF = { prestations: 1, produits: 1, reservation: 1, commande: 1, galerie: 1, horaires: 1, contact: 1 };
  var EXEMPLES = { barbier: "Chez Sam", coiffure: "Atelier Lila", institut: "Institut Rose", boucherie: "Boucherie du Marché", snack: "Le Spot", restaurant: "Le Comptoir", boulangerie: "Fournil du Centre", epicerie: "Épicerie Nour", fleuriste: "Fleurs d'Iris", autre: "Votre commerce" };
  /* L'allure de chaque exemple : une palette d'Ali, un style de design de l'Atelier et une forme de bannière.
     Un commerce trouvé sur la carte reçoit aussi l'allure de son métier. */
  var LOOK = {
    barbier: { theme: { fond: "obsidienne", c1: "#EF233C", c2: "#DFE5EB", style: "suisse", police: "simple", rayon: "carre" }, heros: "partage" },
    coiffure: { theme: { fond: "framboise", c1: "#FFE164", c2: "#FFD0DF", style: "editorial", police: "editorial", rayon: "carre" }, heros: "partage" },
    institut: { theme: { fond: "givre", c1: "#FD6E6E", c2: "#002941", style: "minimal", police: "simple", rayon: "carre" }, heros: "partage" },
    boucherie: { theme: { fond: "nuit", c1: "#EB2F33", c2: "#639CC5", style: "suisse", police: "simple", rayon: "carre" }, heros: "partage" },
    snack: { theme: { fond: "charbon", c1: "#B9F500", c2: "#723BFA", style: "minimal", police: "moderne", rayon: "doux" }, heros: "partage" },
    restaurant: { theme: { fond: "foret", c1: "#FC75B4", c2: "#F5F0EA", style: "editorial", police: "editorial", rayon: "carre" }, heros: "partage" },
    boulangerie: { theme: { fond: "sable", c1: "#474329", c2: "#FC75B4", style: "editorial", police: "vintage", rayon: "doux" }, heros: "partage" },
    epicerie: { theme: { fond: "ciel", c1: "#D83995", c2: "#FCFFFF", style: "minimal", police: "moderne", rayon: "doux" }, heros: "partage" },
    fleuriste: { theme: { fond: "royal", c1: "#FD91CC", c2: "#FFFFFF", style: "editorial", police: "vintage", rayon: "doux" }, heros: "partage" },
    autre: { theme: { fond: "cobalt", c1: "#58F6B1", c2: "#AD96F1", style: "minimal", police: "simple", rayon: "doux" }, heros: "partage" }
  };

  var n = 0; function uid() { return "s" + Date.now().toString(36) + (n++).toString(36); }
  function srcDe(id, t) { if (!id) return null; if (String(id).indexOf("px:") === 0) return BL.photoInfo(id) ? BL.urlPhoto(id, t) : null; return null; }
  function ctx(P) { return { P: P, edition: false, media: srcDe, M: BL.M[P.infos.metier] || BL.M.autre, metier: P.infos.metier, pageId: "accueil" }; }
  function section(t, v, P) {
    var b = BL.B[t], d = b.defaut(ctx(P));
    var menu = MENU_DEF[t] ? ((t === "prestations" || t === "produits") && d.titre && d.titre.length < 16 ? d.titre : b.ancre || "") : "";
    return { id: uid(), t: t, v: v || b.variantes[0][0], d: d, s: { fond: FOND_DEF[t] || "auto", esp: "m" }, menu: menu, ex: !/^(espace|horaires|acces|contact|reseaux)$/.test(t) };
  }
  function projet(o) {
    var m = BL.M[o.metier] ? o.metier : "autre", M = BL.M[m], obj = o.obj || M.objectif;
    var P = {
      v: 1, cree: Date.now(),
      infos: { nom: o.nom || EXEMPLES[m], metier: m, ville: o.ville || "Troyes", adresse: o.adresse || "", cp: o.cp || "", tel: o.tel || "", email: "", insta: o.insta || "", facebook: o.facebook || "", tiktok: "", forme: "", responsable: "", siret: "", mediateur: "", horaires: o.horaires || HOR[HOR_METIER[m]]() },
      theme: Object.assign({ c1: M.couleurs[0], police: M.police, fond: "clair", rayon: "doux", anim: false }, (LOOK[m] || {}).theme || {}, o.theme || {}),
      logo: null, domaine: "", publi: { hebergeur: "" },
      entete: { v: "classique", cta: { t: "Réserver", a: "resa" }, tel: true, fixe: false, logoSeul: false },
      pied: { v: "complet", texte: "", credit: true },
      pages: [{ id: "accueil", nom: "Accueil", sections: [] }]
    };
    var vus = {};
    P.pages[0].sections = BL.recette(m, obj).map(function (x) { var p = x.split(":"), s = section(p[0], p[1], P); if (vus[s.menu]) s.menu = ""; vus[s.menu] = 1; return s; });
    var lk = LOOK[m]; if (lk && lk.heros) P.pages[0].sections.forEach(function (x) { if (x.t === "heros") x.v = lk.heros; });
    P.entete.cta = obj === "rdv" ? { t: "Réserver", a: "resa" } : obj === "commande" ? { t: "Commander", a: "cmd" } : { t: "Appeler", a: "tel" };
    return P;
  }
  function rendre(el, P, secs, avecPied) {
    el.querySelectorAll("[data-sec], .s-entete, .s-pied").forEach(function (b) { if (b._kit) try { b._kit(); } catch (e) {} });
    el.setAttribute("style", BL.varsTheme(P.theme)); el.setAttribute("data-fond", P.theme.fond); el.setAttribute("data-metier", P.infos.metier); if (P.theme.style) el.setAttribute("data-style", P.theme.style); else el.removeAttribute("data-style");
    var c = ctx(P);
    el.innerHTML = BL.entete(c) + '<div class="s-corps">' + (secs || P.pages[0].sections).map(function (s) { return BL.section(s, c); }).join("") + "</div>" + (avecPied === false ? "" : BL.pied(c));
    el.querySelectorAll("[data-defile]").forEach(function (x) { x.tabIndex = 0; });
    el.querySelectorAll("a[href]").forEach(function (a) { a.addEventListener("click", function (e) { var h = a.getAttribute("href") || ""; if (h.charAt(0) !== "#") e.preventDefault(); }); });
    K.activer(el, P, { mode: "apercu" });
  }

  /* ===================== Toast ===================== */
  var tt;
  function toast(t) { var el = $("toast"); el.textContent = t; el.classList.add("on"); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove("on"); }, 3200); }

  /* ===================== Héros ===================== */
  var etat = window.MS_ETAT = { P: null, source: "exemple", fiche: null };
  var apercu = $("apercu"), defile = $("defile");
  function montrer(P, anim) {
    if (!apercu) { majPortable(); return; }
    rendre(apercu, P);
    defile.scrollTop = 0;
    if (anim && !reduit) {
      apercu.classList.remove("construit"); void apercu.offsetWidth;
      apercu.querySelectorAll(".s-entete, [data-sec]").forEach(function (b, k) { b.style.setProperty("--k", Math.min(k, 6)); });
      apercu.classList.add("construit");
      setTimeout(function () { apercu.classList.remove("construit"); }, 1600);
    }
    majPortable();
  }
  function attendre(ms) { return new Promise(function (ok) { setTimeout(ok, reduit ? 0 : ms); }); }
  var tour = 0;
  function construire(o, source, fiche) {
    var moi = ++tour, j = $("journal"), voile = $("voile");
    etat.source = source; etat.fiche = fiche || null;
    $("apres").classList.add("attente");
    j.textContent = "";
    var M = BL.M[o.metier] || BL.M.autre;
    var etapes = [["Nom : " + (o.nom || EXEMPLES[o.metier]), true]];
    if (source === "carte") {
      etapes.push([o.adresse ? "Adresse trouvée" : "Adresse à compléter", !!o.adresse]);
      etapes.push([o.tel ? "Téléphone trouvé" : "Téléphone à compléter", !!o.tel]);
      etapes.push([o.horaires ? "Horaires trouvés" : "Horaires types de votre métier", !!o.horaires]);
    }
    etapes.push(["Photos : " + M.nom.toLowerCase(), true]);
    etapes.push(["Couleurs et écriture choisies", true]);
    voile.classList.add("on");
    arreterExemples();
    var scn = $("scene"); if (scn) scn.hidden = false; if (scn && scn.classList.contains("endormi")) { scn.classList.remove("endormi"); scn.classList.add("reveil"); }
    if (innerWidth < 980 && scn) { var sc = scn.getBoundingClientRect(); if (sc.top > innerHeight * .4 || sc.bottom < 0) $("scene").scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "center" }); }
    var P = projet(o);
    etat.P = P;
    var suite = Promise.resolve();
    etapes.forEach(function (e) {
      suite = suite.then(function () {
        if (moi !== tour) return;
        var li = document.createElement("li"); li.textContent = e[0]; if (!e[1]) li.className = "non"; j.appendChild(li);
        requestAnimationFrame(function () { li.classList.add("on"); });
        return attendre(280);
      });
    });
    return suite.then(function () { return attendre(150); }).then(function () {
      if (moi !== tour) return;
      voile.classList.remove("on");
      montrer(P, true);
      var manque = [];
      if (source === "carte") { if (!o.tel) manque.push("téléphone"); if (!o.horaires) manque.push("horaires"); if (!o.adresse) manque.push("adresse"); }
      $("legende").textContent = source === "carte" ? "Infos trouvées sur OpenStreetMap, à vérifier" + (manque.length ? " (à compléter : " + manque.join(", ") + ")" : "") + ". Photos d'illustration." : source === "nom" ? "Votre nom, avec le modèle de votre métier. Photos d'illustration." : "Commerce imaginaire, pour l'exemple. Faites défiler l'écran du téléphone.";
      $("apres").classList.remove("attente");
      $("f-commerce").value = source === "exemple" ? "" : P.infos.nom;
    });
  }

  /* Métiers : en puces (par défaut), en liens texte, en liste déroulante, ou repliés */
  var metiers = $("metiers"), forme = metiers ? (metiers.getAttribute("data-forme") || "puces") : "aucune";
  var LISTE_M = BL.ORDRE_METIERS.filter(function (m) { return m !== "autre"; });
  function choisirMetier(m) {
    arreterExemples();
    if (metiers) metiers.querySelectorAll("[data-m]").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.m === m ? "true" : "false"); });
    var nom = q.value.trim();
    construire({ metier: m, nom: nom || EXEMPLES[m] }, nom ? "nom" : "exemple");
  }
  if (forme === "select") {
    var sel = document.createElement("select"); sel.className = "metier-select"; sel.setAttribute("aria-label", "Choisir votre métier");
    sel.innerHTML = '<option value="">Pas sur la carte ? Choisir votre métier</option>' + LISTE_M.map(function (m) { return '<option value="' + m + '">' + K.e(BL.M[m].nom) + "</option>"; }).join("");
    sel.addEventListener("change", function () { if (sel.value) choisirMetier(sel.value); });
    metiers.appendChild(sel);
  } else if (metiers) {
    LISTE_M.forEach(function (m) {
      var b = document.createElement("button"); b.type = "button"; b.className = forme === "liens" ? "lien-metier" : "puce"; b.textContent = BL.M[m].nom; b.setAttribute("aria-pressed", "false"); b.dataset.m = m;
      b.addEventListener("click", function () { choisirMetier(m); });
      metiers.appendChild(b);
    });
  }

  /* Exemples qui défilent seuls dans le téléphone, jusqu'au premier geste */
  var minuteur = 0, kEx = 0;
  function arreterExemples() { if (minuteur) { clearInterval(minuteur); minuteur = 0; } }
  function lancerExemples() {
    if (reduit || !$("essai").hasAttribute("data-exemples") || !$("defile")) return;
    var ordre = ["barbier", "boulangerie", "boucherie", "fleuriste", "restaurant", "institut", "snack", "coiffure", "epicerie"];
    minuteur = setInterval(function () {
      if (document.hidden || $("essai").getBoundingClientRect().bottom < 0) return;
      kEx = (kEx + 1) % ordre.length;
      var m = ordre[kEx];
      etat.P = projet({ metier: m }); etat.source = "exemple"; etat.fiche = null;
      montrer(etat.P, true);
      var leg = $("legende"); if (leg) leg.textContent = "Exemple : " + BL.M[m].nom.toLowerCase() + " imaginaire. Tapez votre nom pour voir le vôtre.";
      if (metiers) metiers.querySelectorAll("[data-m]").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.m === m ? "true" : "false"); });
    }, 3600);
    ["pointerdown", "keydown"].forEach(function (t) { $("essai").addEventListener(t, arreterExemples, { once: true }); });
    $("defile").addEventListener("scroll", arreterExemples, { once: true, passive: true });
  }

  /* Recherche */
  var q = $("q"), liste = $("suggestions"), choixK = -1, resultats = [];
  function fermer() { liste.hidden = true; q.setAttribute("aria-expanded", "false"); choixK = -1; }
  function surligner(k) { choixK = k; liste.querySelectorAll(".sugg").forEach(function (b, i) { b.setAttribute("aria-selected", i === k ? "true" : "false"); if (i === k) q.setAttribute("aria-activedescendant", b.id); }); }
  function choisir(r) {
    fermer(); q.value = r.nom;
    $("voile-txt").textContent = "Je récupère ses infos…"; $("voile").classList.add("on");
    T.details(r).then(function (d) {
      $("voile-txt").textContent = "Je construis votre site…";
      construire({ nom: d.nom, metier: d.metier, adresse: d.adresse, cp: d.cp, ville: d.ville, tel: d.tel, horaires: d.horaires, insta: d.insta, facebook: d.facebook }, "carte", d);
    });
  }
  var chercher = (function () {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var v = q.value.trim();
        if (v.length < 3 || !T) { fermer(); return; }
        T.chercher(v + (/troyes|aube|paris|\d{5}/i.test(v) ? "" : " Troyes")).then(function (res) {
          if (q.value.trim() !== v) return;
          resultats = res; liste.textContent = "";
          if (!res.length) { fermer(); return; }
          res.forEach(function (r, i) {
            var b = document.createElement("button"); b.type = "button"; b.className = "sugg"; b.id = "sugg-" + i; b.setAttribute("role", "option");
            var m = BL.M[r.metier] || BL.M.autre;
            b.innerHTML = "<i aria-hidden=\"true\">" + K.e(m.nom.charAt(0)) + "</i><b>" + K.e(r.nom) + "</b><small>" + K.e(r.ligne || r.ville || m.nom) + "</small>";
            b.addEventListener("mousedown", function (e) { e.preventDefault(); });
            b.addEventListener("click", function () { choisir(r); });
            liste.appendChild(b);
          });
          var p = document.createElement("p"); p.className = "sugg-pied"; p.textContent = "Résultats de la carte OpenStreetMap"; liste.appendChild(p);
          liste.hidden = false; q.setAttribute("aria-expanded", "true"); choixK = -1;
        });
      }, 280);
    };
  })();
  q.addEventListener("input", chercher);
  q.addEventListener("keydown", function (e) {
    if (liste.hidden) return;
    var nb = liste.querySelectorAll(".sugg").length;
    if (e.key === "ArrowDown") { e.preventDefault(); surligner((choixK + 1) % nb); }
    else if (e.key === "ArrowUp") { e.preventDefault(); surligner((choixK - 1 + nb) % nb); }
    else if (e.key === "Escape") fermer();
    else if (e.key === "Enter" && choixK >= 0) { e.preventDefault(); choisir(resultats[choixK]); }
  });
  q.addEventListener("blur", function () { setTimeout(fermer, 150); });
  $("recherche").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = q.value.trim();
    if (!v) { q.focus(); return; }
    if (!liste.hidden && resultats.length) { choisir(resultats[Math.max(choixK, 0)]); return; }
    var m = T ? T.metierDe("", "", v, "") : "autre";
    var actif = metiers ? metiers.querySelector('[aria-pressed="true"]') : null;
    if (m === "autre" && actif) m = actif.dataset.m;
    construire({ nom: v, metier: m === "autre" ? "barbier" : m }, "nom");
  });

  /* Liens vers l'Atelier */
  function lienSimple() {
    var f = etat.fiche;
    if (f && f.source === "osm") return "../v5/atelier/?osm=" + encodeURIComponent(f.id) + "&nom=" + encodeURIComponent(f.nom) + "&cle=" + encodeURIComponent(f.cle || "") + "&val=" + encodeURIComponent(f.val || "");
    return "../v5/atelier/?nom=" + encodeURIComponent(etat.P ? etat.P.infos.nom : "");
  }
  function lienCourt() {
    return Promise.race([
      fetch(SERVEUR_LIENS + "/p", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ atelier: 1, projet: etat.P, medias: {} }) })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { if (!d.code) throw 0; return "../v5/atelier/?projet=" + d.code; }),
      new Promise(function (ok, ko) { setTimeout(ko, 5000); })
    ]);
  }
  function absolu(rel) { return new URL(rel, location.href).href; }
  $("vers-atelier").addEventListener("click", function (e) {
    if (!etat.P) return;
    e.preventDefault();
    var a = this; a.textContent = "Ouverture…";
    lienCourt().then(function (l) { location.href = l; }, function () { location.href = lienSimple(); });
  });
  $("partager").addEventListener("click", function () {
    var b = this; b.textContent = "Un instant…";
    lienCourt().catch(function () { return lienSimple(); }).then(function (l) {
      var url = absolu(l);
      var fini = function () { b.textContent = "Copier le lien"; toast("Lien copié : il ouvre cette maquette dans l'Atelier."); };
      if (navigator.share && matchMedia("(pointer: coarse)").matches) { navigator.share({ title: "Ma maquette Mokrani Studio", url: url }).then(function () { b.textContent = "Copier le lien"; }, function () { b.textContent = "Copier le lien"; }); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(fini, function () { b.textContent = "Copier le lien"; prompt("Copiez ce lien :", url); });
      else { b.textContent = "Copier le lien"; prompt("Copiez ce lien :", url); }
    });
  });
  if ($("vers-devis")) $("vers-devis").addEventListener("click", function () {
    if (!etat.P) return;
    if (etat.source !== "exemple") $("f-commerce").value = etat.P.infos.nom;
    var msg = $("f-msg");
    if (!msg.value) msg.value = "J'ai essayé la maquette " + (etat.source === "exemple" ? "pour un " + (BL.M[etat.P.infos.metier] || BL.M.autre).nom.toLowerCase() : "de " + etat.P.infos.nom) + " sur votre site. Je voudrais en parler.";
    $("f-formule").value = etat.P.entete.cta.a === "tel" ? "Vitrine" : "Réservation";
  });

  /* Téléphone qui suit la souris (souris uniquement) */
  var heros = $("essai"), tel = $("tel") || document.createElement("div");
  if (!reduit && matchMedia("(pointer: fine)").matches) {
    var raf = 0;
    heros.addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = heros.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        heros.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); heros.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        tel.style.setProperty("--ry", ((x - .5) * 10).toFixed(2) + "deg"); tel.style.setProperty("--rx", ((.5 - y) * 6).toFixed(2) + "deg");
        tel.style.setProperty("--angle", (100 + x * 40).toFixed(0) + "deg");
      });
    });
    heros.addEventListener("pointerleave", function () { tel.style.removeProperty("--ry"); tel.style.removeProperty("--rx"); });
  }

  /* Navigation claire après le héros */
  var nav = $("nav");
  new IntersectionObserver(function (e) { nav.classList.toggle("clair", !e[0].isIntersecting); }, { rootMargin: "-64px 0px 0px 0px" }).observe(heros);

  /* ===================== Fonctions ===================== */
  var fidMetier = ["boulangerie", "snack", "barbier", "boucherie", "restaurant", "coiffure"].filter(function (m) { return BL.M[m] && BL.M[m].fidelite; })[0] || "boulangerie";
  var FONCTIONS = [
    { t: "Réservation en ligne", d: "Le client choisit sa prestation, son jour et son heure. Vous recevez la demande, il reçoit la confirmation.", m: "barbier", s: ["reservation", "etapes"] },
    { t: "Commande à retirer", d: "Il compose sa commande au prix affiché et choisit l'heure de retrait. Vous la préparez à l'avance.", m: "boucherie", s: ["commande", "carte"] },
    { t: "Votre carte et vos prix", d: "Prestations ou plats, avec les prix. Vous les changez vous-même en une minute.", m: "restaurant", s: ["prestations", "ardoise"] },
    { t: "Carte de fidélité", d: "Un tampon à chaque passage, sans carte en carton à perdre.", m: fidMetier, s: ["fidelite", "carte"] },
    { t: "Horaires et « ouvert maintenant »", d: "Les horaires sont à jour et le site dit si vous êtes ouvert en ce moment.", m: "snack", s: ["horaires", "semaine"] }
  ];
  var choixF = $("choix"), demo = $("demo");
  function montrerF(k) {
    var f = FONCTIONS[k];
    choixF.querySelectorAll("button").forEach(function (b, i) { b.setAttribute("aria-selected", i === k ? "true" : "false"); b.tabIndex = i === k ? 0 : -1; });
    var P = projet({ metier: f.m });
    var s = section(f.s[0], f.s[1], P); s.s.fond = "auto";
    rendre(demo, P, [s], false);
    var dd = $("demo-defile"); if (dd) dd.scrollTop = 0;
    if (!reduit) { demo.classList.remove("construit"); void demo.offsetWidth; demo.classList.add("construit"); }
  }
  FONCTIONS.forEach(function (f, k) {
    var b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "demo"); b.id = "fn-" + k;
    b.innerHTML = "<b>" + K.e(f.t) + "</b><em>" + K.e((BL.M[f.m] || BL.M.autre).nom) + "</em><span>" + K.e(f.d) + "</span>";
    b.addEventListener("click", function () { montrerF(k); });
    b.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); var i = (k + (e.key === "ArrowDown" ? 1 : -1) + FONCTIONS.length) % FONCTIONS.length; montrerF(i); choixF.children[i].focus(); }
    });
    choixF.appendChild(b);
  });
  demo.setAttribute("role", "tabpanel");

  /* ===================== Combinaisons (Atelier) ===================== */
  var COMBOS = [
    ["Bleu égyptien", { fond: "nuit", c1: "#EB2F33", c2: "#639CC5" }, "../v5/assets/palette-egyptien.webp"],
    ["Sable et moka", { fond: "sable", c1: "#474329", c2: "#FC75B4" }, "../v5/assets/palette-sable.webp"],
    ["Forêt et rose", { fond: "foret", c1: "#FC75B4", c2: "#F5F0EA" }, "../v5/assets/palette-foret.webp"],
    ["Cobalt et lavande", { fond: "cobalt", c1: "#58F6B1", c2: "#AD96F1" }, "../v5/assets/palette-cobalt.webp"],
    ["Ciel et rose vif", { fond: "ciel", c1: "#D83995", c2: "#FCFFFF" }, "../v5/assets/palette-ciel.webp"],
    ["Rouge et jaune", { fond: "cramoisi", c1: "#FEED65", c2: "#E13A26" }, "../v5/assets/palette-cramoisi.webp"],
    ["Bleu profond et rose", { fond: "royal", c1: "#FD91CC", c2: "#FFFFFF" }, "../v5/assets/palette-royal.webp"],
    ["Bleu doux et corail", { fond: "givre", c1: "#FD6E6E", c2: "#002941" }, "../v5/assets/palette-givre.webp"],
    ["Framboise et beurre", { fond: "framboise", c1: "#FFE164", c2: "#FFD0DF" }, "../v5/assets/palette-framboise.webp"],
    ["Violet et lime", { fond: "charbon", c1: "#B9F500", c2: "#723BFA" }, "../v5/assets/palette-charbon.webp"],
    ["Noir et rouge", { fond: "obsidienne", c1: "#EF233C", c2: "#DFE5EB" }, "../v5/assets/palette-obsidienne.webp"]
  ];
  var combos = $("combos"), apercuPc = $("apercu-pc"), vuePc = $("vue-pc"), maquette = $("vue-maquette");
  /* Les trois premières combinaisons montrent un vrai site dessiné sur mesure dans cette palette */
  function montrerMaquette(cb) {
    if (!maquette) return false;
    if (cb && cb[2]) { maquette.src = cb[2]; maquette.hidden = false; vuePc.classList.add("avec-maquette"); return true; }
    maquette.hidden = true; vuePc.classList.remove("avec-maquette"); return false;
  }
  COMBOS.forEach(function (cb, k) {
    var f = BL.FONDS[cb[1].fond] || BL.FONDS.clair;
    var b = document.createElement("button"); b.type = "button"; b.className = "combo"; b.setAttribute("aria-pressed", k === 0 && maquette ? "true" : "false"); b.setAttribute("aria-label", cb[0]); b.title = cb[0];
    b.style.cssText = "--cf:" + f.fond + ";--c1:" + cb[1].c1 + ";--c2:" + cb[1].c2;
    b.addEventListener("click", function () {
      if (!etat.P) return;
      combos.querySelectorAll(".combo").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      Object.assign(etat.P.theme, { c1: cb[1].c1, c2: cb[1].c2, fond: cb[1].fond });
      montrer(etat.P, false);
      $("combo-nom").textContent = montrerMaquette(cb)
        ? cb[0] + "\u00a0: à droite, un site dessiné sur mesure dans cette palette. En haut de la page, le site de " + etat.P.infos.nom + " prend les mêmes couleurs."
        : cb[0] + "\u00a0: appliquée au site de " + etat.P.infos.nom + ", ici et en haut de la page.";
    });
    combos.appendChild(b);
  });
  if (montrerMaquette(COMBOS[0])) $("combo-nom").textContent = "Bleu égyptien\u00a0: un site dessiné sur mesure dans cette palette. Touchez une autre combinaison pour l'essayer sur votre site.";
  function majPortable() {
    if (!vuePc || !apercuPc) return;
    if (!etat.P) return;
    var ech = vuePc.clientWidth / 1280; apercuPc.style.setProperty("--ech", ech.toFixed(4));
    rendre(apercuPc, etat.P);
  }
  var lr = 0;
  if (window.ResizeObserver) new ResizeObserver(function () { var l = vuePc.clientWidth; if (l !== lr) { lr = l; apercuPc.style.setProperty("--ech", (l / 1280).toFixed(4)); } }).observe(vuePc);
  $("ouvrir-atelier").addEventListener("click", function (e) {
    if (!etat.P || etat.source === "exemple") return;
    e.preventDefault(); lienCourt().then(function (l) { location.href = l; }, function () { location.href = lienSimple(); });
  });

  /* ===================== Ticket ===================== */
  var FORMULES = [["Vitrine", 350], ["Réservation", 490], ["Sur mesure", 690, "dès "], ["Vitrine Atelier", 190], ["Réservation Atelier", 290]];
  var choixT = $("choix-formule"), lignes = $("ticket-lignes"), tampon = $("tampon");
  function euros(v) { return v.toFixed(2).replace(".", ",") + " €"; }
  function ticket(k) {
    var f = FORMULES[k];
    choixT.querySelectorAll("button").forEach(function (b, i) { b.setAttribute("aria-pressed", i === k ? "true" : "false"); });
    var L = [[(f[0] === "Sur mesure" ? "Logiciel sur mesure" : "Site " + f[0].toLowerCase().replace("atelier", "(Atelier)")), (f[2] || "") + euros(f[1])], ["Domaine et hébergement, 1re année", euros(50)], ["Abonnement mensuel", euros(0), 1], ["Commission sur vos ventes", euros(0), 1]];
    lignes.innerHTML = L.map(function (l) { return "<tr" + (l[2] ? ' class="zero"' : "") + "><td>" + K.e(l[0]) + "</td><td>" + l[1] + "</td></tr>"; }).join("") +
      '<tr class="total"><td>Total 1re année</td><td>' + (f[2] || "") + euros(f[1] + 50) + "</td></tr>";
    if (!reduit) { tampon.classList.remove("frappe"); void tampon.offsetWidth; tampon.classList.add("frappe"); }
  }
  FORMULES.forEach(function (f, k) { var b = document.createElement("button"); b.type = "button"; b.textContent = f[0]; b.addEventListener("click", function () { ticket(k); }); choixT.appendChild(b); });
  ticket(1);
  document.querySelectorAll("[data-formule]").forEach(function (b) {
    b.addEventListener("click", function () {
      var nom = b.dataset.formule, k = FORMULES.map(function (f) { return f[0]; }).indexOf(nom); if (k >= 0) ticket(k);
      $("f-formule").value = nom;
      $("contact").scrollIntoView({ behavior: reduit ? "auto" : "smooth" });
      setTimeout(function () { $("f-nom").focus({ preventScroll: true }); }, reduit ? 0 : 700);
    });
  });

  /* ===================== Contact ===================== */
  function texteDevis() {
    var v = function (id) { return $(id).value.trim(); };
    return ["Demande de devis", "Nom : " + (v("f-nom") || "?"), "Commerce : " + (v("f-commerce") || "?"), "Téléphone : " + (v("f-tel") || "?"), "Formule : " + v("f-formule"), "", v("f-msg")].join("\n");
  }
  function envoyer(url) { location.href = url; setTimeout(function () { location.href = "devis-envoye.html"; }, 1500); }
  $("par-sms").addEventListener("click", function () { envoyer("sms:+33782023657?&body=" + encodeURIComponent(texteDevis())); });
  $("par-mail").addEventListener("click", function () { var c = $("f-commerce").value.trim(); envoyer("mailto:ali@mokranistudio.fr?subject=" + encodeURIComponent("Demande de devis" + (c ? " · " + c : "")) + "&body=" + encodeURIComponent(texteDevis())); });

  /* ===================== Titres qui apparaissent ===================== */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("vu"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll(".revele").forEach(function (el) { io.observe(el); });
  } else document.querySelectorAll(".revele").forEach(function (el) { el.classList.add("vu"); });

  /* ===================== Départ ===================== */
  etat.P = projet({ metier: "barbier", nom: EXEMPLES.barbier });
  window.MS_RENDU = { projet: projet, rendre: rendre, LOOK: LOOK };
  montrer(etat.P, false);
  montrerF(0);
  if (metiers && forme !== "select") metiers.querySelector('[data-m="barbier"]').setAttribute("aria-pressed", "true");
  lancerExemples();
})();
