import {
  ACESFilmicToneMapping,
  type Material,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Scene,
  SphereGeometry,
  WebGLRenderer,
  MathUtils,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { CoreState } from './index';

/**
 * Three.js scéna skleněného jádra (vlastní chunk, načítá ji index.ts po prvním vykreslení).
 * Tvary jsou superelipsoidy z jedné SphereGeometry, morph = lineární mix vrcholů.
 *
 * Start je rozdělený do krátkých kroků (requestIdleCallback), aby hlavní vlákno nezamrzlo:
 *  1. renderer + koule (ostatní tvary se dopočítají po částech max. 8 ms, viz ShapeJob)
 *  2. kompilace shaderů osvětlení prostředí (PMREM) naprázdno, čekání bez blokování
 *  3. PMREM s hotovými shadery
 *  4. renderer.compileAsync hlavního materiálu
 *  5. první snímek
 * Každý krok počká, dokud uživatel 150 ms nescrolluje (scroll se nezasekne).
 * Mobil (<800 px): materiál bez clearcoatu (levnější shader, rozdíl jen na odlescích).
 */

const SEGMENTS = { desktop: 140, mobile: 96 };
/** koule, čip, telefon, okno prohlížeče: poloosy a, b, c a exponent n */
const SHAPES: [number, number, number, number][] = [
  [1, 1, 1, 2],
  [0.95, 0.95, 0.14, 14],
  [0.58, 1.15, 0.12, 9],
  [1.45, 0.92, 0.1, 9],
];
const LERP_PER_FRAME = 0.08; // při 60 fps; přes delta time: k = 1 − 0.92^(dt·60)
/** Úvodní moment stránky: po načtení scény opacity 0 → 1, scale 0.85 → 1.25 (u hera), power3.out */
const INTRO_S = 1.2;
const INTRO_FROM = 0.85 / 1.25;
/** Načtení za půlkou hera: žádný přílet, jen opacity 0 → cílová za 0.4 s (bez scale) */
const FADE_S = 0.4;
const TAU = Math.PI * 2;
/** krok startu se odloží, dokud od posledního scroll eventu neuběhne tolik ms */
const SCROLL_QUIET_MS = 150;
/** max. délka jednoho kroku výpočtu tvarů */
const SLICE_MS = 8;

type Params = [number, number, number, number];

/** superelipsoid pro vrcholy [from, to) jednotkové koule base (pozice po 3) */
function superellipsoid(base: Float32Array, [a, b, c, n]: Params, out: Float32Array, from: number, to: number) {
  for (let i = from; i < to; i += 3) {
    const x = base[i], y = base[i + 1], z = base[i + 2];
    const f = Math.pow(Math.abs(x / a) ** n + Math.abs(y / b) ** n + Math.abs(z / c) ** n, 1 / n) || 1;
    out[i] = x / f;
    out[i + 1] = y / f;
    out[i + 2] = z / f;
  }
}

type Deadline = { timeRemaining: () => number };
/** requestIdleCallback s náhradou pro Safari (bez rIC): setTimeout a 8ms rozpočet */
function idle(timeout = 1000): Promise<Deadline> {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) requestIdleCallback(resolve, { timeout });
    else setTimeout(() => {
      const end = performance.now() + SLICE_MS;
      resolve({ timeRemaining: () => Math.max(0, end - performance.now()) });
    }, 50);
  });
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Poslední scroll (Lenis i nativní scroll posílají scroll event na window). */
let lastScroll = -Infinity;
addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });
/** počká, až uživatel aspoň 150 ms nescrolluje */
async function quiet() {
  for (;;) {
    const wait = lastScroll + SCROLL_QUIET_MS - performance.now();
    if (wait <= 0) return;
    await sleep(wait);
  }
}
/** další krok startu: v idle čase a mimo scroll. fn běží ve stejném tasku jako idle callback */
async function step() {
  for (;;) {
    await quiet();
    await idle();
    if (lastScroll + SCROLL_QUIET_MS <= performance.now()) return;
  }
}

/**
 * Tvary k jedné hustotě sítě. Koule = základní pozice (hned), ostatní se počítají
 * v idle callbacích po kouscích do 8 ms. need() dopočítá tvar hned, kdyby byl potřeba dřív.
 */
class ShapeJob {
  base: Float32Array;
  shapes: (Float32Array | null)[];
  private next = 1;
  private i = 0;
  private out: Float32Array;
  private stopped = false;

