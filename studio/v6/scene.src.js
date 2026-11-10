/* Mokrani Studio v6 : la scène de verre.
   Derrière toute la page : une brume froide, un « M » en verre massif, des éclats de glace,
   et un bloc de glace par métier. Le verre réfracte vraiment ce qu'il y a derrière lui.
   La scène passe du jour glacé à la nuit polaire quand la page le demande (window.MS_NUIT). */
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const toile = document.getElementById("scene3d");
const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
const racine = document.documentElement;
const params = new URLSearchParams(location.search);
const pose = params.get("rendu"); /* ?rendu=og ou ?rendu=m : vues fixes pour fabriquer les images */

function lancer(svg) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: toile, antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: !!pose }); }
  catch (e) { return; }
  const petit = innerWidth < 760;
  let dpr = Math.min(devicePixelRatio || 1, petit ? 1.25 : 1.5);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.transmissionResolutionScale = petit ? 0.5 : 0.75;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  /* Brume : un dégradé repeint quand on passe du jour à la nuit */
  const c = document.createElement("canvas"); c.width = 8; c.height = 256;
  const g = c.getContext("2d");
  const JOUR = [[244, 247, 250], [227, 234, 242], [191, 206, 223]], NUIT = [[3, 6, 12], [6, 16, 38], [10, 44, 104]];
  const fond = new THREE.CanvasTexture(c); fond.colorSpace = THREE.SRGBColorSpace; scene.background = fond;
  function peindre(n) {
    const d = g.createLinearGradient(0, 0, 0, 256);
    [0, 0.5, 1].forEach((p, i) => { const a = JOUR[i], b = NUIT[i]; d.addColorStop(p, "rgb(" + a.map((v, k) => Math.round(v + (b[k] - v) * n)).join(",") + ")"); });
    g.fillStyle = d; g.fillRect(0, 0, 8, 256); fond.needsUpdate = true;
  }
  peindre(0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 0.9;

  const soleil = new THREE.DirectionalLight(0xffffff, 2.2); soleil.position.set(4, 6, 8); scene.add(soleil);
  const lueur = new THREE.PointLight(0x2f7bff, 60, 30); lueur.position.set(-5, -2, 4); scene.add(lueur);

  /* Ce que le M réfracte en haut de page : un anneau bleu, des traits fins, un disque pâle */
  const decor = new THREE.Group(); scene.add(decor);
  const bleu = new THREE.MeshBasicMaterial({ color: 0x1257d6 }), noir = new THREE.MeshBasicMaterial({ color: 0x0a1626 });
  const anneau = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.04, 12, 160), bleu); anneau.position.z = -3; decor.add(anneau);
  const anneau2 = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.012, 8, 120), noir); anneau2.position.z = -2.2; decor.add(anneau2);
  const disque = new THREE.Mesh(new THREE.CircleGeometry(1.9, 96), new THREE.MeshBasicMaterial({ color: 0xffffff })); disque.position.set(0.6, 0.5, -5); decor.add(disque);
  for (let i = 0; i < 7; i++) {
    const t = new THREE.Mesh(new THREE.PlaneGeometry(i % 3 === 0 ? 3.6 : 1.6, 0.022), i % 3 === 0 ? bleu : noir);
    t.position.set(-0.5 + (i % 2) * 1.0, -1.8 + i * 0.6, -1.6 - (i % 3) * 0.4); decor.add(t);
  }

  /* Le M en verre massif */
  const verre = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.03, metalness: 0, transmission: 1, thickness: 1.1, ior: 1.46, dispersion: 7,
    attenuationColor: new THREE.Color(0x4f95ff), attenuationDistance: 2.3, specularIntensity: 1, envMapIntensity: 0.55
  });
  const formes = []; new SVGLoader().parse(svg).paths.forEach(p => SVGLoader.createShapes(p).forEach(s => formes.push(s)));
  const geo = new THREE.ExtrudeGeometry(formes, { depth: 150, bevelEnabled: true, bevelThickness: 26, bevelSize: 16, bevelSegments: 8, curveSegments: 18 });
  geo.center(); geo.rotateX(Math.PI); geo.scale(0.0042, 0.0042, 0.0042); geo.computeVertexNormals();
  const pivot = new THREE.Group(); pivot.add(new THREE.Mesh(geo, verre)); scene.add(pivot);

  /* Éclats de glace qui dérivent */
  const glace = verre.clone(); glace.roughness = 0.1; glace.dispersion = 3; glace.thickness = 0.6; glace.attenuationDistance = 3;
  const eclats = [];
  let graine = 7; const alea = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < (petit ? 5 : 11); i++) {
    const e = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 + alea() * 0.38, 0), glace);
    e.scale.set(0.6 + alea() * 0.8, 1 + alea() * 1.4, 0.5 + alea() * 0.6);
    e.userData = { x: (alea() - 0.5) * 13, y: (alea() - 0.5) * 7, z: -2.5 + alea() * 4.5, v: 0.15 + alea() * 0.3, p: alea() * 6.28 };
    e.rotation.set(alea() * 3, alea() * 3, alea() * 3);
    eclats.push(e); scene.add(e);
  }

  /* Un bloc de glace par métier, chacun d'une forme différente, avec l'icône du métier prise dedans.
     Chaque bloc suit à l'écran son bouton (.puce) : le bouton reste un vrai bouton, le bloc est son image. */
  const FORMES = [
    () => new RoundedBoxGeometry(1, 1, 0.62, 3, 0.09), () => new THREE.CylinderGeometry(0.56, 0.56, 0.62, 6).rotateX(Math.PI / 2),
    () => new THREE.CylinderGeometry(0.54, 0.54, 0.6, 40).rotateX(Math.PI / 2), () => new RoundedBoxGeometry(0.86, 1.08, 0.6, 3, 0.2),
    () => new THREE.CylinderGeometry(0.58, 0.58, 0.62, 8).rotateX(Math.PI / 2).rotateZ(Math.PI / 8), () => new RoundedBoxGeometry(1.08, 0.86, 0.6, 3, 0.04),
    () => new THREE.CylinderGeometry(0.6, 0.6, 0.6, 5).rotateX(Math.PI / 2).rotateZ(Math.PI), () => new RoundedBoxGeometry(0.98, 0.98, 0.66, 4, 0.3),
    () => new THREE.CylinderGeometry(0.5, 0.6, 0.66, 4).rotateX(Math.PI / 2).rotateZ(Math.PI / 4)
  ];
  const matBloc = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.09, transmission: 1, thickness: 0.7, ior: 1.31, dispersion: 3, attenuationColor: new THREE.Color(0x5b9bff), attenuationDistance: 1.3, envMapIntensity: 0.7 });
  const matChoisi = matBloc.clone(); matChoisi.attenuationColor = new THREE.Color(0x1257d6); matChoisi.attenuationDistance = 0.55; matChoisi.roughness = 0.04;
  const blocs = [];
  function icone(m) {
    const G = window.GLYPHES || {}, corps = G[m] || G.autre; if (!corps) return null;
    const src = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 60 60" width="256" height="256"><style>*{fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}.t{fill:rgba(255,255,255,.28)}.a{fill:#fff;stroke:none}.e{stroke:#fff}.p{fill:#fff;stroke:none}</style>' + corps + "</svg>";
    const tex = new THREE.Texture(); const im = new Image();
    im.onload = () => { const k = document.createElement("canvas"); k.width = k.height = 256; k.getContext("2d").drawImage(im, 0, 0, 256, 256); tex.image = k; tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true; sale = true; };
    im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(src);
    return tex;
  }
  function relierBlocs() {
    document.querySelectorAll("#metiers .puce").forEach((b, i) => {
      if (b._bloc) return;
      const grp = new THREE.Group(), corps = new THREE.Mesh(FORMES[i % FORMES.length](), matBloc); grp.add(corps);
      const tex = icone(b.dataset.m);
      if (tex) { const ic = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.74), new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.35, side: THREE.DoubleSide, color: 0x062a78 })); grp.add(ic); grp.userData.ic = ic; }
      grp.visible = false; scene.add(grp);
      const o = { el: b, grp, corps, tour: 0, cible: 0, survol: 0, p: i * 1.7 }; b._bloc = o; blocs.push(o);
      const tourner = () => { if (!reduit) o.cible += Math.PI * 2; sale = true; };
      b.addEventListener("pointerenter", tourner); b.addEventListener("focus", tourner); b.addEventListener("click", tourner);
    });
  }
  relierBlocs(); if (!blocs.length) { let n = 0; const iv = setInterval(() => { relierBlocs(); if (blocs.length || ++n > 20) clearInterval(iv); }, 300); }

  let L = 0, H = 0;
  function taille() {
    L = innerWidth; H = innerHeight;
    renderer.setSize(L, H, false); camera.aspect = L / H;
    camera.position.z = L / H < 0.8 ? 17 : 12; camera.updateProjectionMatrix(); sale = true;
  }
  let sx = 0, sy = 0, cx = 0, cy = 0, defileC = 0, sale = true, nuit = 0, nuitPeinte = 0;
  taille(); addEventListener("resize", taille);
  addEventListener("pointermove", e => { if (e.pointerType === "mouse") { sx = e.clientX / L - 0.5; sy = e.clientY / H - 0.5; sale = true; } }, { passive: true });
  addEventListener("scroll", () => { sale = true; }, { passive: true });
  addEventListener("ms:nuit", () => { sale = true; });

  const horloge = new THREE.Clock(); let t = 0, premier = true, lent = 0, mesures = 0, allege = false;
  const v3 = new THREE.Vector3();
  function image() {
    const dt = Math.min(horloge.getDelta(), 0.05); if (!reduit) t += dt;
    const max = Math.max(1, racine.scrollHeight - H), defile = scrollY / max;
    const k = reduit ? 1 : 1 - Math.exp(-dt * 5);
    defileC += (defile - defileC) * k; cx += (sx - cx) * k; cy += (sy - cy) * k;

    /* Jour et nuit */
    nuit += ((window.MS_NUIT ? 1 : 0) - nuit) * (reduit ? 1 : 1 - Math.exp(-dt * 2.6));
    if (Math.abs(nuit - nuitPeinte) > 0.004) { nuitPeinte = nuit; peindre(nuit); scene.environmentIntensity = 0.9 - 0.55 * nuit; soleil.intensity = 2.2 - 1.5 * nuit; lueur.intensity = 60 + 160 * nuit; renderer.toneMappingExposure = 1.08 - 0.1 * nuit; }

    const etroit = L / H < 0.8, ecran = scrollY / H;
    /* En haut de page le M se tient à côté du titre, puis il traverse la page en tournant, sur les bords */
    const debut = Math.max(0, 1 - ecran * 1.8);
    const libre = Math.min(1, Math.max(0, (ecran - 1.1) / 0.9)), lisse = libre * libre * (3 - 2 * libre);
    /* Tant que les blocs des métiers sont à l'écran, le M reste sur le bord droit ; ensuite il serpente */
    const cote = 1 + (Math.cos(defileC * Math.PI * 5) - 1) * lisse;
    pivot.position.x = etroit ? cote * 0.9 * (1 - debut) : 2.0 * debut + (1 - debut) * cote * 4.9;
    pivot.position.y = (etroit ? 3.7 : 0.5) * debut + Math.sin(t * 0.5) * 0.12 + (1 - debut) * Math.sin(defileC * 21) * 0.8;
    pivot.position.z = (1 - debut) * -1.5;
    pivot.rotation.y = -0.45 + defileC * Math.PI * 4 + cx * 0.7 + Math.sin(t * 0.3) * 0.12;
    pivot.rotation.x = 0.12 + cy * 0.4 + Math.sin(t * 0.23) * 0.06;
    pivot.scale.setScalar((etroit ? 0.62 : 1) * (0.62 + 0.38 * debut));
    decor.visible = debut > 0.02; decor.scale.setScalar((etroit ? 0.55 : 1) * (0.4 + 0.6 * debut));
    decor.position.x = pivot.position.x * 0.8; decor.position.y = pivot.position.y * (etroit ? 1 : 0.6);
    anneau.rotation.z = t * 0.05; anneau.rotation.x = 0.5 + defileC * 3; anneau2.rotation.y = defileC * 4;
    if (pose === "og") { pivot.position.set(2.6, 0, 0); pivot.rotation.set(0.12, -0.5, 0); pivot.scale.setScalar(1.25); decor.position.set(2.2, 0, 0); decor.visible = true; decor.scale.setScalar(1.1); }
    if (pose === "m") { pivot.position.set(0, 0, 2); pivot.rotation.set(0.2, -0.55, 0.05); pivot.scale.setScalar(1.5); decor.position.set(0, 0, 0); decor.visible = true; decor.scale.setScalar(1.2); }
    eclats.forEach(e => {
      const u = e.userData;
      e.position.set(u.x + Math.sin(t * u.v + u.p) * 0.3, ((u.y + defileC * 16 + 40) % 9) - 4.5 + Math.cos(t * u.v * 0.8 + u.p) * 0.2, u.z);
      e.rotation.x += dt * u.v * 0.5; e.rotation.y += dt * u.v * 0.35;
    });
    camera.position.x = cx * 0.5; camera.position.y = -cy * 0.3; camera.lookAt(0, 0, 0); camera.updateMatrixWorld();

    /* Les blocs de glace suivent leurs boutons */
    const parPixel = 2 * Math.tan(THREE.MathUtils.degToRad(16)) * camera.position.z / H;
    let actifs = false;
    blocs.forEach(o => {
      const r = o.el.getBoundingClientRect(), vu = r.width > 0 && r.bottom > -80 && r.top < H + 80;
      o.grp.visible = vu; if (!vu) return;
      const cote2 = Math.min(r.width, 132), px = r.left + r.width / 2, py = r.top + cote2 / 2;
      v3.set((px / L) * 2 - 1, -(py / H) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
      const d = -camera.position.z / v3.z; o.grp.position.copy(camera.position).addScaledVector(v3, d);
      const choisi = o.el.getAttribute("aria-pressed") === "true";
      o.corps.material = choisi ? matChoisi : matBloc; if (o.grp.userData.ic) o.grp.userData.ic.material.color.setHex(choisi ? 0xffffff : 0x062a78);
      o.tour += (o.cible - o.tour) * (reduit ? 1 : 1 - Math.exp(-dt * 4)); if (Math.abs(o.cible - o.tour) > 0.01) actifs = true;
      o.grp.scale.setScalar(cote2 * parPixel * 0.78 * (choisi ? 1.12 : 1));
      o.grp.rotation.set(Math.sin(t * 0.6 + o.p) * 0.14, o.tour + Math.sin(t * 0.45 + o.p) * 0.3, Math.sin(t * 0.37 + o.p) * 0.05);
      o.grp.position.y += Math.sin(t * 0.8 + o.p) * 0.03;
    });
    if (actifs) sale = true;

    renderer.render(scene, camera);
    if (premier) { premier = false; racine.classList.add("gl"); }
  }
  function boucle(maintenant) {
    if (!document.hidden && (!reduit || sale)) {
      sale = false; const avant = performance.now(); image();
      /* Garde-fou : si l'appareil peine, on allège une fois (moins de pixels, panneaux en flou simple) */
      if (!allege && !reduit && !pose) { mesures++; if (performance.now() - avant > 30) lent++; if (mesures === 90) { if (lent > 45) { allege = true; racine.classList.add("leger"); dpr = 1; renderer.setPixelRatio(1); renderer.transmissionResolutionScale = 0.4; taille(); } mesures = lent = 0; } }
    }
    requestAnimationFrame(boucle);
  }
  requestAnimationFrame(boucle);
}

if (toile) fetch("assets/m-marque.svg").then(r => r.text()).then(lancer).catch(() => {});
