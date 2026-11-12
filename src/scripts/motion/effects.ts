import { gsap, SplitText, ScrollTrigger, ease, dur } from './core';

/**
 * Knihovna efektů. Každý efekt se zapíná data-atributem v HTML,
 * takže AI (i člověk) skládá stránku bez psaní nového JS.
 *
 *  data-intro             nadpis, který při načtení vyjede po znacích (jen jeden na stránku)
 *  data-intro-fade        prvky, které se objeví po intru (opacity 0 → 1)
 *  data-intro-rise        prvky, které jsou vidět hned (kvůli LCP) a intro je jen posune o 14 px nahoru
 *  data-hero-zoom         hero sekce: pin, jméno [data-zoom-name] se zvětšuje a rozšiřuje (wdth 62 → 125),
 *                         až jím divák „proletí“; [data-zoom-fade] zmizí v prvních 20 %
 *  data-depth-scenes     sekce s .scene uvnitř → JS přidá .depth-on, scény jsou na středu přes sebe;
 *                         pin, každá přiletí z hloubky, chvíli drží a odletí k divákovi;
 *                         [data-scene-counter] ukazuje „03 / 05“
 *  data-tunnel           sekce s [data-z] položkami → JS přidá .tunnel-on, pin, 3D tunel: položky na zlatém
 *                         úhlu, kamera (proxy camZ) jimi proletí; [data-tunnel-group] = skupina nejbližší položky;
 *                         [data-tunnel-intro] zmizí mezi 12 a 20 % pinu
 *  data-assemble          sekce se skupinami [data-assemble-group] → položky [data-assemble-item] přiletí
 *                         z hloubky (deterministický náhodný start) a složí se do mřížky; pin +120 %,
 *                         posledních 25 % pinu drží složenou mřížku; [data-assemble-rule] se narýsuje,
 *                         když dosedne první položka skupiny. Mobil: bez pinu, skupiny vyjedou při vjezdu
 *  data-scrub-words       odstavec, jehož slova se rozsvěcují podle scrollu
 *  data-horizontal        sekce s .h-track v okně (rodič tracku) → pin + horizontální posun, dokud levá
 *                         hrana poslední karty nedojede do fokusu (levá hrana okna + padding-left tracku);
 *                         pak držení 25 % délky. Aktivní karta (.is-active) = levá hrana nejblíž fokusu
 *  data-year-counter      (uvnitř data-horizontal) velký letopočet podle aktivní karty
 *  data-rule              linka, která se při scrollu "narýsuje" zleva doprava
 *  data-speed="0.8"       parallax (1 = normálně, <1 pomaleji, >1 rychleji)
 */

export function intro() {
  const title = document.querySelector<HTMLElement>('[data-intro]');
  const fades = gsap.utils.toArray<HTMLElement>('[data-intro-fade]');
  const rises = gsap.utils.toArray<HTMLElement>('[data-intro-rise]');
  if (!title) return;
  // aria 'auto': nadpis dostane aria-label s celým textem a znaky aria-hidden → čtečka čte jméno jednou a celé
  // (aria-label je na nadpisu povolený; po intru split.revert() vrátí čistý text bez atributů)
  const split = SplitText.create(title, { type: 'lines,chars', mask: 'lines', aria: 'auto' });
  const tl = gsap.timeline({ defaults: { ease: ease.reveal } });
  tl.set(title, { autoAlpha: 1 })
    .from(split.chars, { yPercent: 115, duration: dur.reveal, stagger: 0.022 }, 0)
    .addLabel('chars')
    // rise: žádná opacity, jen posun; startuje spolu se jménem (text je vidět od prvního vykreslení)
    .to(rises, { y: 0, duration: dur.reveal, stagger: 0.06, ease: ease.soft }, 0)
    .to(fades, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: ease.soft }, 'chars-=0.6')
    // po intru zpět na čistý text: maska řádků (overflow: clip) by ořízla jméno při hero zoomu
    .add(() => split.revert());
  return () => split.revert();
}

