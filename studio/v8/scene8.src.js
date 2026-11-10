/* Mokrani Studio v8 : la scène, en bleu nuit.
   Un bloc de glace (réfraction, dispersion, fêlures fines, cristaux et bulles). Dedans, une vraie page prise dans la glace :
   un site d'exemple en haut, la réservation pour les fonctions, un site Bleu égyptien pour l'Atelier.
   Aux tarifs, le bloc se fend en trois, un bloc au-dessus de chaque formule.
   Au contact, le givre qui flotte depuis le début se rassemble en anneau autour du numéro.
   Lit window.MS8 { mode, cibles } et l'événement "ms8" (v8.js). */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const toile = document.getElementById("glace");
const racine = document.documentElement;
const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pose = new URLSearchParams(location.search).get("rendu");
const E = window.MS8 || { mode: "ouverture", cibles: [] };

const BRUIT = `
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n21(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + 1.), f.x), f.y); }`;

/* Ce que chaque bloc contient selon le chapitre : [bloc du milieu, bloc gauche, bloc droit] */
const CONTENU = {
  ouverture: ["site-foret", null, null],
  tarifs: [null, null, null],
  atelier: ["site-egyptien", null, null],
  fonctions: ["resa", null, null],
  calme: [null, null, null],
  contact: [null, null, null]
};

