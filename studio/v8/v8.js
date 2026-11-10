/* Mokrani Studio v8 : ce qui n'est pas la scène 3D.
   - dit à la scène quel chapitre est à l'écran (window.MS8 + événement "ms8") ;
   - formulaire de contact (mail ou SMS), pré-rempli quand on vient de l'Atelier ou d'un tarif. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var etat = window.MS8 = { mode: "ouverture", metier: "autre", cibles: [] };

  /* Chapitre au centre de l'écran */
  var chapitres = [].slice.call(document.querySelectorAll("[data-scene]"));
  function choisir(el) {
    var m = el.getAttribute("data-scene"), me = el.getAttribute("data-metier") || (m === "atelier" ? "autre" : etat.metier);
    if (m === etat.mode && me === etat.metier) return;
    etat.mode = m; etat.metier = me;
    window.dispatchEvent(new CustomEvent("ms8"));
  }
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) choisir(e.target); }); }, { rootMargin: "-48% 0px -48% 0px" });
    chapitres.forEach(function (c) { io.observe(c); });
  }

  /* Où poser les trois blocs des tarifs : au-dessus de chaque formule */
  function cibles() {
    etat.cibles = [].map.call(document.querySelectorAll(".formule"), function (f) { var r = f.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top }; });
  }
  window.addEventListener("scroll", cibles, { passive: true }); window.addEventListener("resize", cibles); cibles();

  /* Essai : le nom part vers l'Atelier */
  var essai = $("essai");
  if (essai) essai.addEventListener("submit", function (e) {
    var v = $("nom").value.trim(); if (!v) { e.preventDefault(); $("nom").focus(); }
  });

  /* Tarif choisi : le formulaire le reprend */
  [].forEach.call(document.querySelectorAll("[data-formule]"), function (a) {
    a.addEventListener("click", function () { $("f-formule").value = a.getAttribute("data-formule"); });
  });

  /* Formulaire */
  function v(id) { return ($(id).value || "").trim(); }
  function texte() { return ["Demande de devis", "Nom : " + (v("f-nom") || "?"), "Commerce : " + (v("f-commerce") || "?"), "Téléphone : " + (v("f-tel") || "?"), "Formule : " + v("f-formule"), "", v("f-msg")].join("\n"); }
  function envoyer(url) { location.href = url; setTimeout(function () { location.href = "../v6/devis-envoye.html"; }, 1500); }
  $("par-sms").addEventListener("click", function () { envoyer("sms:+33782023657?&body=" + encodeURIComponent(texte())); });
  $("par-mail").addEventListener("click", function () { var c = v("f-commerce"); envoyer("mailto:ali@mokranistudio.fr?subject=" + encodeURIComponent("Demande de devis" + (c ? " · " + c : "")) + "&body=" + encodeURIComponent(texte())); });

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
