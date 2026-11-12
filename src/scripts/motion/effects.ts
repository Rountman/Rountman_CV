import { gsap, SplitText, ScrollTrigger, ease, dur } from './core';

/**
 * Knihovna efektů. Každý efekt se zapíná data-atributem v HTML,
 * takže AI (i člověk) skládá stránku bez psaní nového JS.
 *
 *  data-intro             nadpis, který při načtení vyjede po znacích (jen jeden na stránku)
 *  data-intro-fade        prvky, které se objeví po intru
 *  data-hero-out          prvek, který se při odscrollování hero rozostří a odjede
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
    .to(fades, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: ease.soft }, '-=0.6');
  return () => split.revert();
}

export function heroOut() {
  gsap.utils.toArray<HTMLElement>('[data-hero-out]').forEach((el) => {
    gsap.to(el, {
      yPercent: -18,
      opacity: 0.15,
      filter: 'blur(10px)',
      ease: ease.scrub,
      scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top top', end: 'bottom top', scrub: true },
    });
  });
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
