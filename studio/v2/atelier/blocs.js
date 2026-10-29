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
      accroche: "Coupe, dégradé et taille de barbe. Avec ou sans rendez-vous.", atouts: [["Dégradé, barbe, rasage", "Les prix sont affichés, sans surprise."], ["Réservation en ligne", "24 h sur 24, en moins d'une minute."]],
      prestTitre: "Prestations", prestIntro: "Les prix affichés sont ceux du salon, sans surprise.",
      prest: [["Coupe homme", "30 min", "18"], ["Dégradé", "30 min", "20"], ["Coupe et barbe", "45 min", "26"], ["Taille de barbe", "15 min", "10"], ["Coupe enfant, moins de 12 ans", "20 min", "14"], ["Rasage à l'ancienne", "30 min", "20"]],
      apropos: ["Le salon", "Un salon de quartier où l'on prend le temps de bien faire. Chaque coupe commence par un échange : ce que vous voulez, ce qui va avec votre visage, comment l'entretenir entre deux passages."],
      faq: [["Faut-il prendre rendez-vous ?", "Ce n'est pas obligatoire, mais c'est plus sûr le samedi. La réservation en ligne prend moins d'une minute."], ["Quels moyens de paiement acceptez-vous ?", "Espèces et carte bancaire."], ["Coupez-vous les enfants ?", "Oui, dès 3 ans."]],
      avis: [["Karim B.", "Dégradé propre, toujours le même résultat. Je ne vais plus ailleurs."], ["Thomas L.", "Réservé le matin, coupé l'après-midi. Accueil au top."], ["Yanis M.", "Bonne ambiance et un vrai soin sur la barbe."]],
      fidelite: ["Votre 10e coupe est offerte", 10] },
    coiffure: { nom: "Salon de coiffure", icone: "seche", couleurs: ["#7A3E52", "#1B1E22", "#2F6B4F", "#0B63CE"], police: "elegant", objectif: "rdv",
      accroche: "Coupe, couleur et soins pour femmes, hommes et enfants.", atouts: [["Coupe, couleur, soins", "Pour les femmes, les hommes et les enfants."], ["Réservation en ligne", "24 h sur 24, en moins d'une minute."]],
      prestTitre: "Tarifs", prestIntro: "Shampoing compris pour toutes les coupes.",
      prest: [["Shampoing, coupe, brushing femme", "1 h", "38"], ["Coupe homme", "30 min", "22"], ["Couleur", "1 h 30", "dès 45"], ["Balayage", "2 h", "dès 65"], ["Brushing", "30 min", "22"], ["Coupe enfant", "20 min", "15"]],
      apropos: ["Le salon", "Nous prenons le temps de comprendre ce que vous voulez avant de commencer. Des conseils honnêtes, des produits choisis, et une coupe qui tient entre deux rendez-vous."],
      faq: [["Faites-vous un diagnostic avant une couleur ?", "Oui, toujours. Il est gratuit et prend quelques minutes."], ["Puis-je annuler un rendez-vous ?", "Oui, prévenez-nous la veille par téléphone."], ["Quels moyens de paiement acceptez-vous ?", "Espèces et carte bancaire."]],
      avis: [["Sarah K.", "Enfin une coiffeuse qui écoute. Le balayage est exactement ce que je voulais."], ["Julie M.", "Salon propre, accueil chaleureux, prix corrects."], ["Inès D.", "Ma fille et moi y allons depuis deux ans."]],
      fidelite: ["Un soin offert après 8 visites", 8] },
    institut: { nom: "Institut de beauté", icone: "miroir", couleurs: ["#7A3E52", "#2F6B4F", "#9C7A2E", "#1B1E22"], police: "elegant", objectif: "rdv",
      accroche: "Soins du visage, épilations, ongles et regard, dans un cadre calme.", atouts: [["Visage, ongles, regard", "Des soins choisis pour votre peau."], ["Réservation en ligne", "24 h sur 24, en moins d'une minute."]],
      prestTitre: "Soins et tarifs", prestIntro: "",
      prest: [["Soin du visage", "1 h", "45"], ["Épilation sourcils", "15 min", "10"], ["Vernis semi-permanent", "45 min", "30"], ["Manucure", "40 min", "25"], ["Épilation jambes complètes", "30 min", "28"], ["Rehaussement de cils", "1 h", "55"]],
      apropos: ["L'institut", "Un lieu pensé pour souffler. Chaque soin commence par quelques questions sur votre peau et vos envies, pour choisir les bons gestes et les bons produits."],
      faq: [["Combien de temps tient un semi-permanent ?", "Deux à trois semaines en général, selon vos ongles et vos activités."], ["Faut-il venir démaquillée ?", "Ce n'est pas nécessaire, nous nous en occupons."], ["Proposez-vous des cartes cadeaux ?", "Oui, pour tous les soins, en boutique."]],
      avis: [["Nadia B.", "Soin du visage très relaxant, peau toute douce en sortant."], ["Léa P.", "Travail précis sur les sourcils, je recommande."], ["Camille R.", "Accueil adorable et institut très propre."]],
      fidelite: ["Le 6e soin à moitié prix", 6] },
    boucherie: { nom: "Boucherie", icone: "couteau", couleurs: ["#8C1D2C", "#1B1E22", "#2F6B4F", "#9C7A2E"], police: "enseigne", objectif: "commande",
      accroche: "Viande choisie chez nos éleveurs, découpée devant vous.", atouts: [["Commande à l'avance", "Choisissez l'heure : elle vous attend."], ["Découpe à la demande", "Tranches, brochettes ou haché, comme vous voulez."]],
      prestTitre: "Nos viandes", prestIntro: "Prix au kilo. La découpe est faite à la demande.",
      prod: [["Côte de bœuf", "29,90", "le kg", "Bœuf"], ["Entrecôte", "32,90", "le kg", "Bœuf"], ["Viande hachée", "15,90", "le kg", "Bœuf"], ["Épaule d'agneau", "21,90", "le kg", "Agneau"], ["Merguez maison", "13,90", "le kg", "Agneau"], ["Cuisses de poulet", "7,90", "le kg", "Volaille"], ["Colis barbecue", "49", "le colis", "Colis"]],
      apropos: ["La boutique", "Dites-nous pour combien de personnes vous cuisinez : on vous conseille la bonne pièce, la bonne quantité et la cuisson qui va avec."],
      faq: [["Puis-je commander pour une date précise ?", "Oui : choisissez le jour et l'heure de retrait, la commande est prête à votre arrivée."], ["Faites-vous la découpe sur demande ?", "Oui, en tranches, en morceaux, en brochettes ou hachée, comme vous voulez."], ["Prenez-vous les grosses commandes ?", "Oui, pour les fêtes et les événements. Appelez-nous quelques jours avant."]],
      avis: [["Mehdi A.", "Viande toujours fraîche et bien découpée. Les merguez sont excellentes."], ["Sophie T.", "Commande prête à l'heure, rien à redire."], ["Rachid H.", "Bons conseils pour le barbecue, prix honnêtes."]],
      vitrine: [["Côte de bœuf", "29,90", "le kg", "Bœuf"], ["Entrecôte", "32,90", "le kg", "Bœuf"], ["Filet de bœuf", "42,90", "le kg", "Bœuf"], ["Pavé de rumsteck", "26,90", "le kg", "Bœuf"], ["Jarret de bœuf", "14,90", "le kg", "Bœuf"], ["Bœuf à braiser", "15,90", "le kg", "Bœuf"]],
      promo: ["Commandes de fête ouvertes", "Réservez vos colis et vos pièces à l'avance : tout sera prêt le jour J."] },
    snack: { nom: "Snack", icone: "burger", couleurs: ["#B4532A", "#1B1E22", "#8C1D2C", "#C08A1E"], police: "enseigne", objectif: "commande",
      accroche: "Tacos, burgers et assiettes. Sur place, à emporter ou à commander.", atouts: [["À emporter", "Commandez, choisissez l'heure : c'est prêt quand vous arrivez."], ["Fait minute", "Préparé à la commande."]],
      prestTitre: "La carte", prestIntro: "",
      prod: [["Tacos 1 viande", "7,50", "", "Tacos"], ["Tacos 2 viandes", "9,50", "", "Tacos"], ["Cheese burger", "6,90", "", "Burgers"], ["Double burger maison", "9,90", "", "Burgers"], ["Assiette poulet", "11", "", "Assiettes"], ["Frites", "3", "", "À côté"], ["Canette", "2", "", "Boissons"]],
      apropos: ["Le snack", "Des produits frais, de la viande marinée sur place et des frites coupées chaque matin. Simple, généreux, et prêt vite."],
      faq: [["Peut-on commander à l'avance ?", "Oui : composez votre commande, choisissez l'heure, elle est prête quand vous arrivez."], ["Y a-t-il des places assises ?", "Oui, quelques tables à l'intérieur."], ["Acceptez-vous la carte ?", "Oui, sans minimum."]],
      avis: [["Bilal S.", "Le meilleur tacos du coin, et servi rapidement."], ["Emma V.", "Commandé en ligne, prêt à l'heure, encore chaud."], ["Lucas G.", "Portions généreuses, prix corrects."]],
      fidelite: ["Le 10e menu est offert", 10] },
    restaurant: { nom: "Restaurant", icone: "couverts", couleurs: ["#2F6B4F", "#8C1D2C", "#1B1E22", "#9C7A2E"], police: "classique", objectif: "rdv",
      accroche: "Une cuisine de saison, faite maison, à deux pas du centre.", atouts: [["Fait maison", "Une carte courte, des produits de saison."], ["Réservation en ligne", "Votre table en quelques secondes."]],
      prestTitre: "La carte", prestIntro: "La carte change avec les saisons. Demandez la suggestion du jour.",
      prest: [["Velouté de saison", "Entrées", "7"], ["Œuf parfait, champignons", "Entrées", "9"], ["Poulet rôti, purée maison", "Plats", "17"], ["Poisson du marché", "Plats", "21"], ["Mousse au chocolat", "Desserts", "7"], ["Tarte du moment", "Desserts", "7"]],
      resa: [["Table pour 2", "90", ""], ["Table pour 4", "90", ""], ["Groupe, 6 personnes et plus", "120", ""]],
      apropos: ["La maison", "Une petite salle, une cuisine ouverte et des produits qui viennent de producteurs que nous connaissons. Ici, tout est préparé le jour même."],
      faq: [["Faut-il réserver ?", "C'est conseillé le vendredi et le samedi soir."], ["Avez-vous des plats végétariens ?", "Oui, au moins un plat chaque jour."], ["Accueillez-vous les groupes ?", "Oui, jusqu'à 20 personnes, sur réservation."]],
      avis: [["Claire F.", "Cuisine simple et très bonne, service attentionné."], ["Antoine B.", "Le poulet rôti vaut le détour."], ["Samia L.", "Belle découverte, on reviendra."]] },
    boulangerie: { nom: "Boulangerie", icone: "pain", couleurs: ["#9C6A2E", "#8C1D2C", "#2F6B4F", "#1B1E22"], police: "artisan", objectif: "commande",
      accroche: "Pains au levain, viennoiseries et pâtisseries, faits sur place chaque matin.", atouts: [["Réservez votre pain", "Commandez la veille, passez à l'heure choisie."], ["Cuit sur place", "Plusieurs fournées par jour."]],
      prestTitre: "Au comptoir", prestIntro: "",
      prod: [["Baguette tradition", "1,30", "", "Pains"], ["Pain au levain", "4,20", "", "Pains"], ["Croissant", "1,20", "", "Viennoiseries"], ["Pain au chocolat", "1,30", "", "Viennoiseries"], ["Flan pâtissier, la part", "2,90", "", "Pâtisseries"], ["Tarte aux fruits, 6 parts", "18", "", "Pâtisseries"]],
      apropos: ["Le fournil", "Nos pains lèvent lentement, cuisent sur la sole et sortent du four plusieurs fois par jour. Réservez vos commandes la veille pour être sûr de les avoir."],
      faq: [["Puis-je réserver mon pain ?", "Oui, commandez en ligne et passez le récupérer à l'heure choisie."], ["Faites-vous des gâteaux sur commande ?", "Oui, pour les anniversaires et les fêtes. Prévoyez 48 h."], ["Êtes-vous ouverts le dimanche ?", "Consultez nos horaires juste en dessous."]],
      avis: [["Paul R.", "La tradition est croustillante comme il faut."], ["Hanane Z.", "Les croissants du dimanche sont devenus un rituel."], ["Marc D.", "Gâteau d'anniversaire superbe et délicieux."]],
      fidelite: ["La 10e baguette est offerte", 10] },
    epicerie: { nom: "Épicerie", icone: "panier", couleurs: ["#2F6B4F", "#B4532A", "#1B1E22", "#0B63CE"], police: "artisan", objectif: "vitrine",
      accroche: "Produits frais, épicerie du monde et dépannage, tard le soir.", atouts: [["Épicerie de quartier", "L'essentiel, et ce qu'on ne trouve pas ailleurs."], ["Au détail", "Épices, thé et café, à la quantité voulue."]],
      prestTitre: "Dans nos rayons", prestIntro: "Quelques produits du moment. Il y en a bien d'autres en boutique.",
      prod: [["Fruits et légumes de saison", "", "", "Frais"], ["Épices au détail", "dès 2", "", "Épicerie"], ["Thé et café", "dès 3,50", "", "Épicerie"], ["Produits laitiers", "", "", "Frais"]],
      apropos: ["L'épicerie", "Une épicerie de quartier où l'on trouve l'essentiel, et quelques produits qu'on ne trouve pas ailleurs. Demandez-nous si vous cherchez quelque chose."],
      faq: [["Livrez-vous ?", "Pour les commandes importantes, appelez-nous."], ["Acceptez-vous la carte ?", "Oui, dès 5 € d'achat."], ["Pouvez-vous commander un produit ?", "Oui, demandez au comptoir."]],
      avis: [["Fatou N.", "On trouve de tout et l'accueil est toujours souriant."], ["Kevin P.", "Pratique, ouvert tard, bons produits."], ["Amel S.", "Les épices sont excellentes."]] },
    fleuriste: { nom: "Fleuriste", icone: "fleur", couleurs: ["#7A3E52", "#2F6B4F", "#B4532A", "#1B1E22"], police: "elegant", objectif: "commande",
      accroche: "Bouquets de saison, compositions et plantes, à emporter ou à commander.", atouts: [["Bouquets du jour", "Composés le matin même."], ["Commande à l'avance", "Pour une date, une fête, un cadeau."]],
      prestTitre: "Bouquets", prestIntro: "Chaque bouquet est composé le jour même avec les fleurs de la semaine.",
      prod: [["Bouquet du moment", "25", "", "Bouquets"], ["Bouquet généreux", "40", "", "Bouquets"], ["Plante verte", "dès 15", "", "Plantes"], ["Composition sur mesure", "sur devis", "", "Événements"]],
      apropos: ["L'atelier", "Des fleurs choisies au marché, des bouquets composés à la main et des conseils pour qu'ils durent. Dites-nous l'occasion, on s'occupe du reste."],
      faq: [["Livrez-vous ?", "Oui, dans le centre-ville, sur demande."], ["Puis-je commander pour une date précise ?", "Oui, choisissez le jour et l'heure de retrait."], ["Faites-vous les mariages ?", "Oui, prenez rendez-vous pour en parler."]],
      avis: [["Élodie M.", "Bouquet magnifique, exactement l'esprit demandé."], ["Hugo L.", "Conseils parfaits pour une première commande."], ["Rania K.", "Fleurs fraîches qui tiennent longtemps."]] },
    autre: { nom: "Autre activité", icone: "boutique", couleurs: ["#0B63CE", "#1B1E22", "#2F6B4F", "#8C1D2C"], police: "moderne", objectif: "vitrine",
      accroche: "Votre activité, expliquée simplement, avec les infos utiles au bon endroit.", atouts: [["Votre point fort", "Une phrase pour l'expliquer."], ["Votre second atout", "Une phrase pour l'expliquer."]],
      prestTitre: "Nos services", prestIntro: "",
      prest: [["Votre premier service", "Une phrase pour l'expliquer", "20"], ["Votre deuxième service", "Une phrase pour l'expliquer", "35"], ["Sur mesure", "Parlons-en", "sur devis"]],
      apropos: ["Qui sommes-nous", "Présentez-vous en quelques lignes : depuis quand vous existez, ce que vous faites de mieux, et pourquoi on vient chez vous."],
      faq: [["Comment vous contacter ?", "Par téléphone ou avec le formulaire en bas de page."], ["Où êtes-vous situé ?", "Notre adresse est juste en dessous."], ["Quels moyens de paiement acceptez-vous ?", "Espèces et carte bancaire."]],
      avis: [["Client 1", "Remplacez ce texte par un vrai avis client."], ["Client 2", "Remplacez ce texte par un vrai avis client."], ["Client 3", "Remplacez ce texte par un vrai avis client."]] }
  };
  var ORDRE_METIERS = ["barbier", "coiffure", "institut", "boucherie", "snack", "restaurant", "boulangerie", "epicerie", "fleuriste", "autre"];

  /* ===================== Thème ===================== */
  var POLICES = {
    moderne: { nom: "Moderne", titre: "'Poppins', system-ui, sans-serif", poids: 700, esp: "-0.02em", espG: "-0.035em", casse: "none", large: "normal", fichier: "../assets/poppins-latin-700-normal.woff2", famille: "Poppins" },
    elegant: { nom: "Élégant", titre: "'Fraunces', Georgia, serif", poids: 560, esp: "-0.015em", espG: "-0.03em", casse: "none", large: "normal", fichier: "polices/fraunces-latin-wght-normal.woff2", famille: "Fraunces" },
    enseigne: { nom: "Enseigne", titre: "'Archivo', 'Arial Narrow', sans-serif", poids: 800, esp: "0", espG: "-0.01em", casse: "uppercase", large: "72%", fichier: "polices/archivo-latin-wdth-normal.woff2", famille: "Archivo" },
    classique: { nom: "Classique", titre: "'DM Serif Display', Georgia, serif", poids: 400, esp: "-0.005em", espG: "-0.02em", casse: "none", large: "normal", fichier: "polices/dm-serif-display-latin-400-normal.woff2", famille: "DM Serif Display" },
    artisan: { nom: "Artisan", titre: "'Bricolage Grotesque', system-ui, sans-serif", poids: 720, esp: "-0.03em", espG: "-0.045em", casse: "none", large: "normal", fichier: "polices/bricolage-grotesque-latin-wght-normal.woff2", famille: "Bricolage Grotesque" },
    simple: { nom: "Simple", titre: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", poids: 700, esp: "-0.015em", espG: "-0.035em", casse: "none", large: "normal", fichier: null, famille: null }
  };
  var FONDS = {
    clair: { nom: "Blanc", fond: "#FFFFFF", fond2: "#F5F5F7", encre: "#1D1D1F", encre2: "#6E6E73", ligne: "#E3E3E6", sombre: false },
    creme: { nom: "Crème", fond: "#FBF8F2", fond2: "#F3EEE4", encre: "#211C17", encre2: "#6B6258", ligne: "#E6DFD2", sombre: false },
    gris: { nom: "Gris clair", fond: "#F2F2F4", fond2: "#FFFFFF", encre: "#1D1D1F", encre2: "#6E6E73", ligne: "#DCDCE0", sombre: false },
    sombre: { nom: "Sombre", fond: "#0E0F11", fond2: "#1A1B1E", encre: "#F5F5F7", encre2: "#A1A1A6", ligne: "#2A2B2F", sombre: true }
  };
  var RAYONS = { carre: { nom: "Carrés", r: "3px", b: "3px", g: "4px" }, doux: { nom: "Arrondis", r: "16px", b: "12px", g: "24px" }, rond: { nom: "Très ronds", r: "24px", b: "999px", g: "32px" } };

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
      "--c1": c, "--c1-txt": surC, "--c1-ink": encrePour(c, F.fond), "--c1-doux": melange(F.sombre ? F.fond2 : (F.fond2 === "#FFFFFF" ? F.fond : F.fond2), c, F.sombre ? .14 : .07), "--c1-ink-c": encrePour(c, "#FFFFFF"), "--c1-ink-s": encrePour(c, "#0E0F11"), "--cs": contraste(c, "#0E0F11") < 2.2 ? "#FFFFFF" : c, "--cs-txt": contraste(c, "#0E0F11") < 2.2 ? "#111111" : surC,
      "--fond": F.fond, "--fond-2": F.fond2, "--encre": F.encre, "--encre-2": F.encre2, "--ligne": F.ligne,
      "--r": R.r, "--rb": R.b, "--rg": R.g, "--f-titre": P.titre, "--t-poids": P.poids, "--t-esp": P.esp, "--t-esp-g": P.espG, "--t-casse": P.casse, "--t-large": P.large
    };
    return Object.keys(v).map(function (k) { return k + ":" + v[k]; }).join(";");
  }

  /* ===================== Photos d'illustration (libres de droits, Pexels) ===================== */
  /* Identifiant : "px:<dossier>/<numéro>". Le fichier est photos/<dossier>/<numéro>.webp (et -m.webp, plus léger). */
  var PX = {
    barbier: { heros: "barbier/7518736", apropos: "barbier/2061820", bento: ["barbier/33448216", "barbier/37764947"], galerie: ["barbier/12464838", "barbier/1319459", "barbier/4625626", "barbier/3998414", "barbier/9146943", "barbier/7447145"], appel: "barbier/1319459" },
    coiffure: { heros: "coiffure/7195805", apropos: "coiffure/3993320", bento: ["coiffure/10028673", "coiffure/8468134"], galerie: ["coiffure/3356170", "coiffure/6487888", "coiffure/3993462", "coiffure/7195812", "coiffure/10028673", "coiffure/8468134"], appel: "coiffure/7195812" },
    institut: { heros: "institut/13068377", apropos: "institut/31261686", bento: ["institut/4677851", "institut/5368635"], galerie: ["institut/4677851", "institut/14267564", "institut/33607393", "institut/5368635", "institut/31261686", "institut/13068377"], appel: "institut/13068377" },
    boucherie: { heros: "boucherie/33157191", apropos: "boucherie/8112382", bento: ["boucherie/12884547", "boucherie/5313880"], galerie: ["boucherie/15508161", "boucherie/20187071", "boucherie/65175", "boucherie/7741801", "boucherie/29095929", "boucherie/6896518"], appel: "boucherie/11898916" },
    snack: { heros: "burger/22119668", apropos: "kebab/24981551", bento: ["kebab/10572741", "burger/2271107"], galerie: ["burger/1556688", "kebab/15202777", "kebab/7542730", "burger/3219547", "kebab/34106235", "burger/9011742"], appel: "kebab/10572741" },
    restaurant: { heros: "restaurant/31517300", apropos: "restaurant/3633990", bento: ["restaurant/30457524", "restaurant/19393192"], galerie: ["restaurant/3534750", "restaurant/36138108", "restaurant/18447739", "restaurant/30457524", "restaurant/19393192", "restaurant/3633990"], appel: "restaurant/3534750" },
    boulangerie: { heros: "boulangerie/10481790", apropos: "boulangerie/35993723", bento: ["boulangerie/8633662", "boulangerie/30403209"], galerie: ["boulangerie/1383908", "boulangerie/14520462", "boulangerie/3141268", "boulangerie/7543099", "boulangerie/29380155", "boulangerie/3789032"], appel: "boulangerie/29380155" },
    epicerie: { heros: "epicerie/5332494", apropos: "epicerie/8250271", bento: ["epicerie/33975355", "epicerie/5336705"], galerie: ["epicerie/5332489", "epicerie/33975355", "epicerie/2386150", "epicerie/5336705", "epicerie/9415582", "epicerie/8250271"], appel: "epicerie/5332489" },
    fleuriste: { heros: "fleuriste/39147652", apropos: "fleuriste/5409707", bento: ["fleuriste/38668048", "fleuriste/5414056"], galerie: ["fleuriste/17403112", "fleuriste/25945747", "fleuriste/5414331", "fleuriste/18393677", "fleuriste/38668048", "fleuriste/5414056"], appel: "fleuriste/39147652" }
  };
  var PX_PROD = {
    "Côte de bœuf": "boucherie/11898916", "Entrecôte": "boucherie/29095929", "Pavé de rumsteck": "boucherie/618775", "Jarret de bœuf": "boucherie/7741801", "Filet de bœuf": "boucherie/4661802", "Bœuf à braiser": "boucherie/28881689",
    "Cheese burger": "burger/30500761", "Double burger maison": "burger/1556688", "Burger classique": "burger/30500761", "Double burger": "burger/22119668", "Menu burger, frites et boisson": "burger/1556688",
    "Tacos 1 viande": "kebab/34106235", "Tacos 2 viandes": "kebab/15202777", "Tacos deux viandes": "kebab/34106235", "Assiette poulet": "kebab/7542730",
    "Sandwich kebab": "kebab/38337105", "Galette kebab": "kebab/18330009", "Assiette kebab": "turc/31661077", "Assiette brochettes": "turc/7439809", "Assiette mixte": "turc/15390671", "Menu sandwich, frites et boisson": "kebab/15202777",
    "Cheese naan": "naan/10337726", "Naan nature": "naan/1117862", "Naan à l'ail et aux herbes": "naan/38163958",
    "Baguette tradition": "boulangerie/3789032", "Pain au levain": "boulangerie/8633662", "Croissant": "boulangerie/30403209",
    "Fruits et légumes de saison": "epicerie/33975355", "Épices au détail": "epicerie/5336705",
    "Bouquet du moment": "fleuriste/17403112", "Bouquet généreux": "fleuriste/5414331", "Composition sur mesure": "fleuriste/5414056"
  };
  var PHOTOS_IDX = null;
  function photoInfo(id) {
    if (!id || String(id).indexOf("px:") !== 0) return null;
    if (!PHOTOS_IDX) { PHOTOS_IDX = {}; var L = w.PHOTOS || {}; Object.keys(L).forEach(function (cat) { L[cat].forEach(function (p) { PHOTOS_IDX[cat + "/" + p.id] = { cat: cat, id: p.id, w: p.w, h: p.h, c: p.c, alt: p.alt, src: p.src }; }); }); }
    return PHOTOS_IDX[id.slice(3)] || null;
  }
  function urlPhoto(id, t, base) { return (base == null ? Blocs.PHOTOS_BASE : base) + String(id).slice(3) + (t === "m" ? "-m" : "") + ".webp"; }
  function px(c, cle, i) { var d = PX[c.metier]; if (!d || !d[cle]) return null; var v = d[cle]; if (Array.isArray(v)) v = v[i || 0]; return v ? "px:" + v : null; }
  function pxListe(c, cle, n) { var d = PX[c.metier], r = []; for (var i = 0; i < n; i++) r.push(d && d[cle] && d[cle][i] ? "px:" + d[cle][i] : null); return r; }
  function pxProd(nom) { return PX_PROD[nom] ? "px:" + PX_PROD[nom] : null; }

  /* ===================== Petits outils de rendu ===================== */
  function T(c, tag, k, val, cls, ph, attrs) {
    if (!c.edition && !String(val || "").trim()) return "";
    return "<" + tag + (cls ? ' class="' + cls + '"' : "") + (c.edition ? ' data-k="' + k + '" data-ph="' + e(ph || "") + '"' : "") + (attrs || "") + ">" + e(val || "") + "</" + tag + ">";
  }
  /* Titres en deux tons : la première phrase en noir, la suite en gris. « Tarifs. Sans surprise. » */
  function deuxTons(v) { v = String(v || ""); var m = /^([\s\S]+?[.!?:])\s+(\S[\s\S]*)$/.exec(v); return m ? e(m[1]) + ' <span class="s-gris">' + e(m[2]) + "</span>" : e(v); }
  function H2(c, k, val, cls, ph, tag) {
    tag = tag || "h2";
    if (!c.edition && !String(val || "").trim()) return "";
    return "<" + tag + ' class="' + (cls || "s-h2") + '"' + (c.edition ? ' data-k="' + k + '" data-ph="' + e(ph || "") + '"' : "") + ">" + deuxTons(val) + "</" + tag + ">";
  }
  function IMG(c, k, id, o) {
    o = o || {};
    var src = id && c.media(id), cls = o.cls || "";
    if (src) {
      var inf = photoInfo(id), sm = inf ? c.media(id, "m") : null, alt = o.alt != null ? o.alt : (inf ? inf.alt : ""), ss = "";
      if (inf) c._px = (c._px || 0) + 1;
      if (inf && sm && sm !== src) { var r = Math.min(1, 1600 / Math.max(inf.w, inf.h)); ss = ' srcset="' + sm + " " + Math.min(760, inf.w) + "w, " + src + " " + Math.round(inf.w * r) + 'w" sizes="' + (o.tailles || "100vw") + '"'; }
      return '<img class="' + cls + '" src="' + src + '"' + ss + ' alt="' + e(alt) + '"' + (inf ? ' style="background-color:' + inf.c + '"' : "") + (c.edition ? ' data-img="' + k + '"' : o.prio ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"') + ">";
    }
    if (!c.edition && o.vide) return '<div class="' + o.vide + '" role="presentation">' + (o.videTxt ? '<span class="s-prod-mot">' + e(o.videTxt) + "</span>" : icone(o.ico || c.M.icone, "s-ph-ic")) + "</div>";
    return '<div class="s-ph ' + cls + '"' + (c.edition ? ' data-img="' + k + '"' : "") + ' role="presentation">' + icone(o.ico || c.M.icone, "s-ph-ic") + (c.edition ? "<span>Ajouter une photo</span>" : "") + "</div>";
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
  function FLECHES() { return '<div class="s-fleches"><button type="button" class="s-fleche" data-prec aria-label="Précédent"></button><button type="button" class="s-fleche" data-suiv aria-label="Suivant"></button></div>'; }
  function titreSec(c, d, ph, extra) {
    var t = H2(c, "titre", d.titre, "s-h2", ph || "Titre de la section") + T(c, "p", "intro", d.intro, "s-lead s-pre", "Une phrase d'introduction (facultatif)");
    if (!t && !extra) return "";
    return '<div class="s-tete"><div>' + t + "</div>" + (extra || "") + "</div>";
  }
  function SEG(noms) {
    return '<div class="s-seg" role="tablist" aria-label="Catégories" data-seg><button type="button" role="tab" aria-selected="true" data-g="">Tout</button>' +
      noms.map(function (n) { return '<button type="button" role="tab" aria-selected="false" data-g="' + e(n) + '">' + e(n) + "</button>"; }).join("") + '<span class="s-seg-pouce" aria-hidden="true"></span></div>';
  }
  function adresse(P) { var i = P.infos; return [i.adresse, [i.cp, i.ville].filter(Boolean).join(" ")].filter(Boolean).join(", "); }
  function etoiles(n) { var s = ""; for (var i = 0; i < 5; i++) s += '<svg viewBox="0 0 24 24" class="' + (i < n ? "on" : "") + '" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>'; return '<span class="s-etoiles" role="img" aria-label="' + n + ' sur 5">' + s + "</span>"; }
  /* Étoiles remplies au dixième près : 4,6 n'affiche pas 5 étoiles pleines. */
  function etoilesP(note) {
    var n = Math.max(0, Math.min(5, note || 0)), s = "", t = "";
    for (var i = 0; i < 5; i++) { s += '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>'; t += s.slice(s.lastIndexOf("<svg")).replace("<svg ", '<svg class="on" '); }
    return '<span class="s-etoiles s-etoiles--p" role="img" aria-label="' + String(n).replace(".", ",") + ' sur 5"><span class="s-et-f">' + s + '</span><span class="s-et-p" style="width:' + Math.round(n / 5 * 100) + '%">' + t + "</span></span>";
  }
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
  function prixSeul(s) { return K.prix(s); }
  var SOUS = { barbier: "Coupe, barbe, rasage.", coiffure: "Pour toute la famille.", institut: "Prenez le temps.", boucherie: "Choisies avec soin.", snack: "Tout est préparé minute.", restaurant: "Selon la saison.", boulangerie: "Tout juste sorti du four.", epicerie: "Et bien d'autres en boutique.", fleuriste: "Composés le jour même." };
  function titreDeux(a, b) { return b ? a + ". " + b : a; }

  /* ===================== Les sections ===================== */
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
      variantes: [["cinema", "Photo plein cadre"], ["photo", "Photo en fond"], ["partage", "Texte et photo"], ["aplat", "Aplat de couleur"], ["enseigne", "Façon enseigne"]],
      champs: [{ k: "sur", type: "texte", label: "Petite ligne au-dessus", ph: "Laissez vide : métier et ville" }, { k: "titre", type: "texte", label: "Titre", ph: "Laissez vide : nom du commerce" }, { k: "texte", type: "long", label: "Phrase d'accroche" }, { k: "b1", type: "bouton", label: "Bouton principal" }, { k: "b2", type: "bouton", label: "Second bouton" }, { k: "img", type: "image", label: "Photo" }, { k: "statut", type: "inter", label: "Afficher « ouvert maintenant »" }],
      defaut: function (c) { var o = c.M.objectif; return { sur: "", titre: "", texte: c.M.accroche, b1: { t: o === "rdv" ? (c.metier === "restaurant" ? "Réserver une table" : "Prendre rendez-vous") : o === "commande" ? "Commander" : "Nous appeler", a: o === "rdv" ? "resa" : o === "commande" ? "cmd" : "tel" }, b2: { t: c.M.prod && !c.M.prest ? "Voir les produits" : "Voir les tarifs", a: "prest" }, img: px(c, "heros"), statut: true }; },
      rendu: function (s, c) {
        var d = s.d, i = c.P.infos, sur = d.sur || (c.M.nom + (i.ville ? " à " + i.ville : "")), titre = d.titre || i.nom || "Votre commerce", cine = s.v === "cinema";
        var statut = d.statut ? '<p class="s-statut" data-statut><i></i><span></span></p>' : "";
        var txt = '<div class="s-heros-txt">' +
          (c.edition ? '<p class="s-sur" data-auto data-k="sur" data-ph="' + e(sur) + '">' + e(d.sur) + "</p>" : '<p class="s-sur">' + e(sur) + "</p>") +
          (c.edition ? '<h1 class="s-h1" data-auto data-k="titre" data-ph="' + e(titre) + '">' + e(d.titre) + "</h1>" : '<h1 class="s-h1">' + e(titre) + "</h1>") +
          T(c, "p", "texte", d.texte, "s-heros-p s-pre", "Une phrase qui dit ce que vous faites") +
          '<div class="s-act">' + BTN(c, "b1", d.b1) + BTN(c, "b2", d.b2, cine ? "s-btn--chev" : "s-btn--2") + "</div>" + (cine ? "" : statut) + "</div>";
        var img = function (cls) { return IMG(c, "img", d.img, { cls: cls || "s-heros-img", prio: true, tailles: cls ? "(min-width: 760px) 50vw, 100vw" : "100vw" }); };
        if (cine) {
          var rue = [i.adresse, i.ville].filter(Boolean).join(", ");
          var verre = statut + (rue ? '<a href="' + e(lien(c, "itin")) + '" target="_blank" rel="noopener">' + icone("epingle") + "<span>" + e(rue) + "</span></a>" : "") + (i.tel ? '<a href="' + e(lien(c, "tel")) + '">' + icone("tel") + "<span>" + e(i.tel) + "</span></a>" : "");
          return '<div class="s-heros-fond">' + img() + '</div><div class="s-in s-cine">' + txt + "</div>" + (verre ? '<div class="s-in s-cine-bas"><div class="s-verre">' + verre + "</div></div>" : "");
        }
        if (s.v === "photo") return '<div class="s-heros-fond">' + img() + '</div><div class="s-in">' + txt + "</div>";
        if (s.v === "partage" && !c.edition && !(d.img && c.media(d.img))) return '<div class="s-in">' + txt + "</div>";
        if (s.v === "partage") return '<div class="s-in s-heros-grille">' + txt + '<div class="s-heros-media">' + img("s-heros-img") + "</div></div>";
        if (s.v === "enseigne") return '<div class="s-in"><div class="s-enseigne">' + txt + "</div></div>";
        return '<div class="s-in">' + txt + "</div>";
      }
    },
    bento: {
      nom: "En bref", cat: "presenter", desc: "L'essentiel en un coup d'œil : photos, note, horaires du jour, adresse.", ancre: "",
      variantes: [["tuiles", "Tuiles"]],
      champs: [{ k: "titre", type: "texte", label: "Titre (facultatif)" }, { k: "img", type: "image", label: "Grande photo" }, { k: "note", type: "texte", label: "Votre note Google", ph: "4,8" }, { k: "avis", type: "texte", label: "Sous la note", ph: "213 avis Google" }, { k: "lienAvis", type: "texte", label: "Lien vers vos avis (facultatif)", ph: "https://g.page/…" },
        { k: "a1t", type: "texte", label: "Premier atout" }, { k: "a1x", type: "texte", label: "Son explication" }, { k: "a2t", type: "texte", label: "Second atout" }, { k: "a2x", type: "texte", label: "Son explication" }, { k: "img2", type: "image", label: "Seconde photo" },
        { k: "note2", type: "note", texte: "N'indiquez que votre vraie note Google. Sans note, la tuile propose d'appeler." }],
      defaut: function (c) { var a = c.M.atouts || [["", ""], ["", ""]]; return { titre: "", img: px(c, "bento", 0), img2: px(c, "bento", 1), note: "", avis: "", lienAvis: "", a1t: a[0][0], a1x: a[0][1], a2t: a[1][0], a2x: a[1][1] }; },
      rendu: function (s, c) {
        var d = s.d, i = c.P.infos, t = [], n = 0, tuile = function (cls, corps, tag, attrs) { tag = tag || "div"; t.push("<" + tag + ' class="s-tuile ' + cls + '" style="--i:' + (n++) + '"' + (attrs || "") + ">" + corps + "</" + tag + ">"); };
        var aImg = function (id) { return c.edition || !!(id && c.media(id)); };
        if (aImg(d.img)) tuile("s-tuile--photo", IMG(c, "img", d.img, { tailles: "(min-width: 760px) 50vw, 100vw" }));
        var note = K.num(d.note);
        if (String(d.note || "").trim() || c.edition) {
          var lk = String(d.lienAvis || "").trim();
          tuile("s-tuile--note", '<p class="s-tuile-l">Note Google</p><div>' + (c.edition ? '<p class="s-gros" data-k="note" data-ph="4,8">' + e(d.note) + "</p>" : '<p class="s-gros">' + e(d.note) + "</p>") + etoilesP(note) + T(c, "p", "avis", d.avis, "s-tuile-x", "213 avis Google") + "</div>",
            lk && !c.edition ? "a" : "div", lk && !c.edition ? ' href="' + e(lien(c, "url:" + lk)) + '" target="_blank" rel="noopener"' : "");
        } else if (i.tel) {
          tuile("", '<p class="s-tuile-l">' + icone("tel") + 'Une question ?</p><div><p class="s-moyen">Appelez-nous</p><p class="s-tuile-x">' + e(i.tel) + "</p></div>", "a", ' href="' + e(lien(c, "tel")) + '"');
        } else {
          tuile("", '<p class="s-tuile-l">' + icone(c.M.icone) + e(c.M.nom) + '</p><p class="s-moyen">' + e(i.ville || i.nom || "") + "</p>");
        }
        tuile("", '<p class="s-tuile-l">' + icone("horloge") + "Aujourd'hui</p><div><p class=\"s-moyen\" data-auj>&nbsp;</p><p class=\"s-statut\" data-statut><i></i><span></span></p></div>");
        tuile("s-tuile--l", T(c, "p", "a1t", d.a1t, "s-moyen", "Votre point fort") + T(c, "p", "a1x", d.a1x, "s-tuile-x", "Une phrase pour l'expliquer"));
        tuile("", T(c, "p", "a2t", d.a2t, "s-moyen", "Un autre atout") + T(c, "p", "a2x", d.a2x, "s-tuile-x", "Une phrase"));
        if (aImg(d.img2)) tuile("s-tuile--photo2", IMG(c, "img2", d.img2, { tailles: "(min-width: 760px) 50vw, 100vw" }));
        var rue = i.adresse || "", ville = [i.cp, i.ville].filter(Boolean).join(" ");
        tuile("s-tuile--adr", '<i class="s-tuile-map" aria-hidden="true"></i><p class="s-tuile-l">' + icone("epingle") + "Adresse</p><div><p class=\"s-moyen\">" + e(rue || ville || "Votre adresse") + "</p>" + (rue && ville ? '<p class="s-tuile-x">' + e(ville) + "</p>" : "") + '</div><span class="s-btn s-btn--chev">Itinéraire</span>', "a", ' href="' + e(lien(c, "itin")) + '" target="_blank" rel="noopener"');
        return '<div class="s-in">' + titreSec(c, d, "Titre (facultatif)") + '<div class="s-bento">' + t.join("") + "</div></div>";
      }
    },
    prestations: {
      nom: "Tarifs et prestations", cat: "vendre", desc: "Vos prestations ou votre carte, avec les prix.", ancre: "Tarifs",
      variantes: [["liste", "Liste"], ["cartes", "Cartes"], ["ardoise", "Ardoise"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Introduction" }, { k: "items", type: "liste", label: "Prestations", ajout: "Ajouter une ligne", titre: "nom", champs: [{ k: "nom", type: "texte", label: "Nom" }, { k: "detail", type: "texte", label: "Détail (durée, description)" }, { k: "prix", type: "texte", label: "Prix", ph: "18, dès 45, sur devis" }, { k: "groupe", type: "texte", label: "Catégorie (facultatif)", ph: "Entrées, Plats…" }] }, { k: "note", type: "note", texte: "Avec plusieurs catégories, vos clients peuvent filtrer d'une touche." }],
      defaut: function (c) {
        var src = c.M.prest || (c.M.prod || []).map(function (p) { return [p[0], p[2] ? "Prix " + p[2] : "", p[1], p[3]]; });
        var items = src.map(function (p) { return { nom: p[0], detail: c.metier === "restaurant" ? "" : p[1], prix: p[2], groupe: c.metier === "restaurant" ? p[1] : (p[3] || "") }; });
        return { titre: titreDeux(c.M.prestTitre, SOUS[c.metier]), intro: c.M.prestIntro, items: items };
      },
      rendu: function (s, c) {
        var d = s.d, gs = groupes(d.items || [], "groupe"), seg = !c.edition && gs.length > 1 && gs.every(function (g) { return g.nom; }) ? SEG(gs.map(function (g) { return g.nom; })) : "";
        var h = '<div class="s-in">' + titreSec(c, d) + seg + '<div class="s-prest">';
        gs.forEach(function (g) {
          h += '<div class="s-prest-g" data-g="' + e(g.nom) + '">' + (g.nom ? '<h3 class="s-h3">' + e(g.nom) + "</h3>" : "") + '<ul class="s-prest-l">';
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
      variantes: [["grille", "Grille"], ["vitrine", "Étiquettes de boucher"], ["rangee", "Rangée qui défile"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Introduction" }, { k: "items", type: "liste", label: "Produits", ajout: "Ajouter un produit", titre: "nom", champs: [{ k: "nom", type: "texte", label: "Nom" }, { k: "prix", type: "texte", label: "Prix" }, { k: "unite", type: "texte", label: "Unité", ph: "le kg, la pièce…" }, { k: "badge", type: "texte", label: "Étiquette", ph: "Nouveau, Fait maison…" }, { k: "groupe", type: "texte", label: "Catégorie (facultatif)", ph: "Bœuf, Agneau…" }, { k: "img", type: "image", label: "Photo" }] }, { k: "b", type: "bouton", label: "Bouton sous les produits" }],
      defaut: function (c) {
        var src = c.M.vitrine || c.M.prod || (c.M.prest || []).map(function (p) { return [p[0], p[2], "", ""]; });
        return { titre: c.M.prod ? titreDeux(c.M.prestTitre, SOUS[c.metier]) : "À découvrir", intro: "", items: src.slice(0, 6).map(function (p, i) { return { nom: p[0], prix: p[1], unite: p[2], badge: i === 0 ? "Le plus demandé" : "", groupe: p[3] || "", img: pxProd(p[0]) }; }), b: { t: c.M.objectif === "commande" ? "Commander" : "", a: "cmd" } };
      },
      rendu: function (s, c) {
        var d = s.d, items = d.items || [], vit = s.v === "vitrine", rang = s.v === "rangee";
        var noms = [], vus = {}; items.forEach(function (it) { var g = (it.groupe || "").trim(); if (g && !vus[g]) { vus[g] = 1; noms.push(g); } });
        var seg = !c.edition && !rang && noms.length > 1 && items.every(function (it) { return (it.groupe || "").trim(); }) ? SEG(noms) : "";
        var h = '<div class="s-in">' + titreSec(c, d, null, rang && !c.edition ? FLECHES() : "") + seg + '<ul class="s-prod"' + (rang ? " data-defile" : "") + ">";
        items.forEach(function (it, i) {
          var k = "items." + i + ".", prix = c.edition ? e(it.prix) : e(K.prix(it.prix));
          var pique = vit ? '<p class="s-pique"><small>' + e(it.nom) + "</small><b>" + (prix || "—") + "</b>" + (it.unite ? "<i>" + e(it.unite) + "</i>" : "") + "</p>" : "";
          h += '<li class="s-prod-i"' + ((it.groupe || "").trim() ? ' data-g="' + e(it.groupe.trim()) + '"' : "") + '><div class="s-prod-m">' + IMG(c, k + "img", it.img, { cls: "s-prod-img", alt: it.nom, tailles: "(min-width: 900px) 25vw, 50vw", vide: "s-prod-vide", videTxt: vit ? "" : it.nom }) + (it.badge ? '<span class="s-badge">' + e(it.badge) + "</span>" : "") + pique + '</div><div class="s-prod-t">' + T(c, "p", k + "nom", it.nom, "s-prod-nom", "Nom du produit") + '<p class="s-prod-p">' + (c.edition ? '<b data-k="' + k + 'prix" data-ph="Prix">' + e(it.prix) + "</b>" : "<b>" + prix + "</b>") + (it.unite ? " <small>" + e(it.unite) + "</small>" : "") + "</p></div></li>";
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
        return { titre: c.metier === "restaurant" ? "Réservez votre table. En quelques secondes." : "Réservez en ligne. En moins d'une minute.", intro: "Choisissez, c'est noté. La confirmation s'affiche tout de suite.", pas: "30", items: src.map(function (p) { return { nom: p[0], duree: +p[1] || 30, prix: p[2] }; }) };
      },
      rendu: function (s, c) {
        var d = s.d, h = '<div class="s-in">' + titreSec(c, d) + '<div class="s-resa" data-resa data-pas="' + e(d.pas || 30) + '"><div class="s-resa-etape"><div class="s-resa-g"><div class="s-resa-col"><p class="s-resa-q">Prestation</p><div class="s-services" role="radiogroup">';
        (d.items || []).forEach(function (it) {
          h += '<button type="button" role="radio" class="s-service" data-nom="' + e(it.nom) + '" data-duree="' + e(it.duree) + '" data-prix="' + e(it.prix) + '"><span>' + e(it.nom) + "</span><small>" + e([it.duree ? (it.duree >= 60 ? K.fmt(it.duree / 60).replace(/h$/, " h") : it.duree + " min") : "", K.prix(it.prix)].filter(Boolean).join(" · ")) + "</small></button>";
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
        return { titre: "Commandez à l'avance. Retirez sans attendre.", intro: "Composez votre commande, choisissez l'heure : elle vous attend. Vous payez sur place.", items: src.filter(function (p) { return K.num(p[1]) != null && !/dès|devis/i.test(p[1]); }).slice(0, 6).map(function (p) { return { nom: p[0], prix: p[1], unite: p[2] }; }) };
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
        return '<div class="s-in"><div class="s-promo-boite"><div class="s-promo-t">' + H2(c, "titre", d.titre, "s-h2", "Titre de l'offre") + T(c, "p", "texte", d.texte, "s-lead s-pre", "Ce que vous proposez") + '<div class="s-act">' + BTN(c, "b", d.b) + '</div></div><div class="s-cpt" data-compte="' + e(d.fin) + '" role="timer">' + u("j", "jours") + u("h", "heures") + u("m", "minutes") + u("s", "secondes") + '<p class="s-cpt-fin">Offre terminée</p></div></div></div>';
      }
    },
    fidelite: {
      nom: "Carte de fidélité", cat: "vendre", desc: "Montrez votre carte : la dixième est offerte.",
      variantes: [["carte", "Carte à tampons"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "texte", type: "long", label: "Texte" }, { k: "nb", type: "nombre", label: "Nombre de tampons", min: 4, max: 12, pas: 1, suffixe: "" }],
      defaut: function (c) { var f = c.M.fidelite || ["Votre 10e passage est offert", 10]; return { titre: f[0] + ".", texte: "Un tampon à chaque passage, demandez votre carte en caisse.", nb: f[1] }; },
      rendu: function (s, c) {
        var d = s.d, n = Math.max(4, Math.min(12, +d.nb || 10)), t = "";
        for (var i = 1; i <= n; i++) t += '<span class="s-tampon' + (i === n ? " s-tampon--fin" : "") + '" style="--i:' + i + '">' + (i === n ? "Offert" : i <= 3 ? icone(c.M.icone, "s-tampon-ic") : "") + "</span>";
        return '<div class="s-in s-fid-g"><div class="s-fid-t">' + H2(c, "titre", d.titre, "s-h2", "Titre") + T(c, "p", "texte", d.texte, "s-lead s-pre", "Comment ça marche") + '</div><div class="s-fid-carte" style="--n:' + n + '"><p class="s-fid-nom">' + e(c.P.infos.nom || "Votre commerce") + '</p><div class="s-tampons">' + t + "</div></div></div>";
      }
    },
    apropos: {
      nom: "Votre histoire", cat: "presenter", desc: "Qui vous êtes, ce que vous faites de mieux.", ancre: "",
      variantes: [["gauche", "Photo à gauche"], ["droite", "Photo à droite"], ["citation", "Grande citation"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "texte", type: "long", label: "Texte" }, { k: "sign", type: "texte", label: "Signature", ph: "Sam, fondateur" }, { k: "img", type: "image", label: "Photo" }],
      defaut: function (c) { return { titre: c.M.apropos[0], texte: c.M.apropos[1], sign: "", img: px(c, "apropos") }; },
      rendu: function (s, c) {
        var d = s.d;
        if (s.v === "citation") return '<div class="s-in s-citation">' + T(c, "p", "titre", d.titre, "s-cit-t", "Petit titre") + (c.edition ? T(c, "blockquote", "texte", d.texte, "s-cit s-pre", "Votre texte") : H2(c, "texte", d.texte, "s-cit s-pre", "", "blockquote")) + T(c, "p", "sign", d.sign, "s-cit-s", "Signature") + "</div>";
        if (!c.edition && !(d.img && c.media(d.img))) return '<div class="s-in s-apropos-seul">' + H2(c, "titre", d.titre, "s-h2", "Titre") + T(c, "p", "texte", d.texte, "s-texte s-pre", "Votre texte") + T(c, "p", "sign", d.sign, "s-cit-s", "Signature") + "</div>";
        return '<div class="s-in s-apropos-g">' + '<div class="s-apropos-m">' + IMG(c, "img", d.img, { cls: "s-apropos-img", tailles: "(min-width: 760px) 50vw, 100vw" }) + '</div><div class="s-apropos-t">' + H2(c, "titre", d.titre, "s-h2", "Titre") + T(c, "p", "texte", d.texte, "s-texte s-pre", "Votre texte") + T(c, "p", "sign", d.sign, "s-cit-s", "Signature") + "</div></div>";
      }
    },
    galerie: {
      nom: "Photos", cat: "presenter", desc: "Vos réalisations, votre boutique, vos produits.", ancre: "Photos",
      variantes: [["defile", "Défilement"], ["grille", "Grille"], ["mosaique", "Mosaïque"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }, { k: "imgs", type: "images", label: "Photos" }],
      defaut: function (c) { return { titre: "En images. Venez voir.", intro: "", imgs: pxListe(c, "galerie", 6) }; },
      rendu: function (s, c) {
        var d = s.d, def = s.v === "defile", h = '<div class="s-in">' + titreSec(c, d, null, def && !c.edition ? FLECHES() : "") + '<div class="s-gal" data-galerie' + (def ? " data-defile" : "") + ">";
        (d.imgs || []).forEach(function (id, i) { if (!c.edition && !(id && c.media(id))) return; h += '<div class="s-gal-i">' + IMG(c, "imgs." + i, id, { cls: "s-gal-img", tailles: def ? "(min-width: 760px) 420px, 80vw" : "(min-width: 760px) 33vw, 50vw" }) + "</div>"; });
        return h + "</div></div>";
      }
    },
    equipe: {
      nom: "L'équipe", cat: "presenter", desc: "Les personnes que vos clients vont rencontrer.", ancre: "",
      variantes: [["ronds", "Portraits ronds"], ["cartes", "Cartes"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }, { k: "items", type: "liste", label: "Personnes", ajout: "Ajouter une personne", titre: "nom", champs: [{ k: "nom", type: "texte", label: "Prénom" }, { k: "role", type: "texte", label: "Rôle" }, { k: "img", type: "image", label: "Photo" }] }],
      defaut: function () { return { titre: "L'équipe. Ceux qui vous accueillent.", intro: "", items: [{ nom: "Prénom", role: "Gérant", img: null }, { nom: "Prénom", role: "Votre rôle", img: null }] }; },
      rendu: function (s, c) {
        var d = s.d, h = '<div class="s-in">' + titreSec(c, d) + '<ul class="s-equipe">';
        (d.items || []).forEach(function (it, i) { var k = "items." + i + "."; h += '<li class="s-membre">' + IMG(c, k + "img", it.img, { cls: "s-membre-img", alt: it.nom, tailles: "300px" }) + T(c, "p", k + "nom", it.nom, "s-membre-nom", "Prénom") + T(c, "p", k + "role", it.role, "s-membre-role", "Rôle") + "</li>"; });
        return h + "</ul></div>";
      }
    },
    avis: {
      nom: "Avis clients", cat: "presenter", desc: "Ce que vos clients disent de vous.", ancre: "Avis",
      variantes: [["cartes", "Cartes"], ["une", "Un grand avis"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }, { k: "items", type: "liste", label: "Avis", ajout: "Ajouter un avis", titre: "nom", champs: [{ k: "nom", type: "texte", label: "Nom du client" }, { k: "note", type: "nombre", label: "Note", min: 1, max: 5, pas: 1, suffixe: "/ 5" }, { k: "texte", type: "long", label: "Avis" }] }, { k: "lien", type: "texte", label: "Lien vers vos avis Google", ph: "https://g.page/…" }, { k: "note", type: "note", texte: "N'affichez que de vrais avis, recopiés mot pour mot. Les avis d'exemple ne sont pas publiés." }],
      defaut: function (c) { return { titre: "Ils en parlent. Mieux que nous.", intro: "", items: c.M.avis.map(function (a) { return { nom: a[0], note: 5, texte: a[1] }; }), lien: "" }; },
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
      defaut: function (c) { return { titre: "Vos questions. Nos réponses.", intro: "", items: c.M.faq.map(function (f) { return { q: f[0], r: f[1] }; }) }; },
      rendu: function (s, c) {
        var d = s.d, h = '<div class="s-in s-faq-g">' + (titreSec(c, d) || "<div></div>") + '<div class="s-faq">';
        (d.items || []).forEach(function (it, i) { var k = "items." + i + "."; h += "<details" + (c.edition ? " open" : "") + '><summary><span' + (c.edition ? ' data-k="' + k + 'q" data-ph="Question"' : "") + ">" + e(it.q) + '</span><i aria-hidden="true"></i></summary>' + T(c, "p", k + "r", it.r, "s-pre", "Réponse") + "</details>"; });
        return h + "</div></div>";
      }
    },
    texte: {
      nom: "Texte libre", cat: "presenter", desc: "Un titre et un paragraphe, pour tout le reste.", ancre: "",
      variantes: [["gauche", "Aligné à gauche"], ["centre", "Centré"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "texte", type: "long", label: "Texte" }, { k: "b", type: "bouton", label: "Bouton (facultatif)" }],
      defaut: function () { return { titre: "Un titre", texte: "Écrivez ici ce que vos clients doivent savoir.", b: { t: "", a: "tel" } }; },
      rendu: function (s, c) { var d = s.d; return '<div class="s-in s-texte-b">' + H2(c, "titre", d.titre, "s-h2", "Titre") + T(c, "p", "texte", d.texte, "s-texte s-pre", "Votre texte") + '<div class="s-act">' + BTN(c, "b", d.b) + "</div></div>"; }
    },
    horaires: {
      nom: "Horaires", cat: "infos", desc: "Vos horaires, avec « ouvert maintenant » en direct.", ancre: "Horaires",
      variantes: [["semaine", "Barres de la semaine"], ["tableau", "Tableau"], ["carte", "Avec l'adresse"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte", ph: "Fermé les jours fériés…" }, { k: "note", type: "note", texte: "Les horaires se règlent une seule fois dans l'onglet Infos : ils servent partout sur le site.", action: "infos" }],
      defaut: function () { return { titre: "Horaires. Toujours à jour.", intro: "" }; },
      rendu: function (s, c) {
        var d = s.d, H = c.P.infos.horaires, g = '<div class="s-hor-t">' + H2(c, "titre", d.titre, "s-h2", "Horaires") + '<p class="s-statut" data-statut><i></i><span></span></p>' + T(c, "p", "intro", d.intro, "s-lead s-pre", "Une précision (facultatif)") + "</div>";
        if (s.v === "semaine") {
          var mn = 24, mx = 0, i, j;
          for (i = 0; i < 7; i++) K.plages(H, i).forEach(function (p) { mn = Math.min(mn, Math.floor(p[0])); mx = Math.max(mx, Math.ceil(p[1])); });
          if (mx <= mn) { mn = 8; mx = 20; }
          var pc = function (h) { return Math.round((h - mn) / (mx - mn) * 1000) / 10; }, sem = "";
          for (i = 0; i < 7; i++) {
            var p = K.plages(H, i);
            sem += '<div class="s-sem-l' + (p.length ? "" : " ferme") + '" data-j="' + i + '"><span class="s-sem-j">' + K.JOURS[i].slice(0, 3) + '.</span><span class="s-sem-p">' + p.map(function (x) { return '<i style="left:' + pc(x[0]) + "%;width:" + (pc(x[1]) - pc(x[0])) + "%;--i:" + i + '"></i>'; }).join("") + '</span><span class="s-sem-h">' + (p.length ? p.map(function (x) { return K.fmt(x[0]) + " – " + K.fmt(x[1]); }).join(", ") : "Fermé") + "</span></div>";
          }
          var axe = ""; for (j = 0; j <= 3; j++) axe += "<span>" + K.fmt(Math.round((mn + (mx - mn) * j / 3) * 2) / 2) + "</span>";
          return '<div class="s-in s-hor-g">' + g + '<div class="s-sem" data-semaine data-min="' + mn + '" data-max="' + mx + '">' + sem + '<div class="s-sem-axe" aria-hidden="true"><span class="s-sem-axe-p">' + axe + "</span></div></div></div>";
        }
        var rows = "";
        for (var k = 0; k < 7; k++) {
          var q = K.plages(H, k);
          rows += '<tr data-j="' + k + '"><th scope="row">' + K.JOURS[k] + "</th><td>" + (q.length ? q.map(function (x) { return K.fmt(x[0]) + " – " + K.fmt(x[1]); }).join(", ") : "Fermé") + "</td></tr>";
        }
        var tab = '<table class="s-hor" data-horaires>' + rows + "</table>";
        if (s.v === "carte") return '<div class="s-in s-hor-g">' + g + tab + '<div class="s-hor-adr">' + icone("epingle") + "<p>" + e(adresse(c.P) || "Votre adresse") + '</p><a class="s-btn s-btn--2" href="' + e(lien(c, "itin")) + '" target="_blank" rel="noopener">Itinéraire</a></div></div>';
        return '<div class="s-in s-hor-g">' + g + tab + "</div>";
      }
    },
    acces: {
      nom: "Adresse et accès", cat: "infos", desc: "Où vous trouver, se garer, venir en bus.", ancre: "Accès",
      variantes: [["plan", "Avec plan"], ["simple", "Texte seul"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "texte", type: "long", label: "Comment venir", ph: "Parking gratuit à 50 m, bus ligne 2…" }, { k: "note", type: "note", texte: "L'adresse se règle dans l'onglet Infos. Le plan n'utilise aucun service extérieur : pas de cookie.", action: "infos" }],
      defaut: function () { return { titre: "Nous trouver. C'est simple.", texte: "Stationnement facile à proximité." }; },
      rendu: function (s, c) {
        var d = s.d, adr = adresse(c.P);
        var plan = s.v === "plan" ? '<a class="s-plan" href="' + e(lien(c, "itin")) + '" target="_blank" rel="noopener" aria-label="Ouvrir l\'itinéraire"><i class="s-ilot s-ilot--1"></i><i class="s-ilot s-ilot--2"></i><i class="s-rue s-rue--1"></i><i class="s-rue s-rue--2"></i><i class="s-rue s-rue--3"></i><i class="s-rue s-rue--4"></i><span class="s-plan-pin">' + icone(c.M.icone) + '</span><span class="s-plan-tag">' + e(c.P.infos.nom || "Vous êtes ici") + "</span></a>" : "";
        return '<div class="s-in s-acces-g"><div class="s-acces-t">' + H2(c, "titre", d.titre, "s-h2", "Titre") + '<p class="s-adr">' + icone("epingle") + "<span>" + e(adr || "Votre adresse (onglet Infos)") + "</span></p>" + T(c, "p", "texte", d.texte, "s-texte s-pre", "Comment venir") + '<div class="s-act"><a class="s-btn" href="' + e(lien(c, "itin")) + '" target="_blank" rel="noopener">Itinéraire</a>' + (c.P.infos.tel ? '<a class="s-btn s-btn--2" href="' + e(lien(c, "tel")) + '">Appeler</a>' : "") + "</div></div>" + plan + "</div>";
      }
    },
    contact: {
      nom: "Contact", cat: "infos", desc: "Téléphone, mail et un formulaire simple.", ancre: "Contact",
      variantes: [["formulaire", "Avec formulaire"], ["boutons", "Gros boutons"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "intro", type: "long", label: "Texte" }],
      defaut: function () { return { titre: "Nous contacter. On vous répond.", intro: "Une question, une demande particulière ? Appelez-nous ou écrivez-nous." }; },
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
      defaut: function () { return { titre: "Suivez-nous. Les coulisses d'abord.", intro: "Les nouveautés et les offres passent d'abord par là." }; },
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
      variantes: [["photo", "Sur une photo"], ["plein", "Plein"], ["contour", "Encadré"]],
      champs: [{ k: "titre", type: "texte", label: "Titre" }, { k: "texte", type: "long", label: "Texte" }, { k: "b1", type: "bouton", label: "Bouton" }, { k: "b2", type: "bouton", label: "Second bouton" }, { k: "img", type: "image", label: "Photo (variante « Sur une photo »)" }],
      defaut: function (c) { var o = c.M.objectif; return { titre: o === "rdv" ? "Une place cette semaine ?" : o === "commande" ? "Commandez maintenant. Retirez quand vous voulez." : "Passez nous voir.", texte: "", b1: { t: o === "rdv" ? "Réserver" : o === "commande" ? "Commander" : "Itinéraire", a: o === "rdv" ? "resa" : o === "commande" ? "cmd" : "itin" }, b2: { t: "Appeler", a: "tel" }, img: px(c, "appel") }; },
      rendu: function (s, c) {
        var d = s.d, fond = s.v === "photo" ? '<div class="s-appel-fond">' + IMG(c, "img", d.img, { tailles: "100vw" }) + "</div>" : "";
        return '<div class="s-in"><div class="s-appel-b">' + fond + H2(c, "titre", d.titre, "s-h2", "Titre") + T(c, "p", "texte", d.texte, "s-lead s-pre", "Texte (facultatif)") + '<div class="s-act s-act--c">' + BTN(c, "b1", d.b1) + BTN(c, "b2", d.b2, "s-btn--2") + "</div></div></div>";
      }
    },
    espace: {
      nom: "Espace", cat: "infos", desc: "Un peu d'air entre deux sections.", ancre: "",
      variantes: [["vide", "Vide"], ["ligne", "Avec une ligne"]],
      champs: [],
      defaut: function () { return {}; },
      rendu: function () { return '<div class="s-in"><hr class="s-hr"></div>'; }
    }
  };
  var CATS = [["haut", "Haut de page"], ["vendre", "Vendre et réserver"], ["presenter", "Se présenter"], ["infos", "Infos pratiques"]];

  /* ===================== Recettes : un site complet selon le métier et l'objectif ===================== */
  function recette(metier, objectif) {
    var o = objectif;
    var base = {
      rdv: ["heros:cinema", "bento:tuiles", "prestations:liste", "reservation:etapes", "galerie:defile", "apropos:gauche", "avis:cartes", "horaires:semaine", "acces:plan", "faq:liste", "appel:photo"],
      commande: ["heros:cinema", "bento:tuiles", "produits:grille", "commande:carte", "apropos:droite", "avis:cartes", "horaires:semaine", "acces:plan", "faq:liste", "appel:photo"],
      carte: ["heros:cinema", "bento:tuiles", "prestations:ardoise", "galerie:defile", "apropos:citation", "avis:cartes", "horaires:semaine", "acces:plan", "contact:boutons"],
      vitrine: ["heros:cinema", "bento:tuiles", "apropos:gauche", "prestations:cartes", "galerie:mosaique", "avis:cartes", "horaires:semaine", "acces:plan", "contact:formulaire"]
    }[o] || [];
    base = base.slice();
    if (!PX[metier]) base = base.map(function (x) { return x === "heros:cinema" ? "heros:partage" : x === "appel:photo" ? "appel:plein" : x; });
    if (M[metier] && M[metier].fidelite) base.splice(o === "commande" ? 5 : base.length - 2, 0, "fidelite:carte");
    if (metier === "boucherie") { base = base.map(function (x) { return x === "produits:grille" ? "produits:vitrine" : x; }); base.splice(4, 0, "promo:carte"); }
    if (metier === "restaurant" && base[2] === "prestations:liste") base[2] = "prestations:ardoise";
    return base;
  }

  /* ===================== Pages légales générées ===================== */
  function manque(t) { return '<mark class="s-manque">' + t + "</mark>"; }
  function aDesPhotosLibres(P) { return /"px:/.test(JSON.stringify(P.pages)); }
  function pagesLegales(P) {
    var i = P.infos, adr = adresse(P), x = function (v, t) { return v ? e(v) : manque(t); };
    var contenus = aDesPhotosLibres(P)
      ? "Les textes et les photos de ce site appartiennent à " + x(i.nom, "[nom du commerce]") + ", sauf les photos d'illustration : elles viennent de Pexels (pexels.com) et sont utilisées selon la licence Pexels. Elles ne représentent pas forcément nos produits ou notre boutique."
      : "Les textes et photos de ce site appartiennent à " + x(i.nom, "[nom du commerce]") + ". Merci de ne pas les réutiliser sans accord.";
    var mentions = '<div class="s-in s-legal"><h1 class="s-h2">Mentions légales</h1>' +
      "<h2 class=\"s-h3\">Éditeur du site</h2><p>" + x(i.nom, "[nom du commerce]") + ", " + x(i.forme, "[forme juridique]") + "<br>Responsable : " + x(i.responsable, "[nom du responsable]") + "<br>Adresse : " + x(adr, "[adresse]") + "<br>SIRET : " + x(i.siret, "[numéro SIRET]") + "<br>Téléphone : " + x(i.tel, "[téléphone]") + (i.email ? "<br>E-mail : " + e(i.email) : "") + "</p>" +
      "<p>Directeur de la publication : " + x(i.responsable, "[nom du responsable]") + ".</p>" +
      "<h2 class=\"s-h3\">Hébergement</h2><p>" + x(P.publi && P.publi.hebergeur, "[hébergeur, indiqué à la mise en ligne]") + "</p>" +
      "<h2 class=\"s-h3\">Médiation de la consommation</h2><p>En cas de litige, vous pouvez recourir gratuitement au médiateur de la consommation : " + x(i.mediateur, "[nom et site du médiateur]") + ".</p>" +
      "<h2 class=\"s-h3\">Contenus</h2><p>" + contenus + "</p></div>";
    var conf = '<div class="s-in s-legal"><h1 class="s-h2">Confidentialité et cookies</h1>' +
      "<h2 class=\"s-h3\">Ce que nous recevons</h2><p>Quand vous réservez, commandez ou nous écrivez, vous nous transmettez votre nom, votre téléphone et votre message. Ils servent uniquement à vous répondre et à préparer votre rendez-vous ou votre commande. Ils ne sont ni vendus, ni utilisés pour de la publicité.</p>" +
      "<h2 class=\"s-h3\">Cookies</h2><p>Ce site ne dépose aucun cookie et n'utilise aucun outil de mesure d'audience ni de publicité. Aucun bandeau de consentement n'est donc nécessaire. Le bouton « Itinéraire » ouvre Google Maps seulement si vous cliquez dessus.</p>" +
      "<h2 class=\"s-h3\">Vos droits</h2><p>Vous pouvez demander à consulter, corriger ou supprimer vos informations en contactant " + x(i.nom, "[nom du commerce]") + (i.email ? " à " + e(i.email) : i.tel ? " au " + e(i.tel) : "") + ". Vous pouvez aussi saisir la CNIL (cnil.fr).</p></div>";
    return [{ id: "mentions", nom: "Mentions légales", html: mentions }, { id: "confidentialite", nom: "Confidentialité", html: conf }];
  }

  /* ===================== En-tête, pied de page, barre d'action ===================== */
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
    var P = c.P, E = P.entete, liens = nav(c).map(function (x, i) { return '<a href="' + e(x[0]) + '" style="--i:' + i + '"' + (c.pageId && x[2] === "page:" + c.pageId ? ' class="actif"' : "") + ">" + e(x[1]) + "</a>"; }).join("");
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
  /* Sur téléphone : une barre translucide en bas, avec l'action principale et l'appel. */
  function dock(c) {
    var P = c.P, E = P.entete, tel = P.infos.tel, cta = E.cta && E.cta.t && E.cta.a !== "tel" ? '<a class="s-btn" href="' + e(lien(c, E.cta.a)) + '">' + e(E.cta.t) + "</a>" : "";
    if (!cta && !tel) return "";
    var t = tel ? (cta ? '<a class="s-dock-tel" href="' + e(lien(c, "tel")) + '" aria-label="Appeler">' + icone("tel") + "</a>" : '<a class="s-btn" href="' + e(lien(c, "tel")) + '">' + icone("tel") + "Appeler</a>") : "";
    return '<div class="s-dock" data-dock><div class="s-dock-in">' + t + cta + "</div></div>";
  }

  /* ===================== Section complète ===================== */
  function section(s, c) {
    var b = B[s.t]; if (!b) return "";
    var st = s.s || {};
    var cls = "s-sec b-" + s.t + " v-" + s.v + " fd-" + (st.fond || "auto") + " esp-" + (st.esp || "m") + (st.mob === false ? " cache-mob" : "") + (st.ord === false ? " cache-ord" : "");
    c._px = 0;
    var corps = b.rendu(s, c), n = c._px;
    var illu = !c.edition && n ? '<p class="s-illu">' + (n > 1 ? "Photos d'illustration" : "Photo d'illustration") + "</p>" : "";
    return '<section class="' + cls + '" id="s-' + s.id + '" data-sec="' + s.id + '"' + (s.t !== "annonce" && s.t !== "espace" ? " data-anim" : "") + ">" + corps + illu + "</section>";
  }

  function vignette(t) {
    var c = 'fill="currentColor"', x = "", r = function (a, b, w, h, o) { return '<rect x="' + a + '" y="' + b + '" width="' + w + '" height="' + h + '" rx="1.5" ' + c + ' opacity="' + (o || 1) + '"/>'; };
    switch (t) {
      case "annonce": x = r(0, 0, 96, 12, .9) + '<rect x="28" y="4.5" width="40" height="3" rx="1.5" fill="#fff"/>' + r(8, 22, 50, 6, .18) + r(8, 34, 70, 4, .1) + r(8, 42, 60, 4, .1); break;
      case "heros": x = r(0, 0, 96, 60, .16) + r(8, 22, 48, 7, .85) + r(8, 33, 36, 4, .4) + r(8, 43, 20, 7, .9); break;
      case "bento": x = r(4, 4, 42, 34, .3) + r(50, 4, 20, 16, .85) + r(74, 4, 18, 16, .2) + r(50, 22, 42, 16, .14) + r(4, 42, 20, 14, .14) + r(28, 42, 40, 14, .3) + r(72, 42, 20, 14, .14); break;
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
      case "horaires": for (var h = 0; h < 5; h++) x += r(34, 7 + h * 10, 58, 4, .14) + r(40 + (h % 2) * 4, 7 + h * 10, 38 - (h % 3) * 6, 4, h === 2 ? .9 : .45); x += r(6, 8, 22, 6, .8) + '<circle cx="9" cy="22" r="2.5" ' + c + ' opacity=".9"/>' + r(14, 20.5, 14, 3, .4); break;
      case "acces": x = r(48, 6, 42, 48, .12) + '<path d="M48 30h42M66 6v48" stroke="currentColor" opacity=".3"/>' + '<circle cx="66" cy="28" r="4" ' + c + '/>' + r(6, 12, 34, 6, .8) + r(6, 24, 30, 3, .35) + r(6, 38, 18, 7, .9); break;
      case "contact": x = r(6, 10, 30, 6, .8) + r(6, 22, 26, 4, .35) + r(6, 30, 26, 4, .35) + r(46, 8, 44, 9, .14) + r(46, 20, 44, 9, .14) + r(46, 32, 44, 12, .14) + r(46, 47, 18, 6, .9); break;
      case "reseaux": for (var y = 0; y < 3; y++) x += r(10 + y * 27, 20, 22, 22, .2) + '<circle cx="' + (21 + y * 27) + '" cy="31" r="5" fill="none" stroke="currentColor" opacity=".8"/>'; break;
      case "appel": x = r(4, 8, 88, 44, .85) + '<rect x="26" y="18" width="44" height="6" rx="1.5" fill="#fff" opacity=".9"/><rect x="36" y="32" width="24" height="8" rx="3" fill="#fff"/>'; break;
      case "espace": x = '<path d="M10 30h76" stroke="currentColor" stroke-dasharray="3 3" opacity=".5"/>' + '<path d="M48 14v8M48 38v8M44 18l4-4 4 4M44 42l4 4 4-4" stroke="currentColor" fill="none" opacity=".6"/>'; break;
    }
    return '<svg viewBox="0 0 96 60" aria-hidden="true">' + x + "</svg>";
  }

  var Blocs = w.Blocs = { B: B, CATS: CATS, M: M, ORDRE_METIERS: ORDRE_METIERS, POLICES: POLICES, FONDS: FONDS, RAYONS: RAYONS, IC: IC, icone: icone, vignette: vignette,
    varsTheme: varsTheme, contraste: contraste, lum: lum, recette: recette, section: section, entete: entete, pied: pied, dock: dock, pagesLegales: pagesLegales, adresse: adresse, lien: lien,
    PX: PX, PX_PROD: PX_PROD, photoInfo: photoInfo, urlPhoto: urlPhoto, PHOTOS_BASE: "photos/", aDesPhotosLibres: aDesPhotosLibres };
})(window);
