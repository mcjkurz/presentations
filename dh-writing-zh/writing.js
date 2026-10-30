/* Visuals for the slides written for this talk (數位人文時代的學術書寫). Same HOOKS contract as slides.js. */
(function () {
  const H = window.HOOKS, NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const PERIODS = ['明清', '晚清', '民國', '社會主義', '當代'];

  /* ───────── corpus size per period (tokens) */
  const TOKENS = [7857879, 8553116, 7465087, 7843713, 7921094];
  const YEARS = ['1368–1859', '1860–1911', '1912–1948', '1949–1976', '1977–'];
  H['s-h-corpus'] = {
    enter() {
      const host = document.getElementById('corpus-bars');
      if (host.childElementCount) return;
      const max = Math.max(...TOKENS);
      TOKENS.forEach((v, i) => {
        const c = document.createElement('div');
        c.className = 'c';
        c.innerHTML = `<span class="v">${(v / 1e6).toFixed(1)}M</span><span class="b" style="height:${(240 * v / max).toFixed(0)}px"></span><span class="p">${PERIODS[i]}</span><span class="y">${YEARS[i]}</span>`;
        host.appendChild(c);
      });
    },
  };

  /* ───────── pairwise cosine similarity of the five interiority vectors */
  const SIM = [
    [1, .515, .342, .302, .327],
    [.515, 1, .419, .338, .363],
    [.342, .419, 1, .503, .469],
    [.302, .338, .503, 1, .531],
    [.327, .363, .469, .531, 1],
  ];
  const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
  const heatColor = v => {
    const t = Math.max(0, Math.min(1, (v - .25) / .75));
    const c = t < .4 ? mix([253, 244, 227], [240, 160, 90], t / .4) : mix([240, 160, 90], [170, 30, 40], (t - .4) / .6);
    return [`rgb(${c})`, t > .55 ? '#fff' : 'var(--ink)'];
  };
  H['s-h-stable'] = {
    enter() {
      const host = document.getElementById('heat-int');
      if (host.childElementCount) return;
      host.appendChild(document.createElement('span'));
      PERIODS.forEach(p => { const h = document.createElement('span'); h.className = 'lab top'; h.textContent = p; host.appendChild(h); });
      SIM.forEach((row, i) => {
        const l = document.createElement('span'); l.className = 'lab'; l.textContent = PERIODS[i]; host.appendChild(l);
        row.forEach((v, j) => {
          const [bg, fg] = heatColor(v);
          const c = document.createElement('span');
          c.className = 'cell' + (Math.abs(i - j) === 1 ? ' adj' : '') + (i === j ? ' diag' : '');
          c.style.background = bg; c.style.color = fg;
          c.textContent = v === 1 ? '1' : v.toFixed(2).slice(1);
          host.appendChild(c);
        });
      });
    },
    render(step) { document.getElementById('heat-int').classList.toggle('focus-adj', step === 1); },
  };

  /* ───────── Wasted Years: interiority metaphors near each character, observed vs expected */
  const CHARS = [
    ['柯碧舟', 224, 183, 'pro'], ['杜見春', 197, 157, 'pro'], ['邵玉蓉', 103, 69, 'pro'],
    ['邵大山', 36, 25], ['蘇道誠', 30, 38], ['華雯雯', 22, 16], ['肖永川', 15, 21],
    ['唐惠娟', 14, 14], ['王連發', 8, 15, 'anti'], ['左定法', 8, 18, 'anti'],
  ];
  H['s-h-econ'] = {
    enter() {
      const svg = document.getElementById('econ');
      if (svg.childElementCount) return;
      const L = 40, B = 330, T = 20, W = 710, max = 240, sx = W / CHARS.length, bw = 24;
      const y = v => B - (B - T) * v / max;
      [0, 50, 100, 150, 200].forEach(v => {
        el('line', { x1: L, x2: L + W, y1: y(v), y2: y(v), class: 'grid' }, svg);
        el('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'tick' }, svg).textContent = v;
      });
      CHARS.forEach(([name, act, exp, kind], i) => {
        const g = el('g', { class: 'ch ' + (kind || 'mid') }, svg);
        const x = L + sx * i + sx / 2;
        el('rect', { x: x - bw - 1, y: y(act), width: bw, height: B - y(act), class: 'act' }, g);
        el('rect', { x: x + 1, y: y(exp), width: bw, height: B - y(exp), class: 'exp' }, g);
        el('text', { x: x - bw / 2 - 1, y: y(act) - 5, 'text-anchor': 'middle', class: 'val' }, g).textContent = act;
        el('text', { x: x + bw / 2 + 1, y: y(exp) - 5, 'text-anchor': 'middle', class: 'val e' }, g).textContent = exp;
        el('text', { x, y: B + 24, 'text-anchor': 'middle', class: 'nm' }, g).textContent = name;
      });
      el('line', { x1: L, x2: L + W, y1: B, y2: B, class: 'base' }, svg);
      const lg = el('g', { transform: `translate(${L + W - 200},${T + 4})` }, svg);
      el('rect', { x: 0, y: 0, width: 14, height: 14, class: 'act' }, lg);
      el('text', { x: 20, y: 12, class: 'tick' }, lg).textContent = '實際';
      el('rect', { x: 80, y: 0, width: 14, height: 14, class: 'exp' }, lg);
      el('text', { x: 100, y: 12, class: 'tick' }, lg).textContent = '期望';
    },
    render(step) {
      const svg = document.getElementById('econ');
      svg.classList.toggle('st1', step === 1);
      svg.classList.toggle('st2', step === 2);
      svg.classList.toggle('st3', step >= 3);
    },
  };

  /* ───────── interactive 3-D trajectory of the interiority vector (PCA of one model; Fig. 1)
   * Steps 0–4 move the vector period by period; step 5 shows the whole path with the anchor words.
   * Drag to rotate; click a reached period to show its panel. */
  const TRAJ = [
    { name: '明清', yrs: '1368–1859', p: [-3.80, -1.29, -0.05], col: '#5b2a86',
      gl: '起點：小說人物常「暗想」，思想發生在幽暗、封閉的內室之中。' },
    { name: '晚清', yrs: '1860–1911', p: [-2.59, 0.85, 0.14], col: '#3b528b', cos: .515,
      ws: ['法子', '廣東', '撫臺', '中堂', '亂子', '外國人', '朋友', '王爺', '欽差', '差使', '大人'], gl: '官場中的算計；擴大的世界地理' },
    { name: '民國', yrs: '1912–1948', p: [1.13, 2.41, -0.79], col: '#21918c', cos: .419,
      ws: ['笑容', '嘴脣', '情感', '痛苦', '幸福', '同情', '女士', '感情', '女性', '肉體', '愛情', '理想'], gl: '心理獨白；浪漫愛情與「幸福」' },
    { name: '社會主義', yrs: '1949–1976', p: [2.44, -0.36, 2.29], col: '#3aa655', cos: .503,
      ws: ['幹部', '民兵', '指導員', '貧農', '隊長', '游擊隊', '延安', '共產黨', '毛主席', '同志', '戰士', '漢奸'], gl: '私人情感的集體化' },
    { name: '當代', yrs: '1977–', p: [2.82, -1.61, -1.59], col: '#c99a00', cos: .531,
      ws: ['皇上', '靈魂', '外公', '舞臺', '體驗', '藝術家', '城市', '感覺', '婚禮', '上帝', '商場', '人類'], gl: '內在的「再私有化」；城市生活' },
  ];
  const ANCHORS = ['想道', '忐忑', '提心吊膽', '暗笑', '坐立不安', '七上八下', '心如刀絞', '心亂如麻', '悵惘', '心酸', '心寒', '難過', '按捺不住', '半信半疑'];
  const BOX = [[-4.2, 3.2], [-1.8, 2.8], [-1.8, 2.6]], ASPECT = [1, .78, .68];
  const norm = p => p.map((v, i) => ASPECT[i] * (2 * (v - BOX[i][0]) / (BOX[i][1] - BOX[i][0]) - 1));
  const CLOUD = (() => {   // schematic background: a seeded gaussian cloud, not real word positions
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const g = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
    return Array.from({ length: 320 }, () => [g() * .42, g() * .42, g() * .38].map((v, i) => Math.max(-ASPECT[i], Math.min(ASPECT[i], v))));
  })();
  const T3 = { yaw: -.75, pitch: .45, prog: 0, target: 0, raf: 0, last: 0, dragAt: -1e9, panel: -1 };

  function project([x, y, z]) {
    const ca = Math.cos(T3.yaw), sa = Math.sin(T3.yaw), cb = Math.cos(T3.pitch), sb = Math.sin(T3.pitch);
    const xr = x * ca - y * sa, d = x * sa + y * ca;
    const v = z * cb + d * sb, depth = d * cb - z * sb;   // camera slightly above the box
    const f = 4.2 / (4.2 + depth);
    return [350 + xr * 250 * f, 255 - v * 250 * f, depth, f];
  }
  function draw3d() {
    const svg = document.getElementById('traj3d');
    svg.innerHTML = '';
    // box
    const c = (i, j, k) => project([i * ASPECT[0], j * ASPECT[1], k * ASPECT[2]]);
    const edges = [];
    [-1, 1].forEach(a => [-1, 1].forEach(b => { edges.push([c(-1, a, b), c(1, a, b)], [c(a, -1, b), c(a, 1, b)], [c(a, b, -1), c(a, b, 1)]); }));
    edges.forEach(([p, q]) => el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: 'box' }, svg));
    for (let t = -.5; t <= .51; t += .5) {   // floor grid
      const a = c(t, -1, -1), b = c(t, 1, -1), e = c(-1, t, -1), f = c(1, t, -1);
      el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'grid' }, svg);
      el('line', { x1: e[0], y1: e[1], x2: f[0], y2: f[1], class: 'grid' }, svg);
    }
    [['PC1', c(0, -1.12, -1.12)], ['PC2', c(1.12, 0, -1.12)], ['PC3', c(-1.1, -1.1, 0)]].forEach(([t, p]) =>
      el('text', { x: p[0], y: p[1], class: 'axl', 'text-anchor': 'middle' }, svg).textContent = t);
    // cloud
    const g = el('g', { class: 'cloud' }, svg);
    CLOUD.forEach(p => { const q = project(p); el('circle', { cx: q[0], cy: q[1], r: 1.5 * q[3] }, g); });
    // path up to the moving head
    const P = TRAJ.map(t => project(norm(t.p)));
    const k = Math.floor(T3.prog), fr = T3.prog - k;
    for (let i = 0; i < Math.min(k, 4); i++) el('line', { x1: P[i][0], y1: P[i][1], x2: P[i + 1][0], y2: P[i + 1][1], class: 'path' }, svg);
    let head = P[Math.min(k, 4)];
    if (k < 4 && fr > 1e-3) {
      const a = norm(TRAJ[k].p), b = norm(TRAJ[k + 1].p);
      head = project(a.map((v, i) => v + (b[i] - v) * fr));
      el('line', { x1: P[k][0], y1: P[k][1], x2: head[0], y2: head[1], class: 'path live' }, svg);
    }
    // reached periods, far ones first
    TRAJ.map((t, i) => [t, i]).filter(([, i]) => i <= T3.prog + 1e-3).sort((a, b) => P[b[1]][2] - P[a[1]][2]).forEach(([t, i]) => {
      const q = P[i], pg = el('g', { class: 'pt' + (i === T3.panel ? ' sel' : ''), 'data-i': i }, svg);
      el('circle', { cx: q[0], cy: q[1], r: 9 * q[3], fill: t.col }, pg);
      el('text', { x: q[0], y: q[1] - 16 * q[3], 'text-anchor': 'middle', class: 'lab' }, pg).textContent = t.name;
    });
    if (fr > 1e-3 && k < 4) {
      el('circle', { cx: head[0], cy: head[1], r: 16, class: 'glow' }, svg);
      el('circle', { cx: head[0], cy: head[1], r: 6, class: 'head' }, svg);
    }
  }
  function panel3d(i) {
    if (T3.panel === i) return;
    T3.panel = i;
    const host = document.getElementById('traj3d-panel');
    let h;
    if (i >= TRAJ.length) {
      h = `<div class="pp"><span class="nm">六百年，五個重心</span></div>
        <p class="gl">鄰居詞大幅更替，向量本身只是逐步移動：從未「回到」明清（相似度 0.33）。</p>
        <div class="lab">各時代最接近 interiority 的詞（錨點）</div>
        <div class="dw-chips zh sm">${ANCHORS.map(w => `<span>${w}</span>`).join('')}</div>
        <p class="gl" style="margin-top:12px">它們都仍是<b>內在的心理狀態</b>：把各時代的「心」連在一起。</p>`;
    } else {
      const t = TRAJ[i];
      h = `<div class="pp"><span class="dot" style="background:${t.col}"></span><span class="nm">${t.name}</span><span class="yr">${t.yrs}</span></div>` +
        (t.cos ? `<div class="cos">與${TRAJ[i - 1].name}的餘弦相似度 <b>${t.cos.toFixed(3)}</b></div>
        <div class="lab">移近「心」的詞</div>
        <div class="dw-chips zh sm">${t.ws.map(w => `<span>${w}</span>`).join('')}</div>` : '') +
        `<p class="gl">${t.gl}</p>`;
    }
    host.innerHTML = `<div class="in">${h}</div>`;
  }
  function loop3d(now) {
    const dt = Math.min(.05, (now - (T3.last || now)) / 1000);
    T3.last = now;
    if (Math.abs(T3.target - T3.prog) > 1e-3) {
      const dir = Math.sign(T3.target - T3.prog), dist = Math.abs(T3.target - T3.prog);
      T3.prog += dir * Math.min(dist, dt * Math.max(.8, dist * 1.5));
      if (Math.abs(T3.target - T3.prog) <= 1e-3) T3.prog = T3.target;
    }
    if (now - T3.dragAt > 2500) T3.yaw += dt * .12;
    draw3d();
    T3.raf = requestAnimationFrame(loop3d);
  }
  H['s-h-3d'] = {
    enter(s) {
      const svg = document.getElementById('traj3d');
      if (!svg.dataset.bound) {
        svg.dataset.bound = 1;
        let drag = null;
        svg.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, moved: false }; svg.setPointerCapture(e.pointerId); });
        svg.addEventListener('pointermove', e => {
          if (!drag) return;
          const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
          if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
          T3.yaw += dx * .008; T3.pitch = Math.max(-.2, Math.min(1.2, T3.pitch - dy * .006));
          drag.x = e.clientX; drag.y = e.clientY; T3.dragAt = performance.now();
        });
        svg.addEventListener('pointerup', e => {
          const wasDrag = drag && drag.moved; drag = null;
          if (wasDrag) return;
          const pt = e.target.closest && e.target.closest('.pt');
          if (pt) panel3d(+pt.dataset.i);
        });
      }
      T3.last = 0;
      cancelAnimationFrame(T3.raf);
      T3.raf = requestAnimationFrame(loop3d);
    },
    leave() { cancelAnimationFrame(T3.raf); T3.raf = 0; },
    render(step) {
      T3.target = Math.min(step, TRAJ.length - 1);
      T3.panel = -1;
      panel3d(step);
      if (!T3.raf) draw3d();
    },
  };

  /* ───────── passage tabs follow the step */
  H['s-h-pass'] = {
    render(step, s) { s.querySelectorAll('.sw-tab').forEach(t => t.classList.toggle('on', +t.dataset.on === step)); },
  };
})();

