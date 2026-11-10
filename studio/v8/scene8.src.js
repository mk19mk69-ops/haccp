/* Mokrani Studio v8 : la scène.
   Un bloc de glace (réfraction, dispersion, fêlures, cristaux qui poussent dedans). Le métier du commerçant y est pris,
   et change quand on passe d'une fonction à l'autre, avec un coup de givre sur l'image. Aux tarifs, le bloc se fend en trois.
   Au contact, la neige qui flotte depuis le début se rassemble en anneau autour du numéro.
   Lit window.MS8 { mode, metier, cibles } et l'événement "ms8" (v8.js). */
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
const E = window.MS8 || { mode: "ouverture", metier: "autre", cibles: [] };

const BRUIT = `
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n21(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + 1.), f.x), f.y); }`;

function lancer() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: toile, antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: !!pose }); }
  catch (e) { return; }
  const petit = innerWidth < 760;
  let dpr = Math.min(devicePixelRatio || 1, petit ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.transmissionResolutionScale = petit ? 0.6 : 0.85;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  camera.position.set(0, 0, 9);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;
  const cle = new THREE.DirectionalLight(0xdcecff, 2.4); cle.position.set(4, 6, 5); scene.add(cle);
  const contre = new THREE.DirectionalLight(0x7fa8ff, 1.2); contre.position.set(-5, -2, -4); scene.add(contre);

  /* ---------- Fond : nuit bleutée et voiles d'aurore très doux, que la glace déforme ---------- */
  const fondMat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: BRUIT + `
      varying vec2 vUv; uniform float uT;
      void main(){
        vec2 p = vUv;
        vec3 c = mix(vec3(.003, .005, .01), vec3(.012, .026, .058), smoothstep(.0, 1., p.y));
        float b = n21(vec2(p.x * 2.6 + uT * .025, p.y * 1.4 - uT * .015));
        float voile = smoothstep(.5, .95, sin((p.x * 2.2 + b * 1.8 + uT * .018) * 3.1416) * .5 + .5) * smoothstep(.1, .6, p.y) * smoothstep(1., .5, p.y);
        c += vec3(.05, .16, .42) * voile * .55;
        c += vec3(.25, .5, .9) * pow(n21(p * vec2(5., 46.) + vec2(uT * .01, 0.)), 10.) * .05;
        gl_FragColor = vec4(c, 1.);
      }`,
    depthWrite: false
  });
  const fond = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), fondMat); fond.position.z = -14; scene.add(fond);

  /* ---------- Fêlures et givre de la glace, dessinés une fois ---------- */
  function cartes() {
    const T = 512, k = document.createElement("canvas"); k.width = k.height = T; const g = k.getContext("2d");
    g.fillStyle = "#808080"; g.fillRect(0, 0, T, T);
    let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.lineCap = "round";
    for (let i = 0; i < 34; i++) {
      let x = r() * T, y = r() * T, a = r() * Math.PI * 2; const pas = 6 + r() * 14, nb = 6 + (r() * 22 | 0);
      g.strokeStyle = "rgba(0,0,0," + (0.35 + r() * 0.5) + ")"; g.lineWidth = 0.6 + r() * 1.8;
      g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < nb; j++) { a += (r() - 0.5) * 0.9; x += Math.cos(a) * pas; y += Math.sin(a) * pas; g.lineTo(x, y);
        if (r() < 0.12) { g.moveTo(x, y); a += (r() - 0.5) * 2; } }
      g.stroke();
    }
    g.filter = "blur(1.2px)"; g.drawImage(k, 0, 0); g.filter = "none";
    const src = g.getImageData(0, 0, T, T).data, nm = g.createImageData(T, T), d = nm.data;
    const H = (x, y) => src[(((y + T) % T) * T + ((x + T) % T)) * 4] / 255;
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * 3, dy = (H(x, y + 1) - H(x, y - 1)) * 3, l = Math.hypot(dx, dy, 1), o = (y * T + x) * 4;
      d[o] = (-dx / l * 0.5 + 0.5) * 255; d[o + 1] = (-dy / l * 0.5 + 0.5) * 255; d[o + 2] = (1 / l * 0.5 + 0.5) * 255; d[o + 3] = 255;
    }
    const kn = document.createElement("canvas"); kn.width = kn.height = T; kn.getContext("2d").putImageData(nm, 0, 0);
    const kr = document.createElement("canvas"); kr.width = kr.height = 256; const gr = kr.getContext("2d");
    gr.fillStyle = "rgb(20,20,20)"; gr.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 26; i++) { const x = r() * 256, y = r() * 256, rr = 10 + r() * 46, gd = gr.createRadialGradient(x, y, 0, x, y, rr);
      gd.addColorStop(0, "rgba(150,150,150," + (0.3 + r() * 0.5) + ")"); gd.addColorStop(1, "rgba(150,150,150,0)"); gr.fillStyle = gd; gr.fillRect(0, 0, 256, 256); }
    const tn = new THREE.CanvasTexture(kn), tr = new THREE.CanvasTexture(kr);
    [tn, tr].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; });
    return { tn, tr };
  }
  const { tn, tr } = cartes();

  const glace = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transmission: 1, thickness: 1.8, ior: 1.31, dispersion: 4,
    roughness: 0.45, roughnessMap: tr, normalMap: tn, normalScale: new THREE.Vector2(0.32, 0.32),
    attenuationColor: new THREE.Color(0xa6d2ff), attenuationDistance: 3.2,
    specularIntensity: 1, clearcoat: 0.6, clearcoatRoughness: 0.12, envMapIntensity: 1.1
  });
  const geoBloc = new RoundedBoxGeometry(2, 2, 2, 6, 0.16);

  /* Cristaux et bulles prises dans la glace (opaques : la réfraction les montre) */
  const geoCristal = new THREE.OctahedronGeometry(1, 0), matCristal = new THREE.MeshStandardMaterial({ color: 0xe6f2ff, roughness: 0.35, emissive: 0x6fa8ff, emissiveIntensity: 0.14 });
  const geoBulle = new THREE.SphereGeometry(1, 8, 6), matBulle = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.12 });
  function interieur(graine) {
    let s = graine; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const g = new THREE.Group(), m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    const cr = new THREE.InstancedMesh(geoCristal, matCristal, 30), bu = new THREE.InstancedMesh(geoBulle, matBulle, 130);
    const germes = Array.from({ length: 5 }, () => { const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(); return v.multiplyScalar(0.55 + r() * 0.2); });
    for (let i = 0; i < 30; i++) {
      const o = germes[i % 5]; const dir = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
      p.copy(o).addScaledVector(dir, 0.12 + r() * 0.28); p.clampLength(0, 0.78);
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); const e = 0.012 + r() * 0.028; sc.set(e, 0.1 + r() * 0.3, e);
      cr.setMatrixAt(i, m.compose(p, q, sc));
    }
    for (let i = 0; i < 130; i++) { p.set(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(1.6); const e = 0.004 + r() * r() * 0.022; sc.set(e, e, e); bu.setMatrixAt(i, m.compose(p, q.identity(), sc)); }
    g.add(cr, bu); return g;
  }
  function bloc(graine) {
    const g = new THREE.Group(); const b = new THREE.Mesh(geoBloc, glace); g.add(b); g.add(interieur(graine));
    g.userData = { s: graine === 11 ? 1 : 0, x: 0, y: 0 }; scene.add(g); return g;
  }
  const blocs = [bloc(11), bloc(23), bloc(37)];
  blocs[1].scale.setScalar(0.0001); blocs[2].scale.setScalar(0.0001);

  /* ---------- Le métier pris dans la glace ---------- */
  const textures = {};
  function texMetier(cle) {
    if (textures[cle]) return textures[cle];
    const k = document.createElement("canvas"); k.width = k.height = 512; const t = new THREE.CanvasTexture(k); t.colorSpace = THREE.SRGBColorSpace; textures[cle] = t;
    const G = window.GLYPHES || {}; const corps = G[cle] || G.autre || "";
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="512" height="512"><style>*{fill:none;stroke:#fff;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}.a{fill:#d6ecff;stroke:#d6ecff}.p{fill:#fff;stroke:none}</style>' + corps + "</svg>";
    const im = new Image(); im.onload = () => { const g = k.getContext("2d"); g.clearRect(0, 0, 512, 512); g.drawImage(im, 0, 0, 512, 512); t.needsUpdate = true; };
    im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    return t;
  }
  const matGlyphe = new THREE.MeshBasicMaterial({ map: texMetier("autre"), alphaTest: 0.45, toneMapped: false, color: new THREE.Color(1.25, 1.35, 1.5), side: THREE.DoubleSide });
  const glyphe = new THREE.Group();
  for (let i = 0; i < 2; i++) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), matGlyphe); pl.position.z = (i - 0.5) * 0.02; glyphe.add(pl); }
  blocs[0].add(glyphe);
  ["barbier", "boucherie", "restaurant", "boulangerie", "snack"].forEach(texMetier);

  /* ---------- Neige : flotte partout, se rassemble au contact ---------- */
  const N = petit ? 1300 : 2600, H = 16, W = 26;
  const base = new Float32Array(N * 3), rnd = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { base[i * 3] = (Math.random() - 0.5) * W; base[i * 3 + 1] = (Math.random() - 0.5) * H; base[i * 3 + 2] = -6 + Math.random() * 9; for (let j = 0; j < 4; j++) rnd[i * 4 + j] = Math.random(); }
  const geoNeige = new THREE.BufferGeometry(); geoNeige.setAttribute("position", new THREE.BufferAttribute(base, 3)); geoNeige.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 4));
  const neigeMat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uForme: { value: 0 }, uAnneau: { value: 2.4 }, uPx: { value: dpr }, uH: { value: H }, uY: { value: 0 } },
    vertexShader: `
      attribute vec4 aRnd; uniform float uT, uForme, uAnneau, uPx, uH, uY; varying float vA;
      void main(){
        vec3 p = position;
        p.y = mod(p.y - uT * (.06 + aRnd.x * .14) + uY + uH * .5, uH) - uH * .5;
        p.x += sin(uT * .3 + aRnd.y * 6.2832) * .18;
        float an = aRnd.z * 6.2832 + uT * (.18 + aRnd.w * .22);
        float r = uAnneau * (.82 + aRnd.x * .4);
        vec3 anneau = vec3(cos(an) * r * 1.55, sin(an) * r * .62, (aRnd.y - .5) * 1.4);
        float k = smoothstep(aRnd.w * .45, aRnd.w * .45 + .55, uForme);
        vec3 q = mix(p, anneau, k);
        vec4 mv = modelViewMatrix * vec4(q, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1. + aRnd.x * 2.6) * uPx * (9. / -mv.z) * (1. + k * .4);
        vA = (.18 + aRnd.y * .45) * (.6 + k * .9);
      }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d) * vA; gl_FragColor = vec4(vec3(.72, .86, 1.) * a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const neige = new THREE.Points(geoNeige, neigeMat); neige.frustumCulled = false; scene.add(neige);

  /* ---------- Image finale : aberration chromatique et givre qui gagne depuis les bords ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const effet = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uAb: { value: 0.0015 }, uGivre: { value: 0 }, uT: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: BRUIT + `
      uniform sampler2D tDiffuse; uniform float uAb, uGivre, uT; uniform vec2 uRes; varying vec2 vUv;
      void main(){
        vec2 uv = vUv, c = uv - .5; float d = length(c * vec2(uRes.x / uRes.y, 1.)) / (uRes.x / uRes.y) * 1.6;
        vec2 ar = vec2(uRes.x / uRes.y, 1.); float fn = n21(uv * ar * 5.) * .55 + n21(uv * ar * 17.) * .3 + n21(uv * ar * 41.) * .15;
        float bord = smoothstep(.2, .85, length(c) * 1.5 + fn * .35);
        float m = clamp(uGivre * 1.25 - (1. - bord) * 1.35, 0., 1.) * .75;
        uv += (vec2(n21(uv * ar * 23.), n21(uv * ar * 23. + 7.)) - .5) * .01 * m;
        vec2 dir = c * (uAb + m * .012);
        vec3 col = vec3(texture2D(tDiffuse, uv + dir).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - dir).b);
        col = mix(col, vec3(.62, .74, .9) * (.25 + fn * .45), m * .5);
        col *= 1. - smoothstep(.45, 1.1, length(c) * 1.3) * .5;
        col += (h21(uv * uRes + fract(uT) * 91.) - .5) * .02;
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
    const cote = portrait ? { x: 0, y: visH * 0.2 } : { x: visW * 0.22, y: 0 };
    if (m === "ouverture") t[0] = { x: cote.x, y: cote.y, s: portrait ? 0.7 : 1.1 };
    else if (m === "metier" || m === "atelier") t[0] = { x: cote.x, y: cote.y, s: portrait ? 0.78 : 1.0 };
    else if (m === "calme") t[0] = portrait ? { x: visW * 0.32, y: visH * 0.36, s: 0.3 } : { x: visW * 0.36, y: -visH * 0.12, s: 0.55 };
    else if (m === "contact") t[0] = { x: 0, y: visH * 0.02, s: 0.0001 };
    else if (m === "tarifs") {
      const c = E.cibles || [];
      const ecart = c.length === 3 ? Math.abs(c[2].x - c[0].x) : 0;
      if (c.length === 3 && ecart > innerWidth * 0.3) {
        const s = Math.min(0.42, (ecart / 2 / innerWidth) * visW * 0.32);
        c.forEach((pt, i) => { const w = ecran(pt.x, pt.y); t[[1, 0, 2][i]] = { x: w.x, y: w.y + s * 1.25, s }; });
      } else t[0] = { x: 0, y: visH * 0.24, s: 0.6 };
    }
    return t;
  }

  /* Passage d'un métier à l'autre : coup de givre, le motif change au plus fort */
  let metierVu = E.metier, bascule = 1, aChanger = null;
  function surChapitre() {
    if (E.metier !== metierVu) { aChanger = E.metier; metierVu = E.metier; bascule = 0; }
  }
  addEventListener("ms8", surChapitre);

  /* Souris et défilement */
  const sx = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", e => { sx.tx = e.clientX / innerWidth - 0.5; sx.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  let yAvant = scrollY, vitesse = 0, forme = 0;

  /* Garde-fou : si la machine peine, on allège */
  let images = 0, cumul = 0, allege = false;
  function alleger() { allege = true; dpr = 1; renderer.setPixelRatio(1); neigeMat.uniforms.uPx.value = 1; geoNeige.setDrawRange(0, Math.floor(N * 0.5)); renderer.transmissionResolutionScale = 0.5; taille(); }

  const horloge = new THREE.Clock(); let temps = pose ? 12 : 0, premier = true;
  function image() {
    const dtR = Math.min(horloge.getDelta(), 0.25), dt = Math.min(dtR, 0.05);
    if (!reduit && !pose) temps += dt;
    if (!allege && images < 120) { images++; cumul += dt; if (images === 120 && cumul / 120 > 0.03) alleger(); }
    const lisse = 1 - Math.exp(-dtR * 3.2);

    const y = scrollY; vitesse += ((y - yAvant) / Math.max(dt, 0.001) - vitesse) * 0.12; yAvant = y;
    sx.x += (sx.tx - sx.x) * lisse; sx.y += (sx.ty - sx.y) * lisse;

    const t = cible();
    blocs.forEach((b, i) => {
      const u = b.userData; u.x += (t[i].x - u.x) * lisse; u.y += (t[i].y - u.y) * lisse; u.s += (t[i].s - u.s) * lisse;
      b.position.set(u.x, u.y, 0); b.scale.setScalar(Math.max(u.s, 0.0001)); b.visible = u.s > 0.01;
      b.rotation.y = temps * 0.16 + i * 1.7 + sx.x * 0.5 + y * 0.0011;
      b.rotation.x = -0.32 + Math.sin(temps * 0.21 + i) * 0.06 + sx.y * 0.3;
      b.rotation.z = Math.sin(temps * 0.13 + i * 2) * 0.05;
    });

    /* motif du métier */
    if (bascule < 1) {
      bascule = Math.min(1, bascule + dtR / (reduit ? 0.01 : 0.9));
      if (aChanger && bascule > 0.45) { matGlyphe.map = texMetier(aChanger); matGlyphe.needsUpdate = true; aChanger = null; }
    }
    const pic = Math.sin(bascule * Math.PI);
    glyphe.scale.setScalar(1 - pic * 0.35);
    glyphe.rotation.y = -blocs[0].rotation.y * 0.65 + pic * 0.8;
    glyphe.visible = E.mode !== "tarifs";

    forme += ((E.mode === "contact" ? 1 : 0) - forme) * (1 - Math.exp(-dtR * 1.4));
    neigeMat.uniforms.uT.value = temps; neigeMat.uniforms.uForme.value = forme; neigeMat.uniforms.uY.value = y * 0.002;
    neigeMat.uniforms.uAnneau.value = Math.min(visW * 0.28, 2.6);
    fondMat.uniforms.uT.value = temps;

    effet.uniforms.uT.value = temps;
    effet.uniforms.uGivre.value = reduit ? 0 : pic * 0.9;
    effet.uniforms.uAb.value = 0.0012 + Math.min(Math.abs(vitesse) / 30000, 0.01) + pic * 0.006;

    composer.render();
    if (premier) { premier = false; racine.classList.add("gl"); }
  }

  if (pose) { E.mode = pose === "contact" ? "contact" : "ouverture"; for (let i = 0; i < 200; i++) image(); racine.classList.add("rendu-pret"); return; }
  let tourne = true;
  document.addEventListener("visibilitychange", () => { tourne = !document.hidden; if (tourne) { horloge.getDelta(); boucle(); } });
  function boucle() { if (!tourne) return; image(); requestAnimationFrame(boucle); }
  boucle();
}
lancer();
