import { ScrollTrigger } from '../motion/core';
import { createAnchors, type Target } from './anchors';

/**
 * Skleněné jádro: jeden 3D objekt za obsahem, řízený kotvami data-core (viz anchors.ts).
 * Tento modul je lehký (bez Three.js): kotvy, matchMedia, fallback. Scéna (scene.ts, vlastní chunk
 * s Three.js) se načte dynamicky až po prvním vykreslení, takže hero text na 3D nečeká.
 *
 *  <canvas data-core-canvas>     fixed canvas za obsahem (aria-hidden)
 *  [data-core-fallback]          CSS koule, když chybí WebGL (nebo ?nogl)
 */

/** Sdílený stav pro scénu. Mění se průběžně (matchMedia listener), scéna ho čte každý snímek. */
export type CoreState = {
  mobile: boolean;
  reduce: boolean;
  /** cíl pro aktuální scroll, pro mobil s mobilními hodnotami kotev */
  target: () => Target;
  /** true = stránka je při načtení scény odscrollovaná za půl hera → bez příletu, jen fade */
  pastHero: () => boolean;
};

const MOBILE = '(max-width: 799px)';
const REDUCE = '(prefers-reduced-motion: reduce)';

function hasWebGL() {
  if (new URLSearchParams(location.search).has('nogl')) return false;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

export function initCore() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-core-canvas]');
  const fallback = document.querySelector<HTMLElement>('[data-core-fallback]');
  const anchors = createAnchors();
  if (!canvas || !anchors.count) return;

  const mqMobile = matchMedia(MOBILE);
  const mqReduce = matchMedia(REDUCE);
  const state: CoreState = {
    mobile: mqMobile.matches,
    reduce: mqReduce.matches,
    target: () => anchors.target(window.scrollY, state.mobile),
    pastHero: () => {
      const hero = document.querySelector<HTMLElement>('[data-core]');
      return !!hero && window.scrollY > hero.offsetHeight * 0.5;
    },
  };
  mqMobile.addEventListener('change', (e) => { state.mobile = e.matches; anchors.measure(); });
  mqReduce.addEventListener('change', (e) => { state.reduce = e.matches; });

  // kotvy přeměřit, kdykoli se může posunout layout: resize, piny (ScrollTrigger refresh), písma
  anchors.measure();
  addEventListener('resize', anchors.measure);
  ScrollTrigger.addEventListener('refresh', anchors.measure);
  document.fonts?.ready.then(anchors.measure);

  const useFallback = () => {
    document.documentElement.classList.add('no-gl');
    if (!fallback) return;
    // CSS koule sleduje kotvy jen transformem (bez lerpu), opacity 0.5 × kotva
    const update = () => {
      const t = state.target();
      fallback.style.transform =
        `translate(-50%, -50%) translate(${t.x * 50}vw, ${-t.y * 50}vh) scale(${t.s})`;
      fallback.style.opacity = String(0.5 * t.o);
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    ScrollTrigger.addEventListener('refresh', update);
    update();
  };

  if (!hasWebGL()) {
    useFallback();
    return;
  }

  // až po prvním vykreslení: load → rAF → task (= po vykreslení snímku) → idle.
  // Samotný load může přijít dřív než první paint (lokálně / z cache), proto ještě rAF
  const load = () =>
    import('./scene')
      .then(({ startScene }) => startScene(canvas, state))
      .catch((err) => {
        console.warn('[core] WebGL scene failed, using CSS fallback', err);
        useFallback();
      });
  const idle = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1200 });
    else setTimeout(load, 200);
  };
  const schedule = () => requestAnimationFrame(() => setTimeout(idle, 0));
  if (document.readyState === 'complete') schedule();
  else addEventListener('load', schedule, { once: true });
}