  constructor(base: Float32Array) {
    this.base = base;
    this.shapes = SHAPES.map((_, k) => (k === 0 ? base.slice() : null));
    this.out = new Float32Array(base.length);
    this.run();
  }

  private work(until: number, upTo = SHAPES.length - 1) {
    const N = this.base.length;
    while (this.next <= upTo && performance.now() < until) {
      const to = Math.min(N, this.i + 3 * 1024);
      superellipsoid(this.base, SHAPES[this.next], this.out, this.i, to);
      this.i = to;
      if (to >= N) {
        this.shapes[this.next++] = this.out;
        this.out = new Float32Array(N);
        this.i = 0;
      }
    }
  }

  private async run() {
    while (!this.stopped && this.next < SHAPES.length) {
      const d = await idle(500);
      this.work(performance.now() + Math.min(SLICE_MS, Math.max(1, d.timeRemaining())));
    }
  }

  /** tvar k použití; když ještě není spočítaný, dopočítá ho (i předchozí) synchronně */
  need(k: number) {
    if (!this.shapes[k]) this.work(Infinity, k);
    return this.shapes[k]!;
  }

  stop() { this.stopped = true; }
}

/**
 * Shadery, které použije pmrem.fromScene(), jen zkompilovat: render se dočasně nahradí compile(),
 * takže se vytvoří stejné programy (stejný render target = stejný klíč programu), ale nic se nekreslí
 * a nečeká se na výsledek kompilace. Vrací materiály, na které pak počkáme přes isReady().
 */
function compilePmrem(renderer: WebGLRenderer, pmrem: PMREMGenerator, room: Scene) {
  const materials = new Set<Material>();
  const render = renderer.render;
  renderer.render = (scene, camera) => {
    renderer.compile(scene, camera).forEach((m) => materials.add(m));
  };
  try {
    pmrem.fromScene(room, 0.04).dispose();
  } finally {
    renderer.render = render;
  }
  return materials;
}

/** čeká bez blokování (KHR_parallel_shader_compile), až jsou programy materiálů hotové */
async function whenReady(renderer: WebGLRenderer, materials: Set<Material>) {
  for (;;) {
    for (const m of materials) {
      const program = (renderer.properties.get(m) as { currentProgram?: { isReady(): boolean } }).currentProgram;
      if (!program || program.isReady()) materials.delete(m);
    }
    if (!materials.size) return;
    await sleep(10);
  }
}