/* ───────── title: manuscript grid paper (原稿紙) — Liu Xie's words on 文心, dissolving leftwards into data.
 * Replaces the wave canvas of the lit-machines deck. */
(function () {
  const H = window.HOOKS, NS = 'http://www.w3.org/2000/svg';
  const TEXT = [...'夫文心者，言為文之用心也。昔涓子琴心，王孫巧心，心哉美矣，故用之焉。'];
  const COLS = 8, ROWS = 12, CELL = 38, GAP = 12, X0 = 1190, Y0 = 96;
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function build(svg) {
    svg.innerHTML = '';
    const left = X0 - COLS * CELL - (COLS - 1) * GAP;
    el('rect', { x: left - 14, y: Y0 - 14, width: X0 - left + 28, height: ROWS * CELL + 28, class: 'sheet' }, svg);
    let n = 0;
    for (let c = 0; c < COLS; c++) {          // columns run right to left, as in vertical writing
      const x = X0 - (c + 1) * CELL - c * GAP;
      el('rect', { x, y: Y0, width: CELL, height: ROWS * CELL, class: 'col' }, svg);
      for (let r = 1; r < ROWS; r++) el('line', { x1: x, x2: x + CELL, y1: Y0 + r * CELL, y2: Y0 + r * CELL, class: 'row' }, svg);
      for (let r = 0; r < ROWS; r++, n++) {
        const cx = x + CELL / 2, cy = Y0 + r * CELL + CELL / 2, delay = (n * 14) + 'ms';
        if (c < 3) {                              // written text
          const ch = TEXT[n];
          if (!ch) continue;
          const pu = '，。'.includes(ch);   // vertical punctuation sits in the upper right of its cell
          const t = el('text', { x: pu ? cx + 9 : cx, y: pu ? cy - 2 : cy + 9, 'text-anchor': 'middle', class: 'ch' + (ch === '心' ? ' xin' : '') + (pu ? ' pu' : '') }, svg);
          t.textContent = ch; t.style.transitionDelay = delay;
        } else {                                  // the same page, read as numbers: fading, thinning embedding cells
          const fade = (c - 3) / (COLS - 3);
          if (rnd() < fade * .85) continue;
          const v = rnd(), size = (CELL - 12) * (1 - fade * .55);
          const q = el('rect', { x: cx - size / 2, y: cy - size / 2, width: size, height: size, rx: 2,
            class: 'px' + (v > .78 ? ' hot' : v < .2 ? ' cool' : '') }, svg);
          q.style.setProperty('--o', (.18 + .7 * v * (1 - fade)).toFixed(2));
          q.style.transitionDelay = delay;
        }
      }
    }
    const src = el('text', { x: X0, y: Y0 + ROWS * CELL + 44, 'text-anchor': 'end', class: 'src' }, svg);
    src.textContent = '「夫文心者，言為文之用心也」 劉勰《文心雕龍・序志》';
  }
  H['s-title'] = {
    enter(slide) {
      const svg = document.getElementById('title-grid');
      if (!svg.childElementCount) build(svg);
      svg.classList.remove('go');
      requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add('go')));
    },
  };
})();

