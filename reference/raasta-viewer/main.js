import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';

const DEFAULTS = {
  splatUrl: 'https://sparkjs.dev/assets/splats/butterfly.spz',
  rotation: [180, 0, 0],
  scale: 1,
  modelY: 0,
  eyeHeight: 1.6,
  start: [0, 3],
  startYaw: 0,
  bounds: null,
  speed: 1.6,
  near: 0.35,
  fov: 62
};

const params = new URLSearchParams(location.search);
const cfg = { ...DEFAULTS, ...(await loadConfig()) };
if (params.get('model')) cfg.splatUrl = params.get('model');

async function loadConfig() {
  try {
    const r = await fetch('config.json', { cache: 'no-store' });
    return r.ok ? await r.json() : {};
  } catch { return {}; }
}

const isTouch = matchMedia('(pointer: coarse)').matches;
if (isTouch) document.body.classList.add('touch');

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1117);
const camera = new THREE.PerspectiveCamera(cfg.fov, innerWidth / innerHeight, cfg.near, 500);
camera.rotation.order = 'YXZ';
scene.add(new SparkRenderer({ renderer }));

const splat = new SplatMesh({ url: cfg.splatUrl });
scene.add(splat);
applyModelTransform();

function applyModelTransform() {
  const d = THREE.MathUtils.degToRad;
  splat.rotation.set(d(cfg.rotation[0]), d(cfg.rotation[1]), d(cfg.rotation[2]));
  splat.scale.setScalar(cfg.scale);
  splat.position.set(0, cfg.modelY, 0);
}

function resetCamera() {
  camera.position.set(cfg.start[0], cfg.eyeHeight, cfg.start[1]);
  camera.rotation.set(0, THREE.MathUtils.degToRad(cfg.startYaw), 0);
}
resetCamera();

const statusEl = document.getElementById('status');
const fill = document.getElementById('barfill');
const enterBtn = document.getElementById('enter');
let fake = 0;
const fakeTimer = setInterval(() => { fake = Math.min(92, fake + (95 - fake) * 0.06); fill.style.width = fake + '%'; }, 200);

function ready() {
  clearInterval(fakeTimer);
  fill.style.width = '100%';
  statusEl.textContent = 'Lab loaded. Ready to walk.';
  enterBtn.disabled = false;
}
function failed(err) {
  clearInterval(fakeTimer);
  console.error(err);
  statusEl.textContent = 'Could not load the 3D model. Check splatUrl in config.json.';
}
if (splat.initialized && typeof splat.initialized.then === 'function') splat.initialized.then(ready, failed);
else setTimeout(ready, 1500);

const controls = new PointerLockControls(camera, renderer.domElement);
enterBtn.addEventListener('click', () => {
  if (isTouch) document.body.classList.add('walking');
  else controls.lock();
});
controls.addEventListener('lock', () => document.body.classList.add('walking'));
controls.addEventListener('unlock', () => document.body.classList.remove('walking'));

const keys = {};
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyT' && !e.repeat) toggleTune();
  if (e.code === 'KeyR' && !e.repeat) resetCamera();
});
addEventListener('keyup', e => { keys[e.code] = false; });

const touchMove = { fwd: false, back: false };
document.querySelectorAll('#touch button').forEach(b => {
  const k = b.dataset.move;
  const on = e => { e.preventDefault(); touchMove[k] = true; };
  const off = e => { e.preventDefault(); touchMove[k] = false; };
  b.addEventListener('pointerdown', on);
  b.addEventListener('pointerup', off);
  b.addEventListener('pointerleave', off);
  b.addEventListener('pointercancel', off);
});

let drag = null;
renderer.domElement.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'touch') return;
  drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
});
renderer.domElement.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.x = e.clientX; drag.y = e.clientY;
  camera.rotation.y -= dx * 0.005;
  camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - dy * 0.005, -1.4, 1.4);
});
const endDrag = e => { if (drag && e.pointerId === drag.id) drag = null; };
renderer.domElement.addEventListener('pointerup', endDrag);
renderer.domElement.addEventListener('pointercancel', endDrag);

let boundsOn = true;
const fwd = new THREE.Vector3(), right = new THREE.Vector3(), move = new THREE.Vector3();

