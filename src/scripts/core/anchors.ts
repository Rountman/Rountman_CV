/**
 * Kotvy objektu. Sekce (nebo marker) nese data-core='{"x":0,"y":0.12,"s":1.25,"o":1,"shape":"sphere"}':
 *  x, y   podíl poloviny šířky / výšky okna (0 = střed, y kladné = nahoru)
 *  s      scale, o opacity, shape = sphere | chip | phone | browser
 *  m      volitelně [od, do]: okno morphu tvaru na cestě K této kotvě (podíl úseku mezi kotvami),
 *         výchozí [0.35, 0.65] = uprostřed úseku, kde se přepíná i aktivní etapa.
 *         [0.75, 1] = tvar dojede přesně ve chvíli, kdy je kotva doma (About → Work: čip až se sticky)
 *  mobile volitelně {x, y, s, o}: absolutní hodnoty pro mobil (<800 px). Výchozí mobil =
 *         objekt na středu za textem: x 0, y + 0.25, s × 0.7, o × 0.6
 *  at     volitelně posun kotvy ve vh od začátku pinu. Platí jen u pinnuté sekce (jinak se kotva
 *         vynechá), takže data-core může být i pole kotev: [{…}, {…, "at": 120}, {…, "at": 220}]
 *  ease   "linear" = úsek K této kotvě bez smoothstep (objekt jede přesně se scrollem: posun y o 2
 *         za 100vh = jede spolu s obsahem)
 * Pozice, scale a opacity se mezi sousedními kotvami interpolují smoothstep(0.2, 0.8),
 * takže u každé sekce objekt chvíli drží. Tvar morphuje přímo se scrollem ve svém okně.
 */

export const SHAPES = ['sphere', 'chip', 'phone', 'browser'] as const;
export type ShapeName = (typeof SHAPES)[number];

type Pose = { x: number; y: number; s: number; o: number };
type Anchor = Pose & {
  el: HTMLElement;
  shape: number;
  m: [number, number];
  mobile: Pose;
  at: number | null;
  linear: boolean;
};
const MORPH_WINDOW: [number, number] = [0.35, 0.65];

/** Cíl objektu pro aktuální scroll. shapeA → shapeB podle morph (0..1). */
export type Target = { x: number; y: number; s: number; o: number; shapeA: number; shapeB: number; morph: number };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function parse(el: HTMLElement): Anchor[] {
  const raw = JSON.parse(el.dataset.core || '{}');
  return (Array.isArray(raw) ? raw : [raw]).map((k) => {
    const x = k.x ?? 0, y = k.y ?? 0, s = k.s ?? 1, o = k.o ?? 1;
    return {
      el,
      x, y, s, o,
      shape: Math.max(0, SHAPES.indexOf(k.shape ?? 'sphere')),
      m: k.m ?? MORPH_WINDOW,
      mobile: { x: 0, y: y + 0.25, s: s * 0.7, o: o * 0.6, ...k.mobile },
      at: k.at ?? null,
      linear: k.ease === 'linear',
    };
  });
}

export function createAnchors() {
  const all = [...document.querySelectorAll<HTMLElement>('[data-core]')].flatMap(parse);
  /** aktivní kotvy (bez `at` u nepinnutých sekcí) a jejich scroll pozice */
  let list: Anchor[] = [];
  let at: number[] = [];

  /**
   * Scroll, při kterém je kotva „doma“: střed sekce (nebo její první obrazovky) na středu okna.
   * Pinnutá sekce se měří přes pin-spacer (při pinu je sama position: fixed); `at` = vh od začátku pinu.
   */
  function measure() {
    const vh = window.innerHeight;
    const pos: number[] = [];
    list = all.filter((a) => {
      const pinned = !!a.el.parentElement?.classList.contains('pin-spacer');
      if (a.at !== null && !pinned) return false;
      const box = (pinned ? a.el.parentElement : a.el) as HTMLElement;
      const r = box.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const p = a.at !== null ? top + (a.at * vh) / 100 : Math.max(0, top + Math.min(r.height, vh) / 2 - vh / 2);
      // pojistka: kotvy musí jít po sobě (krátká sekce po pinu by jinak vyšla před konec pinu)
      pos.push(Math.max(p, pos.length ? pos[pos.length - 1] + 1 : 0));
      return true;
    });
    at = pos;
  }

  function target(scroll: number, mobile = false): Target {
    const n = list.length;
    if (!n) return { x: 0, y: 0, s: 1, o: 1, shapeA: 0, shapeB: 0, morph: 0 };
    let i = 0;
    while (i < n - 1 && scroll >= at[i + 1]) i++;
    const A = list[i];
    const B = list[Math.min(i + 1, n - 1)];
    const a = mobile ? A.mobile : A, b = mobile ? B.mobile : B;
    const last = i >= n - 1;
    const raw = last ? 0 : (scroll - at[i]) / Math.max(1, at[i + 1] - at[i]);
    const t = last ? 0 : B.linear ? clamp01(raw) : smoothstep(0.2, 0.8, raw);
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      s: lerp(a.s, b.s, t),
      o: lerp(a.o, b.o, t),
      shapeA: A.shape,
      shapeB: B.shape,
      morph: A.shape === B.shape || last ? 0 : smoothstep(B.m[0], B.m[1], raw),
    };
  }

  return { measure, target, count: all.length };
}
