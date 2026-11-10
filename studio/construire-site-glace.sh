#!/usr/bin/env bash
# Assemble le site « glace » à mettre en ligne sur mokranistudio.fr :
# accueil = studio/v8, pages légales et icônes = studio/v6, Atelier = studio/v5/atelier (servi sous /atelier/),
# fichiers annexes du site précédent (studio/v2). Usage : studio/construire-site-glace.sh <dossier de sortie>
set -euo pipefail
ICI="$(cd "$(dirname "$0")" && pwd)"
OUT="${1:?dossier de sortie}"
rm -rf "$OUT"; mkdir -p "$OUT/atelier" "$OUT/assets" "$OUT/icones"
# Pages légales, 404, icônes et polices de la v6 (sans son accueil)
for f in mentions-legales.html confidentialite.html cgv.html devis-envoye.html 404.html legal.css robots.txt favicon.ico; do cp "$ICI/v6/$f" "$OUT/"; done
cp -r "$ICI/v6/icones/." "$OUT/icones/"
cp "$ICI/v6/assets/"* "$OUT/assets/"
# Accueil glace
cp "$ICI/v8/index.html" "$ICI/v8/v8.css" "$ICI/v8/v8.js" "$OUT/"
cp "$ICI/v8/assets/"* "$OUT/assets/"
# Atelier et ses images
cp -r "$ICI/v5/atelier/." "$OUT/atelier/"
cp --update=none "$ICI/v5/assets/"* "$OUT/assets/"
for f in manifest.webmanifest sw.js sitemap.xml; do cp "$ICI/v2/$f" "$OUT/$f"; done
# Chemins
find "$OUT" -maxdepth 1 -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' \) -print0 | xargs -0 sed -i -e 's#\.\./v6/##g' -e 's#\.\./v5/atelier/#atelier/#g' -e 's#\.\./v5/assets/#assets/#g'
find "$OUT/atelier" -maxdepth 1 -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' \) -print0 | xargs -0 sed -i -e 's#\.\./\.\./v6/#../#g'
# Accueil indexable, adresse définitive
python3 - "$OUT/index.html" <<'PY'
import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
s = s.replace('<meta name="robots" content="noindex">\n', '')
s = s.replace('<meta property="og:image" content="assets/partage8.jpg">', '<meta property="og:image" content="https://mokranistudio.fr/assets/partage8.jpg">')
extra = ('<link rel="canonical" href="https://mokranistudio.fr/">\n'
         '<link rel="manifest" href="manifest.webmanifest">\n'
         '<meta property="og:type" content="website">\n'
         '<meta property="og:url" content="https://mokranistudio.fr/">\n'
         '<script type="application/ld+json">{"@context":"https://schema.org","@type":"ProfessionalService","name":"Mokrani Studio","url":"https://mokranistudio.fr/","email":"ali@mokranistudio.fr","telephone":"+33782023657","founder":{"@type":"Person","name":"Ali Mokrani"},"areaServed":"FR","description":"Sites internet, réservation en ligne et logiciels sur mesure pour les commerçants."}</script>\n')
if 'rel="canonical"' not in s: s = s.replace('</head>', extra + '</head>', 1)
open(p, 'w', encoding='utf-8').write(s)
PY
echo "Site assemblé dans $OUT"
