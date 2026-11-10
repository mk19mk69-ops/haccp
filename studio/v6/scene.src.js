/* Mokrani Studio v6 : la scène, en version sobre.
   Un galet de verre dépoli flotte dans une lumière douce (un halo chaud, un halo froid) et suit lentement la page.
   Les métiers sont de petits galets de verre posés sous leurs boutons. La nuit (window.MS_NUIT) passe au graphite. */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const toile = document.getElementById("scene3d");
const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
const racine = document.documentElement;
const pose = new URLSearchParams(location.search).get("rendu");

function lancer() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: toile, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: !!pose }); }
  catch (e) { return; }
  const petit = innerWidth < 760;
  let dpr = Math.min(devicePixelRatio || 1, petit ? 1.25 : 1.5);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.transmissionResolutionScale = petit ? 0.6 : 0.85;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  /* Fond : perle le jour, graphite la nuit */
  const c = document.createElement("canvas"); c.width = 8; c.height = 256; const g = c.getContext("2d");
  const JOUR = [[245, 245, 246], [234, 235, 238], [218, 221, 227]], NUIT = [[22, 24, 28], [17, 19, 22], [12, 13, 16]];
  const fond = new THREE.CanvasTexture(c); fond.colorSpace = THREE.SRGBColorSpace; scene.background = fond;
  function peindre(n) {
    const d = g.createLinearGradient(0, 0, 0, 256);
    [0, 0.55, 1].forEach((p, i) => { const a = JOUR[i], b = NUIT[i]; d.addColorStop(p, "rgb(" + a.map((v, k) => Math.round(v + (b[k] - v) * n)).join(",") + ")"); });
    g.fillStyle = d; g.fillRect(0, 0, 8, 256); fond.needsUpdate = true;
  }
  peindre(0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.6;
  const cle = new THREE.DirectionalLight(0xfff4ea, 1.6); cle.position.set(5, 7, 6); scene.add(cle);

  /* Deux halos de lumière : c'est ce que le verre dépoli diffuse */
  function halo(couleur) {
    const k = document.createElement("canvas"); k.width = k.height = 256; const x = k.getContext("2d");
    const d = x.createRadialGradient(128, 128, 0, 128, 128, 128); d.addColorStop(0, couleur); d.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = d; x.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(k); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const chaud = halo("rgba(255,178,128,.95)"), froid = halo("rgba(120,150,255,.95)");
  const halos = [[chaud, 1.2, 1.4, 6.5], [froid, 3.6, -0.6, 7.5], [froid, -6, 3.5, 7]].map(([t, x, y, l]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(l, l), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0.85 }));
    m.position.set(x, y, -5); m.userData = { x, y }; scene.add(m); return m;
  });

  /* Le galet de verre dépoli */
  const verre = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.38, transmission: 1, thickness: 2.4, ior: 1.4, dispersion: 0,
    attenuationColor: new THREE.Color(0xe3e7f2), attenuationDistance: 3, specularIntensity: 0.35, envMapIntensity: 0.3 });
  const geoGalet = new THREE.SphereGeometry(1, 96, 64); geoGalet.scale(1.75, 1.6, 0.62);
  const galet = new THREE.Mesh(geoGalet, verre); scene.add(galet);

  /* Les métiers : de petits galets carrés en verre dépoli, un par bouton (.puce), qui suivent leur bouton à l'écran */
  const geoBloc = new RoundedBoxGeometry(1, 1, 0.5, 8, 0.28);
  const matBloc = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.42, transmission: 1, thickness: 0.6, ior: 1.4,
    attenuationColor: new THREE.Color(0xf1f3f8), attenuationDistance: 6, specularIntensity: 0.3, envMapIntensity: 0.45 });
  const matChoisi = matBloc.clone(); matChoisi.attenuationColor = new THREE.Color(0x8aa2ff); matChoisi.attenuationDistance = 1.2;
  const blocs = [];
  function relierBlocs() {
    document.querySelectorAll("#metiers .puce").forEach((b, i) => {
      if (b._bloc) return;
      const grp = new THREE.Group(), corps = new THREE.Mesh(geoBloc, matBloc); grp.add(corps);
      const lum = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: i % 3 ? froid : chaud, transparent: true, depthWrite: false, opacity: 0.55 }));
      lum.position.set(0.2, -0.25, -0.5); grp.add(lum); grp.userData.lum = lum;
      grp.visible = false; scene.add(grp);
      const o = { el: b, grp, corps, tour: 0, cible: 0, p: i * 1.7 }; b._bloc = o; blocs.push(o);
      const tourner = () => { if (!reduit) o.cible += Math.PI; sale = true; };
      b.addEventListener("pointerenter", tourner); b.addEventListener("focus", tourner);
    });
  }
  relierBlocs(); if (!blocs.length) { let n = 0; const iv = setInterval(() => { relierBlocs(); if (blocs.length || ++n > 20) clearInterval(iv); }, 300); }

  let L = 0, H = 0, sale = true;
  function taille() { L = innerWidth; H = innerHeight; renderer.setSize(L, H, false); camera.aspect = L / H; camera.position.z = L / H < 0.8 ? 16 : 12; camera.updateProjectionMatrix(); sale = true; }
  let sx = 0, sy = 0, cx = 0, cy = 0, defileC = 0, nuit = 0, nuitPeinte = 0;
  taille(); addEventListener("resize", taille);
  addEventListener("pointermove", e => { if (e.pointerType === "mouse") { sx = e.clientX / L - 0.5; sy = e.clientY / H - 0.5; sale = true; } }, { passive: true });
  addEventListener("scroll", () => { sale = true; }, { passive: true });
  addEventListener("ms:nuit", () => { sale = true; });

  const horloge = new THREE.Clock(); let t = 0, premier = true, lent = 0, mesures = 0, allege = false;
  const v3 = new THREE.Vector3();
  function image() {
    const dt = Math.min(horloge.getDelta(), 0.05); if (!reduit) t += dt;
    const max = Math.max(1, racine.scrollHeight - H), defile = scrollY / max;
    const k = reduit ? 1 : 1 - Math.exp(-dt * 4);
    defileC += (defile - defileC) * k; cx += (sx - cx) * k; cy += (sy - cy) * k;
    nuit += ((window.MS_NUIT ? 1 : 0) - nuit) * (reduit ? 1 : 1 - Math.exp(-dt * 2.4));
    if (Math.abs(nuit - nuitPeinte) > 0.004) { nuitPeinte = nuit; peindre(nuit); scene.environmentIntensity = 0.6 - 0.3 * nuit; }

    const etroit = L / H < 0.8, ecran = scrollY / H, debut = Math.max(0, 1 - ecran * 1.4);
    /* En haut : le galet se tient derrière le téléphone ; ensuite il glisse doucement d'un bord à l'autre */
    /* Ensuite il se range contre le bord droit et descend avec la page, sans passer sur le texte */
    galet.position.set(etroit ? 0.6 + (1 - debut) * 2.6 : 2.2 * debut + (1 - debut) * 5.6, (etroit ? 3.6 : 0.2) * debut + Math.sin(t * 0.4) * 0.12 + (1 - debut) * Math.sin(defileC * 6) * 1.4, -1.2 - (1 - debut) * 1.5);
    galet.rotation.set(0.35 + cy * 0.25 + Math.sin(t * 0.21) * 0.05, -0.5 + defileC * Math.PI * 1.5 + cx * 0.4 + Math.sin(t * 0.17) * 0.08, 0.15);
    galet.scale.setScalar(etroit ? 0.7 : 1);
    halos.forEach((m, i) => {
      const suit = i < 2 ? 1 : 0;
      m.position.x = suit ? galet.position.x + (i === 0 ? -1 : 1.4) + Math.sin(t * 0.08 + i) * 0.3 : m.userData.x;
      m.position.y = suit ? galet.position.y + (i === 0 ? 1 : -0.9) : m.userData.y - defileC * 3;
      m.material.opacity = 0.85 - 0.45 * nuit;
    });
    if (pose === "og") { galet.position.set(2.8, 0, -1); galet.rotation.set(0.35, -0.45, 0.15); galet.scale.setScalar(1.15); halos[0].position.set(1.8, 1, -5); halos[1].position.set(4.2, -0.9, -5); }
    camera.position.x = cx * 0.4; camera.position.y = -cy * 0.25; camera.lookAt(0, 0, 0); camera.updateMatrixWorld();

    const parPixel = 2 * Math.tan(THREE.MathUtils.degToRad(15)) * camera.position.z / H;
    let actifs = false;
    blocs.forEach(o => {
      const r = o.el.getBoundingClientRect(), vu = r.width > 0 && r.bottom > -80 && r.top < H + 80;
      o.grp.visible = vu; if (!vu) return;
      const cote2 = Math.min(r.width, 120), px = r.left + r.width / 2, py = r.top + 8 + cote2 / 2;
      v3.set((px / L) * 2 - 1, -(py / H) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
      const d = -camera.position.z / v3.z; o.grp.position.copy(camera.position).addScaledVector(v3, d);
      const choisi = o.el.getAttribute("aria-pressed") === "true";
      o.corps.material = choisi ? matChoisi : matBloc; o.grp.userData.lum.material.opacity = (choisi ? 0.9 : 0.5) * (1 - 0.4 * nuit);
      o.tour += (o.cible - o.tour) * (reduit ? 1 : 1 - Math.exp(-dt * 4)); if (Math.abs(o.cible - o.tour) > 0.01) actifs = true;
      o.grp.scale.setScalar(cote2 * parPixel * 0.82);
      o.grp.rotation.set(-0.1 + Math.sin(t * 0.5 + o.p) * 0.04, 0.22 + o.tour + Math.sin(t * 0.4 + o.p) * 0.08, 0);
    });
    if (actifs) sale = true;
    renderer.render(scene, camera);
    if (premier) { premier = false; racine.classList.add("gl"); }
  }
  function boucle() {
    if (!document.hidden && (!reduit || sale)) {
      sale = false; const avant = performance.now(); image();
      if (!allege && !reduit && !pose) { mesures++; if (performance.now() - avant > 30) lent++; if (mesures === 90) { if (lent > 45) { allege = true; racine.classList.add("leger"); dpr = 1; renderer.setPixelRatio(1); renderer.transmissionResolutionScale = 0.4; taille(); } mesures = lent = 0; } }
    }
    requestAnimationFrame(boucle);
  }
  requestAnimationFrame(boucle);
}
if (toile) lancer();
