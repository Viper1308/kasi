/* ══════════════ MOBILE — make the room work on a phone ══════════════
   iOS Safari lies about 100vh (the toolbar overlaps it), so everything
   sizes off --appvh instead. We also flag the body so the CSS can swap
   the desk from "six monitors in a room" to something thumb-sized, and
   we re-lay-out the canvases when the phone is turned.
   ================================================================== */
const Mobile = (() => {

  const q = matchMedia('(max-width: 760px)');
  const coarse = matchMedia('(pointer: coarse)');

  function vh() {
    const h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    document.documentElement.style.setProperty('--appvh', h + 'px');
  }

  function flag() {
    document.body.classList.toggle('is-mobile', q.matches);
    document.body.classList.toggle('is-touch', coarse.matches);
  }

  function relayout() {
    vh();
    try {
      if (typeof Web !== 'undefined' && document.getElementById('view-web')?.classList.contains('on')) Web.draw();
      if (typeof Cal !== 'undefined' && document.getElementById('view-calendar')?.classList.contains('on')) Cal.grid();
      if (typeof Stacks !== 'undefined') Stacks.refresh();
    } catch (e) { }
  }

  function init() {
    vh(); flag();
    window.addEventListener('resize', relayout);
    window.addEventListener('orientationchange', () => setTimeout(relayout, 250));
    window.visualViewport && window.visualViewport.addEventListener('resize', vh);
    q.addEventListener?.('change', () => { flag(); relayout(); });

    // keep the active tab visible in the scrolling tab strip
    document.querySelectorAll('.tab[data-view]').forEach(t => {
      t.addEventListener('click', () => setTimeout(
        () => t.scrollIntoView && t.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }), 60));
    });

    // double-tap-to-zoom is a nuisance on a canvas app
    let lastTap = 0;
    document.addEventListener('touchend', e => {
      const now = Date.now();
      if (now - lastTap < 320 && !e.target.closest('input,textarea,[contenteditable]')) e.preventDefault();
      lastTap = now;
    }, { passive: false });
  }

  return { init, get isPhone() { return q.matches; } };
})();
