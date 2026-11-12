import { gsap, ScrollTrigger } from './core';
import { initLenis } from './lenis';
import { intro, heroZoom, depthScenes, tunnel, assemble, scrubWords, horizontal, rules, parallax } from './effects';
import { frameScrubbers } from './frameScrubber';

/**
 * Jediný vstupní bod. Rozhoduje o reduced motion a mobilu,
 * efekty samy o sobě nic nevědí.
 */
export function initMotion() {
  // na finální font čekají jen efekty, které dělí text (SplitText měří znaky / slova)
  const fontsReady = document.fonts.ready;

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
      // piny vytvářej v pořadí, v jakém jsou na stránce (jinak nesedí start/end následujících)
      cleanups.push(frameScrubbers());
      cleanups.push(heroZoom(desktop));
      if (desktop) horizontal();
      rules();
      cleanups.push(depthScenes(desktop), tunnel(desktop), assemble(desktop));
      if (desktop) parallax();
      ScrollTrigger.refresh();

      // SplitText efekty až s finálním fontem. ctx.add(): i po await je zaregistruje do matchMedia
      // kontextu, takže se při změně breakpointu / reduced motion správně uklidí
      let alive = true;
      fontsReady.then(() => {
        if (!alive) return;
        ctx.add(() => {
          cleanups.push(intro(), scrubWords());
          ScrollTrigger.refresh();
        });
      });

      return () => {
        alive = false;
        cleanups.forEach((c) => c && c());
      };
    },
  );
}
