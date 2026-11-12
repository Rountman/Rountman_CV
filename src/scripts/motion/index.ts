import { gsap, ScrollTrigger } from './core';
import { initLenis } from './lenis';
import { intro, heroOut, scrubWords, horizontal, rules, parallax } from './effects';
import { frameScrubbers } from './frameScrubber';

/**
 * Jediný vstupní bod. Rozhoduje o reduced motion a mobilu,
 * efekty samy o sobě nic nevědí.
 */
export async function initMotion() {
  await document.fonts.ready; // SplitText musí měřit až s finálním fontem

  const mm = gsap.matchMedia();
  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 900px)',
    },
    (ctx) => {
      const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
      const root = document.documentElement;
      if (!motion) {
        root.classList.remove('motion');
        return;
      }
      root.classList.add('motion');

      const cleanups: (void | (() => void))[] = [];
      if (desktop) cleanups.push(initLenis());
      cleanups.push(intro(), scrubWords(), frameScrubbers());
      heroOut();
      rules();
      if (desktop) {
        horizontal();
        parallax();
      }
      ScrollTrigger.refresh();
      return () => cleanups.forEach((c) => c && c());
    },
  );
}
