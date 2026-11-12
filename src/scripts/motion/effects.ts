import { gsap, SplitText, ScrollTrigger, ease, dur } from './core';

/**
 * Knihovna efektů. Každý efekt se zapíná data-atributem v HTML,
 * takže AI (i člověk) skládá stránku bez psaní nového JS.
 *
 *  data-intro             nadpis, který při načtení vyjede po znacích (jen jeden na stránku)
 *  data-intro-fade        prvky, které se objeví po intru
 *  data-hero-zoom         hero sekce: pin, jméno [data-zoom-name] se zvětšuje a rozšiřuje (wdth 62 → 125),
 *                         až jím divák „proletí“; [data-zoom-fade] zmizí v prvních 20 %
 *  data-depth-scenes     sekce s .scene uvnitř → JS přidá .depth-on, scény jsou na středu přes sebe;
 *                         pin, každá přiletí z hloubky, chvíli drží a odletí k divákovi;
 *                         [data-scene-counter] ukazuje „03 / 05“
 *  data-scrub-words       odstavec, jehož slova se rozsvěcují podle scrollu
 *  data-horizontal        sekce s .h-track uvnitř → pin + horizontální posun
 *  data-year-counter      (uvnitř data-horizontal) velký letopočet podle aktivní karty
 *  data-rule              linka, která se při scrollu "narýsuje" zleva doprava
 *  data-speed="0.8"       parallax (1 = normálně, <1 pomaleji, >1 rychleji)
 */

export function intro() {
  const title = document.querySelector<HTMLElement>('[data-intro]');
  const fades = gsap.utils.toArray<HTMLElement>('[data-intro-fade]');
  if (!title) return;
  const split = SplitText.create(title, { type: 'lines,chars', mask: 'lines' });
  const tl = gsap.timeline({ defaults: { ease: ease.reveal } });
  tl.set(title, { autoAlpha: 1 })
    .from(split.chars, { yPercent: 115, duration: dur.reveal, stagger: 0.022 })
    .to(fades, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: ease.soft }, '-=0.6')
    // po intru zpět na čistý text: maska řádků (overflow: clip) by ořízla jméno při hero zoomu
    .add(() => split.revert());
  return () => split.revert();
}

/**
 * Zoom k divákovi. Mobil: menší zvětšení a bez blur (výkon).
 * fontStretch je jediná povolená animace mimo transform/opacity/filter (jen hero nadpis).
 */
export function heroZoom(desktop: boolean) {
  gsap.utils.toArray<HTMLElement>('[data-hero-zoom]').forEach((section) => {
    const name = section.querySelector<HTMLElement>('[data-zoom-name]');
    const fades = section.querySelectorAll<HTMLElement>('[data-zoom-fade]');
    if (!name) return;
    const tl = gsap.timeline({
      defaults: { ease: ease.scrub },
      scrollTrigger: { trigger: section, start: 'top top', end: '+=80%', pin: true, scrub: true },
    });
    tl.to(name, { scale: desktop ? 3.2 : 1.8, fontStretch: '125%', transformOrigin: '50% 50%', duration: 1 }, 0)
      .to(name, desktop ? { opacity: 0, filter: 'blur(12px)', duration: 0.4 } : { opacity: 0, duration: 0.4 }, 0.6)
      .to(fades, { opacity: 0, scale: 0.9, duration: 0.2 }, 0);
  });
}

/**
 * Scény z hloubky. Jedna timeline: příchod (1) → držení (0.4) → odchod (1),
 * další scéna přichází během posledních 30 % odchodu předchozí.
 * Mobil: bez blur, odlet jen na scale 1.8.
 */