function step(dt) {
  const walking = document.body.classList.contains('walking');
  if (!walking) return;
  camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
  right.crossVectors(fwd, camera.up).normalize();
  move.set(0, 0, 0);
  if (keys.KeyW || keys.ArrowUp || touchMove.fwd) move.add(fwd);
  if (keys.KeyS || keys.ArrowDown || touchMove.back) move.sub(fwd);
  if (keys.KeyD || keys.ArrowRight) move.add(right);
  if (keys.KeyA || keys.ArrowLeft) move.sub(right);
  if (move.lengthSq() > 0) {
    const speed = cfg.speed * (keys.ShiftLeft || keys.ShiftRight ? 2.2 : 1);
    move.normalize().multiplyScalar(speed * dt);
    camera.position.add(move);
  }
  camera.position.y = cfg.eyeHeight;
  const b = cfg.bounds;
  if (boundsOn && b) {
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, Math.min(b.minX, b.maxX), Math.max(b.minX, b.maxX));
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, Math.min(b.minZ, b.maxZ), Math.max(b.minZ, b.maxZ));
  }
}

const fpsEl = document.getElementById('fps');
const posEl = document.getElementById('pos');
let frames = 0, fpsT = performance.now(), last = performance.now();
renderer.setAnimationLoop(now => {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  step(dt);
  renderer.render(scene, camera);
  frames++;
  if (now - fpsT > 500) {
    fpsEl.textContent = Math.round(frames * 1000 / (now - fpsT)) + ' fps';
    frames = 0; fpsT = now;
    if (tuneOpen) posEl.textContent = `x ${camera.position.x.toFixed(2)}  z ${camera.position.z.toFixed(2)}`;
  }
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const tune = document.getElementById('tune');
let tuneOpen = false;
const sliders = {
  rx: { get: () => cfg.rotation[0], set: v => { cfg.rotation[0] = v; } },
  ry: { get: () => cfg.rotation[1], set: v => { cfg.rotation[1] = v; } },
  rz: { get: () => cfg.rotation[2], set: v => { cfg.rotation[2] = v; } },
  sc: { get: () => cfg.scale, set: v => { cfg.scale = v; } },
  py: { get: () => cfg.modelY, set: v => { cfg.modelY = v; } },
  eh: { get: () => cfg.eyeHeight, set: v => { cfg.eyeHeight = v; } },
  nc: { get: () => cfg.near, set: v => { cfg.near = v; camera.near = v; camera.updateProjectionMatrix(); } },
  fv: { get: () => cfg.fov, set: v => { cfg.fov = v; camera.fov = v; camera.updateProjectionMatrix(); } }
};
for (const [id, s] of Object.entries(sliders)) {
  const el = document.getElementById(id);
  const out = el.nextElementSibling;
  el.value = s.get(); out.textContent = s.get();
  el.addEventListener('input', () => {
    const v = parseFloat(el.value);
    s.set(v); out.textContent = v;
    applyModelTransform();
  });
}
const here = () => [round(camera.position.x), round(camera.position.z)];
const round = v => Math.round(v * 100) / 100;
document.getElementById('setMin').onclick = () => { const [x, z] = here(); cfg.bounds = { ...(cfg.bounds || { maxX: x, maxZ: z }), minX: x, minZ: z }; showConfig(); };
document.getElementById('setMax').onclick = () => { const [x, z] = here(); cfg.bounds = { ...(cfg.bounds || { minX: x, minZ: z }), maxX: x, maxZ: z }; showConfig(); };
document.getElementById('setStart').onclick = () => { cfg.start = here(); cfg.startYaw = Math.round(THREE.MathUtils.radToDeg(camera.rotation.y)); showConfig(); };
document.getElementById('noBounds').onclick = () => { boundsOn = !boundsOn; };
document.getElementById('copy').onclick = showConfig;

function showConfig() {
  const out = { ...cfg };
  if (params.get('model')) out.splatUrl = params.get('model');
  document.getElementById('out').value = JSON.stringify(out, null, 2);
}
function toggleTune() {
  tuneOpen = !tuneOpen;
  tune.hidden = !tuneOpen;
  posEl.textContent = '';
  if (tuneOpen) { boundsOn = false; showConfig(); } else { boundsOn = true; }
}
if (params.has('tune')) toggleTune();