/**
 * Pin s dojezdem. Sekce (přesně 100svh, třída .depth-on) je pinnutá `pinPct` %
 * a animace dohrává dalších 100 % během odjezdu sekce nahoru. Po odpinování tak
 * nikdy nezůstane prázdná obrazovka: obsah ještě dobíhá a zespodu už jede další sekce.
 * Délku scrollu dává jen pin (pinSpacing), žádné okraje ani min-height navíc.
 * Vrací vars pro scrollTrigger animace; pin vytvoří sám (musí vzniknout před animací).
 */
function pinWithTail(section: HTMLElement, pinPct: number, scrub: boolean | number): ScrollTrigger.Vars {
  section.classList.add('depth-on');
  const pin = ScrollTrigger.create({ trigger: section, start: 'top top', end: `+=${pinPct}%`, pin: true });
  // start/end navázané přímo na pin: trigger = pinnutý prvek by jinak ScrollTrigger posunul o délku pinu
  return {
    start: () => pin.start,
    end: () => pin.start + (window.innerHeight * (pinPct + 100)) / 100,
    scrub,
  };
}

/**
 * Zoom k divákovi. Mobil: menší zvětšení a bez blur (výkon).
 * fontStretch je jediná povolená animace mimo transform/opacity/filter (jen hero nadpis).
 * Pin +80 %, animace +180 % (zbytek zoomu a fade dobíhá, zatímco hero odjíždí).
 */
export function heroZoom(desktop: boolean) {
  const cleanups: (() => void)[] = [];
  gsap.utils.toArray<HTMLElement>('[data-hero-zoom]').forEach((section) => {
    const name = section.querySelector<HTMLElement>('[data-zoom-name]');
    const fades = section.querySelectorAll<HTMLElement>('[data-zoom-fade]');
    if (!name) return;
    const tl = gsap.timeline({
      defaults: { ease: ease.scrub },
      scrollTrigger: pinWithTail(section, 80, true),
    });
    tl.to(name, { scale: desktop ? 3.2 : 1.8, fontStretch: '125%', transformOrigin: '50% 50%', duration: 1 }, 0)
      .to(name, desktop ? { opacity: 0, filter: 'blur(12px)', duration: 0.4 } : { opacity: 0, duration: 0.4 }, 0.6)
      .to(fades, { opacity: 0, scale: 0.9, duration: 0.2 }, 0);
    cleanups.push(() => section.classList.remove('depth-on'));
  });
  return () => cleanups.forEach((c) => c());
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
        if (counter) counter.style.opacity = bestO > 0.01 ? '1' : '0';
        // nic vidět (před první / po poslední scéně) → počítadlo nech, jak je
        if (bestO > 0.01 && best !== current && counter) {
          current = best;
          counter.textContent = `${pad(best + 1)} / ${pad(scenes.length)}`;
        }
      },
      // animace = počet scén × 80 %, z toho posledních 100 % dobíhá při odjezdu sekce
      scrollTrigger: pinWithTail(section, scenes.length * 80 - 100, 0.6),
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

/**
 * 3D tunel. Položka i leží na úhlu i × 137.5° (zlatý úhel), poloměr 18–42 vw/vh
 * (mobil svisle 12–34 vh; vodorovně zůstává 18–42 vw, na úzkém displeji je to i tak málo), z = −i × krok. Kamera = proxy camZ; v onUpdate se píše
 * translate3d jen viditelným položkám. Opacity podle relativního z.
 */
