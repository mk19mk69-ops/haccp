#!/usr/bin/env bash
# Assemble le site à mettre en ligne sur mokranistudio.fr :
# accueil = studio/v6, Atelier = studio/v5/atelier (servi sous /atelier/), fichiers annexes repris du site en ligne (studio/v2).
# Usage : studio/construire-site.sh <dossier de sortie>
set -euo pipefail
ICI="$(cd "$(dirname "$0")" && pwd)"
OUT="${1:?dossier de sortie}"
rm -rf "$OUT"; mkdir -p "$OUT/atelier" "$OUT/assets"

# Accueil et pages légales
cp -r "$ICI/v6/." "$OUT/"
rm -f "$OUT/scene.src.js"
# Atelier
cp -r "$ICI/v5/atelier/." "$OUT/atelier/"
# Images et polices partagées (sans écraser celles de la v6)
cp -n "$ICI/v5/assets/"* "$OUT/assets/"
# Fichiers du site en ligne à garder
for f in manifest.webmanifest sw.js sitemap.xml; do [ -e "$OUT/$f" ] || cp "$ICI/v2/$f" "$OUT/$f"; done

# Chemins : à la racine, ../v5/atelier/ devient atelier/ et ../v5/assets/ devient assets/
find "$OUT" -maxdepth 1 -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' \) -print0 | xargs -0 sed -i -e 's#\.\./v5/atelier/#atelier/#g' -e 's#\.\./v5/assets/#assets/#g'
# Dans l'Atelier, ../../v6/ devient ../
find "$OUT/atelier" -maxdepth 1 -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' \) -print0 | xargs -0 sed -i -e 's#\.\./\.\./v6/#../#g'

# Accueil indexable par Google, avec l'adresse définitive
python3 - "$OUT/index.html" <<'PY'
import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
s = s.replace('<meta name="robots" content="noindex">\n', '')
s = s.replace('<meta property="og:image" content="assets/partage.jpg">', '<meta property="og:image" content="https://mokranistudio.fr/assets/partage.jpg">')
extra = ('<link rel="canonical" href="https://mokranistudio.fr/">\n'
         '<link rel="manifest" href="manifest.webmanifest">\n'
         '<meta property="og:type" content="website">\n'
         '<meta property="og:url" content="https://mokranistudio.fr/">\n'
         '<script type="application/ld+json">{"@context":"https://schema.org","@type":"ProfessionalService","name":"Mokrani Studio","url":"https://mokranistudio.fr/","email":"ali@mokranistudio.fr","telephone":"+33782023657","founder":{"@type":"Person","name":"Ali Mokrani"},"areaServed":"FR","description":"Sites internet, réservation en ligne et logiciels sur mesure pour les commerçants."}</script>\n')
if 'rel="canonical"' not in s:
    s = s.replace('</head>', extra + '</head>', 1)
open(p, 'w', encoding='utf-8').write(s)
PY
echo "Site assemblé dans $OUT"
