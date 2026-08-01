/* ============================================================
   GESTURES — one pan/zoom implementation, shared by any surface
   that needs an infinite plane (The Stacks, The Board).

   Screen = world * k + (x, y)

   attachPanZoom(surface, {
     get(),              -> {x,y,k}
     set(v),             apply + store
     min, max,           zoom clamp
     panOn(ev)  -> bool  should this pointerdown start a pan?
     onIdle()            called after gesture settles (save)
     wheelPans           true = plain wheel scrolls the plane,
                         ctrl/⌘ + wheel zooms (trackpad friendly)
   })
   ============================================================ */
const Gestures = (() => {

  function attachPanZoom(surface, o) {
    const pts = new Map();          // pointerId -> {x,y}
    let pan = null;                 // single-finger / mouse pan
    let pinch = null;               // two-finger

    const rect = () => surface.getBoundingClientRect();
    const toWorld = (cx, cy) => {
      const r = rect(), v = o.get();
      return { x: (cx - r.left - v.x) / v.k, y: (cy - r.top - v.y) / v.k };
    };

    surface.addEventListener('pointerdown', ev => {
      pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });

      if (pts.size === 2) {
        pan = null;
        const [a, b] = [...pts.values()];
        const v = o.get();
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        pinch = {
          d: Math.hypot(a.x - b.x, a.y - b.y) || 1,
          k: v.k,
          world: toWorld(mid.x, mid.y)
        };
        return;
      }
      if (pts.size > 2) return;

      const wantPan = ev.button === 1 || ev.altKey || (o.panOn ? o.panOn(ev) : false);
      if (!wantPan) return;
      const v = o.get();
      pan = { sx: ev.clientX, sy: ev.clientY, vx: v.x, vy: v.y, id: ev.pointerId, moved: false };
      surface.setPointerCapture?.(ev.pointerId);
      surface.classList.add('grabbing');
    }, { passive: true });

    surface.addEventListener('pointermove', ev => {
      if (pts.has(ev.pointerId)) pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });

      if (pinch && pts.size >= 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const r = rect();
        const k = clamp(pinch.k * (d / pinch.d));
        o.set({
          k,
          x: mid.x - r.left - pinch.world.x * k,
          y: mid.y - r.top - pinch.world.y * k
        });
        return;
      }
      if (!pan || ev.pointerId !== pan.id) return;
      const dx = ev.clientX - pan.sx, dy = ev.clientY - pan.sy;
      if (!pan.moved && Math.hypot(dx, dy) < 3) return;
      pan.moved = true;
      const v = o.get();
      o.set({ k: v.k, x: pan.vx + dx, y: pan.vy + dy });
    }, { passive: true });

    const end = ev => {
      pts.delete(ev.pointerId);
      if (pts.size < 2) pinch = null;
      if (pan && ev.pointerId === pan.id) {
        pan = null;
        surface.classList.remove('grabbing');
        o.onIdle && o.onIdle();
      }
      if (!pts.size) o.onIdle && o.onIdle();
    };
    surface.addEventListener('pointerup', end);
    surface.addEventListener('pointercancel', end);

    surface.addEventListener('wheel', ev => {
      const zooming = !o.wheelPans || ev.ctrlKey || ev.metaKey;
      ev.preventDefault();
      const v = o.get(), r = rect();
      if (zooming) {
        const w = toWorld(ev.clientX, ev.clientY);
        const f = Math.exp(-ev.deltaY * (ev.ctrlKey ? .01 : .0016));
        const k = clamp(v.k * f);
        o.set({ k, x: ev.clientX - r.left - w.x * k, y: ev.clientY - r.top - w.y * k });
      } else {
        o.set({ k: v.k, x: v.x - ev.deltaX, y: v.y - ev.deltaY });
      }
      clearTimeout(surface._gz);
      surface._gz = setTimeout(() => o.onIdle && o.onIdle(), 380);
    }, { passive: false });

    function clamp(k) { return Math.min(o.max ?? 3, Math.max(o.min ?? .2, k)); }

    return { toWorld };
  }

  /* ease a view from → to over ms, calling set() each frame */
  function glide(from, to, ms, set, done) {
    const t0 = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    (function frame(now) {
      const t = Math.min(1, (now - t0) / ms), e = ease(t);
      set({
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e,
        k: from.k + (to.k - from.k) * e
      });
      if (t < 1) requestAnimationFrame(frame); else done && done();
    })(t0);
  }

  const isTouch = matchMedia('(pointer:coarse)').matches;

  return { attachPanZoom, glide, isTouch };
})();