export function tunnel(desktop: boolean) {
  const cleanups: (() => void)[] = [];
  gsap.utils.toArray<HTMLElement>('[data-tunnel]').forEach((section) => {
    const items = gsap.utils.toArray<HTMLElement>('[data-z]', section);
    if (!items.length) return;
    const label = section.querySelector<HTMLElement>('[data-tunnel-group]');
    const STEP = desktop ? 350 : 300;
    const RX = [18, 42], RY = desktop ? [18, 42] : [12, 34]; // vw, vh
    const FAR = -3500, FAR_IN = -2500, NEAR = 200, GONE = 700;

    const pts = items.map((el, i) => {
      const a = (i * 137.5 * Math.PI) / 180;
      const t = (i * 0.618034) % 1; // rovnoměrně rozprostřený poloměr, nic přesně uprostřed
      const rx = RX[0] + (RX[1] - RX[0]) * t, ry = RY[0] + (RY[1] - RY[0]) * t;
      return { el, x: Math.cos(a) * rx, y: Math.sin(a) * ry, z: -i * STEP, group: el.dataset.group ?? '', shown: false };
    });

    section.classList.add('tunnel-on');
    const PIN = 220; // animace +320 %, z toho 100 % dojezd
    const st = pinWithTail(section, PIN, 0.6);
    const intro = section.querySelector<HTMLElement>('[data-tunnel-intro]');
    const cam = { z: 0 };
    let group = '';
    const render = () => {
      let nearest = pts[0], nearestD = Infinity;
      for (const p of pts) {
        const rel = p.z + cam.z;
        const d = Math.abs(rel);
        if (d < nearestD) { nearestD = d; nearest = p; }
        const visible = rel > FAR && rel < GONE;
        if (!visible) {
          if (p.shown) { p.el.style.visibility = 'hidden'; p.shown = false; }
          continue;
        }
        const o = rel < FAR_IN ? (rel - FAR) / (FAR_IN - FAR) : rel > NEAR ? 1 - (rel - NEAR) / (GONE - NEAR) : 1;
        if (!p.shown) { p.el.style.visibility = 'visible'; p.shown = true; }
        p.el.style.opacity = o.toFixed(3);
        p.el.style.transform = `translate(-50%, -50%) translate3d(${p.x.toFixed(2)}vw, ${p.y.toFixed(2)}vh, ${rel.toFixed(1)}px)`;
      }
      if (label && nearest.group !== group) {
        group = nearest.group;
        label.textContent = group;
      }
    };

    const tl = gsap.timeline({ defaults: { ease: ease.scrub }, onUpdate: render, scrollTrigger: st });
    tl.to(cam, {
      // kamera musí dojet tak daleko, aby i poslední položka (z = −(n−1) × krok) prošla za GONE;
      // nezávisí na délce scrollu (end), ta mění jen rychlost
      z: (items.length - 1) * STEP + GONE + 200,
      duration: 1,
    }, 0);
    // úvodní věta: viditelná prvních 12 % pinu, do 20 % pinu zmizí (časy v podílu celé animace)
    const pinShare = PIN / (PIN + 100);
    if (intro) tl.to(intro, { opacity: 0, duration: 0.08 * pinShare }, 0.12 * pinShare);
    render();

    cleanups.push(() => {
      section.classList.remove('tunnel-on', 'depth-on');
      intro?.style.removeProperty('opacity');
      items.forEach((el) => { el.style.removeProperty('visibility'); el.style.removeProperty('opacity'); el.style.removeProperty('transform'); });
    });
  });
  return () => cleanups.forEach((c) => c());
}

/** Deterministické pseudonáhodné číslo 0–1 (mulberry32), seed = index položky. */
function seeded(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Sestavení z hloubky. Desktop: pin +120 % (pinWithTail), položky startují na
 * translate3d(±40vw, ±30vh, −2000…−4000px), opacity 0, blur 6px a dosednou na své místo
 * v mřížce. Pořadí po skupinách (posun 0.08), uvnitř skupiny stagger 0.02.
 * Sestavení končí v 75 % pinu, zbytek je držení; během dojezdu sekce odjíždí se složenou mřížkou.
 * Mobil: bez pinu a bez z, každá skupina vyjede při vjezdu do okna (ne scrub).
 */
export function assemble(desktop: boolean) {
  const cleanups: (() => void)[] = [];
  gsap.utils.toArray<HTMLElement>('[data-assemble]').forEach((section) => {
    const groups = gsap.utils.toArray<HTMLElement>('[data-assemble-group]', section);
    if (!groups.length) return;

    if (!desktop) {
      const tweens = groups.map((g) =>
        gsap.from(g.querySelectorAll('[data-assemble-item]'), {
          y: 24, opacity: 0, duration: dur.reveal, stagger: 0.03, ease: ease.reveal,
          scrollTrigger: { trigger: g, start: 'top 85%', once: true },
        }),
      );
      cleanups.push(() => tweens.forEach((t) => t.revert()));
      return;
    }

    const PIN = 120, HOLD = 0.25; // pin +120 %, posledních 25 % pinu = držení
    const ITEM = 0.5, GROUP_GAP = 0.08, STAGGER = 0.02, RULE = 0.15;
    const st = pinWithTail(section, PIN, 0.6);
    const tl = gsap.timeline({ scrollTrigger: { ...st, invalidateOnRefresh: true } });

    let n = 0;
    groups.forEach((g, gi) => {
      const items = gsap.utils.toArray<HTMLElement>('[data-assemble-item]', g);
      const rule = g.querySelector<HTMLElement>('[data-assemble-rule]');
      const t0 = gi * GROUP_GAP;
      items.forEach((el, j) => {
        const i = n++;
        const r = (k: number) => seeded(i * 4 + k) * 2 - 1; // −1…1
        tl.fromTo(
          el,
          {
            x: () => (r(0) * 40 * window.innerWidth) / 100,
            y: () => (r(1) * 30 * window.innerHeight) / 100,
            z: -3000 + r(2) * 1000,
            opacity: 0,
            filter: 'blur(6px)',
          },
          { x: 0, y: 0, z: 0, opacity: 1, filter: 'blur(0px)', duration: ITEM, ease: 'power3.out' },
          t0 + j * STAGGER,
        );
      });
      if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: RULE, ease: ease.soft }, t0 + ITEM);
    });

    // prázdný krok: sestavení = podíl (1 − HOLD) pinu z celé animace (pin + 100 % dojezd)
    const built = tl.duration();
    const share = ((1 - HOLD) * PIN) / (PIN + 100);
    tl.to({}, { duration: built / share - built });

    cleanups.push(() => {
      tl.revert();
      section.classList.remove('depth-on');
    });
  });
  return () => cleanups.forEach((c) => c());
}