/* ───────── word vectors (illustrative coordinates) and cosine similarity: two hands-on slides */
(function () {
  const H = window.HOOKS, NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  const cos = (a, b) => { let d = 0, na = 0, nb = 0; a.forEach((v, i) => { d += v * b[i]; na += v * v; nb += b[i] * b[i]; }); return d / Math.sqrt(na * nb); };

  /* word vectors: rotate by dragging, click a word to make it the reference */
  const WORDS = [['山', [2, 3, 1]], ['丘', [2.3, 2.5, .3]], ['火山', [2.4, 3.2, 2.6]], ['朱古力', [-2.6, 1.2, 2.4]], ['蛋糕', [-2.8, -.2, 1.5]]];
  const W = { yaw: -.5, pitch: .4, ref: 0, step: 0, raf: 0, last: 0, dragAt: -1e9 };
  const proj = ([x, y, z]) => {
    const ca = Math.cos(W.yaw), sa = Math.sin(W.yaw), cb = Math.cos(W.pitch), sb = Math.sin(W.pitch);
    const xr = x * ca - y * sa, d = x * sa + y * ca, v = z * cb + d * sb, depth = d * cb - z * sb, f = 9 / (9 + depth);
    return [260 + xr * 68 * f, 250 - v * 68 * f, depth];
  };
  function drawWV() {
    const svg = document.getElementById('wordvec'); svg.innerHTML = '';
    const o = proj([0, 0, 0]);
    [[[4, 0, 0], 'x'], [[0, 4, 0], 'y'], [[0, 0, 3.6], 'z']].forEach(([p, t]) => {
      const q = proj(p), n = proj(p.map(v => -v * .8));
      el('line', { x1: n[0], y1: n[1], x2: q[0], y2: q[1], class: 'axis' }, svg);
      el('text', { x: q[0] + 6, y: q[1] + 4, class: 'axl' }, svg).textContent = t;
    });
    const shown = W.step >= 1 ? WORDS.map((w, i) => i) : [0];
    shown.map(i => [i, proj(WORDS[i][1])]).sort((a, b) => b[1][2] - a[1][2]).forEach(([i, q]) => {
      const g = el('g', { class: 'w' + (i === W.ref ? ' ref' : ''), 'data-i': i }, svg);
      el('line', { x1: o[0], y1: o[1], x2: q[0], y2: q[1], class: 'vec' }, g);
      el('circle', { cx: q[0], cy: q[1], r: 6 }, g);
      el('text', { x: q[0] + 10, y: q[1] - 8, class: 'lab' }, g).textContent = WORDS[i][0];
      if (W.step === 0) el('text', { x: q[0] + 10, y: q[1] + 16, class: 'co' }, g).textContent = '(' + WORDS[i][1].join(', ') + ')';
    });
  }
  function panelWV() {
    const host = document.getElementById('wordvec-panel');
    const r = WORDS[W.ref];
    const rows = WORDS.map((w, i) => [i, cos(r[1], w[1])]).filter(([i]) => i !== W.ref).sort((a, b) => b[1] - a[1]);
    host.innerHTML = `與 <b class="c-coral zh">${r[0]}</b> 的餘弦相似度：` + rows.map(([i, c]) =>
      `<div class="r" data-i="${i}"><span class="zh">${WORDS[i][0]}</span><span class="bar"><span style="width:${Math.max(0, c) * 100}%"></span></span><span class="v">${c.toFixed(2)}</span></div>`).join('');
    host.querySelectorAll('.r').forEach(e => e.onclick = () => { W.ref = +e.dataset.i; panelWV(); });
  }
  function loopWV(now) {
    const dt = Math.min(.05, (now - (W.last || now)) / 1000); W.last = now;
    if (now - W.dragAt > 2500) W.yaw += dt * .15;
    drawWV(); W.raf = requestAnimationFrame(loopWV);
  }
  H['s-h-vec'] = {
    enter() {
      const svg = document.getElementById('wordvec');
      if (!svg.dataset.bound) {
        svg.dataset.bound = 1;
        let drag = null;
        svg.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, moved: false }; svg.setPointerCapture(e.pointerId); });
        svg.addEventListener('pointermove', e => {
          if (!drag) return;
          const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
          if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
          W.yaw += dx * .008; W.pitch = Math.max(-.3, Math.min(1.2, W.pitch - dy * .006));
          drag.x = e.clientX; drag.y = e.clientY; W.dragAt = performance.now();
        });
        svg.addEventListener('pointerup', e => {
          const moved = drag && drag.moved; drag = null;
          const g = !moved && e.target.closest && e.target.closest('.w');
          if (g && W.step >= 1) { W.ref = +g.dataset.i; panelWV(); }
        });
      }
      W.last = 0; cancelAnimationFrame(W.raf); W.raf = requestAnimationFrame(loopWV);
    },
    leave() { cancelAnimationFrame(W.raf); W.raf = 0; },
    render(step) { W.step = step; panelWV(); },
  };

  /* cosine similarity: two draggable unit vectors */
  const C = { a: 30, b: 75 }, R = 170, O = 220;
  const pt = deg => [O + R * Math.cos(deg * Math.PI / 180), O - R * Math.sin(deg * Math.PI / 180)];
  function drawCos() {
    const svg = document.getElementById('cosvec'); svg.innerHTML = '';
    el('defs', {}, svg).innerHTML = '<marker id="cos-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker>';
    el('circle', { cx: O, cy: O, r: R, class: 'unit' }, svg);
    el('line', { x1: O - R - 20, y1: O, x2: O + R + 20, y2: O, class: 'ax' }, svg);
    el('line', { x1: O, y1: O - R - 20, x2: O, y2: O + R + 20, class: 'ax' }, svg);
    let th = Math.abs(C.b - C.a) % 360; if (th > 180) th = 360 - th;
    const c = Math.cos(th * Math.PI / 180);
    // angle arc from A towards B the short way
    let d = ((C.b - C.a) % 360 + 540) % 360 - 180;
    const r0 = 46, a0 = C.a * Math.PI / 180, a1 = (C.a + d) * Math.PI / 180;
    el('path', { d: `M${O + r0 * Math.cos(a0)},${O - r0 * Math.sin(a0)} A${r0},${r0} 0 0 ${d > 0 ? 0 : 1} ${O + r0 * Math.cos(a1)},${O - r0 * Math.sin(a1)}`, class: 'arc' }, svg);
    // projection of B on A
    const pa = [Math.cos(a0), Math.sin(a0)], foot = [O + R * c * pa[0], O - R * c * pa[1]], B = pt(C.b), A = pt(C.a);
    el('line', { x1: B[0], y1: B[1], x2: foot[0], y2: foot[1], class: 'drop' }, svg);
    el('line', { x1: O, y1: O, x2: foot[0], y2: foot[1], class: 'proj' }, svg);
    [[A, 'a', 'A'], [B, 'b', 'B']].forEach(([p, k, t]) => {
      el('line', { x1: O, y1: O, x2: p[0], y2: p[1], class: 'v ' + k, 'marker-end': 'url(#cos-ar)' }, svg);
      el('circle', { cx: p[0], cy: p[1], r: 13, class: 'h ' + k, 'data-k': k }, svg);
      el('text', { x: p[0] + (p[0] > O ? 18 : -30), y: p[1] + (p[1] > O ? 22 : -8), class: 'vl ' + k }, svg).textContent = t;
    });
    document.getElementById('cos-val').textContent = (c < 0 ? '−' : '') + Math.abs(c).toFixed(2);
    document.getElementById('cos-ang').textContent = th.toFixed(0) + '°';
    document.getElementById('cos-proj').textContent = (c < 0 ? '−' : '') + Math.abs(c).toFixed(2);
    const vd = document.getElementById('cos-verdict');
    const [txt, cls] = c > .7 ? ['相似', 'sim'] : c > .25 ? ['有點相似', 'sim2'] : c > -.25 ? ['無關', 'none'] : c > -.7 ? ['有點相反', 'opp2'] : ['相反', 'opp'];
    vd.textContent = txt; vd.className = 'vd ' + cls;
    // cosine curve with a marker
    const cv = document.getElementById('coscurve'); cv.innerHTML = '';
    const X = t => 40 + t / 180 * 460, Y = v => 68 - v * 52;
    el('line', { x1: 40, x2: 500, y1: Y(0), y2: Y(0), class: 'ax' }, cv);
    [[1, '1'], [0, '0'], [-1, '−1']].forEach(([v, t]) => el('text', { x: 32, y: Y(v) + 4, 'text-anchor': 'end', class: 'tk' }, cv).textContent = t);
    [[0, '0°'], [90, '90°'], [180, '180°']].forEach(([v, t]) => el('text', { x: X(v), y: 146, 'text-anchor': 'middle', class: 'tk' }, cv).textContent = t);
    let dpath = ''; for (let t = 0; t <= 180; t += 3) dpath += (t ? 'L' : 'M') + X(t).toFixed(1) + ',' + Y(Math.cos(t * Math.PI / 180)).toFixed(1);
    el('path', { d: dpath, class: 'curve' }, cv);
    el('line', { x1: X(th), x2: X(th), y1: Y(0), y2: Y(c), class: 'proj' }, cv);
    el('circle', { cx: X(th), cy: Y(c), r: 6, class: 'mk' }, cv);
  }
  H['s-h-cos'] = {
    enter(s) {
      const svg = document.getElementById('cosvec');
      if (!svg.dataset.bound) {
        svg.dataset.bound = 1;
        let k = null;
        const ang = e => { const m = svg.getScreenCTM().inverse(), p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m); return Math.atan2(O - p.y, p.x - O) * 180 / Math.PI; };
        svg.addEventListener('pointerdown', e => {
          const h = e.target.closest('.h');
          if (h) k = h.dataset.k;
          else { const a = ang(e), da = Math.abs(((a - C.a) % 360 + 540) % 360 - 180), db = Math.abs(((a - C.b) % 360 + 540) % 360 - 180); k = da < db ? 'a' : 'b'; C[k] = a; drawCos(); }
          svg.setPointerCapture(e.pointerId);
        });
        svg.addEventListener('pointermove', e => { if (!k) return; C[k] = ang(e); drawCos(); });
        svg.addEventListener('pointerup', () => { k = null; });
        s.querySelectorAll('.presets button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); C.b = C.a + +b.dataset.a; drawCos(); b.blur(); }));
      }
      drawCos();
    },
  };
})();

