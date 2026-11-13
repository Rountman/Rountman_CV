/**
 * Kotvy objektu. Sekce nese data-core='{"x":0,"y":0.12,"s":1.25,"o":1,"shape":"sphere"}':
 *  x, y  podíl poloviny šířky / výšky okna (0 = střed, y kladné = nahoru)
 *  s     scale, o opacity, shape = sphere | chip | phone | browser
 *  m     volitelně [od, do]: okno morphu tvaru na cestě K této kotvě (podíl úseku mezi kotvami),
 *        výchozí [0.35, 0.65] = uprostřed úseku, kde se přepíná i aktivní etapa.
 *        [0.75, 1] = tvar dojede přesně ve chvíli, kdy je kotva doma (About → Work: čip až se sticky)
 *  mobile volitelně {x, y, s, o}: absolutní hodnoty pro mobil (<800 px). Výchozí mobil =
 *        objekt na středu za textem: x 0, y + 0.25, s × 0.7, o × 0.6
 * Pozice, scale a opacity se mezi sousedními kotvami interpolují smoothstep(0.2, 0.8),
 * takže u každé sekce objekt chvíli drží. Tvar morphuje přímo se scrollem ve svém okně.
 */

export const SHAPES = ['sphere', 'chip', 'phone', 'browser'] as const;
export type ShapeName = (typeof SHAPES)[number];

type Pose = { x: number; y: number; s: number; o: number };
export type Anchor = Pose & { shape: number; m: [number, number]; mobile: Pose };
const MORPH_WINDOW: [number, number] = [0.35, 0.65];

/** Cíl objektu pro aktuální scroll. shapeA → shapeB podle morph (0..1). */
export type Target = { x: number; y: number; s: number; o: number; shapeA: number; shapeB: number; morph: number };

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function createAnchors() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-core]')];
  const anchors: Anchor[] = els.map((el) => {
    const k = JSON.parse(el.dataset.core || '{}');
    const shape = Math.max(0, SHAPES.indexOf(k.shape ?? 'sphere'));
    const x = k.x ?? 0, y = k.y ?? 0, s = k.s ?? 1, o = k.o ?? 1;
    const mobile = { x: 0, y: y + 0.25, s: s * 0.7, o: o * 0.6, ...k.mobile };
    return { x, y, s, o, shape, m: k.m ?? MORPH_WINDOW, mobile };
  });
  let at: number[] = [];

  /**
   * Scroll, při kterém je kotva „doma“: střed sekce (nebo její první obrazovky) na středu okna.
   * Pinnutá sekce se měří přes pin-spacer (při pinu je sama position: fixed).
   */
  function measure() {
    const vh = window.innerHeight;
    at = els.map((el) => {
      const box = (el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el) as HTMLElement;
      const r = box.getBoundingClientRect();
      return Math.max(0, r.top + window.scrollY + Math.min(r.height, vh) / 2 - vh / 2);
    });
  }

  function target(scroll: number, mobile = false): Target {
    const n = anchors.length;
    if (!n) return { x: 0, y: 0, s: 1, o: 1, shapeA: 0, shapeB: 0, morph: 0 };
    let i = 0;
    while (i < n - 1 && scroll >= at[i + 1]) i++;
    const A = anchors[i];
    const B = anchors[Math.min(i + 1, n - 1)];
    const a = mobile ? A.mobile : A, b = mobile ? B.mobile : B;
    const raw = i >= n - 1 ? 0 : (scroll - at[i]) / Math.max(1, at[i + 1] - at[i]);
    const t = i >= n - 1 ? 0 : smoothstep(0.2, 0.8, raw);
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      s: lerp(a.s, b.s, t),
      o: lerp(a.o, b.o, t),
      shapeA: A.shape,
      shapeB: B.shape,
      morph: A.shape === B.shape || i >= n - 1 ? 0 : smoothstep(B.m[0], B.m[1], raw),
    };
  }

  return { measure, target, count: anchors.length };
}