export function depthScenes(desktop: boolean) {
  const cleanups: (() => void)[] = [];
  gsap.utils.toArray<HTMLElement>('[data-depth-scenes]').forEach((section) => {
    const scenes = gsap.utils.toArray<HTMLElement>('.scene', section);
    if (!scenes.length) return;
    const counter = section.querySelector<HTMLElement>('[data-scene-counter]');
    const blur = (px: number) => (desktop ? { filter: `blur(${px}px)` } : {});
    const pad = (n: number) => String(n).padStart(2, '0');
    const IN = 1, HOLD = 0.4, OUT = 1, OVERLAP = 0.3;
    const step = IN + HOLD + OUT * (1 - OVERLAP);

    section.classList.add('depth-on');
    gsap.set(scenes, { autoAlpha: 0, scale: 0.3, ...blur(16) });

    let current = -1;
    const tl = gsap.timeline({
      defaults: { ease: ease.scrub },
      // aktivní scéna = nejvíc viditelná; onUpdate timeline sedí i při scrub dojezdu
      onUpdate() {
        let best = 0, bestO = -1;
        scenes.forEach((s, i) => {
          const o = Number(gsap.getProperty(s, 'opacity'));
          if (o > bestO) { bestO = o; best = i; }
        });
        // nic vidět (před první / po poslední scéně) → počítadlo nech, jak je
        if (bestO > 0.01 && best !== current && counter) {
          current = best;
          counter.textContent = `${pad(best + 1)} / ${pad(scenes.length)}`;
        }
      },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${scenes.length * 80}%`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    scenes.forEach((s, i) => {
      const t = i * step;
      tl.to(s, { autoAlpha: 1, scale: 1, ...blur(0), duration: IN }, t)
        .to(s, { autoAlpha: 0, scale: desktop ? 2.4 : 1.8, ...blur(8), duration: OUT }, t + IN + HOLD);
    });
    cleanups.push(() => section.classList.remove('depth-on'));
  });
  return () => cleanups.forEach((c) => c());
}

export function scrubWords() {
  const splits: SplitText[] = [];
  gsap.utils.toArray<HTMLElement>('[data-scrub-words]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words' });
    splits.push(split);
    gsap.fromTo(
      split.words,
      { opacity: 0.14 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: ease.scrub,
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
      },
    );
  });
  return () => splits.forEach((s) => s.revert());
}

export function horizontal() {
  gsap.utils.toArray<HTMLElement>('[data-horizontal]').forEach((section) => {
    const track = section.querySelector<HTMLElement>('.h-track');
    if (!track) return;
    const cards = gsap.utils.toArray<HTMLElement>('[data-year]', track);
    const counter = section.querySelector<HTMLElement>('[data-year-counter]');
    const bar = section.querySelector<HTMLElement>('[data-progress]');
    const distance = () => track.scrollWidth - window.innerWidth;

    let current = '';
    const sync = (progress: number) => {
      if (bar) bar.style.transform = `scaleX(${progress})`;
      if (!counter || !cards.length) return;
      // aktivní karta = ta, jejíž střed je nejblíž středu obrazovky
      const focus = window.innerWidth * 0.5;
      let best = cards[0];
      let bestD = Infinity;
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - focus);
        if (d < bestD) { bestD = d; best = c; }
      }
      cards.forEach((c) => c.classList.toggle('is-active', c === best));
      const y = best.dataset.year ?? '';
      if (y !== current) {
        current = y;
        counter.textContent = y;
        gsap.fromTo(counter, { yPercent: 12, opacity: 0.4 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: ease.soft, overwrite: true });
      }
    };

    // onUpdate na tweenu (ne na ScrollTriggeru): běží i během scrub dojezdu,
    // takže letopočet sedí s tím, co je opravdu vidět
    gsap.to(track, {
      x: () => -distance(),
      ease: ease.scrub,
      onUpdate(this: gsap.core.Tween) { sync(this.progress()); },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    sync(0);
  });
}

export function rules() {
  gsap.utils.toArray<HTMLElement>('[data-rule]').forEach((el) => {
    gsap.fromTo(
      el,
      { scaleX: 0 },
      { scaleX: 1, ease: ease.scrub, transformOrigin: 'left center', scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 60%', scrub: true } },
    );
  });
}

export function parallax() {
  gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed || '1');
    gsap.to(el, {
      y: () => (1 - speed) * 200,
      ease: ease.scrub,
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });
}

export { ScrollTrigger };