export async function startScene(canvas: HTMLCanvasElement, state: CoreState) {
  // 1. renderer a koule
  await step();
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = ACESFilmicToneMapping;

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const material = new MeshPhysicalMaterial({
    color: 0xdfe3ff,
    metalness: 0.9,
    roughness: 0.2,
    iridescence: 1,
    iridescenceIOR: 1.8,
    iridescenceThicknessMinimum: 100, // BRIEF: iridescenceThicknessRange [100, 1400] (od Three r187 rozděleno)
    iridescenceThicknessMaximum: 1400,
    clearcoat: state.mobile ? 0 : 1, // mobil bez clearcoatu
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.1,
    transparent: true,
  });
  const mesh = new Mesh(undefined, material);
  scene.add(mesh);

  const l1 = new PointLight(0x6f8cff, 80, 20);
  l1.position.set(-4, 2, 4);
  const l2 = new PointLight(0xff8fd0, 70, 20);
  l2.position.set(4, -2, 3);
  scene.add(l1, l2);

  // geometrie podle zařízení (desktop 140, mobil 96 segmentů); při změně breakpointu se přestaví
  let segments = 0;
  let job: ShapeJob | null = null;
  let shapeKey = '';
  function build(seg: number) {
    const geo = new SphereGeometry(1, seg, seg);
    job?.stop();
    job = new ShapeJob(geo.attributes.position.array as Float32Array);
    mesh.geometry.dispose();
    mesh.geometry = geo;
    segments = seg;
    shapeKey = '';
  }
  build(state.mobile ? SEGMENTS.mobile : SEGMENTS.desktop);

  /** tvar přímo podle scrollu; normály jen při změně */
  function setShape(a: number, b: number, t: number) {
    const key = `${segments}:${a}:${b}:${t.toFixed(3)}`;
    if (key === shapeKey) return;
    shapeKey = key;
    const A = job!.need(a), B = job!.need(b);
    const pos = mesh.geometry.attributes.position;
    const P = pos.array as Float32Array;
    for (let i = 0; i < P.length; i++) P[i] = A[i] + (B[i] - A[i]) * t;
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  }

  // 2. shadery osvětlení prostředí: kompilace naprázdno, čekání mimo hlavní vlákno
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  await step();
  await whenReady(renderer, compilePmrem(renderer, pmrem, room));

  // 3. osvětlení prostředí (PMREM) s hotovými shadery
  await step();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  pmrem.dispose();
  room.dispose();

  // 4. hlavní materiál (iridescence, clearcoat): kompilace bez blokování
  await step();
  await renderer.compileAsync(scene, camera);
  await quiet();

  let halfW = 1, halfH = 1;
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    halfH = Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfW = halfH * camera.aspect;
  }
  addEventListener('resize', resize);
  resize();

  // myš natáčí objekt (max. 0.5 / 0.3 rad), jen přesný ukazatel
  let mx = 0, my = 0;
  if (matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
  }

  const first = state.target();
  const cur = { x: first.x, y: first.y, s: first.s, o: first.o, mx: 0, my: 0 };
  let time = 0;
  let yaw = 0;
  let last = -1;
  let raf = 0;
  let intro = state.reduce ? 1 : 0; // reduced motion: rovnou finální stav
  const introS = state.pastHero() ? FADE_S : INTRO_S;
  const introFrom = state.pastHero() ? 1 : INTRO_FROM;

  function frame(now: number) {
    if (last < 0) performance.mark('core:first-frame'); // měření vůči LCP (DevTools / Lighthouse)
    const dt = last < 0 ? 0 : Math.min(0.1, (now - last) / 1000);
    last = now;
    time += dt;

    const seg = state.mobile ? SEGMENTS.mobile : SEGMENTS.desktop;
    if (seg !== segments) build(seg);
    material.clearcoat = state.mobile ? 0 : 1; // přechod přes 0 = nový program (jen při změně breakpointu)

    const t = state.target();
    const reduce = state.reduce;
    const k = reduce ? 1 : 1 - Math.pow(1 - LERP_PER_FRAME, dt * 60);
    cur.x += (t.x - cur.x) * k;
    cur.y += (t.y - cur.y) * k;
    cur.s += (t.s - cur.s) * k;
    cur.o += (t.o - cur.o) * k;
    cur.mx += (mx - cur.mx) * k;
    cur.my += (my - cur.my) * k;

    // reduced motion: tvar skokem
    const morph = reduce ? (t.morph < 0.5 ? 0 : 1) : t.morph;
    setShape(t.shapeA, t.shapeB, morph);

    mesh.position.set(cur.x * halfW, cur.y * halfH, 0);
    if (intro < 1) intro = state.reduce ? 1 : Math.min(1, intro + dt / introS);
    const e = 1 - (1 - intro) ** 3;
    mesh.scale.setScalar(cur.s * (introFrom + (1 - introFrom) * e));
    material.opacity = cur.o * e;

    if (reduce) {
      mesh.rotation.set(0.1, -0.35, 0);
    } else {
      // koule: pomalu kolem Y (0.15 rad/s); ploché tvary: jen kývání ±0.25 rad. Mezi nimi plynulý
      // přechod podle podílu plochého tvaru. Úhel koule se přetáčí o 2π (k úhlu kývání) jen u čisté
      // koule, kde je to neviditelné; při morphu by to byl skok
      const flatW = (t.shapeA > 0 ? 1 - morph : 0) + (t.shapeB > 0 ? morph : 0);
      const swing = -0.45 + Math.sin(time * 0.4) * 0.25;
      yaw += 0.15 * dt * (1 - flatW);
      if (flatW === 0) yaw = swing + ((((yaw - swing) % TAU) + TAU + Math.PI) % TAU) - Math.PI;
      mesh.rotation.y = yaw + (swing - yaw) * flatW + cur.mx * 0.5;
      mesh.rotation.x = 0.12 + Math.sin(time * 0.3) * 0.08 + cur.my * 0.3;
    }
    // spodní hranice iridescence pomalu kolísá ±80
    material.iridescenceThicknessMinimum = 100 + (reduce ? 0 : Math.sin(time * 0.25) * 80);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  // pauza renderu při skrytém tabu
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });

  // 5. první snímek (až po kompilaci a mimo scroll)
  if (!document.hidden) raf = requestAnimationFrame(frame);
}
