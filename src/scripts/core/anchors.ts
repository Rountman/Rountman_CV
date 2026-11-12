/**
 * Kotvy objektu. Sekce nese data-core='{"x":0,"y":0.12,"s":1.25,"o":1,"shape":"sphere"}':
 *  x, y  podíl poloviny šířky / výšky okna (0 = střed, y kladné = nahoru)
 *  s     scale, o opacity, shape = sphere | chip | phone | browser
 * Mezi sousedními kotvami se interpoluje smoothstep(0.2, 0.8), takže u každé sekce objekt chvíli drží.
 */

export const SHAPES = ['sphere', 'chip', 'phone', 'browser'] as const;
export type ShapeName = (typeof SHAPES)[number];

export type Anchor = { x: number; y: number; s: number; o: number; shape: number };

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
    return { x: k.x ?? 0, y: k.y ?? 0, s: k.s ?? 1, o: k.o ?? 1, shape };
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

  function target(scroll: number): Target {
    const n = anchors.length;
    if (!n) return { x: 0, y: 0, s: 1, o: 1, shapeA: 0, shapeB: 0, morph: 0 };
    let i = 0;
    while (i < n - 1 && scroll >= at[i + 1]) i++;
    const a = anchors[i];
    const b = anchors[Math.min(i + 1, n - 1)];
    const t = i >= n - 1 ? 0 : smoothstep(0.2, 0.8, (scroll - at[i]) / Math.max(1, at[i + 1] - at[i]));
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      s: lerp(a.s, b.s, t),
      o: lerp(a.o, b.o, t),
      shapeA: a.shape,
      shapeB: b.shape,
      morph: a.shape === b.shape ? 0 : t,
    };
  }

  return { measure, target, count: anchors.length };
}
