/* SiteKit : ce qui fait fonctionner les sites créés avec l'Atelier.
   Horaires en direct, prise de rendez-vous, commande à retirer, compte à rebours,
   galerie, formulaire de contact, menu mobile, pages. Aucun cookie, aucun traceur. */
(function (w) {
  "use strict";
  var K = {};
  K.JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  K.e = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  K.hm = function (s) { if (!s) return null; var p = String(s).split(":"); var v = +p[0] + (+p[1] || 0) / 60; return isNaN(v) ? null : v; };
  K.fmt = function (h) { var H = Math.floor(h + 1e-6), m = Math.round((h - H) * 60); if (m === 60) { H++; m = 0; } return H + "h" + (m ? (m < 10 ? "0" : "") + m : ""); };
  K.ji = function (d) { return (d.getDay() + 6) % 7; };
  K.plages = function (H, i) {
    var j = H && H[i]; if (!j || !j.o) return [];
    var a = K.hm(j.a), f = K.hm(j.f); if (a == null || f == null || f <= a) return [];
    if (j.p) { var pa = K.hm(j.pa), pf = K.hm(j.pf); if (pa != null && pf != null && pa > a && pf < f && pf > pa) return [[a, pa], [pf, f]]; }
    return [[a, f]];
  };
  K.aDesHoraires = function (H) { for (var i = 0; i < 7; i++) if (K.plages(H, i).length) return true; return false; };
  K.statut = function (H, d) {
    d = d || new Date();
    if (!K.aDesHoraires(H)) return { ouvert: null, texte: "Horaires bientôt en ligne" };
    var i = K.ji(d), h = d.getHours() + d.getMinutes() / 60, pl = K.plages(H, i), k;
    for (k = 0; k < pl.length; k++) if (h >= pl[k][0] && h < pl[k][1]) {
      var reste = pl[k][1] - h;
      return { ouvert: true, texte: reste <= .5 ? "Ouvert, ferme bientôt (" + K.fmt(pl[k][1]) + ")" : "Ouvert maintenant, jusqu'à " + K.fmt(pl[k][1]) };
    }
    for (k = 0; k < pl.length; k++) if (h < pl[k][0]) return { ouvert: false, texte: "Fermé, ouvre à " + K.fmt(pl[k][0]) };
    for (var n = 1; n <= 7; n++) {
      var j = (i + n) % 7, p2 = K.plages(H, j);
      if (p2.length) return { ouvert: false, texte: "Fermé, ouvre " + (n === 1 ? "demain" : K.JOURS[j].toLowerCase()) + " à " + K.fmt(p2[0][0]) };
    }
    return { ouvert: false, texte: "Fermé" };
  };
  K.num = function (s) { var m = String(s == null ? "" : s).replace(",", ".").match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; };
  K.eur = function (n) { var t = (Math.round(n * 100) / 100).toFixed(2).replace(".", ","); return t.replace(/,00$/, "") + " €"; };
  K.prix = function (s) {
    s = String(s == null ? "" : s).trim(); if (!s) return "";
    if (/^\d+([.,]\d{1,2})?$/.test(s)) return K.eur(parseFloat(s.replace(",", ".")));
    if (/\d/.test(s) && s.indexOf("€") < 0) return s + " €";
    return s;
  };
  K.estKg = function (u) { return /kg|kilo/i.test(u || ""); };
  K.jourTexte = function (d) {
    var a = new Date(), dm = new Date(); dm.setDate(a.getDate() + 1);
    if (d.toDateString() === a.toDateString()) return "Aujourd'hui";
    if (d.toDateString() === dm.toDateString()) return "Demain";
    var t = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  K.jourLong = function (d) { return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); };
  K.joursOuverts = function (H, n) {
    var r = [], d = new Date(); d.setHours(12, 0, 0, 0);
    for (var k = 0; k < 21 && r.length < n; k++) { if (K.plages(H, K.ji(d)).length) r.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return r;
  };
  K.creneaux = function (H, date, pas, duree) {
    var r = [], now = new Date(), auj = date.toDateString() === now.toDateString(), hn = now.getHours() + now.getMinutes() / 60;
    pas = (pas || 30) / 60; duree = (duree || 30) / 60;
    K.plages(H, K.ji(date)).forEach(function (p) {
      for (var h = p[0]; h + duree <= p[1] + 1e-6; h += pas) if (!auj || h > hn + .5) r.push(Math.round(h * 60) / 60);
    });
    return r;
  };
  /* Créneaux déjà pris : seulement en démonstration, jamais sur un vrai site exporté. */
  K.demoPris = function (date, h) { var x = (date.getDate() * 37 + Math.round(h * 4) * 11 + date.getMonth() * 5) % 7; return x === 0 || x === 3; };

  function el(tag, cls, txt) { var x = document.createElement(tag); if (cls) x.className = cls; if (txt != null) x.textContent = txt; return x; }
  function bouton(cls, txt) { var b = el("button", cls, txt); b.type = "button"; return b; }
  function puce(d, on) {
    var b = bouton("s-puce" + (on ? " on" : "")), a = K.jourTexte(d);
    b.appendChild(el("small", null, a === "Aujourd'hui" ? "Auj." : a === "Demain" ? "Dem." : d.toLocaleDateString("fr-FR", { weekday: "short" })));
    b.appendChild(el("b", null, String(d.getDate())));
    b.setAttribute("aria-label", K.jourLong(d)); b.setAttribute("aria-pressed", on ? "true" : "false");
    return b;
  }
  function vider(z) { var x = z.scrollLeft; z.textContent = ""; return function () { z.scrollLeft = x; }; }
  var douceur = function () { return w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; };

  /* Envoi réel depuis un site exporté : on prépare un SMS (ou un mail) vers le commerce. */
  function envoyer(P, texte) {
    var t = (P.infos.tel || "").replace(/[^\d+]/g, "");
    if (t) { location.href = "sms:" + t + "?&body=" + encodeURIComponent(texte); return "sms"; }
    if (P.infos.email) { location.href = "mailto:" + P.infos.email + "?subject=" + encodeURIComponent("Demande depuis le site") + "&body=" + encodeURIComponent(texte); return "mail"; }
    return null;
  }

  function formulaire(bloc, P, o, quoi, fin) {
    var form = bloc.querySelector(".s-resa-form"), finEl = bloc.querySelector(".s-resa-fin"), etape = bloc.querySelector(".s-resa-etape");
    return {
      ouvrir: function (recap) {
        form.querySelector(".s-form-recap").textContent = recap;
        etape.hidden = true; form.hidden = false; finEl.hidden = true;
        var n = form.querySelector("input"); if (n && o.mode !== "edition") n.focus({ preventScroll: true });
      },
      init: function () {
        form.querySelector("[data-retour]").addEventListener("click", function () { form.hidden = true; etape.hidden = false; });
        form.addEventListener("submit", function (ev) {
          ev.preventDefault();
          var nom = form.querySelector("[name=nom]").value.trim(), tel = form.querySelector("[name=tel]").value.trim(), err = form.querySelector(".s-form-err");
          if (!nom || tel.replace(/\D/g, "").length < 10) { err.textContent = !nom ? "Indiquez votre nom." : "Indiquez un numéro à 10 chiffres pour être recontacté."; return; }
          err.textContent = "";
          var r = fin(nom, tel);
          finEl.querySelector(".s-fin-titre").textContent = r.titre;
          finEl.querySelector(".s-fin-texte").textContent = r.texte;
          if (o.mode === "export") { var via = envoyer(P, r.message); if (via) finEl.querySelector(".s-fin-texte").textContent = r.texte + (via === "sms" ? " Votre message est prêt : il ne reste qu'à l'envoyer." : " Votre mail est prêt : il ne reste qu'à l'envoyer."); }
          else if (o.toast) o.toast(r.notifTitre, r.notifTexte);
          form.hidden = true; finEl.hidden = false; finEl.classList.remove("joue"); void finEl.offsetWidth; finEl.classList.add("joue");
        });
        finEl.querySelector("[data-encore]").addEventListener("click", function () { finEl.hidden = true; etape.hidden = false; form.reset(); if (quoi.reset) quoi.reset(); });
      }
    };
  }

  /* ---------- Prise de rendez-vous ---------- */
  function resa(bloc, P, o) {
    var H = P.infos.horaires, pas = +bloc.getAttribute("data-pas") || 30;
    var services = [].slice.call(bloc.querySelectorAll(".s-service"));
    var zJ = bloc.querySelector(".s-resa-jours"), zH = bloc.querySelector(".s-resa-heures"), recap = bloc.querySelector(".s-resa-recap"), ok = bloc.querySelector("[data-resa-ok]");
    var S = { s: services.length ? 0 : -1, j: 0, h: null }, jours = K.joursOuverts(H, 6);
    function service() { var b = services[S.s]; return b ? { nom: b.getAttribute("data-nom"), duree: +b.getAttribute("data-duree") || pas, prix: b.getAttribute("data-prix") } : { nom: "Rendez-vous", duree: pas, prix: "" }; }
    function dessiner() {
      services.forEach(function (b, i) { b.setAttribute("aria-checked", i === S.s ? "true" : "false"); b.classList.toggle("on", i === S.s); });
      var remettre = vider(zJ); zH.textContent = "";
      if (!jours.length) { zH.appendChild(el("p", "s-vide", "Ajoutez vos horaires pour afficher les créneaux.")); }
      jours.forEach(function (d, i) {
        var b = puce(d, i === S.j);
        b.addEventListener("click", function () { S.j = i; S.h = null; dessiner(); });
        zJ.appendChild(b);
      });
      remettre();
      if (jours.length) {
        var d = jours[S.j], hs = K.creneaux(H, d, pas, service().duree), libres = 0;
        hs.forEach(function (h) {
          var pris = o.mode !== "export" && K.demoPris(d, h);
          var b = bouton("s-heure" + (S.h === h ? " on" : ""), K.fmt(h)); b.disabled = pris; if (pris) b.title = "Déjà pris";
          if (!pris) libres++;
          b.addEventListener("click", function () { S.h = h; dessiner(); });
          zH.appendChild(b);
        });
        if (!hs.length || !libres) zH.appendChild(el("p", "s-vide", "Plus de créneau ce jour-là. Choisissez un autre jour."));
      }
      var s = service();
      recap.textContent = S.h == null ? "Choisissez un horaire." : s.nom + ", " + K.jourLong(jours[S.j]) + " à " + K.fmt(S.h) + (K.prix(s.prix) ? " · " + K.prix(s.prix) : "");
      ok.disabled = S.h == null;
    }
    services.forEach(function (b, i) { b.addEventListener("click", function () { S.s = i; S.h = null; dessiner(); }); });
    var f = formulaire(bloc, P, o, { reset: function () { S.h = null; dessiner(); } }, function (nom, tel) {
      var s = service(), quand = K.jourLong(jours[S.j]) + " à " + K.fmt(S.h);
      return {
        titre: o.mode === "export" ? "Demande prête" : "C'est réservé",
        texte: s.nom + ", " + quand + ".",
        message: "Bonjour, je souhaite réserver : " + s.nom + ", " + quand + ". " + nom + ", " + tel + ".",
        notifTitre: "Nouveau rendez-vous", notifTexte: nom + " : " + s.nom.toLowerCase() + ", " + K.jourTexte(jours[S.j]).toLowerCase() + " " + K.fmt(S.h)
      };
    });
    f.init();
    ok.addEventListener("click", function () { var s = service(); f.ouvrir(s.nom + ", " + K.jourLong(jours[S.j]) + " à " + K.fmt(S.h)); });
    dessiner();
  }

  /* ---------- Commande à retirer ---------- */
  function cmd(bloc, P, o) {
    var H = P.infos.horaires, lignes = [].slice.call(bloc.querySelectorAll(".s-cmd-ligne"));
    var zJ = bloc.querySelector(".s-resa-jours"), zH = bloc.querySelector(".s-resa-heures"), tot = bloc.querySelector(".s-resa-recap"), ok = bloc.querySelector("[data-cmd-ok]");
    var Q = {}, S = { j: 0, h: null, dern: null }, jours = K.joursOuverts(H, 5);
    function qteTexte(q, kg) { if (!kg || !q) return String(q); return q >= 1 ? String(q).replace(".", ",") + " kg" : Math.round(q * 1000) + " g"; }
    function total() { var t = 0, n = 0; lignes.forEach(function (l, i) { var q = Q[i] || 0; if (q) { n++; t += q * (K.num(l.getAttribute("data-prix")) || 0); } }); return { t: t, n: n }; }
    function dessiner() {
      lignes.forEach(function (l, i) {
        var kg = K.estKg(l.getAttribute("data-unite")), q = Q[i] || 0, z = l.querySelector(".s-pas");
        z.textContent = "";
        var m = bouton("s-pas-b", "−"), v = el("span", "s-pas-v", qteTexte(q, kg)), p = bouton("s-pas-b s-pas-plus", "+");
        m.setAttribute("aria-label", "Retirer"); p.setAttribute("aria-label", "Ajouter"); m.disabled = !q;
        m.addEventListener("click", function () { Q[i] = Math.max(0, Math.round((q - (kg ? .25 : 1)) * 100) / 100); S.dern = i; dessiner(); });
        p.addEventListener("click", function () { Q[i] = Math.round((q + (kg ? .25 : 1)) * 100) / 100; S.dern = i; dessiner(); });
        if (S.dern === i) v.classList.add("hop");
        z.appendChild(m); z.appendChild(v); z.appendChild(p);
        l.classList.toggle("on", q > 0);
      });
      S.dern = null;
      var remettre = vider(zJ); zH.textContent = "";
      jours.forEach(function (d, i) { var b = puce(d, i === S.j); b.addEventListener("click", function () { S.j = i; S.h = null; dessiner(); }); zJ.appendChild(b); });
      remettre();
      if (!jours.length) zH.appendChild(el("p", "s-vide", "Ajoutez vos horaires pour proposer des retraits."));
      else {
        var hs = K.creneaux(H, jours[S.j], 30, 0);
        hs.forEach(function (h) { var b = bouton("s-heure" + (S.h === h ? " on" : ""), K.fmt(h)); b.addEventListener("click", function () { S.h = h; dessiner(); }); zH.appendChild(b); });
        if (!hs.length) zH.appendChild(el("p", "s-vide", "Plus de retrait possible ce jour-là."));
      }
      var r = total();
      tot.textContent = r.n ? r.n + " article" + (r.n > 1 ? "s" : "") + ", " + K.eur(r.t) + (S.h == null ? ". Choisissez l'heure de retrait." : ", retrait " + K.jourTexte(jours[S.j]).toLowerCase() + " à " + K.fmt(S.h)) : "Votre panier est vide.";
      ok.disabled = !r.n || S.h == null;
    }
    function liste() { var a = []; lignes.forEach(function (l, i) { var q = Q[i]; if (q) a.push(qteTexte(q, K.estKg(l.getAttribute("data-unite"))) + (K.estKg(l.getAttribute("data-unite")) ? " de " : " × ") + l.getAttribute("data-nom")); }); return a.join(", "); }
    var f = formulaire(bloc, P, o, { reset: function () { Q = {}; S.h = null; dessiner(); } }, function (nom, tel) {
      var r = total(), quand = K.jourLong(jours[S.j]) + " à " + K.fmt(S.h);
      return {
        titre: o.mode === "export" ? "Commande prête" : "Commande envoyée",
        texte: "À retirer " + quand + ". Total estimé : " + K.eur(r.t) + ", à régler sur place.",
        message: "Bonjour, je souhaite commander : " + liste() + ". Retrait " + quand + ". " + nom + ", " + tel + ".",
        notifTitre: "Nouvelle commande", notifTexte: nom + " : " + K.eur(r.t) + ", retrait " + K.jourTexte(jours[S.j]).toLowerCase() + " " + K.fmt(S.h)
      };
    });
    f.init();
    ok.addEventListener("click", function () { f.ouvrir(liste() + ". Retrait " + K.jourLong(jours[S.j]) + " à " + K.fmt(S.h) + ". Total estimé " + K.eur(total().t) + "."); });
    dessiner();
  }

  /* ---------- Compte à rebours ---------- */
  function compte(bloc) {
    var fin = new Date(bloc.getAttribute("data-compte")), cases = bloc.querySelectorAll("[data-u]");
    function maj() {
      var ms = fin - new Date();
      if (isNaN(ms)) return;
      if (ms <= 0) { bloc.classList.add("fini"); ms = 0; }
      var v = { j: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
      cases.forEach(function (c) { var n = v[c.getAttribute("data-u")]; c.textContent = (n < 10 ? "0" : "") + n; });
    }
    maj(); return setInterval(maj, 1000);
  }

  /* ---------- Activation ---------- */
  K.activerBloc = function (bloc, P, o) {
    if (bloc._kit) bloc._kit();
    var mins = [];
    bloc.querySelectorAll("[data-statut]").forEach(function (s) {
      function maj() { var r = K.statut(P.infos.horaires); s.classList.toggle("ferme", r.ouvert === false); s.classList.toggle("inconnu", r.ouvert === null); s.querySelector("span").textContent = r.texte; }
      maj(); mins.push(setInterval(maj, 30000));
    });
    bloc.querySelectorAll("[data-horaires]").forEach(function (t) { var i = K.ji(new Date()); t.querySelectorAll("[data-j]").forEach(function (r) { r.classList.toggle("auj", +r.getAttribute("data-j") === i); }); });
    bloc.querySelectorAll("[data-auj]").forEach(function (x) {
      function maj() { var H = P.infos.horaires, p = K.plages(H, K.ji(new Date())); x.textContent = p.length ? p.map(function (y) { return K.fmt(y[0]) + " – " + K.fmt(y[1]); }).join(", ") : K.aDesHoraires(H) ? "Fermé aujourd'hui" : "Horaires à venir"; }
      maj(); mins.push(setInterval(maj, 60000));
    });
    bloc.querySelectorAll("[data-semaine]").forEach(function (sem) { maj(); mins.push(setInterval(maj, 60000));
      function maj() {
        var mn = +sem.getAttribute("data-min"), mx = +sem.getAttribute("data-max"), d = new Date(), i = K.ji(d), h = d.getHours() + d.getMinutes() / 60;
        sem.querySelectorAll("[data-j]").forEach(function (r) {
          var a = +r.getAttribute("data-j") === i, m = r.querySelector(".s-sem-mtn"); r.classList.toggle("auj", a); if (m) m.remove();
          if (a && h >= mn && h <= mx) { var b = el("b", "s-sem-mtn"); b.style.left = ((h - mn) / (mx - mn) * 100) + "%"; b.title = "Maintenant"; r.querySelector(".s-sem-p").appendChild(b); }
        });
      }
    });
    bloc.querySelectorAll("[data-seg]").forEach(function (seg) { K.segments(seg, bloc); });
    bloc.querySelectorAll("[data-defile]").forEach(function (sc) { K.fleches(sc, bloc); });
    bloc.querySelectorAll("[data-resa]").forEach(function (b) { resa(b, P, o); });
    bloc.querySelectorAll("[data-cmd]").forEach(function (b) { cmd(b, P, o); });
    bloc.querySelectorAll("[data-compte]").forEach(function (b) { mins.push(compte(b)); });
    if (o.mode !== "edition") {
      bloc.querySelectorAll("[data-galerie] img").forEach(function (img) {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", function () { K.loupe(img, o); });
      });
    }
    bloc.querySelectorAll("form[data-contact]").forEach(function (f) {
      f.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var nom = f.querySelector("[name=nom]").value.trim(), msg = f.querySelector("[name=message]").value.trim(), err = f.querySelector(".s-form-err");
        if (!nom || !msg) { err.textContent = "Indiquez votre nom et votre message."; return; }
        err.textContent = "";
        var contact = f.querySelector("[name=contact]").value.trim();
        if (o.mode === "export") envoyer(P, msg + " (" + nom + (contact ? ", " + contact : "") + ")");
        else if (o.toast) o.toast("Nouveau message", nom + " : " + msg.slice(0, 60));
        f.reset(); err.textContent = o.mode === "export" ? "Votre message est prêt à être envoyé." : "Message envoyé.";
      });
    });
    bloc._kit = function () { mins.forEach(clearInterval); bloc._kit = null; };
  };

  /* Filtre par catégorie : la pastille glisse sous l'option choisie. */
  K.segments = function (seg, bloc) {
    var btns = [].slice.call(seg.querySelectorAll("button[data-g]")), cibles = [].slice.call(bloc.querySelectorAll("[data-g]")).filter(function (x) { return !seg.contains(x); });
    function choisi() { return btns.filter(function (b) { return b.getAttribute("aria-selected") === "true"; })[0] || btns[0]; }
    function placer() { var b = choisi(); if (!b || !b.offsetWidth) return; seg.style.setProperty("--x", b.offsetLeft + "px"); seg.style.setProperty("--w", b.offsetWidth + "px"); seg.classList.add("pret"); }
    function prendre(b, focus) {
      btns.forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); x.tabIndex = x === b ? 0 : -1; });
      placer(); if (focus) b.focus();
      var g = b.getAttribute("data-g");
      cibles.forEach(function (c) { var on = !g || c.getAttribute("data-g") === g; c.classList.toggle("s-cache", !on); if (on) { c.classList.remove("s-sort"); void c.offsetWidth; c.classList.add("s-sort"); } });
      if (b.scrollIntoView && seg.scrollWidth > seg.clientWidth) seg.scrollTo({ left: b.offsetLeft - 20, behavior: douceur() });
    }
    btns.forEach(function (b, i) { b.tabIndex = i ? -1 : 0; b.addEventListener("click", function () { prendre(b); }); });
    seg.addEventListener("keydown", function (ev) { var i = btns.indexOf(choisi()); if (ev.key === "ArrowRight") { ev.preventDefault(); prendre(btns[(i + 1) % btns.length], true); } if (ev.key === "ArrowLeft") { ev.preventDefault(); prendre(btns[(i - 1 + btns.length) % btns.length], true); } });
    placer(); setTimeout(placer, 300);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placer);
    if (w.ResizeObserver) new ResizeObserver(placer).observe(seg);
  };
  /* Flèches des rangées qui défilent. */
  K.fleches = function (sc, bloc) {
    var f = bloc.querySelector(".s-fleches"); if (!f) return;
    var p = f.querySelector("[data-prec]"), n = f.querySelector("[data-suiv]");
    function etat() { p.disabled = sc.scrollLeft <= 4; n.disabled = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4; }
    p.addEventListener("click", function () { sc.scrollBy({ left: -sc.clientWidth * .82, behavior: douceur() }); });
    n.addEventListener("click", function () { sc.scrollBy({ left: sc.clientWidth * .82, behavior: douceur() }); });
    sc.addEventListener("scroll", etat, { passive: true }); etat(); setTimeout(etat, 500);
    if (w.ResizeObserver) new ResizeObserver(etat).observe(sc);
  };

  K.loupe = function (img, o) {
    var d = document.createElement("dialog"); d.className = "s-loupe";
    var i = new Image(); i.src = img.src; i.alt = img.alt || "";
    var f = bouton("s-loupe-x", "Fermer"); f.addEventListener("click", function () { d.close(); });
    d.appendChild(i); d.appendChild(f);
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    d.addEventListener("close", function () { d.remove(); });
    (o.calque || document.body).appendChild(d); d.showModal();
  };

  K.activer = function (root, P, o) {
    o = o || {};
    root.querySelectorAll("[data-sec], .s-entete, .s-pied").forEach(function (b) { K.activerBloc(b, P, o); });
    var ent = root.querySelector(".s-entete");
    if (ent && !ent._burger) {
      ent._burger = true;
      var bt = ent.querySelector("[data-burger]");
      if (bt) bt.addEventListener("click", function () { var v = ent.classList.toggle("ouvert"); bt.setAttribute("aria-expanded", v ? "true" : "false"); });
      ent.addEventListener("click", function (e) { if (e.target.closest(".s-nav a")) { ent.classList.remove("ouvert"); if (bt) bt.setAttribute("aria-expanded", "false"); } });
    }
    /* En-tête : vitre dès qu'on défile. Barre d'action du téléphone : visible après la bannière. */
    if (!root._defil) {
      root._defil = true;
      var sc = /(auto|scroll)/.test(getComputedStyle(root).overflowY) ? root : w, tic = false;
      root._majDefil = function () {
        var y = sc === w ? (w.scrollY || w.pageYOffset || 0) : root.scrollTop, hv = sc === w ? w.innerHeight : root.clientHeight;
        var en = root.querySelector(".s-entete"), dk = root.querySelector("[data-dock]");
        if (en) en.classList.toggle("colle", y > 8);
        if (dk) dk.classList.toggle("vu", y > hv * .55);
      };
      sc.addEventListener("scroll", function () { if (!tic) { tic = true; (w.requestAnimationFrame || setTimeout)(function () { tic = false; root._majDefil(); }); } }, { passive: true });
    }
    root._majDefil();
    if (o.anim && "IntersectionObserver" in w) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("vu"); io.unobserve(x.target); } }); }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
      root.querySelectorAll("[data-anim]:not(.vu)").forEach(function (x) { io.observe(x); });
      root._io = io;
    } else root.querySelectorAll("[data-anim]").forEach(function (x) { x.classList.add("vu"); });
  };

  /* Pages d'un site exporté : #page-xxx affiche la page, #s-xxx va à la section. */
  K.routeur = function (root) {
    var mains = [].slice.call(root.querySelectorAll("main[data-page]"));
    function aller() {
      var h = decodeURIComponent(location.hash.slice(1)), cible = null, page = mains[0];
      if (h.indexOf("page-") === 0) { page = root.querySelector('main[data-page="' + h.slice(5) + '"]') || page; }
      else if (h) { cible = document.getElementById(h); if (cible) page = cible.closest("main[data-page]") || page; }
      mains.forEach(function (m) { m.hidden = m !== page; });
      root.querySelectorAll(".s-nav a").forEach(function (a) { a.classList.toggle("actif", a.getAttribute("href") === "#page-" + page.getAttribute("data-page")); });
      if (cible) cible.scrollIntoView(); else w.scrollTo(0, 0);
    }
    w.addEventListener("hashchange", aller); aller();
  };

  w.SiteKit = K;
})(window);
