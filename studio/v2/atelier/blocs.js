/* Atelier : les métiers, les sections (blocs) et leur rendu HTML.
   Le même rendu sert à l'éditeur, à l'aperçu et au fichier exporté. */
(function (w) {
  "use strict";
  var K = w.SiteKit, e = K.e;

  /* ===================== Icônes (traits simples) ===================== */
  var IC = {
    ciseaux: '<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.6 8.6 20 18M8.6 15.4 20 6"/>',
    seche: '<path d="M4 9a5 5 0 0 1 5-5h7v10H9a5 5 0 0 1-5-5Z"/><path d="M16 6h4M16 12h4M10 14l-1 6h3l1-6"/>',
    miroir: '<ellipse cx="12" cy="9" rx="6" ry="7"/><path d="M12 16v5M8 21h8M9.5 6.5a3.5 3.5 0 0 1 3-1.5"/>',
    couteau: '<path d="M3 15 15 3l3 3-9 9"/><path d="M9 15l3 3-2 2-4-4M18 6l3 3"/>',
    burger: '<path d="M4 10a8 5 0 0 1 16 0Z"/><path d="M3 14h18M4 18h16a1 1 0 0 1-1 2H5a1 1 0 0 1-1-2Z"/>',
    couverts: '<path d="M7 3v7a2 2 0 0 0 4 0V3M9 12v9M17 3c-2 2-2 6 0 8v10"/>',
    pain: '<path d="M4 15c0-5 3.6-9 8-9s8 4 8 9v2H4Z"/><path d="M9 9l1.5 4M12.5 8l1 4.5M16 9.5l-.5 3.5"/>',
    panier: '<path d="M3 9h18l-2 11H5Z"/><path d="m8 9 3-6M16 9l-3-6M9 13v4M15 13v4"/>',
    fleur: '<circle cx="12" cy="8" r="2.5"/><path d="M12 10.5V21M12 16c-3 0-5-2-5-4 3 0 5 2 5 4ZM12 14c3 0 5-2 5-4-3 0-5 2-5 4Z"/><path d="M9.5 8a2.5 2.5 0 1 1 5 0"/>',
    boutique: '<path d="M4 10v10h16V10M3 4h18l-1 6H4Z"/><path d="M10 20v-5h4v5"/>',
    tel: '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1Z"/>',
    epingle: '<path d="M12 21s7-6.4 7-12a7 7 0 0 0-14 0c0 5.6 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    horloge: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 8"/>',
    insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z"/>',
    tiktok: '<path d="M14 3v11a4 4 0 1 1-4-4"/><path d="M14 3c.5 2.5 2.5 4.5 5 5"/>',
    etoile: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>'
  };
  function icone(n, cls) { return '<svg class="' + (cls || "s-ic") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[n] || IC.boutique) + "</svg>"; }

  /* ===================== Métiers ===================== */
  var M = {
    barbier: { nom: "Barbier", icone: "ciseaux", couleurs: ["#1B1E22", "#8C1D2C", "#0B63CE", "#9C7A2E"], police: "enseigne", objectif: "rdv",
      accroche: "Coupe, dégradé et taille de barbe. Avec ou sans rendez-vous.",
      prestTitre: "Prestations", prestIntro: "Les prix affichés sont ceux du salon, sans surprise.",
      prest: [["Coupe homme", "30 min", "18"], ["Dégradé", "30 min", "20"], ["Coupe et barbe", "45 min", "26"], ["Taille de barbe", "15 min", "10"], ["Coupe enfant, moins de 12 ans", "20 min", "14"], ["Rasage à l'ancienne", "30 min", "20"]],
      apropos: ["Le salon", "Un salon de quartier où l'on prend le temps de bien faire. Chaque coupe commence par un échange : ce que vous voulez, ce qui va avec votre visage, comment l'entretenir entre deux passages."],
      faq: [["Faut-il prendre rendez-vous ?", "Ce n'est pas obligatoire, mais c'est plus sûr le samedi. La réservation en ligne prend moins d'une minute."], ["Quels moyens de paiement acceptez-vous ?", "Espèces et carte bancaire."], ["Coupez-vous les enfants ?", "Oui, dès 3 ans."]],
      avis: [["Karim B.", "Dégradé propre, toujours le même résultat. Je ne vais plus ailleurs."], ["Thomas L.", "Réservé le matin, coupé l'après-midi. Accueil au top."], ["Yanis M.", "Bonne ambiance et un vrai soin sur la barbe."]],
      fidelite: ["Votre 10e coupe est offerte", 10] },
    coiffure: { nom: "Salon de coiffure", icone: "seche", couleurs: ["#7A3E52", "#1B1E22", "#2F6B4F", "#0B63CE"], police: "elegant", objectif: "rdv",
      accroche: "Coupe, couleur et soins pour femmes, hommes et enfants.",
      prestTitre: "Tarifs", prestIntro: "Shampoing compris pour toutes les coupes.",
      prest: [["Shampoing, coupe, brushing femme", "1 h", "38"], ["Coupe homme", "30 min", "22"], ["Couleur", "1 h 30", "dès 45"], ["Balayage", "2 h", "dès 65"], ["Brushing", "30 min", "22"], ["Coupe enfant", "20 min", "15"]],
      apropos: ["Le salon", "Nous prenons le temps de comprendre ce que vous voulez avant de commencer. Des conseils honnêtes, des produits choisis, et une coupe qui tient entre deux rendez-vous."],
      faq: [["Faites-vous un diagnostic avant une couleur ?", "Oui, toujours. Il est gratuit et prend quelques minutes."], ["Puis-je annuler un rendez-vous ?", "Oui, prévenez-nous la veille par téléphone."], ["Quels moyens de paiement acceptez-vous ?", "Espèces et carte bancaire."]],
      avis: [["Sarah K.", "Enfin une coiffeuse qui écoute. Le balayage est exactement ce que je voulais."], ["Julie M.", "Salon propre, accueil chaleureux, prix corrects."], ["Inès D.", "Ma fille et moi y allons depuis deux ans."]],
      fidelite: ["Un soin offert après 8 visites", 8] },
    institut: { nom: "Institut de beauté", icone: "miroir", couleurs: ["#7A3E52", "#2F6B4F", "#9C7A2E", "#1B1E22"], police: "elegant", objectif: "rdv",
      accroche: "Soins du visage, épilations, ongles et regard, dans un cadre calme.",
      prestTitre: "Soins et tarifs", prestIntro: "",
      prest: [["Soin du visage", "1 h", "45"], ["Épilation sourcils", "15 min", "10"], ["Vernis semi-permanent", "45 min", "30"], ["Manucure", "40 min", "25"], ["Épilation jambes complètes", "30 min", "28"], ["Rehaussement de cils", "1 h", "55"]],
      apropos: ["L'institut", "Un lieu pensé pour souffler. Chaque soin commence par quelques questions sur votre peau et vos envies, pour choisir les bons gestes et les bons produits."],
      faq: [["Combien de temps tient un semi-permanent ?", "Deux à trois semaines en général, selon vos ongles et vos activités."], ["Faut-il venir démaquillée ?", "Ce n'est pas nécessaire, nous nous en occupons."], ["Proposez-vous des cartes cadeaux ?", "Oui, pour tous les soins, en boutique."]],
      avis: [["Nadia B.", "Soin du visage très relaxant, peau toute douce en sortant."], ["Léa P.", "Travail précis sur les sourcils, je recommande."], ["Camille R.", "Accueil adorable et institut très propre."]],
      fidelite: ["Le 6e soin à moitié prix", 6] },
    boucherie: { nom: "Boucherie", icone: "couteau", couleurs: ["#8C1D2C", "#1B1E22", "#2F6B4F", "#9C7A2E"], police: "enseigne", objectif: "commande",
      accroche: "Viande choisie chez nos éleveurs, découpée devant vous.",
      prestTitre: "Nos viandes", prestIntro: "Prix au kilo. La découpe est faite à la demande.",
      prod: [["Côte de bœuf", "29,90", "le kg", "Bœuf"], ["Entrecôte", "32,90", "le kg", "Bœuf"], ["Viande hachée", "15,90", "le kg", "Bœuf"], ["Épaule d'agneau", "21,90", "le kg", "Agneau"], ["Merguez maison", "13,90", "le kg", "Agneau"], ["Cuisses de poulet", "7,90", "le kg", "Volaille"], ["Colis barbecue", "49", "le colis", "Colis"]],
      apropos: ["La boutique", "Dites-nous pour combien de personnes vous cuisinez : on vous conseille la bonne pièce, la bonne quantité et la cuisson qui va avec."],
      faq: [["Puis-je commander pour une date précise ?", "Oui : choisissez le jour et l'heure de retrait, la commande est prête à votre arrivée."], ["Faites-vous la découpe sur demande ?", "Oui, en tranches, en morceaux, en brochettes ou hachée, comme vous voulez."], ["Prenez-vous les grosses commandes ?", "Oui, pour les fêtes et les événements. Appelez-nous quelques jours avant."]],
      avis: [["Mehdi A.", "Viande toujours fraîche et bien découpée. Les merguez sont excellentes."], ["Sophie T.", "Commande prête à l'heure, rien à redire."], ["Rachid H.", "Bons conseils pour le barbecue, prix honnêtes."]],
      promo: ["Commandes de fête ouvertes", "Réservez vos colis et vos pièces à l'avance : tout sera prêt le jour J."] },
    snack: { nom: "Snack", icone: "burger", couleurs: ["#B4532A", "#1B1E22", "#8C1D2C", "#C08A1E"], police: "enseigne", objectif: "commande",
      accroche: "Tacos, burgers et assiettes. Sur place, à emporter ou à commander.",
      prestTitre: "La carte", prestIntro: "",
      prod: [["Tacos 1 viande", "7,50", "", "Tacos"], ["Tacos 2 viandes", "9,50", "", "Tacos"], ["Cheese burger", "6,90", "", "Burgers"], ["Double burger maison", "9,90", "", "Burgers"], ["Assiette poulet", "11", "", "Assiettes"], ["Frites", "3", "", "À côté"], ["Canette", "2", "", "Boissons"]],
      apropos: ["Le snack", "Des produits frais, de la viande marinée sur place et des frites coupées chaque matin. Simple, généreux, et prêt vite."],
      faq: [["Peut-on commander à l'avance ?", "Oui : composez votre commande, choisissez l'heure, elle est prête quand vous arrivez."], ["Y a-t-il des places assises ?", "Oui, quelques tables à l'intérieur."], ["Acceptez-vous la carte ?", "Oui, sans minimum."]],
      avis: [["Bilal S.", "Le meilleur tacos du coin, et servi rapidement."], ["Emma V.", "Commandé en ligne, prêt à l'heure, encore chaud."], ["Lucas G.", "Portions généreuses, prix corrects."]],
      fidelite: ["Le 10e menu est offert", 10] },
    restaurant: { nom: "Restaurant", icone: "couverts", couleurs: ["#2F6B4F", "#8C1D2C", "#1B1E22", "#9C7A2E"], police: "classique", objectif: "rdv",
      accroche: "Une cuisine de saison, faite maison, à deux pas du centre.",
      prestTitre: "La carte", prestIntro: "La carte change avec les saisons. Demandez la suggestion du jour.",
      prest: [["Velouté de saison", "Entrées", "7"], ["Œuf parfait, champignons", "Entrées", "9"], ["Poulet rôti, purée maison", "Plats", "17"], ["Poisson du marché", "Plats", "21"], ["Mousse au chocolat", "Desserts", "7"], ["Tarte du moment", "Desserts", "7"]],
      resa: [["Table pour 2", "90", ""], ["Table pour 4", "90", ""], ["Groupe, 6 personnes et plus", "120", ""]],
      apropos: ["La maison", "Une petite salle, une cuisine ouverte et des produits qui viennent de producteurs que nous connaissons. Ici, tout est préparé le jour même."],
      faq: [["Faut-il réserver ?", "C'est conseillé le vendredi et le samedi soir."], ["Avez-vous des plats végétariens ?", "Oui, au moins un plat chaque jour."], ["Accueillez-vous les groupes ?", "Oui, jusqu'à 20 personnes, sur réservation."]],
      avis: [["Claire F.", "Cuisine simple et très bonne, service attentionné."], ["Antoine B.", "Le poulet rôti vaut le détour."], ["Samia L.", "Belle découverte, on reviendra."]] },
    boulangerie: { nom: "Boulangerie", icone: "pain", couleurs: ["#9C6A2E", "#8C1D2C", "#2F6B4F", "#1B1E22"], police: "artisan", objectif: "commande",
      accroche: "Pains au levain, viennoiseries et pâtisseries, faits sur place chaque matin.",
      prestTitre: "Au comptoir", prestIntro: "",
      prod: [["Baguette tradition", "1,30", "", "Pains"], ["Pain au levain", "4,20", "", "Pains"], ["Croissant", "1,20", "", "Viennoiseries"], ["Pain au chocolat", "1,30", "", "Viennoiseries"], ["Flan pâtissier, la part", "2,90", "", "Pâtisseries"], ["Tarte aux fruits, 6 parts", "18", "", "Pâtisseries"]],
      apropos: ["Le fournil", "Nos pains lèvent lentement, cuisent sur la sole et sortent du four plusieurs fois par jour. Réservez vos commandes la veille pour être sûr de les avoir."],
      faq: [["Puis-je réserver mon pain ?", "Oui, commandez en ligne et passez le récupérer à l'heure choisie."], ["Faites-vous des gâteaux sur commande ?", "Oui, pour les anniversaires et les fêtes. Prévoyez 48 h."], ["Êtes-vous ouverts le dimanche ?", "Consultez nos horaires juste en dessous."]],
      avis: [["Paul R.", "La tradition est croustillante comme il faut."], ["Hanane Z.", "Les croissants du dimanche sont devenus un rituel."], ["Marc D.", "Gâteau d'anniversaire superbe et délicieux."]],
      fidelite: ["La 10e baguette est offerte", 10] },
    epicerie: { nom: "Épicerie", icone: "panier", couleurs: ["#2F6B4F", "#B4532A", "#1B1E22", "#0B63CE"], police: "artisan", objectif: "vitrine",
      accroche: "Produits frais, épicerie du monde et dépannage, tard le soir.",
      prestTitre: "Dans nos rayons", prestIntro: "Quelques produits du moment. Il y en a bien d'autres en boutique.",
      prod: [["Fruits et légumes de saison", "", "", "Frais"], ["Épices au détail", "dès 2", "", "Épicerie"], ["Thé et café", "dès 3,50", "", "Épicerie"], ["Produits laitiers", "", "", "Frais"]],
      apropos: ["L'épicerie", "Une épicerie de quartier où l'on trouve l'essentiel, et quelques produits qu'on ne trouve pas ailleurs. Demandez-nous si vous cherchez quelque chose."],
      faq: [["Livrez-vous ?", "Pour les commandes importantes, appelez-nous."], ["Acceptez-vous la carte ?", "Oui, dès 5 € d'achat."], ["Pouvez-vous commander un produit ?", "Oui, demandez au comptoir."]],
      avis: [["Fatou N.", "On trouve de tout et l'accueil est toujours souriant."], ["Kevin P.", "Pratique, ouvert tard, bons produits."], ["Amel S.", "Les épices sont excellentes."]] },
    fleuriste: { nom: "Fleuriste", icone: "fleur", couleurs: ["#7A3E52", "#2F6B4F", "#B4532A", "#1B1E22"], police: "elegant", objectif: "commande",
      accroche: "Bouquets de saison, compositions et plantes, à emporter ou à commander.",
      prestTitre: "Bouquets", prestIntro: "Chaque bouquet est composé le jour même avec les fleurs de la semaine.",
      prod: [["Bouquet du moment", "25", "", "Bouquets"], ["Bouquet généreux", "40", "", "Bouquets"], ["Plante verte", "dès 15", "", "Plantes"], ["Composition sur mesure", "sur devis", "", "Événements"]],
      apropos: ["L'atelier", "Des fleurs choisies au marché, des bouquets composés à la main et des conseils pour qu'ils durent. Dites-nous l'occasion, on s'occupe du reste."],
      faq: [["Livrez-vous ?", "Oui, dans le centre-ville, sur demande."], ["Puis-je commander pour une date précise ?", "Oui, choisissez le jour et l'heure de retrait."], ["Faites-vous les mariages ?", "Oui, prenez rendez-vous pour en parler."]],
      avis: [["Élodie M.", "Bouquet magnifique, exactement l'esprit demandé."], ["Hugo L.", "Conseils parfaits pour une première commande."], ["Rania K.", "Fleurs fraîches qui tiennent longtemps."]] },
    autre: { nom: "Autre activité", icone: "boutique", couleurs: ["#0B63CE", "#1B1E22", "#2F6B4F", "#8C1D2C"], police: "moderne", objectif: "vitrine",
      accroche: "Votre activité, expliquée simplement, avec les infos utiles au bon endroit.",
      prestTitre: "Nos services", prestIntro: "",
      prest: [["Votre premier service", "Une phrase pour l'expliquer", "20"], ["Votre deuxième service", "Une phrase pour l'expliquer", "35"], ["Sur mesure", "Parlons-en", "sur devis"]],
      apropos: ["Qui sommes-nous", "Présentez-vous en quelques lignes : depuis quand vous existez, ce que vous faites de mieux, et pourquoi on vient chez vous."],
      faq: [["Comment vous contacter ?", "Par téléphone ou avec le formulaire en bas de page."], ["Où êtes-vous situé ?", "Notre adresse est juste en dessous."], ["Quels moyens de paiement acceptez-vous ?", "Espèces et carte bancaire."]],
      avis: [["Client 1", "Remplacez ce texte par un vrai avis client."], ["Client 2", "Remplacez ce texte par un vrai avis client."], ["Client 3", "Remplacez ce texte par un vrai avis client."]] }
  };
  var ORDRE_METIERS = ["barbier", "coiffure", "institut", "boucherie", "snack", "restaurant", "boulangerie", "epicerie", "fleuriste", "autre"];

  /* ===================== Thème ===================== */
  var POLICES = {
    moderne: { nom: "Moderne", titre: "'Poppins', system-ui, sans-serif", poids: 700, esp: "-0.02em", casse: "none", large: "normal", fichier: "../assets/poppins-latin-700-normal.woff2", famille: "Poppins" },
    elegant: { nom: "Élégant", titre: "'Fraunces', Georgia, serif", poids: 560, esp: "-0.015em", casse: "none", large: "normal", fichier: "polices/fraunces-latin-wght-normal.woff2", famille: "Fraunces" },
    enseigne: { nom: "Enseigne", titre: "'Archivo', 'Arial Narrow', sans-serif", poids: 800, esp: "0", casse: "uppercase", large: "72%", fichier: "polices/archivo-latin-wdth-normal.woff2", famille: "Archivo" },
    classique: { nom: "Classique", titre: "'DM Serif Display', Georgia, serif", poids: 400, esp: "-0.005em", casse: "none", large: "normal", fichier: "polices/dm-serif-display-latin-400-normal.woff2", famille: "DM Serif Display" },
    artisan: { nom: "Artisan", titre: "'Bricolage Grotesque', system-ui, sans-serif", poids: 720, esp: "-0.03em", casse: "none", large: "normal", fichier: "polices/bricolage-grotesque-latin-wght-normal.woff2", famille: "Bricolage Grotesque" },
    simple: { nom: "Simple", titre: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", poids: 700, esp: "-0.01em", casse: "none", large: "normal", fichier: null, famille: null }
  };
  var FONDS = {
    clair: { nom: "Blanc", fond: "#FFFFFF", fond2: "#F4F5F6", encre: "#15181C", encre2: "#59616C", ligne: "#E6E7EA", sombre: false },
    creme: { nom: "Crème", fond: "#FBF8F2", fond2: "#F2EDE3", encre: "#1E1A16", encre2: "#665E54", ligne: "#E7E0D3", sombre: false },
    gris: { nom: "Gris clair", fond: "#F1F3F5", fond2: "#E6E9EC", encre: "#14181D", encre2: "#56606B", ligne: "#DADFE4", sombre: false },
    sombre: { nom: "Sombre", fond: "#121416", fond2: "#1B1E21", encre: "#F2F1EE", encre2: "#A7ADB4", ligne: "#2C3035", sombre: true }
  };
  var RAYONS = { carre: { nom: "Carrés", r: "3px", b: "3px" }, doux: { nom: "Arrondis", r: "14px", b: "10px" }, rond: { nom: "Très ronds", r: "26px", b: "999px" } };

  function rgb(h) { h = h.replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function hex(c) { return "#" + c.map(function (v) { return ("0" + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join(""); }
  function lum(h) { return rgb(h).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [.2126, .7152, .0722][i]; }, 0); }
  function contraste(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  function melange(a, b, t) { var A = rgb(a), B = rgb(b); return hex(A.map(function (v, i) { return v + (B[i] - v) * t; })); }
  function encrePour(c, fond) { var x = c, k = 0; var cible = lum(fond) > .5 ? "#000000" : "#FFFFFF"; while (contraste(x, fond) < 4.5 && k < 12) { x = melange(c, cible, (++k) * .08); } return x; }

  function varsTheme(T) {
    var F = FONDS[T.fond] || FONDS.clair, P = POLICES[T.police] || POLICES.moderne, R = RAYONS[T.rayon] || RAYONS.doux, c = T.c1 || "#0B63CE";
    var surC = contraste("#FFFFFF", c) >= 3.2 ? "#FFFFFF" : "#15181C";
    var v = {
      "--c1": c, "--c1-txt": surC, "--c1-ink": encrePour(c, F.fond), "--c1-doux": melange(F.fond, c, F.sombre ? .22 : .1), "--c1-ink-c": encrePour(c, "#FFFFFF"), "--c1-ink-s": encrePour(c, "#15181C"), "--cs": contraste(c, "#15181C") < 2.2 ? "#FFFFFF" : c, "--cs-txt": contraste(c, "#15181C") < 2.2 ? "#15181C" : surC,
      "--fond": F.fond, "--fond-2": F.fond2, "--encre": F.encre, "--encre-2": F.encre2, "--ligne": F.ligne,
      "--r": R.r, "--rb": R.b, "--f-titre": P.titre, "--t-poids": P.poids, "--t-esp": P.esp, "--t-casse": P.casse, "--t-large": P.large
    };
    return Object.keys(v).map(function (k) { return k + ":" + v[k]; }).join(";");
  }

  /* ===================== Petits outils de rendu ===================== */
  function T(c, tag, k, val, cls, ph, attrs) {
    if (!c.edition && !String(val || "").trim()) return "";
    return "<" + tag + (cls ? ' class="' + cls + '"' : "") + (c.edition ? ' data-k="' + k + '" data-ph="' + e(ph || "") + '"' : "") + (attrs || "") + ">" + e(val || "") + "</" + tag + ">";
  }
  function IMG(c, k, id, cls, ico, alt) {
    var src = id && c.media(id);
    if (src) return '<img class="' + (cls || "") + '" src="' + src + '" alt="' + e(alt || "") + '"' + (c.edition ? ' data-img="' + k + '"' : ' loading="lazy" decoding="async"') + ">";
    return '<div class="s-ph ' + (cls || "") + '"' + (c.edition ? ' data-img="' + k + '"' : "") + ' role="presentation">' + icone(ico || c.M.icone, "s-ph-ic") + (c.edition ? "<span>Ajouter une photo</span>" : "") + "</div>";
  }
  function trouver(c, type) {
    var r = null;
    c.P.pages.forEach(function (p) { p.sections.forEach(function (s) { if (!r && s.t === type) r = { s: s, p: p }; }); });
    return r;
  }
  function lien(c, a) {
    a = a || "";
    if (a === "resa" || a === "cmd") { var x = trouver(c, a === "resa" ? "reservation" : "commande"); if (x) return "#s-" + x.s.id; a = "tel"; }
    if (a === "prest") { var y = trouver(c, "prestations") || trouver(c, "produits"); if (y) return "#s-" + y.s.id; a = "itin"; }
    if (a === "tel") return c.P.infos.tel ? "tel:" + c.P.infos.tel.replace(/[^\d+]/g, "") : "#s-contact";
    if (a === "itin") return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([c.P.infos.adresse, c.P.infos.cp, c.P.infos.ville].filter(Boolean).join(" ") || c.P.infos.nom);
    if (a.indexOf("sec:") === 0) return "#s-" + a.slice(4);
    if (a.indexOf("page:") === 0) return "#page-" + a.slice(5);
    if (a.indexOf("url:") === 0) { var u = a.slice(4).trim(); return /^https?:\/\//.test(u) ? u : "https://" + u; }
    return "#";
  }
  function BTN(c, k, b, cls) {
    if (!b || (!c.edition && !String(b.t || "").trim())) return "";
    var h = lien(c, b.a), ext = /^https?:/.test(h);
    return '<a class="s-btn ' + (cls || "") + '" href="' + e(h) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + (c.edition ? ' data-k="' + k + '.t" data-ph="Texte du bouton"' : "") + ">" + e(b.t || "") + "</a>";
  }
  function titreSec(c, d, ph, cls) { return T(c, "h2", "titre", d.titre, "s-h2 " + (cls || ""), ph || "Titre de la section") + T(c, "p", "intro", d.intro, "s-lead s-pre", "Une phrase d'introduction (facultatif)"); }
  function adresse(P) { var i = P.infos; return [i.adresse, [i.cp, i.ville].filter(Boolean).join(" ")].filter(Boolean).join(", "); }
  function etoiles(n) { var s = ""; for (var i = 0; i < 5; i++) s += '<svg viewBox="0 0 24 24" class="' + (i < n ? "on" : "") + '" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>'; return '<span class="s-etoiles" role="img" aria-label="' + n + ' sur 5">' + s + "</span>"; }
  function formFin() {
    return '<div class="s-resa-fin" hidden><svg class="s-coche" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><path d="M15 27l7 7 15-16"/></svg><p class="s-fin-titre"></p><p class="s-fin-texte"></p><button type="button" class="s-btn s-btn--2" data-encore>Recommencer</button></div>';
  }
  function formClient(btn) {
    return '<form class="s-resa-form" hidden novalidate><p class="s-form-recap"></p><label class="s-champ"><span>Votre nom</span><input name="nom" autocomplete="name" required></label><label class="s-champ"><span>Votre téléphone</span><input name="tel" type="tel" inputmode="tel" autocomplete="tel" required></label><p class="s-form-err" role="alert"></p><div class="s-form-act"><button type="button" class="s-lien" data-retour>Modifier</button><button class="s-btn">' + btn + "</button></div></form>";
  }
  function groupes(items, kG) {
    var g = [], idx = {};
    items.forEach(function (it, i) { var n = (it[kG] || "").trim(); if (!(n in idx)) { idx[n] = g.length; g.push({ nom: n, l: [] }); } g[idx[n]].l.push({ it: it, i: i }); });
    return g;
  }

  /* ===================== Les sections ===================== */
  var L = {}; // texte, long, image, images, bouton, choix, segments, inter, nombre, date, liste, note
  var B = {
    annonce: {
      nom: "Bandeau d'annonce", cat: "haut", desc: "Une info courte tout en haut : fermeture, promo, nouveauté.",
      variantes: [["couleur", "Couleur"], ["sombre", "Sombre"], ["defile", "Qui défile"]],
      champs: [{ k: "texte", type: "texte", label: "Message", max: 90 }, { k: "b", type: "bouton", label: "Lien (facultatif)" }],
      defaut: function () { return { texte: "Nouveau : réservez en ligne, 24 h sur 24", b: { t: "", a: "resa" } }; },
      rendu: function (s, c) {
        var d = s.d, txt = T(c, "p", "texte", d.texte, "s-annonce-t", "Votre message");
        if (s.v === "defile" && !c.edition) { var u = '<span>' + e(d.texte) + "</span>"; return '<div class="s-defile" aria-label="' + e(d.texte) + '"><div class="s-defile-piste" aria-hidden="true">' + u + u + u + u + u + u + "</div></div>"; }
        return '<div class="s-in s-annonce-in">' + txt + BTN(c, "b", d.b, "s-btn--lien") + "</div>";
      }
    },
    heros: {
      nom: "Grande bannière", cat: "haut", desc: "Le haut de votre page : votre nom, une phrase, un bouton.",
      variantes: [["photo", "Photo en fond"], ["partage", "Texte et photo"], ["aplat", "Aplat de couleur"], ["enseigne", "Façon enseigne"]],
      champs: [{ k: "sur", type: "texte", label: "Petite ligne au-dessus", ph: "Laissez vide : métier et ville" }, { k: "titre", type: "texte", label: "Titre", ph: "Laissez vide : nom du commerce" }, { k: "texte", type: "long", label: "Phrase d'accroche" }, { k: "b1", type: "bouton", label: "Bouton principal" }, { k: "b2", type: "bouton", label: "Second bouton" }, { k: "img", type: "image", label: "Photo" }, { k: "statut", type: "inter", label: "Afficher « ouvert maintenant »" }],
      defaut: function (c) { var o = c.M.objectif; return { sur: "", titre: "", texte: c.M.accroche, b1: { t: o === "rdv" ? (c.metier === "restaurant" ? "Réserver une table" : "Prendre rendez-vous") : o === "commande" ? "Commander" : "Nous appeler", a: o === "rdv" ? "resa" : o === "commande" ? "cmd" : "tel" }, b2: { t: c.M.prod && !c.M.prest ? "Voir les produits" : "Voir les tarifs", a: "prest" }, img: null, statut: true }; },
      rendu: function (s, c) {
        var d = s.d, i = c.P.infos, sur = d.sur || (c.M.nom + (i.ville ? " à " + i.ville : "")), titre = d.titre || i.nom || "Votre commerce";
        var txt = '<div class="s-heros-txt">' +
          (c.edition ? '<p class="s-sur" data-auto data-k="sur" data-ph="' + e(sur) + '">' + e(d.sur) + "</p>" : '<p class="s-sur">' + e(sur) + "</p>") +
          (c.edition ? '<h1 class="s-h1" data-auto data-k="titre" data-ph="' + e(titre) + '">' + e(d.titre) + "</h1>" : '<h1 class="s-h1">' + e(titre) + "</h1>") +
          T(c, "p", "texte", d.texte, "s-heros-p s-pre", "Une phrase qui dit ce que vous faites") +
          '<div class="s-act">' + BTN(c, "b1", d.b1) + BTN(c, "b2", d.b2, "s-btn--2") + "</div>" +
          (d.statut ? '<p class="s-statut" data-statut><i></i><span></span></p>' : "") + "</div>";
        if (s.v === "photo") return '<div class="s-heros-fond">' + IMG(c, "img", d.img, "s-heros-img", null, "") + '</div><div class="s-in">' + txt + "</div>";
        if (s.v === "partage") return '<div class="s-in s-heros-grille">' + txt + '<div class="s-heros-media">' + IMG(c, "img", d.img, "s-heros-img", null, "") + "</div></div>";
        if (s.v === "enseigne") return '<div class="s-in"><div class="s-enseigne">' + txt + "</div></div>";
        return '<div class="s-in">' + txt + "</div>";
      }
    },
    prestations: {
      nom: "Tarifs et prestations", cat: "vendre", desc: "Vos prestations ou votre carte, avec les prix.", ancre: "Tarifs",
      variantes: [["liste", "Liste"], ["cartes", "Cartes"], ["ardoise", "Ardoise"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Introduction" }, { k: "items", type: "liste", label: "Prestations", ajout: "Ajouter une ligne", titre: "nom", champs: [{ k: "nom", type: "texte", label: "Nom" }, { k: "detail", type: "texte", label: "Détail (durée, description)" }, { k: "prix", type: "texte", label: "Prix", ph: "18, dès 45, sur devis" }, { k: "groupe", type: "texte", label: "Catégorie (facultatif)", ph: "Entrées, Plats…" }] }],
      defaut: function (c) {
        var src = c.M.prest || (c.M.prod || []).map(function (p) { return [p[0], p[2] ? "Prix " + p[2] : "", p[1], p[3]]; });
        var items = src.map(function (p) { return { nom: p[0], detail: c.metier === "restaurant" ? "" : p[1], prix: p[2], groupe: c.metier === "restaurant" ? p[1] : (p[3] || "") }; });
        return { titre: c.M.prestTitre, intro: c.M.prestIntro, items: items };
      },
      rendu: function (s, c) {
        var d = s.d, h = '<div class="s-in">' + titreSec(c, d) + '<div class="s-prest">';
        groupes(d.items || [], "groupe").forEach(function (g) {
          h += '<div class="s-prest-g">' + (g.nom ? '<h3 class="s-h3">' + e(g.nom) + "</h3>" : "") + '<ul class="s-prest-l">';
          g.l.forEach(function (x) {
            var it = x.it, k = "items." + x.i + ".";
            h += '<li class="s-prest-i"><div class="s-prest-n">' + T(c, "p", k + "nom", it.nom, "s-prest-nom", "Nom") + T(c, "p", k + "detail", it.detail, "s-prest-d", "Détail") + '</div><span class="s-prest-pt" aria-hidden="true"></span><p class="s-prest-p"' + (c.edition ? ' data-k="' + k + 'prix" data-ph="Prix"' : "") + ">" + e(c.edition ? it.prix : K.prix(it.prix)) + "</p></li>";
          });
          h += "</ul></div>";
        });
        return h + "</div></div>";
      }
    },
    produits: {
      nom: "Produits en vitrine", cat: "vendre", desc: "Vos produits phares avec photo et prix.", ancre: "Produits",
      variantes: [["grille", "Grille"], ["rangee", "Rangée qui défile"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Introduction" }, { k: "items", type: "liste", label: "Produits", ajout: "Ajouter un produit", titre: "nom", champs: [{ k: "nom", type: "texte", label: "Nom" }, { k: "prix", type: "texte", label: "Prix" }, { k: "unite", type: "texte", label: "Unité", ph: "le kg, la pièce…" }, { k: "badge", type: "texte", label: "Étiquette", ph: "Nouveau, Fait maison…" }, { k: "img", type: "image", label: "Photo" }] }, { k: "b", type: "bouton", label: "Bouton sous les produits" }],
      defaut: function (c) {
        var src = c.M.prod || (c.M.prest || []).map(function (p) { return [p[0], p[2], "", ""]; });
        return { titre: c.M.prod ? c.M.prestTitre : "À découvrir", intro: "", items: src.slice(0, 6).map(function (p, i) { return { nom: p[0], prix: p[1], unite: p[2], badge: i === 0 ? "Le plus demandé" : "", img: null }; }), b: { t: c.M.objectif === "commande" ? "Commander" : "", a: "cmd" } };
      },
      rendu: function (s, c) {
        var d = s.d, h = '<div class="s-in">' + titreSec(c, d) + '<ul class="s-prod">';
        (d.items || []).forEach(function (it, i) {
          var k = "items." + i + ".";
          h += '<li class="s-prod-i"><div class="s-prod-m">' + IMG(c, k + "img", it.img, "s-prod-img", null, it.nom) + (it.badge ? '<span class="s-badge">' + e(it.badge) + "</span>" : "") + '</div><div class="s-prod-t">' + T(c, "p", k + "nom", it.nom, "s-prod-nom", "Nom du produit") + '<p class="s-prod-p">' + (c.edition ? '<b data-k="' + k + 'prix" data-ph="Prix">' + e(it.prix) + "</b>" : "<b>" + e(K.prix(it.prix)) + "</b>") + (it.unite ? " <small>" + e(it.unite) + "</small>" : "") + "</p></div></li>";
        });
        return h + '</ul><div class="s-act s-act--c">' + BTN(c, "b", d.b) + "</div></div>";
      }
    },
    reservation: {
      nom: "Prise de rendez-vous", cat: "vendre", desc: "Vos clients choisissent une prestation, un jour et une heure.", ancre: "Réserver",
      variantes: [["etapes", "Côte à côte"], ["simple", "Une colonne"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }, { k: "pas", type: "segments", label: "Créneaux toutes les", options: [["15", "15 min"], ["30", "30 min"], ["60", "1 h"]] }, { k: "items", type: "liste", label: "Ce qu'on peut réserver", ajout: "Ajouter une prestation", titre: "nom", champs: [{ k: "nom", type: "texte", label: "Nom" }, { k: "duree", type: "nombre", label: "Durée", min: 5, max: 480, pas: 5, suffixe: "min" }, { k: "prix", type: "texte", label: "Prix" }] }, { k: "note", type: "note", texte: "Les jours et heures proposés suivent vos horaires (onglet Infos)." }],
      defaut: function (c) {
        var src = c.M.resa || (c.M.prest || []).slice(0, 4).map(function (p) { var m = /(\d+)\s*h(?:\s*(\d+))?/.exec(p[1]), mn = /(\d+)\s*min/.exec(p[1]); return [p[0], m ? String(+m[1] * 60 + (+m[2] || 0)) : mn ? mn[1] : "30", p[2]]; });
        return { titre: c.metier === "restaurant" ? "Réserver une table" : "Prendre rendez-vous", intro: "Choisissez, réservez, c'est noté. Vous recevez la confirmation tout de suite.", pas: "30", items: src.map(function (p) { return { nom: p[0], duree: +p[1] || 30, prix: p[2] }; }) };
      },
      rendu: function (s, c) {
        var d = s.d, h = '<div class="s-in">' + titreSec(c, d) + '<div class="s-resa" data-resa data-pas="' + e(d.pas || 30) + '"><div class="s-resa-etape"><div class="s-resa-g"><div class="s-resa-col"><p class="s-resa-q">Prestation</p><div class="s-services" role="radiogroup">';
        (d.items || []).forEach(function (it, i) {
          h += '<button type="button" role="radio" class="s-service" data-nom="' + e(it.nom) + '" data-duree="' + e(it.duree) + '" data-prix="' + e(it.prix) + '"><span>' + e(it.nom) + "</span><small>" + e([it.duree ? (it.duree >= 60 ? K.fmt(it.duree / 60).replace(/h$/, " h") : it.duree + " min") : "", K.prix(it.prix)].filter(Boolean).join(", ")) + "</small></button>";
        });
        return h + '</div></div><div class="s-resa-col"><p class="s-resa-q">Jour et heure</p><div class="s-resa-jours"></div><div class="s-resa-heures"></div></div></div><div class="s-resa-pied"><p class="s-resa-recap" aria-live="polite"></p><button type="button" class="s-btn" data-resa-ok disabled>Continuer</button></div></div>' + formClient("Confirmer le rendez-vous") + formFin() + "</div></div>";
      }
    },
    commande: {
      nom: "Commande à retirer", cat: "vendre", desc: "Vos clients composent leur commande et choisissent l'heure de retrait.", ancre: "Commander",
      variantes: [["carte", "Panier"], ["compact", "Compact"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }, { k: "items", type: "liste", label: "Produits commandables", ajout: "Ajouter un produit", titre: "nom", champs: [{ k: "nom", type: "texte", label: "Nom" }, { k: "prix", type: "texte", label: "Prix" }, { k: "unite", type: "texte", label: "Unité", ph: "le kg : la quantité se règle par 250 g" }] }, { k: "note", type: "note", texte: "Les heures de retrait suivent vos horaires. Le paiement se fait sur place." }],
      defaut: function (c) {
        var src = c.M.prod || (c.M.prest || []).map(function (p) { return [p[0], p[2], ""]; });
        return { titre: "Commander à l'avance", intro: "Composez votre commande, choisissez l'heure : elle vous attend. Vous payez sur place.", items: src.filter(function (p) { return K.num(p[1]) != null && !/dès|devis/i.test(p[1]); }).slice(0, 6).map(function (p) { return { nom: p[0], prix: p[1], unite: p[2] }; }) };
      },
      rendu: function (s, c) {
        var d = s.d, h = '<div class="s-in">' + titreSec(c, d) + '<div class="s-resa s-cmd" data-cmd><div class="s-resa-etape"><div class="s-resa-g"><div class="s-resa-col"><p class="s-resa-q">Votre panier</p><ul class="s-cmd-l">';
        (d.items || []).forEach(function (it) {
          h += '<li class="s-cmd-ligne" data-nom="' + e(it.nom) + '" data-prix="' + e(it.prix) + '" data-unite="' + e(it.unite) + '"><p><b>' + e(it.nom) + "</b><small>" + e(K.prix(it.prix)) + (it.unite ? " " + e(it.unite) : "") + '</small></p><div class="s-pas"></div></li>';
        });
        return h + '</ul></div><div class="s-resa-col"><p class="s-resa-q">Retrait</p><div class="s-resa-jours"></div><div class="s-resa-heures"></div></div></div><div class="s-resa-pied"><p class="s-resa-recap" aria-live="polite"></p><button type="button" class="s-btn" data-cmd-ok disabled>Continuer</button></div></div>' + formClient("Envoyer la commande") + formFin() + "</div></div>";
      }
    },
    promo: {
      nom: "Offre à durée limitée", cat: "vendre", desc: "Une offre ou une date clé, avec un compte à rebours.",
      variantes: [["carte", "Encadré"], ["bandeau", "Pleine largeur"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "texte", type: "long", label: "Texte" }, { k: "fin", type: "date", label: "Fin de l'offre" }, { k: "b", type: "bouton", label: "Bouton" }],
      defaut: function (c) { var f = new Date(); f.setDate(f.getDate() + 14); f.setHours(19, 0, 0, 0); var p = c.M.promo || ["Offre de bienvenue", "Une offre pour découvrir la maison, valable jusqu'à la date indiquée."]; return { titre: p[0], texte: p[1], fin: f.toISOString().slice(0, 16), b: { t: c.M.objectif === "commande" ? "Commander" : "En profiter", a: c.M.objectif === "commande" ? "cmd" : c.M.objectif === "rdv" ? "resa" : "tel" } }; },
      rendu: function (s, c) {
        var d = s.d, u = function (k, l) { return '<div class="s-cpt-c"><b data-u="' + k + '">00</b><small>' + l + "</small></div>"; };
        return '<div class="s-in"><div class="s-promo-boite"><div class="s-promo-t">' + T(c, "h2", "titre", d.titre, "s-h2", "Titre de l'offre") + T(c, "p", "texte", d.texte, "s-lead s-pre", "Ce que vous proposez") + '<div class="s-act">' + BTN(c, "b", d.b) + '</div></div><div class="s-cpt" data-compte="' + e(d.fin) + '" role="timer">' + u("j", "jours") + u("h", "heures") + u("m", "minutes") + u("s", "secondes") + '<p class="s-cpt-fin">Offre terminée</p></div></div></div>';
      }
    },
    fidelite: {
      nom: "Carte de fidélité", cat: "vendre", desc: "Montrez votre carte : la dixième est offerte.",
      variantes: [["carte", "Carte à tampons"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "texte", type: "long", label: "Texte" }, { k: "nb", type: "nombre", label: "Nombre de tampons", min: 4, max: 12, pas: 1, suffixe: "" }],
      defaut: function (c) { var f = c.M.fidelite || ["Votre 10e passage est offert", 10]; return { titre: f[0], texte: "Un tampon à chaque passage, demandez votre carte en caisse.", nb: f[1] }; },
      rendu: function (s, c) {
        var d = s.d, n = Math.max(4, Math.min(12, +d.nb || 10)), t = "";
        for (var i = 1; i <= n; i++) t += '<span class="s-tampon' + (i === n ? " s-tampon--fin" : "") + '" style="--i:' + i + '">' + (i === n ? "Offert" : i <= 3 ? icone(c.M.icone, "s-tampon-ic") : "") + "</span>";
        return '<div class="s-in s-fid-g"><div class="s-fid-t">' + T(c, "h2", "titre", d.titre, "s-h2", "Titre") + T(c, "p", "texte", d.texte, "s-lead s-pre", "Comment ça marche") + '</div><div class="s-fid-carte" style="--n:' + n + '"><p class="s-fid-nom">' + e(c.P.infos.nom || "Votre commerce") + '</p><div class="s-tampons">' + t + "</div></div></div>";
      }
    },
    apropos: {
      nom: "Votre histoire", cat: "presenter", desc: "Qui vous êtes, ce que vous faites de mieux.", ancre: "",
      variantes: [["gauche", "Photo à gauche"], ["droite", "Photo à droite"], ["citation", "Grande citation"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "texte", type: "long", label: "Texte" }, { k: "sign", type: "texte", label: "Signature", ph: "Sam, fondateur" }, { k: "img", type: "image", label: "Photo" }],
      defaut: function (c) { return { titre: c.M.apropos[0], texte: c.M.apropos[1], sign: "", img: null }; },
      rendu: function (s, c) {
        var d = s.d;
        if (s.v === "citation") return '<div class="s-in s-citation">' + T(c, "p", "titre", d.titre, "s-cit-t", "Petit titre") + T(c, "blockquote", "texte", d.texte, "s-cit s-pre", "Votre texte") + T(c, "p", "sign", d.sign, "s-cit-s", "Signature") + "</div>";
        return '<div class="s-in s-apropos-g">' + '<div class="s-apropos-m">' + IMG(c, "img", d.img, "s-apropos-img", null, "") + '</div><div class="s-apropos-t">' + T(c, "h2", "titre", d.titre, "s-h2", "Titre") + T(c, "p", "texte", d.texte, "s-texte s-pre", "Votre texte") + T(c, "p", "sign", d.sign, "s-cit-s", "Signature") + "</div></div>";
      }
    },
    galerie: {
      nom: "Photos", cat: "presenter", desc: "Vos réalisations, votre boutique, vos produits.", ancre: "Photos",
      variantes: [["grille", "Grille"], ["mosaique", "Mosaïque"], ["defile", "Défilement"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }, { k: "imgs", type: "images", label: "Photos" }],
      defaut: function () { return { titre: "En images", intro: "", imgs: [null, null, null, null, null, null] }; },
      rendu: function (s, c) {
        var d = s.d, h = '<div class="s-in">' + titreSec(c, d) + '<div class="s-gal" data-galerie>';
        (d.imgs || []).forEach(function (id, i) { h += '<div class="s-gal-i">' + IMG(c, "imgs." + i, id, "s-gal-img", null, "Photo " + (i + 1)) + "</div>"; });
        return h + "</div></div>";
      }
    },
    equipe: {
      nom: "L'équipe", cat: "presenter", desc: "Les personnes que vos clients vont rencontrer.", ancre: "",
      variantes: [["ronds", "Portraits ronds"], ["cartes", "Cartes"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }, { k: "items", type: "liste", label: "Personnes", ajout: "Ajouter une personne", titre: "nom", champs: [{ k: "nom", type: "texte", label: "Prénom" }, { k: "role", type: "texte", label: "Rôle" }, { k: "img", type: "image", label: "Photo" }] }],
      defaut: function () { return { titre: "L'équipe", intro: "", items: [{ nom: "Prénom", role: "Gérant", img: null }, { nom: "Prénom", role: "Votre rôle", img: null }] }; },
      rendu: function (s, c) {
        var d = s.d, h = '<div class="s-in">' + titreSec(c, d) + '<ul class="s-equipe">';
        (d.items || []).forEach(function (it, i) { var k = "items." + i + "."; h += '<li class="s-membre">' + IMG(c, k + "img", it.img, "s-membre-img", null, it.nom) + T(c, "p", k + "nom", it.nom, "s-membre-nom", "Prénom") + T(c, "p", k + "role", it.role, "s-membre-role", "Rôle") + "</li>"; });
        return h + "</ul></div>";
      }
    },
    avis: {
      nom: "Avis clients", cat: "presenter", desc: "Ce que vos clients disent de vous.", ancre: "Avis",
      variantes: [["cartes", "Cartes"], ["une", "Un grand avis"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }, { k: "items", type: "liste", label: "Avis", ajout: "Ajouter un avis", titre: "nom", champs: [{ k: "nom", type: "texte", label: "Nom du client" }, { k: "note", type: "nombre", label: "Note", min: 1, max: 5, pas: 1, suffixe: "/ 5" }, { k: "texte", type: "long", label: "Avis" }] }, { k: "lien", type: "texte", label: "Lien vers vos avis Google", ph: "https://g.page/…" }, { k: "note", type: "note", texte: "N'affichez que de vrais avis, recopiés mot pour mot. Les avis d'exemple ne sont pas publiés." }],
      defaut: function (c) { return { titre: "Ils en parlent", intro: "", items: c.M.avis.map(function (a) { return { nom: a[0], note: 5, texte: a[1] }; }), lien: "" }; },
      rendu: function (s, c) {
        var d = s.d, items = d.items || [];
        if (s.v === "une") items = items.slice(0, 1);
        var h = '<div class="s-in">' + titreSec(c, d) + '<ul class="s-avis">';
        items.forEach(function (it, i) { var k = "items." + i + "."; h += '<li class="s-avi">' + etoiles(Math.max(1, Math.min(5, +it.note || 5))) + T(c, "blockquote", k + "texte", it.texte, "s-avi-t s-pre", "Texte de l'avis") + T(c, "p", k + "nom", it.nom, "s-avi-n", "Nom") + "</li>"; });
        h += "</ul>";
        if (d.lien) h += '<div class="s-act s-act--c"><a class="s-btn s-btn--2" href="' + e(lien(c, "url:" + d.lien)) + '" target="_blank" rel="noopener">Voir tous les avis Google</a></div>';
        return h + "</div>";
      }
    },
    faq: {
      nom: "Questions fréquentes", cat: "presenter", desc: "Les réponses aux questions qu'on vous pose tout le temps.", ancre: "",
      variantes: [["liste", "Liste"], ["deux", "Deux colonnes"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }, { k: "items", type: "liste", label: "Questions", ajout: "Ajouter une question", titre: "q", champs: [{ k: "q", type: "texte", label: "Question" }, { k: "r", type: "long", label: "Réponse" }] }],
      defaut: function (c) { return { titre: "Vos questions", intro: "", items: c.M.faq.map(function (f) { return { q: f[0], r: f[1] }; }) }; },
      rendu: function (s, c) {
        var d = s.d, h = '<div class="s-in s-faq-g"><div>' + titreSec(c, d) + '</div><div class="s-faq">';
        (d.items || []).forEach(function (it, i) { var k = "items." + i + "."; h += "<details" + (c.edition ? " open" : "") + '><summary><span' + (c.edition ? ' data-k="' + k + 'q" data-ph="Question"' : "") + ">" + e(it.q) + '</span><i aria-hidden="true"></i></summary>' + T(c, "p", k + "r", it.r, "s-pre", "Réponse") + "</details>"; });
        return h + "</div></div>";
      }
    },
    texte: {
      nom: "Texte libre", cat: "presenter", desc: "Un titre et un paragraphe, pour tout le reste.", ancre: "",
      variantes: [["gauche", "Aligné à gauche"], ["centre", "Centré"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "texte", type: "long", label: "Texte" }, { k: "b", type: "bouton", label: "Bouton (facultatif)" }],
      defaut: function () { return { titre: "Un titre", texte: "Écrivez ici ce que vos clients doivent savoir.", b: { t: "", a: "tel" } }; },
      rendu: function (s, c) { var d = s.d; return '<div class="s-in s-texte-b">' + T(c, "h2", "titre", d.titre, "s-h2", "Titre") + T(c, "p", "texte", d.texte, "s-texte s-pre", "Votre texte") + '<div class="s-act">' + BTN(c, "b", d.b) + "</div></div>"; }
    },
    horaires: {
      nom: "Horaires", cat: "infos", desc: "Vos horaires, avec « ouvert maintenant » en direct.", ancre: "Horaires",
      variantes: [["tableau", "Tableau"], ["carte", "Avec l'adresse"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte", ph: "Fermé les jours fériés…" }, { k: "note", type: "note", texte: "Les horaires se règlent une seule fois dans l'onglet Infos : ils servent partout sur le site.", action: "infos" }],
      defaut: function () { return { titre: "Horaires", intro: "" }; },
      rendu: function (s, c) {
        var d = s.d, H = c.P.infos.horaires, rows = "";
        for (var i = 0; i < 7; i++) {
          var p = K.plages(H, i);
          rows += '<tr data-j="' + i + '"><th scope="row">' + K.JOURS[i] + "</th><td>" + (p.length ? p.map(function (x) { return K.fmt(x[0]) + " – " + K.fmt(x[1]); }).join(", ") : "Fermé") + "</td></tr>";
        }
        var tab = '<table class="s-hor" data-horaires>' + rows + "</table>";
        var g = '<div class="s-hor-t">' + T(c, "h2", "titre", d.titre, "s-h2", "Horaires") + '<p class="s-statut" data-statut><i></i><span></span></p>' + T(c, "p", "intro", d.intro, "s-lead s-pre", "Une précision (facultatif)") + "</div>";
        if (s.v === "carte") return '<div class="s-in s-hor-g">' + g + tab + '<div class="s-hor-adr">' + icone("epingle") + "<p>" + e(adresse(c.P) || "Votre adresse") + '</p><a class="s-btn s-btn--2" href="' + e(lien(c, "itin")) + '" target="_blank" rel="noopener">Itinéraire</a></div></div>';
        return '<div class="s-in s-hor-g">' + g + tab + "</div>";
      }
    },
    acces: {
      nom: "Adresse et accès", cat: "infos", desc: "Où vous trouver, se garer, venir en bus.", ancre: "Accès",
      variantes: [["plan", "Avec plan"], ["simple", "Texte seul"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "texte", type: "long", label: "Comment venir", ph: "Parking gratuit à 50 m, bus ligne 2…" }, { k: "note", type: "note", texte: "L'adresse se règle dans l'onglet Infos. Le plan n'utilise aucun service extérieur : pas de cookie.", action: "infos" }],
      defaut: function (c) { return { titre: "Nous trouver", texte: "Stationnement facile à proximité." }; },
      rendu: function (s, c) {
        var d = s.d, adr = adresse(c.P);
        var plan = s.v === "plan" ? '<a class="s-plan" href="' + e(lien(c, "itin")) + '" target="_blank" rel="noopener" aria-label="Ouvrir l\'itinéraire"><i class="s-rue s-rue--1"></i><i class="s-rue s-rue--2"></i><i class="s-rue s-rue--3"></i><i class="s-rue s-rue--4"></i><i class="s-ilot s-ilot--1"></i><i class="s-ilot s-ilot--2"></i><span class="s-plan-pin">' + icone("epingle") + '</span><span class="s-plan-tag">' + e(c.P.infos.nom || "Vous êtes ici") + "</span></a>" : "";
        return '<div class="s-in s-acces-g"><div class="s-acces-t">' + T(c, "h2", "titre", d.titre, "s-h2", "Titre") + '<p class="s-adr">' + icone("epingle") + "<span>" + e(adr || "Votre adresse (onglet Infos)") + "</span></p>" + T(c, "p", "texte", d.texte, "s-texte s-pre", "Comment venir") + '<div class="s-act"><a class="s-btn" href="' + e(lien(c, "itin")) + '" target="_blank" rel="noopener">Itinéraire</a>' + (c.P.infos.tel ? '<a class="s-btn s-btn--2" href="' + e(lien(c, "tel")) + '">Appeler</a>' : "") + "</div></div>" + plan + "</div>";
      }
    },
    contact: {
      nom: "Contact", cat: "infos", desc: "Téléphone, mail et un formulaire simple.", ancre: "Contact",
      variantes: [["formulaire", "Avec formulaire"], ["boutons", "Gros boutons"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }],
      defaut: function () { return { titre: "Nous contacter", intro: "Une question, une demande particulière ? Appelez-nous ou écrivez-nous." }; },
      rendu: function (s, c) {
        var d = s.d, i = c.P.infos, l = "";
        if (i.tel) l += '<a class="s-coord" href="' + e(lien(c, "tel")) + '">' + icone("tel") + "<span><small>Téléphone</small>" + e(i.tel) + "</span></a>";
        if (i.email) l += '<a class="s-coord" href="mailto:' + e(i.email) + '">' + icone("mail") + "<span><small>E-mail</small>" + e(i.email) + "</span></a>";
        if (adresse(c.P)) l += '<a class="s-coord" href="' + e(lien(c, "itin")) + '" target="_blank" rel="noopener">' + icone("epingle") + "<span><small>Adresse</small>" + e(adresse(c.P)) + "</span></a>";
        if (!l && c.edition) l = '<p class="s-vide">Ajoutez votre téléphone et votre adresse dans l\'onglet Infos.</p>';
        var form = s.v === "formulaire" ? '<form class="s-contact-f" data-contact novalidate><label class="s-champ"><span>Votre nom</span><input name="nom" autocomplete="name"></label><label class="s-champ"><span>Téléphone ou e-mail</span><input name="contact" autocomplete="email"></label><label class="s-champ s-champ--l"><span>Votre message</span><textarea name="message" rows="4"></textarea></label><p class="s-form-err" role="status"></p><button class="s-btn">Envoyer</button><p class="s-mini">Votre message nous parvient directement. Rien n\'est enregistré sur ce site.</p></form>' : "";
        return '<div class="s-in s-contact-g"><div>' + titreSec(c, d) + '<div class="s-coords">' + l + "</div></div>" + form + "</div>";
      }
    },
    reseaux: {
      nom: "Réseaux sociaux", cat: "infos", desc: "Liens vers votre Instagram, Facebook, TikTok.", ancre: "",
      variantes: [["boutons", "Boutons"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }, { k: "note", type: "note", texte: "Les liens se règlent dans l'onglet Infos.", action: "infos" }],
      defaut: function () { return { titre: "Suivez-nous", intro: "Les nouveautés, les coulisses et les offres passent d'abord par là." }; },
      rendu: function (s, c) {
        var d = s.d, i = c.P.infos, l = "";
        [["insta", "Instagram", "https://instagram.com/"], ["facebook", "Facebook", "https://facebook.com/"], ["tiktok", "TikTok", "https://tiktok.com/@"]].forEach(function (r) {
          var v = (i[r[0]] || "").trim(); if (!v && !c.edition) return;
          var h = !v ? "#" : /^https?:/.test(v) ? v : r[2] + v.replace(/^@/, "");
          l += '<a class="s-res' + (v ? "" : " s-res--vide") + '" href="' + e(h) + '" target="_blank" rel="noopener">' + icone(r[0]) + "<span>" + r[1] + "<small>" + e(v ? (v.indexOf("http") === 0 ? v.replace(/^https?:\/\/(www\.)?/, "") : "@" + v.replace(/^@/, "")) : "À renseigner") + "</small></span></a>";
        });
        return '<div class="s-in s-res-g"><div>' + titreSec(c, d) + '</div><div class="s-res-l">' + l + "</div></div>";
      }
    },
    appel: {
      nom: "Appel à l'action", cat: "infos", desc: "Un bloc fort pour pousser à réserver ou appeler.", ancre: "",
      variantes: [["plein", "Plein"], ["contour", "Encadré"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "texte", type: "long", label: "Texte" }, { k: "b1", type: "bouton", label: "Bouton" }, { k: "b2", type: "bouton", label: "Second bouton" }],
      defaut: function (c) { var o = c.M.objectif; return { titre: o === "rdv" ? "Une place cette semaine ?" : o === "commande" ? "Commandez maintenant, retirez quand vous voulez" : "Passez nous voir", texte: "", b1: { t: o === "rdv" ? "Réserver" : o === "commande" ? "Commander" : "Itinéraire", a: o === "rdv" ? "resa" : o === "commande" ? "cmd" : "itin" }, b2: { t: "Appeler", a: "tel" } }; },
      rendu: function (s, c) { var d = s.d; return '<div class="s-in"><div class="s-appel-b">' + T(c, "h2", "titre", d.titre, "s-h2", "Titre") + T(c, "p", "texte", d.texte, "s-lead s-pre", "Texte (facultatif)") + '<div class="s-act s-act--c">' + BTN(c, "b1", d.b1) + BTN(c, "b2", d.b2, "s-btn--2") + "</div></div></div>"; }
    },
    espace: {
      nom: "Espace", cat: "infos", desc: "Un peu d'air entre deux sections.", ancre: "",
      variantes: [["vide", "Vide"], ["ligne", "Avec une ligne"]],
      champs: [],
      defaut: function () { return {}; },
      rendu: function (s) { return '<div class="s-in"><hr class="s-hr"></div>'; }
    }
  };
  var CATS = [["haut", "Haut de page"], ["vendre", "Vendre et réserver"], ["presenter", "Se présenter"], ["infos", "Infos pratiques"]];

  /* ===================== Recettes : un site complet selon le métier et l'objectif ===================== */
  function recette(metier, objectif) {
    var o = objectif;
    var base = {
      rdv: ["heros:photo", "prestations:liste", "reservation:etapes", "apropos:gauche", "galerie:mosaique", "avis:cartes", "horaires:carte", "acces:plan", "faq:liste", "appel:plein"],
      commande: ["heros:partage", "produits:grille", "commande:carte", "apropos:droite", "avis:cartes", "horaires:carte", "acces:plan", "faq:liste"],
      carte: ["heros:photo", "prestations:ardoise", "galerie:grille", "apropos:citation", "avis:cartes", "horaires:carte", "acces:plan", "contact:boutons"],
      vitrine: ["heros:partage", "apropos:gauche", "prestations:cartes", "galerie:mosaique", "avis:cartes", "horaires:carte", "acces:plan", "contact:formulaire"]
    }[o] || [];
    base = base.slice();
    if (M[metier] && M[metier].fidelite) base.splice(o === "commande" ? 4 : base.length - 2, 0, "fidelite:carte");
    if (metier === "boucherie") { base.unshift("annonce:couleur"); base.splice(4, 0, "promo:carte"); }
    if (metier === "restaurant" && base[1] === "prestations:liste") base[1] = "prestations:ardoise";
    return base;
  }

  /* ===================== Pages légales générées ===================== */
  function manque(t) { return '<mark class="s-manque">' + t + "</mark>"; }
  function pagesLegales(P) {
    var i = P.infos, adr = adresse(P), x = function (v, t) { return v ? e(v) : manque(t); };
    var mentions = '<div class="s-in s-legal"><h1 class="s-h2">Mentions légales</h1>' +
      "<h2 class=\"s-h3\">Éditeur du site</h2><p>" + x(i.nom, "[nom du commerce]") + ", " + x(i.forme, "[forme juridique]") + "<br>Responsable : " + x(i.responsable, "[nom du responsable]") + "<br>Adresse : " + x(adr, "[adresse]") + "<br>SIRET : " + x(i.siret, "[numéro SIRET]") + "<br>Téléphone : " + x(i.tel, "[téléphone]") + (i.email ? "<br>E-mail : " + e(i.email) : "") + "</p>" +
      "<p>Directeur de la publication : " + x(i.responsable, "[nom du responsable]") + ".</p>" +
      "<h2 class=\"s-h3\">Hébergement</h2><p>" + x(P.publi && P.publi.hebergeur, "[hébergeur, indiqué à la mise en ligne]") + "</p>" +
      "<h2 class=\"s-h3\">Médiation de la consommation</h2><p>En cas de litige, vous pouvez recourir gratuitement au médiateur de la consommation : " + x(i.mediateur, "[nom et site du médiateur]") + ".</p>" +
      "<h2 class=\"s-h3\">Contenus</h2><p>Les textes et photos de ce site appartiennent à " + x(i.nom, "[nom du commerce]") + ". Merci de ne pas les réutiliser sans accord.</p></div>";
    var conf = '<div class="s-in s-legal"><h1 class="s-h2">Confidentialité et cookies</h1>' +
      "<h2 class=\"s-h3\">Ce que nous recevons</h2><p>Quand vous réservez, commandez ou nous écrivez, vous nous transmettez votre nom, votre téléphone et votre message. Ils servent uniquement à vous répondre et à préparer votre rendez-vous ou votre commande. Ils ne sont ni vendus, ni utilisés pour de la publicité.</p>" +
      "<h2 class=\"s-h3\">Cookies</h2><p>Ce site ne dépose aucun cookie et n'utilise aucun outil de mesure d'audience ni de publicité. Aucun bandeau de consentement n'est donc nécessaire. Le bouton « Itinéraire » ouvre Google Maps seulement si vous cliquez dessus.</p>" +
      "<h2 class=\"s-h3\">Vos droits</h2><p>Vous pouvez demander à consulter, corriger ou supprimer vos informations en contactant " + x(i.nom, "[nom du commerce]") + (i.email ? " à " + e(i.email) : i.tel ? " au " + e(i.tel) : "") + ". Vous pouvez aussi saisir la CNIL (cnil.fr).</p></div>";
    return [{ id: "mentions", nom: "Mentions légales", html: mentions }, { id: "confidentialite", nom: "Confidentialité", html: conf }];
  }

  /* ===================== En-tête et pied de page ===================== */
  function nav(c) {
    var P = c.P, l = [];
    if (P.pages.length > 1) P.pages.forEach(function (p) { l.push(['#page-' + p.id, p.nom, "page:" + p.id]); });
    else P.pages[0].sections.forEach(function (s) { if (s.menu) l.push(["#s-" + s.id, s.menu, "sec:" + s.id]); });
    return l;
  }
  function marque(c) {
    var P = c.P, src = P.logo && c.media(P.logo), n = P.infos.nom || "Votre commerce";
    return '<a class="s-marque" href="#page-' + P.pages[0].id + '">' + (src ? '<img class="s-logo" src="' + src + '" alt="' + (P.entete.logoSeul ? e(n) : "") + '">' : '<span class="s-logo s-logo--l" aria-hidden="true">' + e(n.charAt(0).toUpperCase()) + "</span>") + (src && P.entete.logoSeul ? "" : "<b>" + e(n) + "</b>") + "</a>";
  }
  function entete(c) {
    var P = c.P, E = P.entete, liens = nav(c).map(function (x) { return '<a href="' + e(x[0]) + '"' + (c.pageId && x[2] === "page:" + c.pageId ? ' class="actif"' : "") + ">" + e(x[1]) + "</a>"; }).join("");
    return '<header class="s-entete v-' + E.v + (E.fixe ? " fixe" : "") + '" data-glob="entete"><div class="s-entete-in">' + marque(c) +
      '<nav class="s-nav" aria-label="Menu principal">' + liens + "</nav>" +
      '<div class="s-entete-act">' + (E.tel && P.infos.tel ? '<a class="s-entete-tel" href="' + e(lien(c, "tel")) + '">' + icone("tel") + "<span>" + e(P.infos.tel) + "</span></a>" : "") + (E.cta && E.cta.t ? '<a class="s-btn s-btn--s" href="' + e(lien(c, E.cta.a)) + '">' + e(E.cta.t) + "</a>" : "") +
      (liens ? '<button type="button" class="s-burger" data-burger aria-label="Ouvrir le menu" aria-expanded="false"><i></i></button>' : "") + "</div></div></header>";
  }
  function pied(c) {
    var P = c.P, i = P.infos, adr = adresse(P), F = P.pied, H = i.horaires, res = "";
    [["insta", "https://instagram.com/"], ["facebook", "https://facebook.com/"], ["tiktok", "https://tiktok.com/@"]].forEach(function (r) { var v = (i[r[0]] || "").trim(); if (v) res += '<a href="' + e(/^https?:/.test(v) ? v : r[1] + v.replace(/^@/, "")) + '" target="_blank" rel="noopener" aria-label="' + r[0] + '">' + icone(r[0]) + "</a>"; });
    var hor = "";
    if (K.aDesHoraires(H)) for (var j = 0; j < 7; j++) { var p = K.plages(H, j); hor += "<li><span>" + K.JOURS[j].slice(0, 3) + ".</span>" + (p.length ? p.map(function (x) { return K.fmt(x[0]) + "–" + K.fmt(x[1]); }).join(", ") : "fermé") + "</li>"; }
    var legal = '<a href="#page-mentions">Mentions légales</a><a href="#page-confidentialite">Confidentialité</a>';
    var credit = F.credit ? '<a class="s-credit" href="https://mk19mk69-ops.github.io/haccp/studio/v2/" target="_blank" rel="noopener">Site créé avec Mokrani Studio</a>' : "";
    if (F.v === "simple") return '<footer class="s-pied v-simple" data-glob="pied"><div class="s-in s-pied-bas"><p>© ' + new Date().getFullYear() + " " + e(i.nom || "") + "</p><nav>" + legal + "</nav>" + credit + "</div></footer>";
    return '<footer class="s-pied v-complet" data-glob="pied"><div class="s-in s-pied-g"><div class="s-pied-m">' + marque(c) + (F.texte ? '<p class="s-pre">' + e(F.texte) + "</p>" : "") + (res ? '<div class="s-pied-res">' + res + "</div>" : "") + '</div><div><p class="s-pied-h">Nous trouver</p><p>' + e(adr || "") + (i.tel ? '<br><a href="' + e(lien(c, "tel")) + '">' + e(i.tel) + "</a>" : "") + (i.email ? '<br><a href="mailto:' + e(i.email) + '">' + e(i.email) + "</a>" : "") + "</p></div>" + (hor ? '<div><p class="s-pied-h">Horaires</p><ul class="s-pied-hor">' + hor + "</ul></div>" : "") + '</div><div class="s-in s-pied-bas"><p>© ' + new Date().getFullYear() + " " + e(i.nom || "") + "</p><nav>" + legal + "</nav>" + credit + "</div></footer>";
  }

  /* ===================== Section complète ===================== */
  function section(s, c) {
    var b = B[s.t]; if (!b) return "";
    var st = s.s || {};
    var cls = "s-sec b-" + s.t + " v-" + s.v + " fd-" + (st.fond || "auto") + " esp-" + (st.esp || "m") + (st.mob === false ? " cache-mob" : "") + (st.ord === false ? " cache-ord" : "");
    return '<section class="' + cls + '" id="s-' + s.id + '" data-sec="' + s.id + '"' + (s.t !== "annonce" && s.t !== "espace" ? " data-anim" : "") + ">" + b.rendu(s, c) + "</section>";
  }

  function vignette(t) {
    var c = 'fill="currentColor"', x = "", r = function (a, b, w, h, o) { return '<rect x="' + a + '" y="' + b + '" width="' + w + '" height="' + h + '" rx="1.5" ' + c + ' opacity="' + (o || 1) + '"/>'; };
    switch (t) {
      case "annonce": x = r(0, 0, 96, 12, .9) + r(30, 4.5, 36, 3, .0) + '<rect x="28" y="4.5" width="40" height="3" rx="1.5" fill="#fff"/>' + r(8, 22, 50, 6, .18) + r(8, 34, 70, 4, .1) + r(8, 42, 60, 4, .1); break;
      case "heros": x = r(0, 0, 96, 60, .16) + r(8, 22, 48, 7, .85) + r(8, 33, 36, 4, .4) + r(8, 43, 20, 7, .9); break;
      case "prestations": for (var i = 0; i < 4; i++) x += r(8, 10 + i * 12, 46, 4, .5) + '<line x1="58" y1="' + (13 + i * 12) + '" x2="76" y2="' + (13 + i * 12) + '" stroke="currentColor" stroke-dasharray="1.5 2" opacity=".4"/>' + r(78, 10 + i * 12, 10, 4, .85); break;
      case "produits": for (var j = 0; j < 3; j++) x += r(6 + j * 30, 8, 26, 26, .18) + r(6 + j * 30, 38, 20, 4, .55) + r(6 + j * 30, 46, 12, 4, .85); break;
      case "reservation": x = r(6, 8, 36, 8, .2) + r(6, 20, 36, 8, .55) + r(6, 32, 36, 8, .2); for (var k = 0; k < 6; k++) x += r(50 + (k % 3) * 14, 8 + Math.floor(k / 3) * 12, 11, 8, k === 4 ? .9 : .2); x += r(50, 44, 40, 9, .9); break;
      case "commande": for (var m = 0; m < 3; m++) x += r(6, 8 + m * 13, 40, 9, .18) + '<circle cx="' + 54 + '" cy="' + (12.5 + m * 13) + '" r="3.5" ' + c + ' opacity=".9"/>'; x += r(64, 8, 26, 26, .12) + r(64, 44, 26, 9, .9); break;
      case "promo": x = r(4, 6, 88, 48, .12) + r(10, 14, 36, 6, .8) + r(10, 24, 30, 4, .35); for (var n = 0; n < 4; n++) x += r(52 + n * 10, 22, 8, 12, .85); break;
      case "fidelite": x = r(18, 8, 60, 44, .14); for (var f = 0; f < 10; f++) x += '<circle cx="' + (28 + (f % 5) * 10) + '" cy="' + (24 + Math.floor(f / 5) * 14) + '" r="3.6" ' + c + ' opacity="' + (f < 3 ? .9 : .25) + '"/>'; break;
      case "apropos": x = r(6, 8, 38, 44, .2) + r(52, 14, 32, 6, .8) + r(52, 25, 38, 3, .35) + r(52, 31, 36, 3, .35) + r(52, 37, 30, 3, .35); break;
      case "galerie": for (var g = 0; g < 6; g++) x += r(6 + (g % 3) * 29, 6 + Math.floor(g / 3) * 25, 26, 22, .22 + (g % 2) * .1); break;
      case "equipe": for (var q = 0; q < 3; q++) x += '<circle cx="' + (20 + q * 28) + '" cy="24" r="10" ' + c + ' opacity=".22"/>' + r(12 + q * 28, 39, 16, 4, .6) + r(14 + q * 28, 46, 12, 3, .3); break;
      case "avis": for (var a = 0; a < 3; a++) x += r(4 + a * 31, 8, 27, 44, .12) + r(8 + a * 31, 14, 16, 3, .8) + r(8 + a * 31, 22, 19, 3, .35) + r(8 + a * 31, 28, 17, 3, .35); break;
      case "faq": for (var z = 0; z < 4; z++) x += r(6, 8 + z * 12, 84, 9, .14) + r(10, 11 + z * 12, 40, 3, .6); break;
      case "texte": x = r(8, 12, 50, 7, .8) + r(8, 26, 80, 3, .35) + r(8, 32, 76, 3, .35) + r(8, 38, 60, 3, .35); break;
      case "horaires": for (var h = 0; h < 5; h++) x += r(40, 6 + h * 10, 18, 4, .55) + r(66, 6 + h * 10, 24, 4, .3); x += r(6, 8, 26, 6, .8) + '<circle cx="9" cy="22" r="2.5" ' + c + ' opacity=".9"/>' + r(14, 20.5, 16, 3, .4); break;
      case "acces": x = r(48, 6, 42, 48, .12) + '<path d="M48 30h42M66 6v48" stroke="currentColor" opacity=".3"/>' + '<circle cx="66" cy="28" r="4" ' + c + '/>' + r(6, 12, 34, 6, .8) + r(6, 24, 30, 3, .35) + r(6, 38, 18, 7, .9); break;
      case "contact": x = r(6, 10, 30, 6, .8) + r(6, 22, 26, 4, .35) + r(6, 30, 26, 4, .35) + r(46, 8, 44, 9, .14) + r(46, 20, 44, 9, .14) + r(46, 32, 44, 12, .14) + r(46, 47, 18, 6, .9); break;
      case "reseaux": for (var y = 0; y < 3; y++) x += r(10 + y * 27, 20, 22, 22, .2) + '<circle cx="' + (21 + y * 27) + '" cy="31" r="5" fill="none" stroke="currentColor" opacity=".8"/>'; break;
      case "appel": x = r(4, 8, 88, 44, .85) + '<rect x="26" y="18" width="44" height="6" rx="1.5" fill="#fff" opacity=".9"/><rect x="36" y="32" width="24" height="8" rx="3" fill="#fff"/>'; break;
      case "espace": x = '<path d="M10 30h76" stroke="currentColor" stroke-dasharray="3 3" opacity=".5"/>' + '<path d="M48 14v8M48 38v8M44 18l4-4 4 4M44 42l4 4 4-4" stroke="currentColor" fill="none" opacity=".6"/>'; break;
    }
    return '<svg viewBox="0 0 96 60" aria-hidden="true">' + x + "</svg>";
  }

  w.Blocs = { B: B, CATS: CATS, M: M, ORDRE_METIERS: ORDRE_METIERS, POLICES: POLICES, FONDS: FONDS, RAYONS: RAYONS, IC: IC, icone: icone, vignette: vignette,
    varsTheme: varsTheme, contraste: contraste, lum: lum, recette: recette, section: section, entete: entete, pied: pied, pagesLegales: pagesLegales, adresse: adresse, lien: lien };
})(window);