function lancer() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: toile, antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: !!pose }); }
  catch (e) { return; }
  const petit = innerWidth < 760;
  let dpr = Math.min(devicePixelRatio || 1, petit ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.transmissionResolutionScale = petit ? 0.65 : 0.9;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  camera.position.set(0, 0, 9);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;
  const cle = new THREE.DirectionalLight(0xdcecff, 1.8); cle.position.set(4, 6, 5); scene.add(cle);
  const contre = new THREE.DirectionalLight(0x9db8ff, 1.0); contre.position.set(-5, -2, -4); scene.add(contre);

  /* ---------- Fond clair : ciel d'hiver et voiles de brume que la glace déforme ---------- */
  const fondMat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: BRUIT + `
      varying vec2 vUv; uniform float uT;
      void main(){
        vec2 p = vUv;
        vec3 c = mix(vec3(.004, .008, .02), vec3(.02, .05, .12), smoothstep(.0, 1., p.y));
        float b = n21(vec2(p.x * 2.4 + uT * .02, p.y * 1.3 - uT * .012));
        float voile = smoothstep(.45, .95, sin((p.x * 2. + b * 1.8 + uT * .015) * 3.1416) * .5 + .5) * smoothstep(.05, .55, p.y) * smoothstep(1., .45, p.y);
        c += vec3(.05, .17, .48) * voile * .6;
        c += vec3(.3, .55, 1.) * pow(n21(p * vec2(4., 38.) + vec2(uT * .01, 0.)), 9.) * .05;
        gl_FragColor = vec4(c, 1.);
      }`,
    depthWrite: false
  });
  const fond = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), fondMat); fond.position.z = -14; scene.add(fond);

  /* ---------- Fêlures et givre, dessinés une fois ---------- */
  let s0 = 7; const r = () => (s0 = (s0 * 16807) % 2147483647) / 2147483647;
  function cartes() {
    const T = 512, k = document.createElement("canvas"); k.width = k.height = T; const g = k.getContext("2d");
    g.fillStyle = "#808080"; g.fillRect(0, 0, T, T); g.lineCap = "round";
    for (let i = 0; i < 22; i++) {
      let x = r() * T, y = r() * T, a = r() * Math.PI * 2; const pas = 6 + r() * 12, nb = 5 + (r() * 16 | 0);
      g.strokeStyle = "rgba(0,0,0," + (0.25 + r() * 0.4) + ")"; g.lineWidth = 0.5 + r() * 1.2;
      g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < nb; j++) { a += (r() - 0.5) * 0.8; x += Math.cos(a) * pas; y += Math.sin(a) * pas; g.lineTo(x, y); if (r() < 0.12) { g.moveTo(x, y); a += (r() - 0.5) * 2; } }
      g.stroke();
    }
    g.filter = "blur(1px)"; g.drawImage(k, 0, 0); g.filter = "none";
    const src = g.getImageData(0, 0, T, T).data, nm = g.createImageData(T, T), d = nm.data;
    const H = (x, y) => src[(((y + T) % T) * T + ((x + T) % T)) * 4] / 255;
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * 3, dy = (H(x, y + 1) - H(x, y - 1)) * 3, l = Math.hypot(dx, dy, 1), o = (y * T + x) * 4;
      d[o] = (-dx / l * 0.5 + 0.5) * 255; d[o + 1] = (-dy / l * 0.5 + 0.5) * 255; d[o + 2] = (1 / l * 0.5 + 0.5) * 255; d[o + 3] = 255;
    }
    const kn = document.createElement("canvas"); kn.width = kn.height = T; kn.getContext("2d").putImageData(nm, 0, 0);
    const kr = document.createElement("canvas"); kr.width = kr.height = 256; const gr = kr.getContext("2d");
    gr.fillStyle = "rgb(16,16,16)"; gr.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 18; i++) { const x = r() * 256, y = r() * 256, rr = 8 + r() * 40, gd = gr.createRadialGradient(x, y, 0, x, y, rr);
      gd.addColorStop(0, "rgba(140,140,140," + (0.25 + r() * 0.45) + ")"); gd.addColorStop(1, "rgba(140,140,140,0)"); gr.fillStyle = gd; gr.fillRect(0, 0, 256, 256); }
    const tn = new THREE.CanvasTexture(kn), tr = new THREE.CanvasTexture(kr);
    [tn, tr].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; });
    return { tn, tr };
  }
  const { tn, tr } = cartes();
  const glace = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transmission: 1, thickness: 1.0, ior: 1.31, dispersion: 3.5,
    roughness: 0.14, roughnessMap: tr, normalMap: tn, normalScale: new THREE.Vector2(0.16, 0.16),
    attenuationColor: new THREE.Color(0xc4dcff), attenuationDistance: 4.5,
    specularIntensity: 0.55, clearcoat: 0.18, clearcoatRoughness: 0.2, envMapIntensity: 0.55
  });
  const geoBloc = new RoundedBoxGeometry(2.1, 2.1, 1.15, 6, 0.16);

  /* Cristaux fins et bulles, poussés vers les coins pour laisser la page lisible */
  const geoCristal = new THREE.OctahedronGeometry(1, 0), matCristal = new THREE.MeshStandardMaterial({ color: 0xa9c3e6, roughness: 0.25, emissive: 0x4a76c9, emissiveIntensity: 0.06 });
  const geoBulle = new THREE.SphereGeometry(1, 8, 6), matBulle = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
  function interieur(graine) {
    let s = graine; const rr = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const g = new THREE.Group(), m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    const NC = 22, NB = 120;
    const cr = new THREE.InstancedMesh(geoCristal, matCristal, NC), bu = new THREE.InstancedMesh(geoBulle, matBulle, NB);
    const coins = [[1, 1, 1], [-1, 1, -1], [1, -1, -1], [-1, -1, 1]].map(v => new THREE.Vector3(v[0] * 0.66, v[1] * 0.66, v[2] * 0.3));
    for (let i = 0; i < NC; i++) {
      const o = coins[i % 4], dir = new THREE.Vector3(rr() - 0.5, rr() - 0.5, rr() - 0.5).normalize();
      p.copy(o).addScaledVector(dir, 0.05 + rr() * 0.2);
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); const e = 0.006 + rr() * 0.012; sc.set(e, 0.05 + rr() * 0.15, e);
      cr.setMatrixAt(i, m.compose(p, q, sc));
    }
    for (let i = 0; i < NB; i++) {
      p.set((rr() - 0.5) * 1.8, (rr() - 0.5) * 1.8, (rr() - 0.5) * 0.9); if (Math.abs(p.z) < 0.1) p.z += 0.18 * Math.sign(p.z || 1);
      const e = 0.003 + rr() * rr() * 0.018; sc.set(e, e, e); bu.setMatrixAt(i, m.compose(p, q.identity(), sc));
    }
    g.add(cr, bu); return g;
  }

  /* ---------- Ce qui est pris dans la glace ---------- */
  const images = {};
  function givrer(g, w, h) {
    /* un voile blanc très léger et du givre qui gagne depuis les coins */
    g.fillStyle = "rgba(240,246,255,.03)"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      const x = i % 2 ? w : 0, y = i < 2 ? 0 : h, gd = g.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * 0.55);
      gd.addColorStop(0, "rgba(245,250,255,.3)"); gd.addColorStop(1, "rgba(245,250,255,0)"); g.fillStyle = gd; g.fillRect(0, 0, w, h);
    }
    for (let i = 0; i < 900; i++) { const x = r() * w, y = r() * h, e = Math.min(x, w - x, y, h - y) / Math.min(w, h); if (r() > e * 3.2) { g.fillStyle = "rgba(255,255,255," + (0.15 + r() * 0.35) + ")"; g.fillRect(x, y, 1 + r() * 2, 1 + r() * 2); } }
  }
  function cadre(w, h, rayon) { const k = document.createElement("canvas"); k.width = w; k.height = h; const g = k.getContext("2d"); g.beginPath(); g.roundRect(0, 0, w, h, rayon); g.clip(); return { k, g }; }
  function texImage(cle, fichier) {
    const t = new THREE.Texture(); t.colorSpace = THREE.SRGBColorSpace; t.userData = { ratio: 1.6 };
    const im = new Image(); im.onload = () => {
      const w = 1024, h = Math.round(1024 * im.naturalHeight / im.naturalWidth), { k, g } = cadre(w, h, 26);
      g.drawImage(im, 0, 0, w, h);
      if (cle === "resa") { g.globalCompositeOperation = "multiply"; g.fillStyle = "rgb(196,208,228)"; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "source-over"; }
      givrer(g, w, h); t.image = k; t.userData.ratio = w / h; t.needsUpdate = true; majPlans();
    };
    im.src = "assets/" + fichier;
    images[cle] = t; return t;
  }
  texImage("site-foret", "site-foret.jpg"); texImage("site-egyptien", "site-egyptien.jpg"); texImage("resa", "resa.jpg");

  function bloc(graine) {
    const g = new THREE.Group(); g.add(new THREE.Mesh(geoBloc, glace)); g.add(interieur(graine));
    const mat = new THREE.MeshBasicMaterial({ alphaTest: 0.5, side: THREE.DoubleSide });
    const plan = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); plan.visible = false; plan.position.z = 0.05; g.add(plan);
    g.userData = { s: graine === 11 ? 1 : 0, x: 0, y: 0, plan, cle: null, voulu: null, bascule: 1 };
    scene.add(g); return g;
  }
  const blocs = [bloc(11), bloc(23), bloc(37)];
  function poserPlan(b) {
    const u = b.userData, t = u.cle && images[u.cle];
    if (!t || !t.image) { u.plan.visible = false; return; }
    u.plan.material.map = t; u.plan.material.needsUpdate = true; u.plan.visible = true;
    const ratio = t.userData.ratio || 1.6, long = 1.74;
    if (ratio >= 1) u.plan.scale.set(long, long / ratio, 1); else u.plan.scale.set(long * 1.05 * ratio, long * 1.05, 1);
  }
  function majPlans() { blocs.forEach(poserPlan); }

  /* ---------- Givre qui flotte : discret partout, en anneau au contact ---------- */
  const N = petit ? 1100 : 2200, Hh = 16, W = 26;
  const base = new Float32Array(N * 3), rnd = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { base[i * 3] = (Math.random() - 0.5) * W; base[i * 3 + 1] = (Math.random() - 0.5) * Hh; base[i * 3 + 2] = -6 + Math.random() * 9; for (let j = 0; j < 4; j++) rnd[i * 4 + j] = Math.random(); }
  const geoNeige = new THREE.BufferGeometry(); geoNeige.setAttribute("position", new THREE.BufferAttribute(base, 3)); geoNeige.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 4));
  const neigeMat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uForme: { value: 0 }, uAnneau: { value: 2.4 }, uPx: { value: dpr }, uH: { value: Hh }, uY: { value: 0 } },
    vertexShader: `
      attribute vec4 aRnd; uniform float uT, uForme, uAnneau, uPx, uH, uY; varying float vA;
      void main(){
        vec3 p = position;
        p.y = mod(p.y - uT * (.05 + aRnd.x * .12) + uY + uH * .5, uH) - uH * .5;
        p.x += sin(uT * .3 + aRnd.y * 6.2832) * .18;
        float an = aRnd.z * 6.2832 + uT * (.16 + aRnd.w * .2);
        float rr = uAnneau * (.84 + aRnd.x * .36);
        vec3 anneau = vec3(cos(an) * rr * 1.55, sin(an) * rr * .62, (aRnd.y - .5) * 1.2);
        float k = smoothstep(aRnd.w * .45, aRnd.w * .45 + .55, uForme);
        vec4 mv = modelViewMatrix * vec4(mix(p, anneau, k), 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1. + aRnd.x * 2.4) * uPx * (9. / -mv.z) * (1. + k * .3);
        vA = (.16 + aRnd.y * .4) * (.6 + k * 1.);
      }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d) * vA; gl_FragColor = vec4(vec3(.72, .86, 1.) * a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const neige = new THREE.Points(geoNeige, neigeMat); neige.frustumCulled = false; scene.add(neige);

  /* ---------- Image finale : légère aberration et givre qui gagne depuis les bords au changement ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const effet = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uAb: { value: 0.001 }, uGivre: { value: 0 }, uT: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: BRUIT + `
      uniform sampler2D tDiffuse; uniform float uAb, uGivre, uT; uniform vec2 uRes; varying vec2 vUv;
      void main(){
        vec2 uv = vUv, c = uv - .5, ar = vec2(uRes.x / uRes.y, 1.);
        float fn = n21(uv * ar * 5.) * .55 + n21(uv * ar * 17.) * .3 + n21(uv * ar * 41.) * .15;
        float bord = smoothstep(.2, .85, length(c) * 1.5 + fn * .35);
        float m = clamp(uGivre * 1.25 - (1. - bord) * 1.35, 0., 1.) * .7;
        uv += (vec2(n21(uv * ar * 23.), n21(uv * ar * 23. + 7.)) - .5) * .008 * m;
        vec2 dir = c * (uAb + m * .008);
        vec3 col = vec3(texture2D(tDiffuse, uv + dir).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - dir).b);
        col = mix(col, vec3(.5, .62, .8) * (.3 + fn * .4), m * .55);
        col *= 1. - smoothstep(.45, 1.1, length(c) * 1.3) * .45;
        col += (h21(uv * uRes + fract(uT) * 91.) - .5) * .018;
        gl_FragColor = vec4(col, 1.);
      }`
  });
  composer.addPass(effet);
  composer.addPass(new OutputPass());

  /* ---------- Mise en place selon le chapitre ---------- */
  let visH = 1, visW = 1;
  function taille() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    effet.uniforms.uRes.value.set(w * dpr, h * dpr);
    visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; visW = visH * camera.aspect;
  }
  taille(); addEventListener("resize", taille);
  const ecran = (px, py) => ({ x: (px / innerWidth - 0.5) * visW, y: (0.5 - py / innerHeight) * visH });

  function cible() {
    const portrait = innerWidth / innerHeight < 0.85, m = E.mode;
    const t = [{ x: 0, y: 0, s: 0.0001 }, { x: 0, y: 0, s: 0.0001 }, { x: 0, y: 0, s: 0.0001 }];
    const cote = portrait ? { x: 0, y: visH * 0.21 } : { x: visW * 0.23, y: 0 };
    if (m === "ouverture" || m === "atelier") t[0] = { x: cote.x, y: cote.y, s: portrait ? 0.72 : 1.15 };
    else if (m === "fonctions") t[0] = { x: cote.x, y: cote.y, s: portrait ? 0.62 : 1.0 };
    
    else if (m === "tarifs") {
      const c = E.cibles || [], ecart = c.length === 3 ? Math.abs(c[2].x - c[0].x) : 0;
      if (c.length === 3 && ecart > innerWidth * 0.3) {
        const s = Math.min(0.46, (ecart / 2 / innerWidth) * visW * 0.34);
        c.forEach((pt, i) => { const w = ecran(pt.x, pt.y); t[[1, 0, 2][i]] = { x: w.x, y: w.y + s * 1.3, s }; });
      } else t[0] = { x: 0, y: visH * 0.24, s: 0.6 };
    }
    return t;
  }

  /* Ce que contient chaque bloc : le changement passe par un coup de givre */
  function surChapitre() {
    const portrait = innerWidth / innerHeight < 0.85;
    const voulu = (CONTENU[E.mode] || CONTENU.calme).slice();
    
    blocs.forEach((b, i) => { const u = b.userData; if (voulu[i] !== u.voulu) { u.voulu = voulu[i]; u.bascule = 0; } });
  }
  addEventListener("ms8", surChapitre); surChapitre();

  const sx = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", e => { sx.tx = e.clientX / innerWidth - 0.5; sx.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  let yAvant = scrollY, vitesse = 0, forme = 0, givre = 0;

  let nbImages = 0, cumul = 0, allege = false;
  function alleger() { allege = true; dpr = 1; renderer.setPixelRatio(1); neigeMat.uniforms.uPx.value = 1; geoNeige.setDrawRange(0, Math.floor(N * 0.5)); renderer.transmissionResolutionScale = 0.55; taille(); }

  const horloge = new THREE.Clock(); let temps = pose ? 12 : 0, premier = true;
  function image() {
    const dtR = Math.min(horloge.getDelta(), 0.25), dt = Math.min(dtR, 0.05);
    if (!reduit && !pose) temps += dt;
    if (!allege && nbImages < 120) { nbImages++; cumul += dtR; if (nbImages === 120 && cumul / 120 > 0.03) alleger(); }
    const lisse = 1 - Math.exp(-dtR * 3.2);
    const y = scrollY; vitesse += ((y - yAvant) / Math.max(dtR, 0.001) - vitesse) * 0.12; yAvant = y;
    sx.x += (sx.tx - sx.x) * lisse; sx.y += (sx.ty - sx.y) * lisse;

    const t = cible(); let pic = 0;
    blocs.forEach((b, i) => {
      const u = b.userData; u.x += (t[i].x - u.x) * lisse; u.y += (t[i].y - u.y) * lisse; u.s += (t[i].s - u.s) * lisse;
      b.position.set(u.x, u.y, 0); b.scale.setScalar(Math.max(u.s, 0.0001)); b.visible = u.s > 0.01;
      /* le bloc oscille sans tourner sur lui-même : la page reste lisible */
      b.rotation.y = -0.24 + Math.sin(temps * 0.22 + i * 1.3) * 0.12 + sx.x * 0.3;
      b.rotation.x = -0.16 + Math.sin(temps * 0.17 + i) * 0.06 + sx.y * 0.22;
      b.rotation.z = Math.sin(temps * 0.12 + i * 2) * 0.03;
      if (u.bascule < 1) {
        u.bascule = Math.min(1, u.bascule + dtR / (reduit ? 0.01 : 0.85));
        if (u.cle !== u.voulu && u.bascule > 0.45) { u.cle = u.voulu; poserPlan(b); }
      }
      if (b.visible) pic = Math.max(pic, Math.sin(u.bascule * Math.PI));
      u.plan.rotation.y = -b.rotation.y * 0.9; u.plan.rotation.x = -b.rotation.x * 0.85;
    });

    forme += ((E.mode === "contact" ? 1 : 0) - forme) * (1 - Math.exp(-dtR * 1.4));
    neigeMat.uniforms.uT.value = temps; neigeMat.uniforms.uForme.value = forme; neigeMat.uniforms.uY.value = y * 0.002;
    neigeMat.uniforms.uAnneau.value = Math.min(visW * 0.28, 2.6);
    fondMat.uniforms.uT.value = temps;
    effet.uniforms.uT.value = temps;
    givre += ((reduit ? 0 : pic) - givre) * 0.5;
    effet.uniforms.uGivre.value = givre * 0.8;
    effet.uniforms.uAb.value = 0.0008 + Math.min(Math.abs(vitesse) / 40000, 0.006) + givre * 0.004;

    composer.render();
    if (premier) { premier = false; racine.classList.add("gl"); }
  }

  if (pose) { E.mode = pose; surChapitre(); for (let i = 0; i < 200; i++) image(); racine.classList.add("rendu-pret"); return; }
  let tourne = true;
  document.addEventListener("visibilitychange", () => { tourne = !document.hidden; if (tourne) { horloge.getDelta(); boucle(); } });
  function boucle() { if (!tourne) return; image(); requestAnimationFrame(boucle); }
  boucle();
}
lancer();