/* ───────── training demo (a cartoon of word2vec, not the real algorithm):
 * words start at random positions; once training runs, words of the same group attract, all words repel at short range. */
(function () {
  const H = window.HOOKS, NS = 'http://www.w3.org/2000/svg';
  const GROUPS = [
    { name: '身體', col: 'var(--coral)', ws: ['心', '胸', '肚', '腦海', '肺腑'] },
    { name: '情感', col: 'var(--amber)', ws: ['歡喜', '痛苦', '憂愁', '憤怒', '同情'] },
    { name: '官場', col: 'var(--blue)', ws: ['撫臺', '欽差', '中堂', '大人', '差使'] },
    { name: '器物', col: 'var(--green)', ws: ['碗', '杯', '房門', '燈光', '床'] },
  ];
  const WS = GROUPS.flatMap((g, gi) => g.ws.map(w => ({ w, g: gi })));
  const T = { step: 0, epoch: 0, raf: 0, seed: 3, pos: [], init: [] };
  const rand = () => (T.seed = (T.seed * 16807) % 2147483647) / 2147483647;
  function scatter() {
    T.init = WS.map(() => [60 + rand() * 520, 46 + rand() * 340]);
    T.pos = T.init.map(p => p.slice()); T.epoch = 0;
  }
  function tick() {
    const lr = .9 / (1 + T.epoch * .015), F = WS.map(() => [0, 0]);
    for (let i = 0; i < WS.length; i++) for (let j = 0; j < WS.length; j++) {
      if (i === j) continue;
      const dx = T.pos[j][0] - T.pos[i][0], dy = T.pos[j][1] - T.pos[i][1], d = Math.hypot(dx, dy) || 1;
      const same = WS[i].g === WS[j].g, R = same ? 75 : 210, K = same ? 2.4 : 1.6;
      if (same) { F[i][0] += dx * .012; F[i][1] += dy * .012; }           // co-occurring: pull together
      if (d < R) { const k = (R - d) / R * K; F[i][0] -= dx / d * k; F[i][1] -= dy / d * k; }   // keep room; push other groups away
    }
    T.pos.forEach((p, i) => {
      p[0] = Math.max(40, Math.min(600, p[0] + lr * F[i][0] + (rand() - .5) * 3 * lr));
      p[1] = Math.max(36, Math.min(394, p[1] + lr * F[i][1] + (rand() - .5) * 3 * lr));
    });
    T.epoch++;
  }
  function draw() {
    const svg = document.getElementById('train'); svg.innerHTML = '';
    const el = (tag, a, par) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); par.appendChild(e); return e; };
    el('rect', { x: 1, y: 1, width: 638, height: 428, rx: 6, class: 'frame' }, svg);
    const coloured = T.step >= 2;
    if (coloured) GROUPS.forEach((g, gi) => {          // group halo + name
      const ps = T.pos.filter((p, i) => WS[i].g === gi), cx = ps.reduce((a, p) => a + p[0], 0) / ps.length, cy = ps.reduce((a, p) => a + p[1], 0) / ps.length;
      const r = Math.max(...ps.map(p => Math.hypot(p[0] - cx, p[1] - cy))) + 34;
      el('circle', { cx, cy, r, class: 'halo', style: `fill:${g.col};stroke:${g.col}` }, svg);
      el('text', { x: cx, y: cy - r - 6, 'text-anchor': 'middle', class: 'gname', style: `fill:${g.col}` }, svg).textContent = g.name;
    });
    WS.forEach((w, i) => {
      const [x, y] = T.pos[i], col = coloured ? GROUPS[w.g].col : 'var(--ink2)';
      el('circle', { cx: x, cy: y, r: 5, style: `fill:${col}` }, svg);
      el('text', { x: x + 9, y: y + 7, class: 'w', style: `fill:${col}` }, svg).textContent = w.w;
    });
    document.getElementById('train-epoch').textContent = `第 ${T.epoch} 輪`;
  }
  function loop() {
    if (T.step >= 1 && T.epoch < 260) { tick(); tick(); }
    draw();
    T.raf = requestAnimationFrame(loop);
  }
  H['s-h-train'] = {
    enter(s) {
      if (!T.pos.length) scatter();
      const b = document.getElementById('train-reseed');
      if (!b.dataset.bound) {
        b.dataset.bound = 1;
        b.addEventListener('click', e => { e.stopPropagation(); T.seed = 1 + Math.floor(Math.random() * 1e6); scatter(); b.blur(); });
      }
      cancelAnimationFrame(T.raf); T.raf = requestAnimationFrame(loop);
    },
    leave() { cancelAnimationFrame(T.raf); T.raf = 0; },
    render(step) {
      if (step === 0) { T.pos = T.init.map(p => p.slice()); T.epoch = 0; }
      T.step = step;
      document.getElementById('train-reseed').style.visibility = step >= 1 ? 'visible' : 'hidden';
    },
  };
})();
