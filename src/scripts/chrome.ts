/**
 * Stálé UI navázané na scroll (běží i při reduced motion, nejde o animaci obsahu):
 *  [data-scroll-progress]  2px lišta nahoře, scaleX = podíl odscrollované stránky
 *  [data-scroll-hint]      nápověda „Scroll“; po 40 px dostane <html> třídu .is-scrolled a nápověda zmizí
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
