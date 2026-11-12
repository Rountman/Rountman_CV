import { gsap } from './core';

/**
 * Sekvence snímků řízená scrollem (Apple styl / "průlet" z AI videa).
 * CV ji nepoužívá; je tu připravená pro promo weby.
 *
 * HTML:
 *   <section data-frames="/frames/desktop/frame-{i}.webp" data-frames-mobile="/frames/mobile/frame-{i}.webp"
 *            data-count="120" data-count-mobile="60" data-length="400">
 *     <canvas></canvas>
 *     ...overlay texty (normální HTML)...
 *   </section>
 *
 * Snímky vyrobíš: npm run frames -- video.mp4  (scripts/extract-frames.mjs)
 */
export function frameScrubbers() {
  const cleanups: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>('[data-frames]').forEach((section) => {
    const canvas = section.querySelector('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const pattern = (mobile && section.dataset.framesMobile) || section.dataset.frames!;
    const count = Number((mobile && section.dataset.countMobile) || section.dataset.count || 60);
    const length = Number(section.dataset.length || 300);
    const pad = String(count).length < 3 ? 3 : String(count).length;
    const src = (i: number) => pattern.replace('{i}', String(i + 1).padStart(pad, '0'));

    const images: (HTMLImageElement | undefined)[] = new Array(count);
    const load = (i: number) => {
      if (images[i]) return images[i];
      const img = new Image();
      img.decoding = 'async';
      img.src = src(i);
      images[i] = img;
      return img;
    };

    // progresivní preload: první snímek hned, pak každý 8., pak zbytek
    load(0).onload = () => draw(0);
    const order: number[] = [];
    for (let i = 0; i < count; i += 8) order.push(i);
    for (let i = 0; i < count; i++) if (i % 8) order.push(i);
    let k = 0;
    const idle = (cb: () => void) => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(cb) : setTimeout(cb, 16));
    const pump = () => { for (let n = 0; n < 6 && k < order.length; n++) load(order[k++]); if (k < order.length) idle(pump); };
    idle(pump);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      draw(state.frame);
    };

    const state = { frame: 0 };
    function nearestLoaded(i: number) {
      for (let d = 0; d < count; d++) {
        const a = images[i - d], b = images[i + d];
        if (a?.complete && a.naturalWidth) return a;
        if (b?.complete && b.naturalWidth) return b;
      }
    }
    function draw(i: number) {
      const img = nearestLoaded(Math.round(i));
      if (!img) return;
      // object-fit: cover
      const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    }

    resize();
    window.addEventListener('resize', resize);
    const tween = gsap.to(state, {
      frame: count - 1,
      ease: 'none',
      snap: 'frame',
      onUpdate: () => draw(state.frame),
      scrollTrigger: { trigger: section, start: 'top top', end: `+=${length}%`, pin: true, scrub: 0.5 },
    });
    cleanups.push(() => { tween.scrollTrigger?.kill(); tween.kill(); window.removeEventListener('resize', resize); });
  });
  return () => cleanups.forEach((c) => c());
}
