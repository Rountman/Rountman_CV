/**
 * Stálé UI navázané na scroll (běží i při reduced motion, nejde o animaci obsahu):
 *  [data-scroll-progress]  2px lišta nahoře, scaleX = podíl odscrollované stránky
 *  [data-scroll-hint]      nápověda „Scroll“; po 40 px dostane <html> třídu .is-scrolled a nápověda zmizí
 *  [data-lang-switch]      odkaz na druhou jazykovou verzi; při kliknutí dostane #id sekce, ve které je čtenář
 *                          (poslední main section[id], jejíž horní hrana je nad půlkou okna)
 */
export function initChrome() {
  const bar = document.querySelector<HTMLElement>('[data-scroll-progress]');
  const root = document.documentElement;
  let queued = false;

  const update = () => {
    queued = false;
    const max = root.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    root.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  const request = () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  };

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  update();
}

/** Sekce, ve které je čtenář: poslední s horní hranou nad půlkou okna (hero bez id = začátek stránky). */
function currentSection() {
  let id = '';
  document.querySelectorAll<HTMLElement>('main section[id]').forEach((sec) => {
    const box = sec.parentElement?.classList.contains('pin-spacer') ? sec.parentElement : sec;
    if (box.getBoundingClientRect().top <= window.innerHeight / 2) id = sec.id;
  });
  return id;
}

export function initLangSwitch() {
  document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]').forEach((a) => {
    const base = a.getAttribute('href')!.split('#')[0];
    const sync = () => {
      const id = currentSection();
      a.setAttribute('href', id ? `${base}#${id}` : base);
    };
    // pointerdown/focus: href je správně už pro prostřední tlačítko, „otevřít v novém panelu“ i Enter
    a.addEventListener('pointerdown', sync);
    a.addEventListener('focus', sync);
    a.addEventListener('click', sync);
  });
}

/**
 * Načtení s #hash: prohlížeč skočí na kotvu dřív, než JS přidá sticky Work (330vh) a pin Tools,
 * které posunou sekce pod nimi. Po inicializaci (písma + 2 snímky) proto skočit znovu.
 */
export function restoreHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  document.fonts.ready.then(() =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (!el) return;
        const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
        window.scrollTo(0, box.getBoundingClientRect().top + window.scrollY);
      }),
    ),
  );
}
