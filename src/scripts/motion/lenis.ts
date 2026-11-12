import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './core';

/** Smooth scroll propojený s GSAP tickerem (kanonický setup z README Lenisu). */
export function initLenis() {
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // kotvy (#contact) přes Lenis, ať neskáčou
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: 0 });
    });
  });

  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}
