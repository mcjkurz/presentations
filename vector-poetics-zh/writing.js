/* Visuals for the slides written for this talk (向量詩學, DADH 2026). Same HOOKS contract as slides.js. */

/* ───────── title: the couplet 明月松間照，清泉石上流 in GujiBERT space (top layer, PC1 × PC2 of window.COUPLET).
 * Each verse is a path through the space; the two paths run side by side. */
(function () {
  const H = window.HOOKS, NS = 'http://www.w3.org/2000/svg';
  const X0 = 780, Y0 = 112, W = 410, PAD = 44;          // panel in stage pixels
  const NUDGE = { 上: [-14, 30, 'end'] };               // label offsets where two labels would collide
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  function build(svg) {
    svg.innerHTML = '';
    const [v1, v2] = window.COUPLET.verses, pts = v1.points.concat(v2.points);
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const lo = Math.min(...xs, ...ys), hi = Math.max(...xs, ...ys), s = (W - 2 * PAD) / (hi - lo);
    const px = p => X0 + PAD + (p.x - lo) * s, py = p => Y0 + W - PAD - (p.y - lo) * s;
    // nudge the second verse a few pixels down-right so the two paths sit side by side instead of overlapping
    const SHIFT = 6, w2 = { ...v2, points: v2.points.map(p => ({ ...p, x: p.x + SHIFT / s, y: p.y - SHIFT / s })) };
    el('rect', { x: X0, y: Y0, width: W, height: W, class: 'panel' }, svg);
    for (let i = 1; i < 6; i++) {
      el('line', { x1: X0 + i * W / 6, x2: X0 + i * W / 6, y1: Y0, y2: Y0 + W, class: 'grid' }, svg);
      el('line', { y1: Y0 + i * W / 6, y2: Y0 + i * W / 6, x1: X0, x2: X0 + W, class: 'grid' }, svg);
    }
    el('text', { x: X0 + W, y: Y0 + W + 22, class: 'axl', 'text-anchor': 'end' }, svg).textContent = 'PC1';
    el('text', { x: X0 - 10, y: Y0 + 12, class: 'axl', 'text-anchor': 'end' }, svg).textContent = 'PC2';
    v1.points.forEach((p, i) => el('line', { x1: px(p), y1: py(p), x2: px(w2.points[i]), y2: py(w2.points[i]), class: 'pair' }, svg));
    [[v1, 'a', -1], [w2, 'b', 1]].forEach(([v, k, side]) => {
      const d = v.points.map((p, i) => (i ? 'L' : 'M') + px(p).toFixed(1) + ',' + py(p).toFixed(1)).join(' ');
      el('path', { d, class: 'path ' + k, pathLength: 1 }, svg);
      v.points.forEach((p, i) => {
        el('circle', { cx: px(p), cy: py(p), r: 5, class: 'pt ' + k }, svg);
        const [dx, dy, anchor] = NUDGE[p.char] || [side * 16, 8 + side * 8, side < 0 ? 'end' : 'start'];
        const t = el('text', { x: px(p) + dx, y: py(p) + dy, class: 'ch ' + k, 'text-anchor': anchor }, svg);
        t.textContent = p.char; t.style.transitionDelay = (.3 + i * .15 + (k === 'b' ? .9 : 0)) + 's';
      });
    });
    el('text', { x: X0 + W / 2, y: Y0 + W + 48, class: 'src', 'text-anchor': 'middle' }, svg).textContent = '王維「明月松間照，清泉石上流」· GujiBERT 頂層 · 主成分投影';
  }
  H['s-title'] = {
    enter() {
      const svg = document.getElementById('title-cpl');
      if (!svg.childElementCount) build(svg);
      svg.classList.remove('go');
      requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add('go')));
    },
  };
})();

/* ───────── SymNet: pan and zoom the character network to show single communities */
(function () {
  const H = window.HOOKS;
  const MAX = 8;
  let box, img, net, z = 1, x = 0, y = 0;
  const base = () => Math.max(box.clientWidth, box.clientHeight);   // image is square: fit the longer side
  const clamp = () => {
    const s = base() * z;
    x = Math.min(Math.max(x, box.clientWidth - s), Math.max(0, (box.clientWidth - s) / 2));
    y = Math.min(Math.max(y, box.clientHeight - s), Math.max(0, (box.clientHeight - s) / 2));
  };
  const draw = () => { clamp(); img.style.width = base() + 'px'; img.style.transform = `translate(${x}px, ${y}px) scale(${z})`; };
  // the stage is CSS-scaled to the window: convert screen pixels to stage pixels
  const k = () => box.getBoundingClientRect().width / box.clientWidth;
  function zoomAt(f, px, py) {
    const nz = Math.min(MAX, Math.max(1, z * f));
    x = px - (px - x) * nz / z; y = py - (py - y) * nz / z; z = nz; draw();
  }
  const reset = () => { z = 1; x = 0; y = 0; draw(); };
  function bind() {
    box = document.getElementById('net-zoom'); img = box.querySelector('img'); net = box.parentElement;
    box.addEventListener('wheel', e => {
      e.preventDefault();
      const r = box.getBoundingClientRect(), s = k();
      zoomAt(Math.exp(-e.deltaY * .0025), (e.clientX - r.left) / s, (e.clientY - r.top) / s);
    }, { passive: false });
    let drag = null;
    box.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; box.setPointerCapture(e.pointerId); box.classList.add('drag'); });
    box.addEventListener('pointermove', e => {
      if (!drag) return;
      const s = k(); x += (e.clientX - drag.x) / s; y += (e.clientY - drag.y) / s; drag = { x: e.clientX, y: e.clientY }; draw();
    });
    const end = () => { drag = null; box.classList.remove('drag'); };
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
    box.addEventListener('dblclick', reset);
    net.querySelector('.vp-zctl').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      e.stopPropagation(); b.blur();
      const c = [box.clientWidth / 2, box.clientHeight / 2];
      if (b.dataset.z === 'in') zoomAt(1.6, ...c);
      else if (b.dataset.z === 'out') zoomAt(1 / 1.6, ...c);
      else if (b.dataset.z === 'reset') reset();
      else { net.classList.toggle('big'); reset(); }
    });
  }
  H['s-v-net'] = {
    enter() { if (!box) bind(); requestAnimationFrame(draw); },
    leave() { net.classList.remove('big'); reset(); },
  };
})();
