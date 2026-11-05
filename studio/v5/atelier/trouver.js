/* Trouver un commerce par son nom et remplir ses infos (Mokrani Studio).
   Source par défaut : OpenStreetMap (Photon pour la recherche, Nominatim pour le détail), gratuit et sans clé.
   Si window.FICHE_GOOGLE contient l'adresse du serveur Mokrani Studio (route /fiche), la vraie fiche Google est utilisée. */
(function (w) {
  "use strict";
  var TROYES = { lat: 48.2973, lon: 4.0744 };
  var JOURS = { Mo: 0, Tu: 1, We: 2, Th: 3, Fr: 4, Sa: 5, Su: 6 };
  var AMENITES = { restaurant: 1, fast_food: 1, cafe: 1, bar: 1, pub: 1, ice_cream: 1, food_court: 1, pharmacy: 1 };

  function metierDe(cle, val, nom, cuisine) {
    nom = (nom || "").toLowerCase(); cuisine = (cuisine || "").toLowerCase();
    if (/barb/.test(nom)) return "barbier";
    if (cle === "shop") {
      if (val === "bakery" || val === "pastry" || val === "confectionery") return "boulangerie";
      if (val === "butcher") return "boucherie";
      if (val === "hairdresser") return "coiffure";
      if (val === "beauty" || val === "cosmetics" || val === "massage" || val === "tattoo") return "institut";
      if (val === "florist" || val === "garden_centre") return "fleuriste";
      if (/convenience|supermarket|greengrocer|deli|grocery|spices|food|farm|frozen_food|health_food|cheese|wine|alcohol|seafood/.test(val)) return "epicerie";
      return "autre";
    }
    if (cle === "amenity") {
      if (val === "fast_food") return "snack";
      if (val === "restaurant" || val === "cafe" || val === "food_court") return /kebab|burger|pizza|tacos|sandwich/.test(cuisine) ? "snack" : "restaurant";
      if (val === "bar" || val === "pub" || val === "ice_cream") return "restaurant";
    }
    if (/boulang|pâtiss|patiss/.test(nom)) return "boulangerie";
    if (/bouch/.test(nom)) return "boucherie";
    if (/coiff/.test(nom)) return "coiffure";
    if (/fleur/.test(nom)) return "fleuriste";
    if (/kebab|burger|snack|tacos/.test(nom)) return "snack";
    return "autre";
  }

  /* Horaires OpenStreetMap ("Mo-Sa 09:00-12:00,14:00-19:00; Su off") vers le modèle de l'Atelier (lundi = 0) */
  function lireHoraires(txt) {
    if (!txt) return null;
    txt = String(txt).trim();
    if (txt === "24/7") return [0, 1, 2, 3, 4, 5, 6].map(function () { return { o: true, a: "00:00", f: "23:59", p: false, pa: "12:00", pf: "14:00" }; });
    var sem = [0, 1, 2, 3, 4, 5, 6].map(function () { return { o: false, a: "09:00", f: "19:00", p: false, pa: "12:00", pf: "14:00" }; });
    var compris = false;
    var regles = txt.split(";");
    for (var r = 0; r < regles.length; r++) {
      var regle = regles[r].trim(); if (!regle) continue;
      if (/PH|SH|week|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|"|\[/.test(regle)) continue;
      var m = regle.match(/^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*[-,]\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))*)?\s*(.*)$/);
      if (!m) continue;
      var jours = [];
      if (m[1]) {
        m[1].replace(/\s/g, "").split(",").forEach(function (b) {
          var x = b.split("-");
          if (x.length === 2) { var d = JOURS[x[0]], f = JOURS[x[1]]; for (var k = d; ; k = (k + 1) % 7) { jours.push(k); if (k === f) break; } }
          else if (JOURS[x[0]] != null) jours.push(JOURS[x[0]]);
        });
      } else jours = [0, 1, 2, 3, 4, 5, 6];
      var t = (m[2] || "").trim();
      if (/^(off|closed)$/i.test(t)) { jours.forEach(function (j) { sem[j].o = false; }); compris = true; continue; }
      var plages = t.split(",").map(function (p) { return p.trim().match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/); });
      if (!plages.length || plages.some(function (p) { return !p; })) continue;
      var z = function (h) { return h.length === 4 ? "0" + h : h; };
      jours.forEach(function (j) {
        var J = sem[j]; J.o = true; J.a = z(plages[0][1]); J.f = z(plages[plages.length - 1][2]);
        if (plages.length > 1) { J.p = true; J.pa = z(plages[0][2]); J.pf = z(plages[1][1]); } else J.p = false;
      });
      compris = true;
    }
    return compris ? sem : null;
  }

  function telFr(t) {
    if (!t) return "";
    var c = String(t).split(";")[0].replace(/[^\d+]/g, "");
    if (c.indexOf("+33") === 0) c = "0" + c.slice(3);
    if (c.indexOf("0033") === 0) c = "0" + c.slice(4);
    return c.length === 10 ? c.replace(/(\d{2})(?=\d)/g, "$1 ") : String(t).split(";")[0];
  }

  function versCarte(f) {
    var p = f.properties || {};
    var rue = [p.housenumber, p.street].filter(Boolean).join(" ");
    return {
      id: (p.osm_type || "N") + p.osm_id, nom: p.name || "", cle: p.osm_key, val: p.osm_value,
      adresse: rue, cp: p.postcode || "", ville: p.city || p.town || p.village || p.locality || "",
      ligne: [rue, p.city || p.town || p.village].filter(Boolean).join(", "),
      metier: metierDe(p.osm_key, p.osm_value, p.name, ""), source: "osm"
    };
  }

  var dernier = 0, controleur = null;
  function chercher(q) {
    q = (q || "").trim();
    if (q.length < 3) return Promise.resolve([]);
    if (w.FICHE_GOOGLE) {
      return fetch(w.FICHE_GOOGLE.replace(/\/$/, "") + "/suggestions?q=" + encodeURIComponent(q)).then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .catch(function () { return chercherOsm(q); });
    }
    return chercherOsm(q);
  }
  function chercherOsm(q) {
    if (controleur) try { controleur.abort(); } catch (e) {}
    controleur = w.AbortController ? new AbortController() : null;
    var n = ++dernier;
    var url = "https://photon.komoot.io/api/?lang=fr&limit=12&lat=" + TROYES.lat + "&lon=" + TROYES.lon + "&q=" + encodeURIComponent(q);
    return fetch(url, controleur ? { signal: controleur.signal } : {}).then(function (r) { return r.json(); }).then(function (d) {
      if (n !== dernier) return [];
      var vus = {};
      return (d.features || []).filter(function (f) {
        var p = f.properties || {};
        if (!p.name) return false;
        if (p.osm_key === "shop" || p.osm_key === "craft") return true;
        return p.osm_key === "amenity" && AMENITES[p.osm_value];
      }).map(versCarte).filter(function (c) { if (vus[c.id]) return false; vus[c.id] = 1; return true; }).slice(0, 6);
    }).catch(function () { return []; });
  }

  /* Détail : téléphone, horaires, site web, cuisine */
  function details(c) {
    if (c.source === "google" && w.FICHE_GOOGLE) return fetch(w.FICHE_GOOGLE.replace(/\/$/, "") + "/fiche?id=" + encodeURIComponent(c.id)).then(function (r) { return r.json(); }).catch(function () { return c; });
    var url = "https://nominatim.openstreetmap.org/lookup?format=jsonv2&extratags=1&addressdetails=1&accept-language=fr&osm_ids=" + encodeURIComponent(c.id);
    return fetch(url).then(function (r) { return r.json(); }).then(function (l) {
      var x = (l && l[0]) || {}, e = x.extratags || {}, a = x.address || {};
      var r = {};
      Object.keys(c).forEach(function (k) { r[k] = c[k]; });
      r.tel = telFr(e.phone || e["contact:phone"] || e["contact:mobile"] || "");
      r.web = e.website || e["contact:website"] || "";
      r.horaires = lireHoraires(e.opening_hours);
      r.horairesTexte = e.opening_hours || "";
      r.metier = metierDe(c.cle, c.val, c.nom, e.cuisine);
      if (!r.adresse && (a.road || a.house_number)) r.adresse = [a.house_number, a.road].filter(Boolean).join(" ");
      if (!r.cp && a.postcode) r.cp = a.postcode;
      if (!r.ville) r.ville = a.city || a.town || a.village || "";
      r.insta = e["contact:instagram"] || "";
      r.facebook = e["contact:facebook"] || "";
      return r;
    }).catch(function () { return c; });
  }

  /* Liste de ce qui a été trouvé, pour l'afficher simplement */
  function trouve(r) {
    var l = [];
    if (r.adresse) l.push("adresse");
    if (r.tel) l.push("téléphone");
    if (r.horaires) l.push("horaires");
    if (r.metier && r.metier !== "autre") l.push("métier");
    return l;
  }

  w.Trouver = { chercher: chercher, details: details, lireHoraires: lireHoraires, metierDe: metierDe, trouve: trouve, telFr: telFr,
    credit: function (r) { return r && r.source === "google" ? "Infos de la fiche Google. Vérifiez-les." : "Infos trouvées sur OpenStreetMap. Vérifiez-les."; } };
})(window);
