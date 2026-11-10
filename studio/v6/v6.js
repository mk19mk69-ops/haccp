/* Mokrani Studio v6 : ce qui rend le verre vivant autour de la scène 3D.
   1. Jour et nuit selon la partie de la page à l'écran
   2. Reflet qui suit la souris sur les plaques de verre
   3. Vraie réfraction sur le bord des panneaux (famille Chrome), calculée à leur forme
   4. Titres qui se décodent une fois
   5. Après le choix d'un métier, on ramène le téléphone à l'écran */
(function () {
  "use strict";
  var racine = document.documentElement;
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Jour et nuit */
  if (window.IntersectionObserver) {
    var dedans = new Set();
    var ioN = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) dedans.add(e.target); else dedans.delete(e.target); });
      var n = dedans.size > 0;
      if (n !== !!window.MS_NUIT) { window.MS_NUIT = n; racine.classList.toggle("nuit", n); window.dispatchEvent(new Event("ms:nuit")); var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = n ? "#05080D" : "#EEF2F6"; }
    }, { rootMargin: "-50% 0px -50% 0px" });
    document.querySelectorAll('[data-ton="nuit"]').forEach(function (el) { ioN.observe(el); });
  }

  /* 2. Reflet qui suit la souris */
  if (window.matchMedia("(pointer: fine)").matches) {
    var PLAQUES = ".verre, .dalle, .etape, .contact-dalle, .ticket, .choix, .faq-liste, .options", derniere = null, attente = 0, ev = null;
    document.addEventListener("pointermove", function (e) {
      ev = e; if (attente) return;
      attente = requestAnimationFrame(function () {
        attente = 0;
        var p = ev.target.closest ? ev.target.closest(PLAQUES) : null;
        if (derniere && derniere !== p) { derniere.style.removeProperty("--lx"); derniere.style.removeProperty("--ly"); }
        if (p) { var r = p.getBoundingClientRect(); p.style.setProperty("--lx", (ev.clientX - r.left).toFixed(0) + "px"); p.style.setProperty("--ly", (ev.clientY - r.top).toFixed(0) + "px"); }
        derniere = p;
      });
    }, { passive: true });
  }

  /* 3. Réfraction : une carte de déplacement par panneau.
     Sur une bande le long du bord (le biseau), l'image de derrière est tirée vers l'intérieur, comme à travers un verre bombé. */
  var chrome = /Chrome\/|Chromium\//.test(navigator.userAgent) && !/OPR\/.*Mobile/.test(navigator.userAgent);
  var sansTransparence = window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
  var defs = document.getElementById("filtres-verre");
  if (chrome && defs && !sansTransparence && window.ResizeObserver) {
    var NS = "http://www.w3.org/2000/svg", numero = 0;
    var carte = function (w, h, rayon, biseau) {
      var c = document.createElement("canvas"); c.width = w; c.height = h;
      var g = c.getContext("2d"), img = g.createImageData(w, h), d = img.data, hx = w / 2, hy = h / 2, r = Math.min(rayon, hx, hy);
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var px = Math.abs(x + .5 - hx) - (hx - r), py = Math.abs(y + .5 - hy) - (hy - r), sx = x + .5 < hx ? -1 : 1, sy = y + .5 < hy ? -1 : 1;
        var qx = Math.max(px, 0), qy = Math.max(py, 0), ext = Math.sqrt(qx * qx + qy * qy), prof = r - ext - Math.min(Math.max(px, py), 0), nx, ny;
        if (ext > 0) { nx = qx / ext * sx; ny = qy / ext * sy; } else if (px > py) { nx = sx; ny = 0; } else { nx = 0; ny = sy; }
        var i = (y * w + x) * 4, m = 0;
        if (prof >= 0 && prof < biseau) { var t = 1 - prof / biseau; m = t * t * (3 - 2 * t); m *= m; }
        /* On échantillonne plus loin vers l'intérieur : décalage opposé à la normale */
        d[i] = 128 - nx * m * 127; d[i + 1] = 128 - ny * m * 127; d[i + 2] = 128; d[i + 3] = 255;
      }
      g.putImageData(img, 0, 0); return c.toDataURL();
    };
    var poser = function (el) {
      var w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight); if (!w || !h || w * h > 900000) return;
      var biseau = +el.getAttribute("data-verre") || 18, rayon = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 20;
      var id = el._filtre || (el._filtre = "verre-" + (++numero)), f = document.getElementById(id);
      if (!f) { f = document.createElementNS(NS, "filter"); f.id = id; f.setAttribute("filterUnits", "userSpaceOnUse"); f.setAttribute("primitiveUnits", "userSpaceOnUse"); f.setAttribute("color-interpolation-filters", "sRGB"); defs.appendChild(f); }
      f.setAttribute("x", 0); f.setAttribute("y", 0); f.setAttribute("width", w); f.setAttribute("height", h);
      f.innerHTML = '<feGaussianBlur in="SourceGraphic" stdDeviation="7" result="flou"/>' +
        '<feImage href="' + carte(w, h, rayon, biseau) + '" x="0" y="0" width="' + w + '" height="' + h + '" result="carte" preserveAspectRatio="none"/>' +
        '<feDisplacementMap in="flou" in2="carte" scale="' + (biseau * 2.6).toFixed(0) + '" xChannelSelector="R" yChannelSelector="G" result="refracte"/>' +
        '<feColorMatrix in="refracte" type="saturate" values="1.7"/>';
      el.style.backdropFilter = "url(#" + id + ")"; el.style.webkitBackdropFilter = "url(#" + id + ")";
    };
    var file = new Set(), tic = 0;
    var ro = new ResizeObserver(function (es) { es.forEach(function (e) { file.add(e.target); }); clearTimeout(tic); tic = setTimeout(function () { file.forEach(poser); file.clear(); }, 140); });
    document.querySelectorAll("[data-verre]").forEach(function (el) { ro.observe(el); });
  }

  /* 4. (Titres décodés retirés : effet trop appuyé) */

  /* Icône nette du métier, posée au centre de son bloc de glace */
  if (window.GLYPHES) document.querySelectorAll("#metiers .puce").forEach(function (b) {
    if (b.querySelector(".cube")) return;
    var c = document.createElement("span"); c.className = "cube"; c.setAttribute("aria-hidden", "true");
    c.innerHTML = '<svg viewBox="0 0 48 48">' + (window.GLYPHES[b.dataset.m] || window.GLYPHES.autre) + "</svg>";
    b.insertBefore(c, b.firstChild);
  });

  /* Le fil des étapes se remplit en défilant (au repos s'il n'y a pas de mouvement) */
  var piste = document.getElementById("piste");
  if (piste) {
    if (reduit) piste.style.setProperty("--fil", 1);
    else { var majFil = function () { var r = piste.getBoundingClientRect(), p = (innerHeight * .78 - r.top) / (r.height * (innerWidth >= 900 ? .9 : 1)); piste.style.setProperty("--fil", Math.max(0, Math.min(1, p)).toFixed(3)); }; addEventListener("scroll", majFil, { passive: true }); majFil(); }
  }

  /* 5. Métier choisi : le téléphone revient à l'écran */
  var metiers = document.getElementById("metiers"), scene = document.getElementById("scene");
  if (metiers && scene) metiers.addEventListener("click", function (e) {
    if (!e.target.closest(".puce")) return;
    var r = scene.getBoundingClientRect();
    if (r.top < 70 || r.bottom > innerHeight) scene.scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "center" });
  });
})();
