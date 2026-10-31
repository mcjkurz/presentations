/* Per-slide visuals. Each HOOKS[slideId] may define render(step, el), key(e, step, el), enter(el), leave(el). */
window.HOOKS = {};
(function () {
  const H = window.HOOKS;
  const NS = 'http://www.w3.org/2000/svg';
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = {
    ink: css('--ink'), ink2: css('--ink2'), mute: css('--mute'), faint: css('--faint'), line: css('--line'),
    blue: css('--blue'), amber: css('--amber'), coral: css('--coral'), green: css('--green'), violet: css('--violet'),
  };

  // svg helper: el('circle', {cx, cy, r}, parent)
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) {
      if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(e);
    return e;
  }
  const show = (node, on) => { node.style.transition = 'opacity .5s'; node.style.opacity = on ? 1 : 0; };

  // animation loop that runs only while its slide is active
  function loop(slide, draw) {
    if (slide._loop) return;
    slide._loop = true;
    const t0 = performance.now();
    const f = now => {
      if (!slide.classList.contains('active')) { slide._loop = false; return; }
      draw((now - t0) / 1000);
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }
  function hidpi(canvas, w, h) {
    const r = 2;
    canvas.width = w * r; canvas.height = h * r;
    const g = canvas.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0);
    return g;
  }


  /* ───────────────────────── poem: highlight the couplet under the classifier */
  H['s-poem'] = {
    render(step) {
      const ln = [...document.querySelectorAll('#clf-grid .ln')];
      ln[1].classList.toggle('on', step >= 1);                       // the parallel couplet (0.97)
      ln[3].classList.toggle('on', step >= 4); ln[3].classList.add('no');   // the free couplet (0.02), shown neutral
    },
  };



  /* ───────────────────────── regulated verse: the middle two couplets are parallel by rule */
  H['s-reg'] = {
    render(step) {
      const ln = [...document.querySelectorAll('#reg-poem .ln')];
      ln.forEach((l, i) => {
        const mid = i === 1 || i === 2;
        l.classList.toggle('par', step >= 1 && mid);
        l.classList.toggle('hl', step >= 1 && mid);
        l.classList.toggle('hl2', step >= 2 && !mid);
      });
    },
  };

  /* ───────────────────────── keys & queries: a draggable [CLS] query lights up the ten characters (viridis = attention) */
  (function () {
    const rad = d => d * Math.PI / 180;
    // key directions. Parallel couplet: matched characters (明–清, 月–泉, 松–石, 間–上, 照–流) point roughly the same way.
    // Non-parallel couplet: the two lines' keys point in unrelated directions.
    const SETS = {
      par: { v1: [...'明月松間照'], v2: [...'清泉石上流'], a1: [38, 102, 120, 196, 292], a2: [28, 110, 128, 186, 282], l1: [.78, .8, .74, .72, .78], l2: [.72, .74, .8, .66, .72],
        text: '<b class="c-coral">Drag the red query.</b> Each character offers a <span class="c-blue">key</span>; the more a key points the same way as the <span class="c-coral">query</span>, the brighter its square. Characters of the same kind point the same way: <b>4 nouns</b> (月 松 泉 石), <b>2 adjectives</b> (明 清), <b>2 locatives</b> (間 上), <b>2 verbs</b> (照 流). Aim the query at one kind, and <b>both lines light up together</b>.' },
      non: { v1: [...'空山新雨後'], v2: [...'天氣晚來秋'], a1: [14, 92, 168, 236, 304], a2: [208, 46, 286, 128, 352], l1: [.74, .8, .7, .78, .72], l2: [.7, .76, .8, .68, .74],
        text: '<b>A counter-example.</b> Here the keys of corresponding characters point in different directions. Wherever you aim the query, <b>the two lines do not light up together</b>: nothing is aligned.' },
    };
    const STOPS = [[68, 1, 84], [59, 82, 139], [33, 144, 141], [93, 200, 99], [253, 231, 37]];
    const viridis = t => { t = Math.max(0, Math.min(1, t)) * 4; const i = Math.min(3, Math.floor(t)), f = t - i; return `rgb(${STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f)).join(',')})`; };
    let built = false, which = 'par', q = [Math.cos(rad(112)) * .55, Math.sin(rad(112)) * .55], cells = [], qg, keyG, svg, drag = false, KV = [];
    const O = [280, 215], S = 190;
    const pt = ([x, y]) => [O[0] + x * S, O[1] - y * S];
    function attn() {
      const e = KV.map(k => Math.exp(7 * (q[0] * k[0] + q[1] * k[1])));
      const z = e.reduce((a, b) => a + b, 0);
      return e.map(v => v / z);
    }
    function paint() {
      const a = attn();
      cells.forEach((c, i) => { c.style.background = viridis(a[i] / .5); });
      const [X, Y] = pt(q), ang = Math.atan2(Y - O[1], X - O[0]);
      qg.line.setAttribute('x2', X - 12 * Math.cos(ang)); qg.line.setAttribute('y2', Y - 12 * Math.sin(ang));
      qg.head.setAttribute('d', `M${X} ${Y} L${X - 16 * Math.cos(ang - .38)} ${Y - 16 * Math.sin(ang - .38)} L${X - 16 * Math.cos(ang + .38)} ${Y - 16 * Math.sin(ang + .38)} z`);
      qg.dot.setAttribute('cx', X); qg.dot.setAttribute('cy', Y);
      qg.lab.setAttribute('x', X + 26 * Math.cos(ang)); qg.lab.setAttribute('y', Y + 26 * Math.sin(ang) + 5);
    }
    function load(name) {
      which = name; const D = SETS[name];
      const K = D.v1.map((c, i) => [c, rad(D.a1[i]), D.l1[i], 1]).concat(D.v2.map((c, i) => [c, rad(D.a2[i]), D.l2[i], 2]));
      KV = K.map(([c, a, l]) => [Math.cos(a) * l, Math.sin(a) * l]);
      while (keyG.firstChild) keyG.removeChild(keyG.firstChild);
      KV.forEach((k, i) => {
        const [X, Y] = pt(k), col = K[i][3] === 1 ? C.blue : '#12b5cb', ang = Math.atan2(Y - O[1], X - O[0]);
        el('line', { x1: O[0], y1: O[1], x2: X - 9 * Math.cos(ang), y2: Y - 9 * Math.sin(ang), stroke: col, 'stroke-width': 3, 'stroke-linecap': 'butt', opacity: .85 }, keyG);
        el('path', { d: `M${X} ${Y} L${X - 12 * Math.cos(ang - .4)} ${Y - 12 * Math.sin(ang - .4)} L${X - 12 * Math.cos(ang + .4)} ${Y - 12 * Math.sin(ang + .4)} z`, fill: col }, keyG);
        el('text', { x: X + 16 * Math.cos(ang) - 11, y: Y + 16 * Math.sin(ang) + 8, 'font-size': 24, fill: col, 'font-family': 'Songti TC, Noto Serif TC, serif', text: K[i][0] }, keyG);
      });
      cells.forEach((c, i) => { c.textContent = K[i][0]; });
      document.getElementById('kq-text').innerHTML = D.text;
      document.querySelectorAll('.kq-tabs button').forEach(b => b.classList.toggle('on', b.dataset.set === name));
      paint();
    }
    function build() {
      svg = document.getElementById('kq');
      for (let g = -1; g <= 1.01; g += .5) { const [X] = pt([g, 0]); el('line', { x1: X, x2: X, y1: 20, y2: 410, stroke: C.line }, svg); const [, Y] = pt([0, g]); el('line', { x1: 40, x2: 520, y1: Y, y2: Y, stroke: C.line }, svg); }
      el('line', { x1: 40, x2: 520, y1: O[1], y2: O[1], stroke: C.faint }, svg);
      el('line', { x1: O[0], x2: O[0], y1: 20, y2: 410, stroke: C.faint }, svg);
      keyG = el('g', {}, svg);
      qg = { line: el('line', { x1: O[0], y1: O[1], stroke: C.coral, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg), head: el('path', { fill: C.coral }, svg), dot: el('circle', { r: 17, fill: C.coral, opacity: .14 }, svg), lab: el('text', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.coral, 'font-family': 'JetBrains Mono', text: '[CLS]', style: 'pointer-events:none' }, svg) };
      el('text', { x: 40, y: 408, 'font-size': 13, fill: C.coral, 'font-family': 'JetBrains Mono', text: '● [CLS] 查詢：可拖曳' }, svg);
      [['kq-r1', 0], ['kq-r2', 5]].forEach(([id]) => {
        const row = document.getElementById(id);
        for (let i = 0; i < 5; i++) { const d = document.createElement('div'); d.className = 'kq-cell'; row.appendChild(d); cells.push(d); }
      });
      const move = e => { const r = svg.getBoundingClientRect(), k = r.width / 560; q = [((e.clientX - r.left) / k - O[0]) / S, -((e.clientY - r.top) / k - O[1]) / S]; const m = Math.hypot(...q); if (m > 1.05) q = q.map(v => v / m * 1.05); paint(); };
      const slide = document.getElementById('s-kq');
      svg.addEventListener('pointerdown', e => { e.preventDefault(); drag = true; slide.classList.add('dragging'); window.getSelection && window.getSelection().removeAllRanges(); svg.setPointerCapture(e.pointerId); move(e); });
      svg.addEventListener('pointermove', e => { if (drag) move(e); });
      const end = () => { drag = false; slide.classList.remove('dragging'); };
      svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
      document.querySelectorAll('.kq-tabs button').forEach(b => b.addEventListener('click', () => load(b.dataset.set)));
      built = true;
    }
    H['s-kq'] = {
      enter() { if (!built) build(); load('par'); },
      key(e) { if (e.key === 'n' || e.key === 'N') { load(which === 'par' ? 'non' : 'par'); return true; } return false; },
    };
  })();

  /* ───────────────────────── 3D couplet: encoded apart vs. together (data: window.ALIGN, from standalone_3d/alignment_coords.py) */
  (function () {
    const A = window.ALIGN, chars1 = [...A.verse1], chars2 = [...A.verse2];
    const HOME = { yaw: -0.7, pitch: 0.35 };
    let yaw = HOME.yaw, pitch = HOME.pitch, auto = true, drag = null, stepNow = 0, g = null, zoom = 1, layer = 12, mix = /[?&]mix=1/.test(location.search) ? 1 : 0, vis1 = 1, vis2 = 0, both = 0;
    const CX = 790, CY = 385, SC0 = 305;
    const ease = t => t * t * (3 - 2 * t);
    // positions at the current layer, normalised so that both conditions fit the same unit sphere
    function coords() {
      const L = A.layers[layer], rad = Math.max(...L.separate.concat(L.joint).map(p => Math.hypot(...p)));
      const e = ease(mix);
      return L.separate.map((p, i) => p.map((v, k) => (v * (1 - e) + L.joint[i][k] * e) / rad));
    }
    function project([x, y, z]) {
      const SC = SC0 * zoom;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const x1 = x * cy - y * sy, y1 = x * sy + y * cy;
      const depth = y1 * cp + z * sp, up = z * cp - y1 * sp;
      const persp = 1 / (1 - depth * 0.18);
      return { X: CX + x1 * SC * persp, Y: CY - up * SC * persp, d: depth, s: persp };
    }
    function line(a, b, col, w, dash, alpha) {
      g.beginPath(); g.moveTo(a.X, a.Y); g.lineTo(b.X, b.Y);
      g.strokeStyle = col; g.lineWidth = w; g.setLineDash(dash || []); g.globalAlpha = alpha == null ? 1 : alpha; g.stroke();
      g.setLineDash([]); g.globalAlpha = 1;
    }
    function bars() {
      const L = A.layers[layer], box = document.getElementById('cpl-align');
      box.style.opacity = both;
      document.getElementById('cpl-al-layer').textContent = '第 ' + layer + ' 層' + (layer === 12 ? '（頂層）' : '');
      document.getElementById('cpl-bar1').style.width = (100 * Math.max(0, L.alignment_separate)) + '%';
      document.getElementById('cpl-v1').textContent = L.alignment_separate.toFixed(2);
      document.getElementById('cpl-row2').style.opacity = .15 + .85 * ease(mix);
      document.getElementById('cpl-bar2').style.width = (100 * Math.max(0, L.alignment_joint)) + '%';
      document.getElementById('cpl-v2').textContent = L.alignment_joint.toFixed(2);
    }
    function draw() {
      g.clearRect(0, 0, 1280, 720);
      const L = A.layers[layer], v3 = L.var_pct, Lx = 1.15;
      [[[Lx, 0, 0], `PC1 · ${v3[0].toFixed(1)}%`], [[0, Lx, 0], `PC2 · ${v3[1].toFixed(1)}%`], [[0, 0, Lx], `PC3 · ${v3[2].toFixed(1)}%`]].forEach(([e, t]) => {
        const a = project(e.map(v => -v)), b = project(e);
        line(a, b, C.faint, 1.5);
        g.fillStyle = C.mute; g.font = '13px "JetBrains Mono", "Songti TC", serif'; g.fillText(t, b.X + 6, b.Y);
      });
      const Q = coords().map(project), Q1 = Q.slice(0, 5), Q2 = Q.slice(5);
      for (let i = 0; i < 4; i++) { if (vis1 > .01) line(Q1[i], Q1[i + 1], C.blue, 6, null, .85 * vis1); if (vis2 > .01) line(Q2[i], Q2[i + 1], '#12b5cb', 6, null, .85 * vis2); }
      // the pairs 明–清, 月–泉 … : loose while the verses are read apart, tight once they see each other
      for (let i = 0; i < 5; i++) line(Q1[i], Q2[i], mix > .5 ? C.green : C.faint, 2 + 2 * ease(mix), [8, 7], (.35 + .6 * ease(mix)) * both);
      const pts = Q1.map((q, i) => ({ q, c: chars1[i], col: C.blue, a: vis1 })).concat(Q2.map((q, i) => ({ q, c: chars2[i], col: '#12b5cb', a: vis2 }))).filter(p => p.a > .01);
      pts.sort((a, b) => a.q.d - b.q.d);
      pts.forEach(({ q, c, col, a }) => {
        const r = 27 * q.s;
        g.beginPath(); g.arc(q.X, q.Y, r, 0, 2 * Math.PI);
        g.fillStyle = col; g.globalAlpha = .92 * a; g.fill(); g.globalAlpha = a;
        g.lineWidth = 2; g.strokeStyle = '#fff'; g.stroke();
        g.fillStyle = '#fff'; g.font = `600 ${Math.round(28 * q.s)}px "Songti TC", "Noto Serif TC", serif`;
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c, q.X, q.Y + 1);
        g.textAlign = 'start'; g.textBaseline = 'alphabetic'; g.globalAlpha = 1;
      });
      bars();
    }
    const cv = document.getElementById('cpl');
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; auto = false; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => {
      if (!drag) return;
      yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
      pitch = Math.max(-1.4, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * 0.008));
    });
    cv.addEventListener('pointerup', () => { drag = null; });
    const setZoom = z => { zoom = Math.max(.4, Math.min(3, z)); };
    cv.addEventListener('wheel', e => { e.preventDefault(); setZoom(zoom * Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
    const setLayer = l => { layer = Math.max(0, Math.min(12, l)); const el2 = document.getElementById('cpl-layer'); if (el2) el2.textContent = layer === 12 ? '頂層（第 12 層）' : '第 ' + layer + ' 層'; };
    H['s-3d'] = {
      enter(sl) {
        g = hidpi(cv, 1280, 720);
        let lastT = 0;
        loop(sl, t => {
          const dt = t - lastT; lastT = t;
          if (auto) yaw += dt * 0.25;
          const target = stepNow >= 3 ? 1 : 0;
          mix += Math.sign(target - mix) * Math.min(Math.abs(target - mix), dt / 1.6);
          const t1 = stepNow === 1 ? 0 : 1, t2 = stepNow >= 1 ? 1 : 0;
          vis1 += Math.sign(t1 - vis1) * Math.min(Math.abs(t1 - vis1), dt / .6);
          vis2 += Math.sign(t2 - vis2) * Math.min(Math.abs(t2 - vis2), dt / .6);
          const tb = stepNow >= 2 ? 1 : 0;   // the alignment readout belongs to the two verses seen together, so it ignores the 0 ↔ 1 cross-fade
          both += Math.sign(tb - both) * Math.min(Math.abs(tb - both), dt / .6);
          draw();
        });
      },
      render(step) { stepNow = step; },
      key(e) {
        if (e.key === 'r' || e.key === 'R') { auto = !auto; return true; }
        if (e.key === '+' || e.key === '=') { setZoom(zoom * 1.12); return true; }
        if (e.key === '-' || e.key === '_') { setZoom(zoom / 1.12); return true; }
        if (e.key === ']') { setLayer(layer + 1); return true; }
        if (e.key === '[') { setLayer(layer - 1); return true; }
        if (e.key === '0') { yaw = HOME.yaw; pitch = HOME.pitch; zoom = 1; setLayer(12); return true; }
        return false;
      },
    };
  })();
})();

(function () {
  /* ───────────────────────── Gärdenfors: one region, two regions, three... the space is divided step by step */
  const H = window.HOOKS;
  let timers = [], on = null;
  const groups = () => [...document.querySelectorAll('#s-gardenfors .vk')];
  const show = k => groups().forEach(g => { g.style.transition = 'opacity .35s'; g.style.opacity = (+g.dataset.k <= k) ? 1 : 0; });
  H['s-gardenfors'] = {
    render(step) {
      const run = step >= 1;
      if (run === on) return;
      on = run;
      timers.forEach(clearTimeout); timers = [];
      const n = groups().length;
      if (!run) { groups().forEach(g => { g.style.transition = 'none'; g.style.opacity = 0; }); return; }
      for (let k = 1; k <= n; k++) timers.push(setTimeout(() => show(k), (k - 1) * 520));
    },
  };
})();