export function scrubWords() {
  const splits: SplitText[] = [];
  gsap.utils.toArray<HTMLElement>('[data-scrub-words]').forEach((el) => {
    // aria 'none': slova zůstanou čitelným textem (aria-label na <p> není povolený); span = platné uvnitř <p>
    const split = SplitText.create(el, { type: 'words', aria: 'none', tag: 'span' });
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
    const win = track.parentElement as HTMLElement; // okno, kterým pás jede
    const cards = gsap.utils.toArray<HTMLElement>('[data-year]', track);
    const counter = section.querySelector<HTMLElement>('[data-year-counter]');
    const bar = section.querySelector<HTMLElement>('[data-progress]');
    // fokus = levá hrana okna + padding-left tracku (4vw); na 0 % v něm stojí první karta
    const focusX = () => win.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
    // posun tracku tak, aby levá hrana POSLEDNÍ karty dojela do fokusu (layout, ne transformace)
    const distance = () => {
      const first = cards[0];
      const last = cards[cards.length - 1];
      if (!first || !last) return 0;
      return Math.max(0, last.offsetLeft - first.offsetLeft);
    };
    const MOVE = 0.75, HOLD = 0.25; // podíly celé délky; držení na poslední kartě

    let current = '';
    const sync = (progress: number) => {
      if (bar) bar.style.transform = `scaleX(${Math.min(1, progress / MOVE)})`;
      if (!cards.length) return;
      // aktivní karta = ta, jejíž levá hrana je nejblíž fokusu
      const focus = focusX();
      let best = cards[0];
      let bestD = Infinity;
      for (const c of cards) {
        const d = Math.abs(c.getBoundingClientRect().left - focus);
        if (d < bestD) { bestD = d; best = c; }
      }
      cards.forEach((c) => c.classList.toggle('is-active', c === best));
      const y = best.dataset.year ?? '';
      if (counter && y !== current) {
        const first = current === '';
        current = y;
        counter.textContent = y;
        if (!first) gsap.fromTo(counter, { yPercent: 12, opacity: 0.4 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: ease.soft, overwrite: true });
      }
    };

    // onUpdate na timeline (ne na ScrollTriggeru): běží i během scrub dojezdu,
    // takže letopočet sedí s tím, co je opravdu vidět
    const tl = gsap.timeline({
      onUpdate(this: gsap.core.Timeline) { sync(this.progress()); },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance() / MOVE, // posun + držení
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onRefresh: (self) => sync(self.animation?.progress() ?? 0),
      },
    });
    tl.to(track, { x: () => -distance(), ease: ease.scrub, duration: MOVE })
      .to({}, { duration: HOLD }); // prázdný krok: držení na poslední kartě
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
