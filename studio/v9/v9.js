/* Mokrani Studio v9 : la vitrine qui pivote, la barre du haut, le formulaire. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var reduit = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Barre du haut : transparente sur l'ouverture, posée ensuite ---------- */
  var nav = $("nav"), haut = $("haut");
  function majNav() { nav.classList.toggle("posee", haut.getBoundingClientRect().bottom < 70); }
  addEventListener("scroll", majNav, { passive: true }); majNav();

  /* ---------- La vitrine : chaque page pivote et laisse place au site suivant ---------- */
  var DEMOS = [
    { img: "moi-bleu.jpg", nom: "Mokrani Studio", palette: "en bleu Mokrani, la version actuelle" },
    { img: "moi-egyptien.jpg", nom: "Mokrani Studio", palette: "en Bleu égyptien, bleu nuit et rouge" },
    { img: "moi-foret.jpg", nom: "Mokrani Studio", palette: "en vert forêt et beige" },
    { img: "moi-beige.jpg", nom: "Mokrani Studio", palette: "en beige et vert forêt" }
  ];
  var vitrine = $("vitrine"), carte = $("carte"), legende = $("legende"), points = $("points");
  var faces = [carte.querySelector(".face--avant img"), carte.querySelector(".face--arriere img")];
  var i = 0, angle = 0, enCours = false, arret = false, survol = false, visible = true, minuteur = null;
  var DUREE = 5200, PIVOT = 1250;

  /* précharger les images, pour qu'aucune page ne pivote vide */
  DEMOS.forEach(function (d) { var im = new Image(); im.src = "assets/" + d.img; d.pret = im.decode ? im.decode().catch(function () {}) : Promise.resolve(); });
  DEMOS.forEach(function (d, n) { var p = document.createElement("i"); if (n === 0) p.className = "on"; points.appendChild(p); });

  function ecrireLegende(d) { legende.innerHTML = "<b>" + d.nom + "</b> " + d.palette; }
  function majPoints() { [].forEach.call(points.children, function (p, n) { p.classList.toggle("on", n === i); }); }
  function cachee() { return (Math.round(angle / 180) % 2 === 0) ? 1 : 0; }

  function aller(sens) {
    if (enCours) return;
    enCours = true;
    var n = (i + sens + DEMOS.length) % DEMOS.length, d = DEMOS[n];
    Promise.resolve(d.pret).then(function () {
      i = n;
      if (reduit) {
        /* sans mouvement : on change simplement la page visible */
        faces[1 - cachee()].src = "assets/" + d.img;
      } else {
        faces[cachee()].src = "assets/" + d.img;
        angle += 180 * sens;
        carte.classList.remove("suit", "tourne"); void carte.offsetWidth; carte.classList.add("tourne");
        carte.style.setProperty("--angle", angle + "deg");
      }
      ecrireLegende(d); majPoints();
      setTimeout(function () { enCours = false; carte.classList.remove("tourne"); }, reduit ? 60 : PIVOT + 50);
    });
  }
  function programmer() {
    clearTimeout(minuteur);
    if (arret || survol || !visible || document.hidden) return;
    minuteur = setTimeout(function () { aller(1); programmer(); }, DUREE);
  }
  $("suiv").addEventListener("click", function () { aller(1); programmer(); });
  $("prec").addEventListener("click", function () { aller(-1); programmer(); });
  $("pause").addEventListener("click", function () {
    arret = !arret; vitrine.classList.toggle("arretee", arret);
    this.setAttribute("aria-label", arret ? "Reprendre le défilement" : "Mettre en pause"); programmer();
  });
  /* flèches du clavier quand on est dans la vitrine */
  vitrine.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { aller(1); programmer(); } else if (e.key === "ArrowLeft") { aller(-1); programmer(); }
  });
  /* pause au survol, seulement avec une souris (sur téléphone, un toucher ne doit pas tout arrêter) */
  vitrine.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { survol = true; programmer(); } });
  vitrine.addEventListener("pointerleave", function (e) {
    if (e.pointerType !== "mouse") return;
    survol = false; programmer();
    carte.style.setProperty("--ry", "0deg"); carte.style.setProperty("--rx", "0deg");
  });
  document.addEventListener("visibilitychange", programmer);
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; programmer(); }, { threshold: 0.25 }).observe(vitrine);

  /* la page s'incline très légèrement vers la souris */
  var plateau = vitrine.querySelector(".plateau");
  if (!reduit && matchMedia("(hover: hover)").matches) plateau.addEventListener("pointermove", function (e) {
    if (enCours) return;
    var r = plateau.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    carte.classList.add("suit");
    carte.style.setProperty("--ry", (x * 8).toFixed(2) + "deg"); carte.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg");
  });

  /* glisser du doigt : page suivante ou précédente */
  var x0 = null, y0 = null;
  plateau.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  plateau.addEventListener("touchend", function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) { aller(dx < 0 ? 1 : -1); programmer(); }
  }, { passive: true });
  programmer();

  /* ---------- Essai : le nom part vers l'Atelier ---------- */
  $("essai").addEventListener("submit", function (e) { if (!$("nom").value.trim()) { e.preventDefault(); $("nom").focus(); } });

  /* ---------- Formulaire ---------- */
  [].forEach.call(document.querySelectorAll("[data-formule]"), function (a) {
    a.addEventListener("click", function () { $("f-formule").value = a.getAttribute("data-formule"); });
  });
  function v(id) { return ($(id).value || "").trim(); }
  function texte() { return ["Demande de devis", "Nom : " + (v("f-nom") || "?"), "Commerce : " + (v("f-commerce") || "?"), "Téléphone : " + (v("f-tel") || "?"), "Formule : " + v("f-formule"), "", v("f-msg")].join("\n"); }
  function envoyer(url) { location.href = url; setTimeout(function () { location.href = "../v6/devis-envoye.html"; }, 1500); }
  $("par-sms").addEventListener("click", function () { envoyer("sms:+33782023657?&body=" + encodeURIComponent(texte())); });
  $("par-mail").addEventListener("click", function () { var c = v("f-commerce"); envoyer("mailto:ali@mokranistudio.fr?subject=" + encodeURIComponent("Demande de devis" + (c ? ", " + c : "")) + "&body=" + encodeURIComponent(texte())); });

  /* Arrivée depuis l'Atelier (?formule=&commerce=&msg=) */
  try {
    var q = new URLSearchParams(location.search);
    if (q.get("msg") || q.get("formule")) {
      var f = $("f-formule");
      if (q.get("formule")) [].forEach.call(f.options, function (o) { if (o.textContent === q.get("formule")) f.value = o.textContent; });
      if (q.get("commerce")) $("f-commerce").value = q.get("commerce").slice(0, 80);
      if (q.get("msg")) $("f-msg").value = q.get("msg").slice(0, 4000);
      setTimeout(function () { $("contact").scrollIntoView(); $("f-nom").focus({ preventScroll: true }); }, 400);
    }
  } catch (e) {}
})();
