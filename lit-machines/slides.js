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

  /* ───────────────────────── title: faint layered waves */
  H['s-title'] = {
    enter(slide) {
      const cv = document.getElementById('title-waves');
      const g = hidpi(cv, 1280, 720);
      const bands = [
        { f: 9.0, a: 6, y: 470, c: C.blue, o: .55 },
        { f: 4.2, a: 12, y: 482, c: C.blue, o: .4 },
        { f: 1.6, a: 20, y: 494, c: C.green, o: .3 },
        { f: .7, a: 30, y: 506, c: C.amber, o: .3 },
        { f: .25, a: 42, y: 518, c: C.coral, o: .25 },
      ];
      loop(slide, t => {
        g.clearRect(0, 0, 1280, 720);
        bands.forEach((b, i) => {
          g.beginPath();
          for (let x = 0; x <= 1280; x += 3) {
            const u = x / 1280;
            const env = Math.sin(Math.PI * u) ** 1.5;
            const y = b.y + env * b.a * Math.sin(2 * Math.PI * (b.f * u * 3 - t * b.f * .12) + i);
            x ? g.lineTo(x, y) : g.moveTo(x, y);
          }
          g.strokeStyle = b.c; g.globalAlpha = b.o; g.lineWidth = 1.3; g.stroke();
        });
        g.globalAlpha = 1;
      });
    },
  };

  /* ───────────────────────── polytemporality: log timeline */
  (function () {
    let built = false, marks = [];
    const X0 = 40, X1 = 1064, LMIN = -1, LMAX = 16.4, AY = 118;
    const lx = s => X0 + (Math.log10(s) - LMIN) / (LMAX - LMIN) * (X1 - X0);
    const YEAR = 3.156e7, DAY = 86400;
    function build() {
      const svg = document.getElementById('logline');
      el('line', { x1: X0, x2: X1, y1: AY, y2: AY, stroke: C.faint, 'stroke-width': 1 }, svg);
      [[1, '1 s'], [60, '1 min'], [3600, '1 h'], [DAY, '1 day'], [YEAR, '1 yr'], [10 * YEAR, '10'], [100 * YEAR, '100'], [1000 * YEAR, '1k'], [1e4 * YEAR, '10k'], [1e6 * YEAR, '1M yr'], [1e8 * YEAR, '100M yr']].forEach(([s, t]) => {
        const x = lx(s);
        el('line', { x1: x, x2: x, y1: AY - 4, y2: AY + 4, stroke: C.faint }, svg);
        el('text', { x, y: AY + 20, 'text-anchor': 'middle', 'font-size': 11, fill: C.mute, 'font-family': 'JetBrains Mono', text: t }, svg);
      });
      el('text', { x: X1, y: 292, 'text-anchor': 'end', 'font-size': 10, fill: C.faint, 'font-family': 'JetBrains Mono', text: 'LOGARITHMIC TIME SCALE' }, svg);
      // Latour (above), steps 1–5
      const lat = [
        [3 * DAY, 'habits', 'a few days', 1, 62],
        [3000 * YEAR, 'habits', 'several thousand years', 2, 30],
        [1e5 * YEAR, 'genes', '100,000 years', 3, 62],
        [3e6 * YEAR, 'genes', '3 million years', 4, 30],
        [5e8 * YEAR, 'genes', '500 million years', 5, 62],
      ];
      lat.forEach(([s, a, b, st, ly]) => {
        const G = el('g', {}, svg), x = lx(s);
        el('line', { x1: x, x2: x, y1: ly + 12, y2: AY, stroke: C.coral, 'stroke-width': 1, opacity: .5 }, G);
        el('circle', { cx: x, cy: AY, r: 6, fill: C.coral }, G);
        el('text', { x, y: ly - 4, 'text-anchor': 'middle', 'font-size': 15, fill: C.ink, text: b }, G);
        el('text', { x, y: ly + 10, 'text-anchor': 'middle', 'font-size': 11, fill: C.mute, 'font-family': 'JetBrains Mono', text: a.toUpperCase() }, G);
        marks.push([G, st]);
      });
      // the literary text (below), step 6
      const lit = [
        [.25, 'hearing a word', '≈ 0.25 s', 176, 6],
        [8 * 3600, 'reading a novel', '≈ 8 hours', 176, 7],
        [10 * YEAR, 'the Cultural Revolution', '1966–76: 10 years', 176, 8],
        [1300 * YEAR, 'regulated verse', 'Tang: ≈ 1,300 years', 212, 9],
        [3000 * YEAR, 'parallelism (Shijing)', '≈ 3,000 years', 248, 10],
      ];
      lit.forEach(([s, t, sub, ly, st]) => {
        const G = el('g', {}, svg), x = lx(s);
        el('line', { x1: x, x2: x, y1: AY, y2: ly - 16, stroke: C.amber, 'stroke-width': 1, opacity: .45 }, G);
        el('rect', { x: x - 5, y: AY - 5, width: 10, height: 10, fill: C.amber, transform: `rotate(45 ${x} ${AY})` }, G);
        el('text', { x, y: ly - 2, 'text-anchor': 'middle', 'font-size': 15, fill: C.amber, text: t }, G);
        el('text', { x, y: ly + 12, 'text-anchor': 'middle', 'font-size': 10.5, fill: C.mute, 'font-family': 'JetBrains Mono', text: sub }, G);
        marks.push([G, st]);
      });
      built = true;
    }
    H['s-poly'] = {
      render(step) {
        if (!built) build();
        marks.forEach(([G, st]) => show(G, step >= st));
      },
    };
    document.getElementById('s-poly').dataset.steps = 11;
  })();

  /* ───────────────────────── brain: three bands of oscillation */
  (function () {
    let stepNow = 0;
    H['s-waves'] = {
      render(step) { stepNow = step; },
      enter(slide) {
        const cv = document.getElementById('waves');
        const g = hidpi(cv, 1104, 360);
        const bands = [
          { name: 'Sensory cortex', t: '10–100 ms · phonemes, words', f: 15, a: 16, c: C.blue },
          { name: 'Language network', t: 'seconds · sentences', f: 3, a: 26, c: C.green },
          { name: 'Default mode network', t: 'minutes · paragraphs, stories', f: .6, a: 36, c: C.amber },
        ];
        const X0 = 250, W = 1104 - X0;
        loop(slide, t => {
          g.clearRect(0, 0, 1104, 360);
          bands.forEach((b, i) => {
            const cy = 60 + i * 120;
            g.fillStyle = C.ink; g.font = '400 24px "Instrument Serif"'; g.fillText(b.name, 0, cy - 2);
            g.fillStyle = C.mute; g.font = '11px "JetBrains Mono"'; g.fillText(b.t.toUpperCase(), 0, cy + 18);
            g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.moveTo(X0, cy); g.lineTo(1104, cy); g.stroke();
            const slow = u => b.a * Math.sin(2 * Math.PI * b.f * 2 * (u - t * .35 * Math.min(b.f, 3) / 3 / (b.f * 2)));
            const trace = (fn, col, lw) => {
              g.beginPath();
              for (let x = 0; x <= W; x += 2) { const y = fn(x / W); x ? g.lineTo(X0 + x, cy + y) : g.moveTo(X0 + x, cy + y); }
              g.strokeStyle = col; g.lineWidth = lw; g.stroke();
            };
            if (i === 2 && stepNow >= 2) {
              // step 2: fast ripples riding on the slow wave (Buzsáki); the ripples travel with it, so the shape stays rigid
              // step 2: the three clocks add up in one signal: slow (this row) + seconds-scale (row 2) + fast (row 1)
              trace(slow, b.c, 1.2);
              const mid = u => 12 * Math.sin(2 * Math.PI * (3 * 2 * u - t * .35));
              const fast = u => 5 * Math.sin(2 * Math.PI * (15 * 2 * u - t * .35));
              trace(u => slow(u) + mid(u) + fast(u), C.coral, 1.5);
            } else trace(slow, b.c, 2);
          });
        });
      },
    };
  })();

  /* ───────────────────────── Fibonacci grammar: sequence and hierarchy */
  (function () {
    const G = 7, LEVELS = 8, SHOWN = 4;
    const gens = ['0'];
    for (let i = 1; i <= G; i++) gens.push([...gens[i - 1]].map(c => c === '0' ? '1' : '01').join(''));
    // levels[0] = surface (gen 7); levels[k] = gen 7-k, each unit knows its span over the surface
    const levels = [];
    levels[0] = [...gens[G]].map((s, i) => ({ s, a: i, b: i + 1, parent: null }));
    for (let k = 1; k < LEVELS; k++) {
      const up = [...gens[G - k]].map(s => ({ s, kids: [] }));
      let j = 0;
      up.forEach(u => {
        const n = u.s === '0' ? 1 : 2;
        for (let m = 0; m < n; m++) { u.kids.push(levels[k - 1][j]); levels[k - 1][j].parent = u; j++; }
        u.a = u.kids[0].a; u.b = u.kids[u.kids.length - 1].b;
      });
      levels[k] = up;
    }
    // which surface symbols are predictable when the top `depth` levels of structure are known:
    // a unit is predicted if the previous unit at its level is '0', or if its parent unit is predicted
    function surfaceDet(depth) {
      for (let k = LEVELS - 1; k >= 0; k--) levels[k].forEach((u, i) => {
        const inUse = k < depth;
        const own = i > 0 && levels[k][i - 1].s === '0';
        const par = u.parent && u.parent._det && (k + 1) < depth;
        u._det = inUse && (own || par);
      });
      return levels[0].map(u => u._det);
    }
    let built = false, genRows = [], lv = [], cnt = null, E0 = [];
    const NSX = 'http://www.w3.org/2000/svg';
    const N = levels[0].length, W = 880, cw = W / N;
    function build() {
      const host = document.getElementById('fib');
      // generation tree: gen k = levels[G - k]; a symbol spans the surface positions it generates
      const gh = document.getElementById('fibgen');
      for (let k = 0; k <= G; k++) {
        const row = document.createElement('div'); row.className = 'fib-row'; row.style.height = '38px';
        row.innerHTML = `<div class="lab" style="width:212px">GENERATION ${k}</div><div class="cells" style="flex:none;width:${W}px;height:34px"></div>`;
        const cells = row.querySelector('.cells');
        levels[G - k].forEach(u => {
          const d = document.createElement('div'); d.className = 'fcell ' + (u.s === '0' ? 'g0' : 'g1');
          d.style.height = '34px'; d.style.fontSize = '19px'; d.style.left = (u.a * cw + 2) + 'px'; d.style.width = ((u.b - u.a) * cw - 4) + 'px'; d.textContent = u.s; cells.appendChild(d);
        });
        gh.appendChild(row); genRows.push(row);
      }
      // one diagram: the surface on top; each further level merges elements of the level above into larger chunks (arrows)
      const RH = 34, GAP = 44, X0 = 234;
      host.style.cssText += `;position:absolute;left:0;width:1100px;height:${RH + 3 * (RH + GAP)}px`;
      const names = ['SURFACE', 'LEVEL 1 CHUNKS', 'LEVEL 2 CHUNKS', 'LEVEL 3 CHUNKS'];
      const svg = document.createElementNS(NSX, 'svg'); svg.setAttribute('width', 1100); svg.setAttribute('height', RH + 3 * (RH + GAP));
      svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none';
      svg.innerHTML = `<defs><marker id="fibah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${C.mute}"/></marker></defs>`;
      host.appendChild(svg);
      lv = [];
      // display elements per level. Surface: one element per symbol. At level k every grammar unit is merged into one element.
      // If the unit is predictable there (the previous unit at that level is a 0) all its symbols are certain (green);
      // otherwise the symbols keep the colours they already had, so a merged [0 1] may be [red 0, green 1].
      const E = [levels[0].map((u, i) => ({ a: u.a, b: u.b, cols: [i > 0 && levels[0][i - 1].s === '0'], src: [] }))];
      for (let k = 1; k < SHOWN; k++) {
        E.push(levels[k].map((u, i) => {
          const src = E[k - 1].filter(e => e.a >= u.a && e.b <= u.b);
          const cols = (i > 0 && levels[k][i - 1].s === '0') ? Array(u.b - u.a).fill(true) : [].concat(...src.map(e => e.cols));
          return { a: u.a, b: u.b, cols, src };
        }));
      }
      E0 = E[0];
      for (let k = 0; k < SHOWN; k++) {
        const y = (SHOWN - 1 - k) * (RH + GAP), g = { cells: [], arrows: [], lab: document.createElement('div') };
        g.lab.className = 'lab'; g.lab.style.cssText = `position:absolute;left:0;top:${y + 8}px;width:212px;text-align:right;white-space:nowrap;font-family:var(--mono);font-size:12px;letter-spacing:.08em;color:var(--mute)`; g.lab.textContent = names[k]; host.appendChild(g.lab);
        E[k].forEach(u => {
          const d = document.createElement('div'), syms = levels[0].slice(u.a, u.b).map(x => x.s), one = syms.length === 1;
          d.className = one ? 'fcell ' + (u.cols[0] ? 'det' : 'prob') : 'fchunk' + (u.cols.every(Boolean) ? ' alldet' : '');
          d.style.cssText = `top:${y}px;height:${RH}px;left:${X0 + u.a * cw + 2}px;width:${(u.b - u.a) * cw - 4}px`;
          if (one) { d.style.fontSize = '19px'; d.textContent = syms[0]; }
          else syms.forEach((s, i) => { const c = document.createElement('span'); c.className = u.cols[i] ? 'det' : 'prob'; c.textContent = s; d.appendChild(c); });
          host.appendChild(d); g.cells.push(d); u._el = d;
          if (k) u.src.forEach(c => {
            const cx = X0 + (c.a + c.b) / 2 * cw, px = X0 + (u.a + u.b) / 2 * cw, x2 = u.src.length === 1 ? cx : px + (cx - px) * .35;
            const ln = document.createElementNS(NSX, 'line');
            ln.setAttribute('x1', cx); ln.setAttribute('y1', y + RH + GAP - 3); ln.setAttribute('x2', x2); ln.setAttribute('y2', y + RH + 3);
            ln.setAttribute('stroke', C.mute); ln.setAttribute('stroke-width', 1.4); ln.setAttribute('marker-end', 'url(#fibah)');
            svg.appendChild(ln); g.arrows.push(ln);
          });
        });
        g.cnt = document.createElement('div'); g.cnt.className = 'fib-n'; g.cnt.style.cssText = `position:absolute;left:0;top:${y + 30}px;width:212px;text-align:right;white-space:nowrap;font-size:12px;color:var(--mute)`;
        g.cnt.innerHTML = `<b>${E[k].reduce((n, u) => n + u.cols.filter(x => !x).length, 0)}</b> of 21 symbols uncertain`;
        host.appendChild(g.cnt);
        lv.push(g);
      }
      cnt = document.createElement('div'); host.appendChild(cnt);
      built = true;
    }
    H['s-fib'] = {
      render(step) {
        if (!built) build();
        // steps 0–7: generations 0..step of the grammar; step 8: the surface string alone;
        // steps 9–12: predictability once 1..4 levels of chunking are known; the quotation comes with step 12
        const gen = step < 8;
        const gh = document.getElementById('fibgen'), fh = document.getElementById('fib');
        gh.style.transition = fh.style.transition = 'opacity .5s';
        gh.style.opacity = gen ? 1 : 0; fh.style.opacity = gen ? 0 : 1;
        genRows.forEach((r, k) => { r.style.transition = 'opacity .5s'; r.style.opacity = k <= step ? 1 : 0; });
        const depth = Math.max(1, step - 8);            // step 8: the bare surface; 9: predict it; 10–12: one more level of chunks each
        lv.forEach((g, k) => {
          const shown = step >= 8 && (k === 0 || k < depth);
          g.cells.forEach((d, i) => {
            d.style.transition = 'opacity .5s, background .4s, border-color .4s, color .4s';
            d.style.opacity = shown ? 1 : 0;
            if (k === 0) d.className = 'fcell' + (step >= 9 ? (E0[i].cols[0] ? ' det' : ' prob') : '');
          });
          g.lab.style.transition = g.cnt.style.transition = 'opacity .5s';
          g.lab.style.opacity = shown ? 1 : 0; g.cnt.style.opacity = shown && (k > 0 || step >= 9) ? 1 : 0;
          g.arrows.forEach(a => { a.style.transition = 'opacity .5s'; a.style.opacity = shown ? 1 : 0; });
        });
      },
    };
    document.getElementById('s-fib').dataset.steps = 12;
  })();

  /* ───────────────────────── LM layer stack */
  (function () {
    let built = false, layers = [], lab1, labs;
    const chars = [...'明月松間照，清泉石上流'];
    const NL = 7, X0 = 170, W = 450, Y0 = 400, DY = 54;
    const cw = W / chars.length;
    const mix = (a, b, t) => {
      const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
      const A = p(a), B = p(b);
      return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
    };
    function build() {
      const svg = document.getElementById('stack');
      const tokens = el('g', {}, svg);
      chars.forEach((c, i) => el('text', { x: X0 + i * cw + cw / 2, y: Y0 + 40, 'text-anchor': 'middle', 'font-size': 24, fill: C.ink, 'font-family': 'Songti TC, Noto Serif TC, serif', text: c }, tokens));
      let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let l = 0; l < NL; l++) {
        const G = el('g', {}, svg), y = Y0 - l * DY, t = l / (NL - 1);
        const col = mix(C.blue, C.amber, t);
        // attention: every token is linked to every token of the layer below (a dense network);
        // early layers weight near neighbours, later layers spread the weight over the whole sequence
        if (l > 0) {
          const spread = .8 + l * 1.6;
          for (let i = 0; i < chars.length; i++) for (let j = 0; j < chars.length; j++) {
            const w = Math.exp(-Math.abs(i - j) / spread);
            el('line', { x1: X0 + i * cw + cw / 2, y1: y + 7, x2: X0 + j * cw + cw / 2, y2: y + DY - 7, stroke: col, 'stroke-width': .6 + .9 * w, opacity: .06 + .34 * w }, G);
          }
        }
        for (let i = 0; i < chars.length; i++) el('rect', { x: X0 + i * cw + 4, y: y - 7, width: cw - 8, height: 14, rx: 3, fill: col, opacity: .1 + .9 * Math.pow(rnd(), 1.7) }, G);
        el('text', { x: X0 - 16, y: y + 4, 'text-anchor': 'end', 'font-size': 11, fill: C.mute, 'font-family': 'JetBrains Mono', text: `L${l + 1}` }, G);
        layers.push(G);
      }
      lab1 = el('g', {}, svg);
      el('text', { x: X0 + W / 2, y: Y0 + 72, 'text-anchor': 'middle', 'font-size': 12, fill: C.blue, 'font-family': 'JetBrains Mono', text: '↑ A LINEAR SEQUENCE' }, lab1);
      el('text', { x: X0 + W / 2, y: Y0 - (NL - 1) * DY - 22, 'text-anchor': 'middle', 'font-size': 12, fill: C.amber, 'font-family': 'JetBrains Mono', text: 'A HIERARCHICAL REPRESENTATION' }, lab1);
      labs = el('g', {}, svg);
      el('text', { x: X0 - 46, y: Y0 - DY * .5 + 4, 'text-anchor': 'end', 'font-size': 13, fill: C.blue, text: '≈ auditory cortex' }, labs);
      el('text', { x: X0 - 46, y: Y0 - (NL - 1.5) * DY + 4, 'text-anchor': 'end', 'font-size': 13, fill: C.amber, text: '≈ higher regions' }, labs);
      built = true;
    }
    H['s-stack'] = {
      render(step) {
        if (!built) build();
        layers.forEach((G, l) => { G.style.transition = `opacity .4s ${step >= 1 ? l * 0.12 : 0}s`; G.style.opacity = step >= 1 ? 1 : 0; });
        show(lab1, step >= 2); show(labs, step >= 3);
      },
    };
  })();

  /* ───────────────────────── heatmap focus */
  H['s-heat'] = {
    render(step) {
      document.getElementById('shade-bot').classList.toggle('on', step === 2);
      document.getElementById('shade-top').classList.toggle('on', step === 3);
    },
  };

  /* ───────────────────────── passage layers */
  H['s-passage'] = {
    render(step) {
      const p = document.getElementById('passage');
      for (let i = 1; i <= 5; i++) p.classList.toggle('l' + i, step >= i);
      p.classList.toggle('focus', step >= 1);
    },
  };

  /* ───────────────────────── hermeneutic circle */
  (function () {
    let built = false, parts = {};
    function stack(svg, x, y, dir, col) {
      const G = el('g', {}, svg);
      for (let b = 0; b < 4; b++) {
        const by = y + b * 78;
        el('rect', { x, y: by, width: 200, height: 66, rx: 8, fill: 'none', stroke: C.faint }, G);
        for (let r = 0; r < 3; r++) {
          const ry = by + 9 + r * 17, n = [10, 5, 2][dir > 0 ? r : 2 - r];
          for (let c = 0; c < n; c++) el('rect', { x: x + 10 + c * (180 / n), y: ry, width: 180 / n - 4, height: 11, rx: 2, fill: col, opacity: .25 + .15 * ((b + c) % 3) }, G);
        }
      }
      // flow particles
      for (let i = 0; i < 4; i++) {
        const c = el('circle', { cx: x + 30 + i * 46, cy: y, r: 3, fill: col }, G);
        el('animate', { attributeName: 'cy', from: dir > 0 ? y : y + 306, to: dir > 0 ? y + 306 : y, dur: `${2.4 + i * .3}s`, repeatCount: 'indefinite' }, c);
      }
      return G;
    }
    function arrow(svg, d, col, label, lx, ly) {
      const G = el('g', {}, svg);
      el('path', { d, fill: 'none', stroke: col, 'stroke-width': 2.5, 'marker-end': `url(#ah-${col === C.blue ? 'b' : 'a'})`, class: 'flow' }, G);
      el('text', { x: lx, y: ly, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: col, 'font-family': 'Inter', text: label }, G);
      return G;
    }
    function build() {
      const svg = document.getElementById('circle');
      const defs = el('defs', {}, svg);
      [['b', C.blue], ['a', C.amber], ['c', C.coral]].forEach(([id, col]) => {
        const m = el('marker', { id: 'ah-' + id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
        el('path', { d: 'M0 0 L10 5 L0 10 z', fill: col }, m);
      });
      el('style', { text: '.flow{stroke-dasharray:6 7;animation:dash 1.2s linear infinite}@keyframes dash{to{stroke-dashoffset:-26}}' }, svg);
      const box = (cx, cy, t) => {
        const G = el('g', {}, svg);
        el('rect', { x: cx - 120, y: cy - 28, width: 240, height: 56, rx: 28, fill: '#fff', stroke: C.ink2 }, G);
        el('text', { x: cx, y: cy + 9, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 400, fill: C.ink, 'font-family': 'Instrument Serif', text: t }, G);
        return G;
      };
      parts.axes = el('g', {}, svg);
      el('line', { x1: 552, x2: 552, y1: 92, y2: 468, stroke: C.faint, 'stroke-width': 1.5 }, parts.axes);
      el('line', { x1: 290, x2: 814, y1: 280, y2: 280, stroke: C.faint, 'stroke-width': 1.5 }, parts.axes);
      el('text', { x: 566, y: 152, 'font-size': 18, 'font-weight': 700, fill: C.ink, 'font-family': 'JetBrains Mono', text: 'INTERTEXTUALITY' }, parts.axes);
      el('text', { x: 566, y: 176, 'font-size': 15, fill: C.mute, text: 'symbolic sequences' }, parts.axes);
      el('text', { x: 300, y: 268, 'font-size': 18, 'font-weight': 700, fill: C.ink, 'font-family': 'JetBrains Mono', text: 'INFRATEXTUALITY' }, parts.axes);
      el('text', { x: 300, y: 304, 'font-size': 15, fill: C.mute, text: 'patterns of activation' }, parts.axes);
      parts.narr = box(552, 50, 'narrative');
      parts.right = stack(svg, 855, 126, 1, C.blue);
      parts.a1 = arrow(svg, 'M676 50 C 860 50, 955 60, 955 118', C.blue, 'integration', 850, 36);
      parts.a2 = arrow(svg, 'M955 440 C 955 505, 860 510, 680 510', C.amber, 'linearization', 850, 536);
      parts.interp = box(552, 510, 'interpretation');
      parts.left = stack(svg, 49, 126, -1, C.blue);
      parts.a3 = arrow(svg, 'M428 510 C 244 510, 149 505, 149 442', C.blue, 'integration', 254, 536);
      parts.a4 = arrow(svg, 'M149 118 C 149 60, 244 50, 424 50', C.amber, 'linearization', 254, 36);
      // feedback: top-down signals against the feed-forward flow of each stack (cf. V5 → V1)
      const fb = (x, y0, y1, side) => {
        const G = el('g', {}, svg);
        el('path', { d: `M${x} ${y0} L${x} ${y1}`, fill: 'none', stroke: C.coral, 'stroke-width': 2.5, 'marker-end': 'url(#ah-c)', class: 'flow' }, G);
        for (let i = 0; i < 3; i++) {
          const c = el('circle', { cx: x, cy: y0, r: 3.2, fill: C.coral }, G);
          el('animate', { attributeName: 'cy', from: y0, to: y1, dur: `${2.6 + i * .35}s`, begin: `${-i * .9}s`, repeatCount: 'indefinite' }, c);
        }
        const t = el('text', { x: x + side * 16, y: (y0 + y1) / 2, 'text-anchor': 'middle', 'font-size': 13, fill: C.coral, 'font-family': 'JetBrains Mono', transform: `rotate(${side * 90} ${x + side * 16} ${(y0 + y1) / 2})`, text: 'FEEDBACK' }, G);
        return G;
      };
      parts.fb = el('g', {}, svg);
      parts.fb.appendChild(fb(1078, 432, 130, 1));
      parts.fb.appendChild(fb(26, 130, 432, -1));
      built = true;
    }
    H['s-circle'] = {
      render(step) {
        if (!built) build();
        show(parts.narr, true);
        show(parts.a1, step >= 1); show(parts.right, step >= 1);
        show(parts.a2, step >= 2); show(parts.interp, step >= 2);
        show(parts.a3, step >= 3); show(parts.left, step >= 3); show(parts.a4, step >= 3);
        show(parts.fb, step >= 4);
        show(parts.axes, step >= 5);
      },
    };
    document.getElementById('s-circle').dataset.steps = 5;
  })();

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

  /* ───────────────────────── what "aligned" looks like: schematic 3D paths (hypothetical coordinates) */
  (function () {
    const B = [[-1.6, -.6, -.4], [-.8, .2, .3], [0, -.3, -.2], [.8, .5, .4], [1.6, 0, -.1]];
    const add = (a, b) => a.map((v, i) => v + b[i]);
    // misaligned: the second verse takes steps in unrelated directions
    const stepsMis = [[1.2, -1.1, .5], [-1.6, .4, -1.0], [.5, 1.3, 1.2], [-1.0, -1.4, -.4]];
    const M = [[-.7, 1.0, -.6]]; stepsMis.forEach(d => M.push(add(M[M.length - 1], d)));
    // aligned: the same steps as the first verse, plus a small offset
    // (same overall directions, but different step lengths and a little noise, so it does not look like a copy)
    const scale = [.65, 1.3, .8, 1.25], noise = [[.18, -.22, .12], [-.25, .15, -.2], [.2, .2, .15], [-.12, -.25, .2]];
    const A = [[-1.5, .9, -.7]];
    for (let i = 0; i < 4; i++) A.push(add(A[i], add(B[i + 1].map((v, k) => (v - B[i][k]) * scale[i]), noise[i])));
    function panel(cv, other, g, t) {
      const W = 520, H_ = 320, S = 88, yaw = -.5 + .45 * Math.sin(t * .5), pitch = .4;
      const proj = ([x, y, z]) => {
        const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
        const x1 = x * cy - y * sy, y1 = x * sy + y * cy;
        const d = y1 * cp + z * sp, up = z * cp - y1 * sp, k = 1 / (1 - d * .12);
        return { X: W / 2 + x1 * S * k, Y: H_ / 2 - up * S * k, d, k };
      };
      g.clearRect(0, 0, W, H_);
      [[[-2.1, 0, 0], [2.1, 0, 0]], [[0, -1.6, 0], [0, 1.6, 0]], [[0, 0, -1.4], [0, 0, 1.4]]].forEach(([a, b]) => {
        const pa = proj(a), pb = proj(b); g.beginPath(); g.moveTo(pa.X, pa.Y); g.lineTo(pb.X, pb.Y); g.strokeStyle = C.faint; g.lineWidth = 1.2; g.stroke();
      });
      const nodes = [];
      [[B, '#2f6fe0'], [other, '#12b5cb']].forEach(([pts, col]) => {
        const P = pts.map(proj);
        for (let i = 0; i < P.length - 1; i++) {
          const a = P[i], b = P[i + 1], ang = Math.atan2(b.Y - a.Y, b.X - a.X), r = 9;
          const sx = a.X + r * Math.cos(ang), sy = a.Y + r * Math.sin(ang), ex = b.X - r * Math.cos(ang), ey = b.Y - r * Math.sin(ang);
          g.strokeStyle = col; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
          g.beginPath(); g.moveTo(ex - 9 * Math.cos(ang - .45), ey - 9 * Math.sin(ang - .45)); g.lineTo(ex, ey); g.lineTo(ex - 9 * Math.cos(ang + .45), ey - 9 * Math.sin(ang + .45)); g.stroke();
        }
        P.forEach(p => nodes.push({ p, col }));
      });
      nodes.sort((u, v) => u.p.d - v.p.d).forEach(({ p, col }) => {
        g.beginPath(); g.arc(p.X, p.Y, 9 * p.k, 0, 7); g.fillStyle = col; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
      });
    }
    H['s-align-ex'] = {
      enter(slide) {
        const c1 = document.getElementById('ax-mis'), c2 = document.getElementById('ax-ali');
        const g1 = hidpi(c1, 520, 320), g2 = hidpi(c2, 520, 320);
        loop(slide, t => { panel(c1, M, g1, t); panel(c2, A, g2, t); });
      },
    };
  })();

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
      el('text', { x: 40, y: 408, 'font-size': 13, fill: C.coral, 'font-family': 'JetBrains Mono', text: '● [CLS] query: drag me' }, svg);
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
      document.getElementById('cpl-al-layer').textContent = 'LAYER ' + layer + (layer === 12 ? ' (TOP)' : '');
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
        g.fillStyle = C.mute; g.font = '13px "JetBrains Mono"'; g.fillText(t, b.X + 6, b.Y);
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
        g.fillStyle = '#fff'; g.font = `600 ${Math.round(28 * q.s)}px "PingFang TC", "Noto Sans TC", sans-serif`;
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
    const setLayer = l => { layer = Math.max(0, Math.min(12, l)); const el2 = document.getElementById('cpl-layer'); if (el2) el2.textContent = layer === 12 ? 'top layer (12)' : 'layer ' + layer; };
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

  /* ───────────────────────── prisons of autocomplete: a phone chat whose keyboard finishes our sentences */
  (function () {
    const EX = [
      ['hey, how', ' are you', ['are', 'do', 'is']],
      ['It was a dark and', ' stormy night', ['stormy', 'quiet', 'cold']],
      ['床前明月', '光', ['光', '夜', '色']],
      ['It was the best of times, it was the', ' worst of times', ['worst', 'best', 'age']],
      ['Call me', ' Ishmael', ['Ishmael', 'maybe', 'later']],
    ];
    H['s-autocomplete'] = {
      enter(slide) {
        const f = document.getElementById('ac-field'), chat = document.getElementById('ph-chat'), sg = [...document.querySelectorAll('#ph-sugg span')];
        const typed = f.querySelector('.ac-typed'), ghost = f.querySelector('.ac-ghost');
        const TYPE = .07, SHOW = .5, HOLD = 1.4, ACCEPT = .6, GAP = .7;
        const dur = ([p]) => p.length * TYPE + SHOW + HOLD + ACCEPT + GAP;
        const total = EX.reduce((a, e) => a + dur(e), 0);
        let chatKey = '';
        loop(slide, t => {
          let u = t % total, k = 0;
          while (u >= dur(EX[k])) { u -= dur(EX[k]); k++; }
          const [p, gh, tips] = EX[k];
          const nTyped = Math.min(p.length, Math.floor(u / TYPE));
          const tTyped = p.length * TYPE, tGhost = tTyped + SHOW, tAcc = tGhost + HOLD, tEnd = tAcc + ACCEPT;
          const showGhost = u >= tGhost && u < tAcc, accepted = u >= tAcc && u < tEnd;
          typed.textContent = u >= tEnd ? '' : p.slice(0, nTyped) + (accepted ? gh : '');
          ghost.textContent = showGhost ? gh : '';
          sg.forEach((n, i) => { n.textContent = showGhost || accepted ? tips[i] : ''; n.classList.toggle('pick', i === 0 && (showGhost || accepted)); });
          // sent messages: all earlier examples in this cycle, plus the current one once it is sent
          const sent = EX.slice(0, k).map(e => e[0] + e[1]);
          if (u >= tEnd) sent.push(p + gh);
          const key = sent.join('\u0001');
          if (key !== chatKey) { chatKey = key; chat.innerHTML = sent.slice(-4).map(m => '<div class="ph-b"></div>').join(''); [...chat.children].forEach((n, i) => { n.textContent = sent.slice(-4)[i]; }); }
        });
      },
    };
  })();

  /* ───────────────────────── building BodyWords with an agent: the exchanges play out when the slide opens */
  H['s-ag-intro'] = {
    enter() {
      const svg = document.getElementById('ag-svg');
      svg.classList.remove('go'); void svg.getBoundingClientRect(); svg.classList.add('go');
    },
  };

  /* ───────────────────────── sense trajectory (schematic, 池 ↔ 峯) */
  (function () {
    let built = false, P = {};
    // one unit = 556 px; |δ1| = 0.575, back component −0.166, sideways 0.565 (this couplet)
    const U = 556, G = [70, 440], S1 = [70 + .575 * U, 440], S2 = [70 + (.575 - .166) * U, 440 - .565 * U];
    const PART = [S1[0], 440 - .70 * U];
    function arrowhead(svg, from, to, col) {
      const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
      return el('path', { d: `M${to[0]} ${to[1]} L${to[0] - 14 * Math.cos(a - .4)} ${to[1] - 14 * Math.sin(a - .4)} L${to[0] - 14 * Math.cos(a + .4)} ${to[1] - 14 * Math.sin(a + .4)} z`, fill: col }, svg);
    }
    function words(parent, x, y, ws, col, hi) {
      ws.forEach((w, i) => el('text', { x: x + i * 28, y, 'font-size': 22, fill: (hi || []).includes(w) ? C.amber : col, 'font-family': 'Songti TC, Noto Serif TC, serif', text: w }, parent));
    }
    function build() {
      const svg = document.getElementById('traj');
      P.g = el('g', {}, svg);
      el('circle', { cx: G[0], cy: G[1], r: 8, fill: C.mute }, P.g);
      el('text', { x: G[0] - 8, y: G[1] + 32, 'font-size': 13, fill: C.mute, 'font-family': 'JetBrains Mono', text: '① GENERAL' }, P.g);

      P.s1 = el('g', {}, svg);
      el('line', { x1: G[0], y1: G[1], x2: S1[0] - 12, y2: S1[1], stroke: C.mute, 'stroke-width': 2.5 }, P.s1);
      arrowhead(P.s1, G, [S1[0] - 8, S1[1]], C.mute);
      el('circle', { cx: S1[0], cy: S1[1], r: 8, fill: C.blue }, P.s1);
      el('text', { x: S1[0] + 16, y: S1[1] + 5, 'font-size': 13, fill: C.blue, 'font-family': 'JetBrains Mono', text: '② OWN LINE' }, P.s1);

      P.s2 = el('g', {}, svg);
      el('line', { x1: PART[0], y1: S1[1], x2: PART[0], y2: PART[1], stroke: C.amber, 'stroke-width': 1.5, 'stroke-dasharray': '6 6' }, P.s2);
      el('text', { x: PART[0], y: PART[1], 'font-size': 24, fill: C.amber, 'text-anchor': 'middle', 'dominant-baseline': 'middle', text: '★' }, P.s2);
      el('text', { x: PART[0] + 22, y: PART[1] - 14, 'font-size': 13, fill: C.amber, text: '峯, read in its own line' }, P.s2);

      P.dec = el('g', {}, svg);
      [[-1, 0], [-.55, -.83], [0, -1], [.6, -.8]].forEach(([dx, dy]) => {
        el('line', { x1: S1[0] + dx * 14, y1: S1[1] + dy * 14, x2: S1[0] + dx * 120, y2: S1[1] + dy * 120, stroke: C.coral, 'stroke-width': 2, 'stroke-dasharray': '3 7', opacity: .8 }, P.dec);
        el('text', { x: S1[0] + dx * 138, y: S1[1] + dy * 138 + 6, 'text-anchor': 'middle', 'font-size': 18, fill: C.coral, text: '?' }, P.dec);
      });
      el('text', { x: S1[0] + 24, y: S1[1] - 150, 'font-size': 13, fill: C.coral, 'font-family': 'JetBrains Mono', text: '③ WITH LINE 2' }, P.dec);
      el('text', { x: 0, y: 548, 'font-size': 11, fill: C.faint, 'font-family': 'JetBrains Mono', text: 'SCHEMATIC 2-D VIEW · GUJIBERT, LAST LAYER' }, P.dec);
      built = true;
    }
    H['s-traj'] = {
      render(step) {
        if (!built) build();
        show(P.g, step >= 1); show(P.s1, step >= 2); show(P.s2, step >= 3); show(P.dec, step >= 3);
      },
    };
  })();

  /* ───────────────────────── prediction: a genealogy in four lanes (piecewise time scale) */
  (function () {
    const X0 = 180, W = 840;
    const BP = [[1860, 0], [1910, .04], [1940, .14], [1960, .40], [1995, .52], [2030, 1]];
    const tx = yr => {
      for (let i = 1; i < BP.length; i++) if (yr <= BP[i][0]) {
        const [a, fa] = BP[i - 1], [b, fb] = BP[i];
        return X0 + (fa + (yr - a) / (b - a) * (fb - fa)) * W;
      }
      return X0 + W;
    };
    const lanes = [
      ['ENGINEERING', 'war, information', C.coral],
      ['MIND', 'predictive brains', C.green],
      ['LANGUAGE MODELS', 'machines that write', C.blue],
      ['LITERARY THEORY', 'readers as predictors', C.amber],
    ];
    const LY = [44, 138, 232, 326];
    // [year, lane, label, tier, anchor]; tier 1 above, 0 below, 3 higher above, 2 lower below
    const ev = [
      [1942, 0, 'Wiener: anti-aircraft predictor', 1, 'end'],
      [1948, 0, 'Cybernetics · A Mathematical Theory of Communication', 0, 'start'],
      [1951, 0, 'Shannon: Printed English', 1, 'start'],
      [1867, 1, 'Helmholtz: unconscious inference', 1, 'start'],
      [1980, 1, 'Kutas & Hillyard: N400', 1, 'start'],
      [1999, 1, 'Rao & Ballard: predictive coding', 3, 'start'],
      [2001, 1, 'Hale, Levy: surprisal theory', 0, 'start'],
      [2010, 1, 'Friston: free energy', 2, 'end'],
      [2013, 1, 'Clark: “Whatever next?”', 2, 'start'],
      [1913, 2, 'Markov: Eugene Onegin', 1, 'start'],
      [1957, 2, 'Harris, Firth: distributional hypothesis', 1, 'start'],
      [1990, 2, 'Elman: simple recurrent net', 0, 'start'],
      [2013, 2, 'word2vec', 3, 'end'],
      [2017, 2, 'Transformer', 1, 'end'],
      [2018, 2, 'BERT', 3, 'start'],
      [2020, 2, 'Holtzman: human text ≠ most probable', 2, 'end'],
      [2022, 2, 'brains ≈ models', 1, 'start'],
      [2026, 2, 'homogenization', 0, 'start'],
      [1917, 3, 'Shklovsky: defamiliarization', 1, 'start'],
      [1956, 3, 'Meyer: musical expectation', 0, 'start'],
      [1967, 3, 'Jauss: horizon of expectations', 3, 'start'],
      [1978, 3, 'Iser: wandering viewpoint', 1, 'start'],
      [2018, 3, 'Tobin: well-made surprise', 0, 'end'],
      [2020, 3, 'Kukkonen: probability designs', 1, 'start'],
    ];
    let built = false, laneG = [];
    function build() {
      const svg = document.getElementById('genealogy');
      const AY = 384;
      el('line', { x1: X0, x2: X0 + W, y1: AY, y2: AY, stroke: C.faint }, svg);
      [1920, 1940, 1950, 1960, 1980, 2000, 2010, 2020].forEach(yr => {
        el('line', { x1: tx(yr), x2: tx(yr), y1: AY - 4, y2: AY + 4, stroke: C.faint }, svg);
        el('text', { x: tx(yr), y: AY + 20, 'text-anchor': 'middle', 'font-size': 11, fill: C.mute, 'font-family': 'JetBrains Mono', text: yr }, svg);
      });
      el('text', { x: X0 + W, y: AY + 38, 'text-anchor': 'end', 'font-size': 10, fill: C.faint, 'font-family': 'JetBrains Mono', text: 'TIME AXIS COMPRESSED BEFORE 1940 AND 1960–1995' }, svg);
      lanes.forEach(([name, sub, col], i) => {
        const y = LY[i];
        el('text', { x: 0, y: y + 1, 'font-size': 11.5, fill: col, 'font-family': 'JetBrains Mono', 'letter-spacing': '.08em', text: name }, svg);
        el('text', { x: 0, y: y + 17, 'font-size': 12, fill: C.mute, text: sub }, svg);
        const G = el('g', {}, svg);
        el('line', { x1: X0, x2: X0 + W, y1: y, y2: y, stroke: col, 'stroke-width': 1, opacity: .35 }, G);
        ev.filter(e => e[1] === i).forEach(([yr, , label, up, anchor]) => {
          const x = tx(yr);
          el('circle', { cx: x, cy: y, r: 5.5, fill: col }, G);
          const ly = up === 1 ? y - 13 : up === 3 ? y - 32 : up === 2 ? y + 41 : y + 23;
          const dx = anchor === 'end' ? -4 : 4;
          const t = el('text', { x: x + dx, y: ly, 'text-anchor': anchor, 'font-size': 13, fill: C.ink }, G);
          const ys = document.createElementNS(NS, 'tspan');
          ys.setAttribute('font-family', 'JetBrains Mono'); ys.setAttribute('fill', col); ys.setAttribute('font-size', 11);
          ys.textContent = yr + ' ';
          t.appendChild(ys);
          t.appendChild(document.createTextNode(label));
        });
        laneG.push(G);
      });
      built = true;
    }
    H['s-genealogy'] = {
      render(step) {
        if (!built) build();
        laneG.forEach((G, i) => show(G, step >= i + 1));
      },
    };
  })();

  /* ───────────────────────── next-token prediction (illustrative probabilities) */
  (function () {
    const words = ['book', 'story', 'movie', 'game', 'shop'];
    const P0 = { book: .24, story: .21, movie: .21, game: .2, shop: .14 };
    const P1 = { book: .8, story: .12, movie: .04, game: .03, shop: .01 };
    const host = document.getElementById('nt-bars');
    const rows = words.map(w => {
      const r = document.createElement('div');
      r.className = 'nt-bar' + (w === 'book' ? ' target' : '');
      r.innerHTML = `<span class="w">${w}</span><span class="track"><span class="fill" style="display:block;width:0"></span></span><span class="p"></span>`;
      host.appendChild(r);
      return r;
    });
    H['s-next'] = {
      render(step) {
        const P = step >= 2 ? P1 : P0;
        rows.forEach((r, i) => {
          const p = P[words[i]];
          r.querySelector('.fill').style.width = (step >= 1 ? p * 100 : 0) + '%';
          r.querySelector('.p').textContent = p.toFixed(2);
        });
        document.getElementById('nt-ppl').textContent = (1 / P.book).toFixed(step >= 2 ? 2 : 1);
      },
    };
  })();

  /* ───────────────────────── Mao vs. novels: average perplexity on 16-grams (paper, Figure 1) */
  (function () {
    const mao = [13.98, 9.72, 8.23, 7.32, 6.79, 6.59];
    const nov = [56.27, 59.66, 62.45, 64.66, 68.08, 70.07];
    const labels = ['pre-trained', '1', '2', '3', '4', '5'];
    let built = false, groups = [];
    const X0 = 50, Y0 = 320, H0 = 270, MAX = 75, GW = 84;
    const y = v => Y0 - v / MAX * H0;
    function build() {
      const svg = document.getElementById('ppl-chart');
      [0, 20, 40, 60].forEach(v => {
        el('line', { x1: X0, x2: X0 + GW * 6, y1: y(v), y2: y(v), stroke: C.line }, svg);
        el('text', { x: X0 - 10, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: C.mute, 'font-family': 'JetBrains Mono', text: v }, svg);
      });
      el('text', { x: X0, y: 20, 'font-size': 12, fill: C.mute, 'font-family': 'JetBrains Mono', text: 'AVERAGE PERPLEXITY ON 16-GRAMS' }, svg);
      el('text', { x: X0 + GW * 3, y: Y0 + 50, 'text-anchor': 'middle', 'font-size': 12, fill: C.mute, 'font-family': 'JetBrains Mono', text: 'FINE-TUNING EPOCH ON MAO →' }, svg);
      [[C.coral, 'Mao corpus', 340], [C.blue, 'Novels', 460]].forEach(([c, t, x]) => {
        el('rect', { x, y: 8, width: 12, height: 12, rx: 2, fill: c }, svg);
        el('text', { x: x + 18, y: 19, 'font-size': 13, fill: C.ink2, text: t }, svg);
      });
      mao.forEach((m, i) => {
        const G = el('g', {}, svg), gx = X0 + i * GW + 14;
        el('rect', { x: gx, y: y(m), width: 26, height: Y0 - y(m), rx: 3, fill: C.coral }, G);
        el('rect', { x: gx + 30, y: y(nov[i]), width: 26, height: Y0 - y(nov[i]), rx: 3, fill: C.blue }, G);
        el('text', { x: gx + 13, y: y(m) - 6, 'text-anchor': 'middle', 'font-size': 11, fill: C.coral, 'font-family': 'JetBrains Mono', text: m.toFixed(1) }, G);
        el('text', { x: gx + 43, y: y(nov[i]) - 6, 'text-anchor': 'middle', 'font-size': 11, fill: C.blue, 'font-family': 'JetBrains Mono', text: nov[i].toFixed(1) }, G);
        el('text', { x: gx + 28, y: Y0 + 22, 'text-anchor': 'middle', 'font-size': 12, fill: C.mute, text: labels[i] }, G);
        groups.push(G);
      });
      built = true;
    }
    H['s-pipeline'] = { render() {} };   // the perplexity chart now lives on the next slide's figures
  })();
})();

(function () {
  /* ───────────────────────── body words (data: window.BODY): stable core, shifting layer, one novel across its length */
  const H = window.HOOKS, B = window.BODY, NS = 'http://www.w3.org/2000/svg';
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = { ink2: css('--ink2'), mute: css('--mute'), faint: css('--faint'), line: css('--line'), blue: css('--blue'), amber: css('--amber'), coral: css('--coral'), green: css('--green'), violet: css('--violet') };
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const k in a) k === 'text' ? e.textContent = a[k] : e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const show = (n, on) => { n.style.transition = 'opacity .5s'; n.style.opacity = on ? 1 : 0; };
  const T = (p, x, y, t, o) => el('text', Object.assign({ x, y, text: t, 'font-size': 13, fill: C.mute }, o || {}), p);

  let zh = false;
  const rn = r => zh ? B.zh[r] : B.en[r];
  const TR = {
    core7: ['hands, head, whole body, heart, eyes, face, mouth', '手 头 全身 心 眼 脸 口'],
    brain: ['brain', '脑'], organs: ['inner organs', '脏腑'],
    brainhead: ['BRAIN (脑), MENTIONS PER 10,000 WORDS', '脑 · 每万词出现次数'],
    mindhead: ['WHERE THOUGHT LIVES, PER 10,000 WORDS', '思想所在 · 每万词'],
    inheart: ['心里, 心中', '心里 心中'], inhead: ['脑子里, 脑海中', '脑子里 脑海中'],
  };
  const P = ['Ming–Qing', 'Late Qing', 'Republican', 'Socialist', 'New Era'], PZ = B.periods;
  const pn = i => zh ? PZ[i] : P[i];
  const active = () => document.querySelector('.slide.active');

  function retext(root) { root.querySelectorAll('.tr').forEach(s => { s.textContent = TR[s.dataset.k][zh ? 1 : 0]; }); }
  const state = {};   // per-slide last step
  function redraw() { const s = active(); if (s && H[s.id] && H[s.id].redo) H[s.id].redo(state[s.id] || 0); }
  function setLang(v) { zh = v; document.body.dataset.zh = v ? '1' : '0'; document.querySelectorAll('.slide[id^="s-body"]').forEach(retext); redraw(); }
  document.querySelectorAll('.langbtn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); setLang(!zh); b.blur(); }));
  addEventListener('keydown', e => { if ((e.key === 'l' || e.key === 'L') && active() && /^s-body/.test(active().id)) setLang(!zh); });
  document.querySelectorAll('.slide[id^="s-body"]').forEach(retext);

  /* ── 1. stacked area of shares */
  const cols = { hands: '#2f6fe0', head: '#6c9cf0', whole: '#16925a', heart: '#5bbd8c', eyes: '#7650d6', face: '#a48be3', mouth: '#c98200' };
  const minor = B.order.filter(r => !B.core.includes(r) && r !== 'organs' && r !== 'brain');
  const stack = [...B.core, ...minor, 'organs', 'brain'];
  const gcol = (r, step) => cols[r] || (step >= 2 && r === 'brain' ? C.coral : step >= 2 && r === 'organs' ? C.amber : '#d8d5cd');
  function drawCore(step) {
    const svg = document.getElementById('bcore'); svg.innerHTML = '';
    const W = 520, H2 = 440, X = i => i * W / 4, Y = v => H2 - v / 100 * H2;
    const G = el('g', { transform: 'translate(46,24)' }, svg);
    [0, 25, 50, 75, 100].forEach(t => { T(G, -8, Y(t) + 4, t + '%', { 'text-anchor': 'end', 'font-size': 12 }); });
    let base = [0, 0, 0, 0, 0];
    stack.forEach(r => {
      const v = B.shares[r], top = base.map((b, i) => b + v[i]);
      const d = 'M' + top.map((t, i) => X(i) + ',' + Y(t)).join('L') + 'L' + base.map((b, i) => X(4 - i) + ',' + Y(base[4 - i])).join('L') + 'Z';
      const isCore = B.core.includes(r);
      const p = el('path', { d, fill: gcol(r, step), stroke: '#fff', 'stroke-width': isCore ? 1.5 : .6, opacity: isCore || step >= 1 ? 1 : 1 }, G);
      if (isCore) { const m = (base[4] + top[4]) / 2; T(G, W + 10, Y(m) + 4, rn(r), { fill: C.ink2, 'font-size': 13, 'font-weight': 500 }); }
      if (step >= 2 && (r === 'brain' || r === 'organs')) { const m = (base[4] + top[4]) / 2; T(G, W + 10, Y(m) + (r === 'brain' ? -1 : 6), rn(r), { fill: r === 'brain' ? C.coral : C.amber, 'font-size': 13, 'font-weight': 600 }); }
      base = top;
    });
    const cb = B.core.reduce((a, r) => a + B.shares[r][4], 0);
    T(G, W + 10, Y(cb + 6) + 4, zh ? '15 个次要部位' : '15 minor regions', { fill: C.mute, 'font-size': 12, 'font-style': 'italic' });
    P.forEach((p, i) => T(G, X(i), H2 + 22, pn(i), { 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle' }));
    el('line', { x1: X(1.5), x2: X(1.5), y1: 0, y2: H2, stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, G);
    T(G, X(1.5), -8, '1911', { 'text-anchor': 'middle', 'font-size': 11 });
    if (step >= 1) {
      const y0 = Y(cb), yb = Y(0);
      el('path', { d: `M${W + 96},${yb}h6v${y0 - yb}h-6`, fill: 'none', stroke: C.blue, 'stroke-width': 2 }, G);
      T(G, W + 108, (y0 + yb) / 2 - 2, '79–83%', { fill: C.blue, 'font-size': 15, 'font-weight': 700 });
      T(G, W + 108, (y0 + yb) / 2 + 16, zh ? '七个核心部位' : 'core seven', { fill: C.blue, 'font-size': 12 });
    }
  }
  H['s-body-core'] = { render(step) { state['s-body-core'] = step; drawCore(step); }, redo(step) { drawCore(step); } };

  /* ── 2. brain bars + where thought lives */
  function drawShift(step) {
    let svg = document.getElementById('bbrain'); svg.innerHTML = '';
    const W = 500, bw = 62, Hb = 200, Yb = v => Hb - v / 2.4 * Hb;
    let G = el('g', { transform: 'translate(40,10)' }, svg);
    [0, 1, 2].forEach(t => { el('line', { x1: 0, x2: W, y1: Yb(t), y2: Yb(t), stroke: C.line }, G); T(G, -8, Yb(t) + 4, t, { 'text-anchor': 'end', 'font-size': 12 }); });
    B.rates.brain.forEach((v, i) => {
      const x = 20 + i * 96, gg = el('g', {}, G);
      el('rect', { x, y: Yb(v), width: bw, height: Hb - Yb(v), fill: i < 2 ? C.faint : C.coral, rx: 3 }, gg);
      T(gg, x + bw / 2, Yb(v) - 6, v.toFixed(1), { 'text-anchor': 'middle', fill: C.ink2 });
      T(gg, x + bw / 2, Hb + 20, pn(i), { 'text-anchor': 'middle' });
      gg.style.opacity = i < 2 || step >= 1 ? 1 : 0;
    });
    svg = document.getElementById('bmind'); svg.innerHTML = '';
    const Hm = 140, X = i => 20 + i * 96 + 31, Ym = v => Hm - v / 13 * Hm;
    G = el('g', { transform: 'translate(40,10)' }, svg);
    [0, 5, 10].forEach(t => { el('line', { x1: 0, x2: W, y1: Ym(t), y2: Ym(t), stroke: C.line }, G); T(G, -8, Ym(t) + 4, t, { 'text-anchor': 'end', 'font-size': 12 }); });
    P.forEach((p, i) => T(G, X(i), Hm + 20, pn(i), { 'text-anchor': 'middle' }));
    [['heart', C.amber, zh ? '心里 / 心中' : 'in the heart'], ['head', C.coral, zh ? '脑子里 / 脑海中' : 'in the head']].forEach(([k, c, lb]) => {
      const gg = el('g', {}, G), v = B.cons[k];
      el('polyline', { points: v.map((y, i) => X(i) + ',' + Ym(y)).join(' '), fill: 'none', stroke: c, 'stroke-width': 3 }, gg);
      v.forEach((y, i) => el('circle', { cx: X(i), cy: Ym(y), r: 4, fill: c }, gg));
      T(gg, X(4) + 14, Ym(v[4]) + 4, lb, { fill: c, 'font-weight': 600 });
      gg.style.opacity = step >= 2 ? 1 : 0;
    });
  }
  H['s-body-shift'] = { render(step) { state['s-body-shift'] = step; drawShift(step); }, redo(step) { drawShift(step); } };

  /* ── 3. region × position matrix for one novel (as in the body-map viewer) */
  const NOV = ['jinpingmei', 'hongloumeng', 'musilin'], YR = ['Ming', 'Qing', '1991'], TT = ['Jin Ping Mei (The Plum in the Golden Vase)', 'Dream of the Red Chamber', 'The Muslim Funeral'], AUT = [['Lanling Xiaoxiaosheng', '兰陵笑笑生'], ['Cao Xueqin', '曹雪芹'], ['Huo Da', '霍达']];
  const ramp = (t, hue) => { t = Math.max(0, Math.min(1, t)); const a = hue === 'c' ? [253, 236, 232] : [238, 243, 253], b = hue === 'c' ? [200, 40, 20] : [28, 70, 190]; return 'rgb(' + a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',') + ')'; };
})();

(function () {
  /* ───────────────────────── body silhouette + distinctive words per period */
  const H = window.HOOKS, B = window.BODY;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const INK = css('--ink2'), FAINT = css('--faint');
  const zhOn = () => document.body.dataset.zh === '1';
  // silhouette geometry (units 240 × 470), regions: [name, x, y, sigma] (front view), after the Body Map viewer
  function taper(x1, y1, r1, x2, y2, r2) {
    const p = new Path2D(), dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    p.moveTo(x1 + nx * r1, y1 + ny * r1); p.lineTo(x2 + nx * r2, y2 + ny * r2); p.lineTo(x2 - nx * r2, y2 - ny * r2); p.lineTo(x1 - nx * r1, y1 - ny * r1); p.closePath();
    const c1 = new Path2D(); c1.arc(x1, y1, r1, 0, 7); const c2 = new Path2D(); c2.arc(x2, y2, r2, 0, 7);
    return [p, c1, c2];
  }
  const ell = (cx, cy, rx, ry) => { const p = new Path2D(); p.ellipse(cx, cy, rx, ry, 0, 0, 7); return [p]; };
  const SIL = (() => {
    const P = [...ell(100, 38, 22, 28), ...taper(100, 60, 10, 100, 92, 12),
      new Path2D('M64 92 Q100 84 136 92 Q144 98 140 112 Q136 152 126 190 Q134 214 134 240 L100 254 L66 240 Q66 214 74 190 Q64 152 60 112 Q56 98 64 92 Z')];
    for (const m of [x => x, x => 200 - x]) {
      P.push(...taper(m(66), 100, 11, m(53), 180, 8.5), ...taper(m(53), 180, 8.5, m(45), 250, 6.5), ...ell(m(43), 266, 8, 13),
        ...taper(m(84), 238, 18, m(84), 330, 11.5), ...taper(m(84), 330, 11.5, m(86), 408, 7.5), ...ell(m(86), 420, 10, 8));
    }
    return P;
  })();
  const A = [['head', 100, 12, 13], ['brain', 100, 25, 8], ['face', 100, 44, 15], ['eyes', 91, 36, 5.5], ['eyes', 109, 36, 5.5], ['nose', 100, 46, 4.5], ['mouth', 100, 56, 5.5],
    ['ears', 77, 40, 5], ['ears', 123, 40, 5], ['neck', 100, 76, 8], ['shoulders', 66, 98, 10], ['shoulders', 134, 98, 10],
    ['arms', 58, 145, 9], ['arms', 142, 145, 9], ['arms', 49, 215, 8], ['arms', 151, 215, 8], ['hands', 43, 266, 10], ['hands', 157, 266, 10],
    ['chest', 86, 122, 12], ['chest', 114, 122, 12], ['heart', 109, 130, 8.5], ['organs', 96, 168, 15], ['waist', 74, 196, 9], ['waist', 126, 196, 9],
    ['belly', 100, 202, 13], ['genitals', 100, 244, 9], ['legs', 84, 290, 14], ['legs', 116, 290, 14], ['legs', 85, 370, 10], ['legs', 115, 370, 10], ['feet', 86, 420, 9], ['feet', 114, 420, 9]];
  const RAMP = ['#f6ddd1', '#eca98f', '#d86c50', '#b3372a', '#761b17'].map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
  const ramp = t => { t = Math.max(0, Math.min(1, t)) * 4; const i = Math.min(3, Math.floor(t)), f = t - i; return RAMP[i].map((c, k) => c + (RAMP[i + 1][k] - c) * f); };
  const RES = 2, PW = 240, PH = 470;
  function paint(cv, rates, cap) {
    const S = cv.width / PW, g = cv.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    const hc = document.createElement('canvas'); hc.width = PW * RES; hc.height = PH * RES;
    const mc = document.createElement('canvas'); mc.width = hc.width; mc.height = hc.height;
    const mg = mc.getContext('2d'); mg.setTransform(RES, 0, 0, RES, 20 * RES, 10 * RES); SIL.forEach(p => mg.fill(p));
    if (rates) {
      const bw = hc.width, bh = hc.height, field = new Float32Array(bw * bh);
      A.forEach(([r, x, y, sg]) => {
        const t = Math.min(1, (rates[r] || 0) / cap); if (t <= 0) return;
        const cx = (20 + x) * RES, cy = (10 + y) * RES, sp = sg * 1.15 * RES, R = sp * 2.2;
        for (let py = Math.max(0, cy - R | 0); py < Math.min(bh, cy + R); py++) for (let px = Math.max(0, cx - R | 0); px < Math.min(bw, cx + R); px++) {
          const d2 = ((px - cx) ** 2 + (py - cy) ** 2) / (sp * sp), v = t * Math.exp(-0.6 * d2 * d2), i = py * bw + px; if (v > field[i]) field[i] = v;
        }
      });
      const hg = hc.getContext('2d'), img = hg.createImageData(bw, bh);
      for (let i = 0; i < field.length; i++) { const v = field[i]; if (v < .01) continue; const c = ramp(v), o = i * 4; img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = Math.round(255 * Math.min(1, .45 + v) * Math.min(1, v * 12)); }
      hg.putImageData(img, 0, 0); hg.globalCompositeOperation = 'destination-in'; hg.drawImage(mc, 0, 0);
    }
    g.setTransform(S, 0, 0, S, 20 * S, 10 * S); g.lineJoin = 'round';
    if (rates) { const tw = Math.min(1, (rates.whole || 0) / cap); g.strokeStyle = 'rgb(' + ramp(tw).map(Math.round) + ')'; g.lineWidth = 2 + 7 * tw; g.globalAlpha = .9; SIL.forEach(p => g.stroke(p)); g.globalAlpha = 1; }
    g.fillStyle = '#f6f5f1'; SIL.forEach(p => g.fill(p));
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(hc, 0, 0, cv.width, cv.height);
    g.setTransform(S, 0, 0, S, 20 * S, 10 * S); g.strokeStyle = INK; g.lineWidth = 1.6; SIL.forEach(p => g.stroke(p));
  }
  const rate = k => { const m = B.novels[k].m, o = {}; Object.keys(m).forEach(r => { o[r] = m[r].reduce((a, b) => a + b, 0) / m[r].length; }); return o; };
  const NOV = ['jinpingmei', 'hongloumeng', 'musilin'], YR = ['Ming', 'Qing', '1991'], EN = ['Jin Ping Mei', 'Dream of the Red Chamber', 'The Muslim Funeral'], SUB = ['The Plum in the Golden Vase', '', ''];
  const AU = [['Lanling Xiaoxiaosheng', '兰陵笑笑生'], ['Cao Xueqin', '曹雪芹'], ['Huo Da', '霍达']];
  let built = false, plates = [];
  function build() {
    const host = document.getElementById('bsil'); host.innerHTML = '';
    NOV.forEach((k, i) => {
      const w = document.createElement('div'); w.style.cssText = 'width:236px;text-align:center';
      const box = document.createElement('div'); box.style.cssText = 'position:relative;width:236px;height:462px';
      const mk = () => { const c = document.createElement('canvas'); c.width = 472; c.height = 924; c.style.cssText = 'position:absolute;left:0;top:0;width:236px;height:462px'; box.appendChild(c); return c; };
      const base = mk(), heat = mk(); paint(base, null, 1); paint(heat, rate(k), 28);
      heat.style.opacity = 0; heat.style.transition = 'opacity .7s';
      const cap = document.createElement('div'); cap.style.cssText = 'margin:-12px -16px 0;font-size:15px;line-height:1.3;color:var(--ink2);height:64px';
      w.appendChild(box); w.appendChild(cap); host.appendChild(w); plates.push({ heat, cap, i });
    });
    built = true;
  }
  let stepS = 0;
  function labels() { plates.forEach(p => { const n = B.novels[NOV[p.i]]; p.cap.innerHTML = (zhOn() ? '<span class="zh" style="font-size:20px">' + n.zh + '</span>' : EN[p.i] + ' <span class="zh" style="font-size:14px;color:var(--mute)">' + n.zh + '</span>' + (SUB[p.i] ? '<br><i style="color:var(--mute);font-size:13px">' + SUB[p.i] + '</i>' : '')) + '<br><span style="color:var(--mute)">' + AU[p.i][zhOn() ? 1 : 0] + ' · ' + YR[p.i] + '</span>'; }); }
  H['s-body-sil'] = {
    render(step) { if (!built) build(); stepS = step; plates.forEach(p => { p.heat.style.opacity = step >= p.i + 1 ? 1 : 0; }); labels(); },
    redo() { labels(); },
  };

  /* one silhouette per period (rates per 10,000 words, same colour scale as the novels) */
  const PEN = ['Ming–Qing', 'Late Qing', 'Republican', 'Socialist', 'New Era'];
  let pBuilt = false, pPlates = [];
  function buildP() {
    const host = document.getElementById('psil'); host.innerHTML = '';
    B.periods.forEach((zh, i) => {
      const w = document.createElement('div'); w.style.cssText = 'width:150px;text-align:center';
      const cv = document.createElement('canvas'); cv.width = 360; cv.height = 705; cv.style.cssText = 'width:150px;height:294px;display:block';
      const o = {}; Object.keys(B.rates).forEach(r => { o[r] = B.rates[r][i]; }); paint(cv, o, Math.max(...Object.values(o)));
      const cap = document.createElement('div'); cap.style.cssText = 'font-size:16px;color:var(--ink2);margin-top:-6px';
      w.appendChild(cv); w.appendChild(cap); host.appendChild(w); pPlates.push({ w, cap, i, zh });
    });
    pBuilt = true;
  }
  function labelsP() { pPlates.forEach(p => { p.cap.innerHTML = zhOn() ? '<span class="zh" style="font-size:20px">' + p.zh + '</span>' : PEN[p.i] + ' <span class="zh" style="font-size:14px;color:var(--mute)">' + p.zh + '</span>'; }); }
  /* play through one novel: the silhouette is recoloured for each ~5,000-word window */
  (function () {
    const NSV = 'http://www.w3.org/2000/svg', cs = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const C = { faint: cs('--faint'), line: cs('--line'), coral: cs('--coral'), mute: cs('--mute') };
    const el = (tag, a, p) => { const e = document.createElementNS(NSV, tag); for (const k in a) k === 'text' ? e.textContent = a[k] : e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
    const cv = () => document.getElementById('bp-cv');
    let nov = 'hongloumeng', bin = 0, timer = null, ready = false, cap = 30;
    const regions = () => Object.keys(B.novels[nov].m);
    const rates = i => { const o = {}, m = B.novels[nov].m; regions().forEach(r => { o[r] = m[r][i]; }); return o; };
    const words = n => Math.round(n / 100) * 100;
    function setCap() {
      const v = []; const m = B.novels[nov].m; Object.keys(m).forEach(r => { if (r !== 'whole') v.push(...m[r]); });
      v.sort((a, b) => a - b); cap = v[Math.floor(v.length * .985)];
    }
    let lastZh = null;
    const LW = 108, PW = 640, RH = 13.4, TOP = 4, CW = PW / 80;
    const rowY = ri => TOP + ri * RH + (ri >= 7 ? 9 : 0);
    function spark() {
      const svg = document.getElementById('bp-line'); svg.innerHTML = ''; lastZh = zhOn();
      const m = B.novels[nov].m;
      B.order.forEach((r, ri) => {
        const y = rowY(ri), core = ri < 7;
        el('text', { x: LW - 8, y: y + RH - 4, 'text-anchor': 'end', 'font-size': 11.5, fill: core ? '#3d3c38' : C.mute, 'font-weight': core ? 500 : 400, text: zhOn() ? B.zh[r] : B.en[r] }, svg);
        m[r].forEach((v, i) => { const c = ramp(v / cap); el('rect', { x: LW + i * CW, y, width: CW + .4, height: RH - 1.4, fill: v > 0 ? 'rgb(' + c.map(Math.round) + ')' : '#f1efea' }, svg); });
      });
      const H = rowY(B.order.length - 1) + RH;
      el('path', { d: 'M' + (LW + PW + 8) + ',' + TOP + 'h5v' + (7 * RH - 2) + 'h-5', fill: 'none', stroke: cs('--blue'), 'stroke-width': 1.5 }, svg);
      el('text', { x: LW + 8, y: H + 14, 'font-size': 11, fill: C.mute, text: zhOn() ? '开头' : 'start of novel' }, svg);
      el('text', { x: LW + PW, y: H + 14, 'text-anchor': 'end', 'font-size': 11, fill: C.mute, text: zhOn() ? '结尾' : 'end' }, svg);
      el('rect', { id: 'bp-ph', x: 0, y: TOP - 2, width: CW, height: H - TOP + 4, fill: 'rgba(20,20,19,.06)', stroke: '#141413', 'stroke-width': 1.8 }, svg);
      svg.onclick = e => { const r = svg.getBoundingClientRect(); bin = Math.max(0, Math.min(79, Math.floor(((e.clientX - r.left) / r.width * 750 - LW) / CW))); draw(); };
    }
    function draw() {
      if (!ready) return;
      const n = B.novels[nov], m = n.m, step = n.n / 80;
      paint(cv(), rates(bin), cap);
      document.getElementById('bp-lab').textContent = (zhOn() ? '词 ' : 'words ') + words(bin * step).toLocaleString('en') + ' – ' + words((bin + 1) * step).toLocaleString('en');
      const top = regions().filter(r => r !== 'whole' && m[r][bin] > 0).sort((a, b) => m[b][bin] - m[a][bin]).slice(0, 4).map(r => zhOn() ? B.zh[r] : B.en[r]);
      document.getElementById('bp-top').innerHTML = (zhOn() ? '最多：' : 'Most: ') + (top.length ? top.join(' · ') : '–');
      if (lastZh !== zhOn()) spark();
      document.getElementById('bp-ph').setAttribute('x', LW + bin * CW);
      document.getElementById('bp-play').textContent = timer ? (zhOn() ? '❚❚ 暂停' : '❚❚ Pause') : (zhOn() ? '▶ 播放' : '▶ Play');
      document.querySelectorAll('.bp-pick button').forEach(b => b.classList.toggle('on', b.dataset.k === nov));
    }
    const stop = () => { clearInterval(timer); timer = null; };
    function play() {
      if (timer) { stop(); draw(); return; }
      if (bin >= 79) bin = 0;
      timer = setInterval(() => { if (bin >= 79) { stop(); draw(); return; } bin++; draw(); }, 380); draw();
    }
    function init() {
      ready = true; cv().width = 520; cv().height = 1020;
      document.getElementById('bp-play').onclick = e => { e.stopPropagation(); play(); e.target.blur(); };
      document.querySelectorAll('.bp-pick button').forEach(b => { b.onclick = e => { e.stopPropagation(); stop(); nov = b.dataset.k; bin = 0; setCap(); spark(); draw(); b.blur(); }; });
      setCap(); spark(); draw();
    }
    H['s-body-play'] = {
      enter() { if (!ready) init(); },
      render() { if (!ready) init(); draw(); },
      redo() { draw(); },
      leave() { stop(); },
      key(e) { if (e.key === 'p' || e.key === 'P') { play(); return true; } return false; },
    };
  })();

  H['s-body-periods'] = {
    render(step) { if (!pBuilt) buildP(); pPlates.forEach(p => { p.w.style.transition = 'opacity .6s'; p.w.style.opacity = step >= p.i + 1 ? 1 : 0; }); labelsP(); },
    redo() { labelsP(); },
  };

})();

(function () {
  /* ───────────────────────── sequence versus hierarchy (after Uddén et al., via Kurzynski 2025, Fig. 1a) */
  const H = window.HOOKS, NS = 'http://www.w3.org/2000/svg';
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const coral = css('--coral'), node = '#27506f', link = '#b5c3cf';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) k === 'text' ? e.textContent = a[k] : e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  let built = false, P = {};
  const XS = [70, 185, 300, 415, 530], YB = 270, XX = (XS[0] + XS[3]) / 2, YX = 90, R = 26;
  function circ(g, x, y, t, fill) { el('circle', { cx: x, cy: y, r: R, fill: fill || node }, g); el('text', { x, y: y + 8, 'text-anchor': 'middle', 'font-size': 24, fill: '#fff', 'font-family': 'Instrument Serif', 'font-style': 'italic', text: t }, g); }
  function build() {
    const svg = document.getElementById('seqhier');
    P.seq = el('g', {}, svg); P.links = el('g', {}, svg); P.bold = el('g', {}, svg); P.nodes = el('g', {}, svg); P.x = el('g', {}, svg);
    for (let i = 0; i < 4; i++) el('line', { x1: XS[i], y1: YB, x2: XS[i + 1], y2: YB, stroke: node, 'stroke-width': 5 }, P.seq);
    XS.forEach(x => el('line', { x1: XX, y1: YX, x2: x, y2: YB, stroke: link, 'stroke-width': 3 }, P.links));
    [XS[0], XS[3]].forEach(x => el('line', { x1: XX, y1: YX, x2: x, y2: YB, stroke: coral, 'stroke-width': 7, 'stroke-linecap': 'round' }, P.bold));
    XS.forEach((x, i) => circ(P.nodes, x, YB, 'abcde'[i]));
    circ(P.x, XX, YX, 'x');
    P.hint = el('g', {}, svg);
    el('text', { x: (XS[0] + XS[3]) / 2, y: YB + 62, 'text-anchor': 'middle', 'font-size': 14, fill: node, 'font-family': 'JetBrains Mono', text: 'a–b–c–d: 3 steps' }, P.hint);
    P.hint2 = el('g', {}, svg);
    el('text', { x: XX + 78, y: YX - 4, 'font-size': 14, fill: coral, 'font-family': 'JetBrains Mono', text: 'a–x–d: 2 steps' }, P.hint2);
    built = true;
  }
  const show = (n, on) => { n.style.transition = 'opacity .5s'; n.style.opacity = on ? 1 : 0; };
  H['s-seqhier'] = {
    render(step) {
      if (!built) build();
      show(P.x, step >= 1); show(P.links, step >= 1); show(P.bold, step >= 2); show(P.hint2, step >= 2); show(P.hint, step >= 2);
    },
  };
})();

(function () {
  /* ───────────────────────── style as a cognitive signature: schematic perplexity arcs (ground vs figure) */
  const H = window.HOOKS, NS = 'http://www.w3.org/2000/svg';
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = { blue: css('--blue'), coral: css('--coral'), line: css('--line'), mute: css('--mute'), faint: css('--faint') };
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) k === 'text' ? e.textContent = a[k] : e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const N = 38, W = 340, Hh = 150;
  // values are heights 0..1 on a log-like scale
  const prop = Array.from({ length: N }, () => .03 + .05 * rnd());
  const noise = Array.from({ length: N }, () => .55 + .4 * rnd());
  const spikes = { 5: .55, 11: .8, 17: .45, 21: .95, 27: .6, 33: .7 };
  const lit = Array.from({ length: N }, (_, i) => (spikes[i] || .05 + .1 * rnd()) + (i > 0 && spikes[i - 1] ? .1 : 0));
  let built = false, P = [];
  function panel(id, vals, hi) {
    const svg = document.getElementById(id); svg.innerHTML = '';
    const X = i => 6 + i * (W - 12) / (N - 1), Y = v => Hh - v * (Hh - 12);
    // the familiar ground (band) and the surprise zone
    el('rect', { x: 0, y: Y(.2), width: W, height: Hh - Y(.2), fill: '#eaf1fd' }, svg);
    el('line', { x1: 0, x2: W, y1: Hh, y2: Hh, stroke: C.faint }, svg);
    el('text', { x: 4, y: Hh + 14, 'font-size': 11, fill: C.mute, 'font-family': 'var(--sans)', text: 'shaded: familiar ground · tokens → · perplexity ↑ (log)' }, svg);
    el('polyline', { points: vals.map((v, i) => X(i) + ',' + Y(v)).join(' '), fill: 'none', stroke: hi ? C.blue : C.mute, 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
    vals.forEach((v, i) => { if (v > .3) el('circle', { cx: X(i), cy: Y(v), r: 4, fill: C.coral }, svg); });
  }
  H['s-signature'] = {
    render() {
      if (!built) { panel('sig1', prop, false); panel('sig2', noise, false); panel('sig3', lit, true); built = true; }
      [1, 2, 3].forEach(k => { const s = document.getElementById('sig' + k); s.style.transition = 'opacity .5s'; s.style.opacity = H['s-signature'].step >= k ? 1 : 0; });
    },
    step: 0,
  };
  const orig = H['s-signature'].render;
  H['s-signature'].render = function (step) { H['s-signature'].step = step; orig(step); };
})();

(function () {
  /* ───────────────────────── scale matters: three units of analysis and their F1 (Kurzynski 2026, Table 1) */
  const H = window.HOOKS, NS = 'http://www.w3.org/2000/svg';
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = { blue: css('--blue'), green: css('--green'), amber: css('--amber'), mute: css('--mute'), line: css('--line'), ink2: css('--ink2') };
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) k === 'text' ? e.textContent = a[k] : e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const PAIRS = ['distant ↔ bright', 'fragrance ↔ greenery', 'invades ↔ meets', 'ancient ↔ ruined', 'road ↔ town'];
  H['s-scale'] = {
    render(step) {
      const sp = document.getElementById('sc-poem'), cp = document.getElementById('sc-cpl'), cap = document.getElementById('sc-cap');
      cp.querySelectorAll('.ch').forEach(c => {
        const k = +c.className.match(/p(\d)/)[1] + 1;            // pair number 1..5
        c.classList.toggle('now', step >= 1 && step <= 5 && k === step);
        c.classList.toggle('seen', (step >= 2 && step <= 5 && k < step) || step >= 6);
      });
      cp.classList.toggle('meso', step >= 6); sp.classList.toggle('macro', step >= 7);
      cap.textContent = step >= 1 && step <= 5 ? 'pair ' + step + ' of 5: ' + PAIRS[step - 1]
        : step === 6 ? 'Now the model reads both lines together.'
        : step >= 7 ? 'The target couplet, inside the whole poem.' : 'Is the third couplet parallel? It depends on what the model is allowed to see.';
    },
  };
})();

(function () {
  /* ───────────────────────── alignment by layer and couplet role (parallelism-transition results, penta) */
  const H = window.HOOKS, A = window.ALIGN.corpus, NS = 'http://www.w3.org/2000/svg';
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = { blue: css('--blue'), green: css('--green'), amber: css('--amber'), coral: css('--coral'), mute: css('--mute'), line: css('--line'), faint: css('--faint') };
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) k === 'text' ? e.textContent = a[k] : e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const cols = [C.green, C.blue, C.amber, C.coral], lab = ['Head 首聯', 'Jaw 頷聯', 'Neck 頸聯', 'Tail 尾聯'];
  let built = false, G = {};
  function build() {
    const svg = document.getElementById('alchart'); svg.innerHTML = '';
    const W = 500, H2 = 330, X = l => l * W / 12, Y = v => H2 - v / 0.5 * H2;
    const g = el('g', { transform: 'translate(50,10)' }, svg);
    [0, .1, .2, .3, .4, .5].forEach(t => { el('line', { x1: 0, x2: W, y1: Y(t), y2: Y(t), stroke: C.line }, g); el('text', { x: -8, y: Y(t) + 4, 'text-anchor': 'end', 'font-size': 12, fill: C.mute, text: t.toFixed(1) }, g); });
    for (let l = 0; l <= 12; l += 2) el('text', { x: X(l), y: H2 + 20, 'text-anchor': 'middle', 'font-size': 12, fill: C.mute, text: l }, g);
    el('text', { x: W / 2, y: H2 + 40, 'text-anchor': 'middle', 'font-size': 12, fill: C.mute, text: 'GujiBERT layer' }, g);
    el('text', { x: -40, y: -14, 'font-size': 11, fill: C.mute, 'font-family': 'JetBrains Mono', text: 'TRANSITION ALIGNMENT (COSINE)' }, g);
    G.base = el('g', {}, g);
    el('polyline', { points: A.random.map((v, l) => X(l) + ',' + Y(v)).join(' '), fill: 'none', stroke: C.faint, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, G.base);
    el('text', { x: X(12) + 8, y: Y(A.random[12]) + 4, 'font-size': 12, fill: C.mute, text: 'random pairs' }, G.base);
    G.roles = [0, 1, 2, 3].map(r => {
      const gg = el('g', {}, g), v = A.byLayer.map(row => row[r]);
      el('polyline', { points: v.map((y, l) => X(l) + ',' + Y(y)).join(' '), fill: 'none', stroke: cols[r], 'stroke-width': 3.2, 'stroke-linejoin': 'round' }, gg);
      v.forEach((y, l) => el('circle', { cx: X(l), cy: Y(y), r: 3.6, fill: cols[r] }, gg));
      const ly = r === 1 ? Y(v[12]) + 4 : r === 2 ? Y(v[12]) - 6 : Y(v[12]) + 4;
      el('text', { x: X(12) + 8, y: ly, 'font-size': 13, fill: cols[r], 'font-weight': 600, text: lab[r] }, gg);
      return gg;
    });
  }
  H['s-align-layers'] = {
    render(step) {
      if (!built) { build(); built = true; }
      const show = (n, on) => { n.style.transition = 'opacity .5s'; n.style.opacity = on ? 1 : 0; };
      show(G.base, step >= 1);
      G.roles.forEach((g, r) => { show(g, step >= 1); if (step >= 2) g.style.opacity = (r === 1 || r === 2 || r === 3) ? 1 : .3; });
    },
  };
})();

/* BodyWords figures: body heat maps by emotion (dark slides) */
(function () {
  const H = window.HOOKS, D = window.BODYEMO, EC = EMOTION_COLOR;
  const ORDER = ['joy', 'sadness', 'fear', 'anger', 'surprise'];
  const LAB = { joy: 'Joy', sadness: 'Sadness', fear: 'Fear', anger: 'Anger', surprise: 'Surprise' };
  const mix = (a, b, w) => { const p = i => parseInt(a.substr(i, 2), 16) * (1 - w) + parseInt(b.substr(i, 2), 16) * w; return '#' + [1, 3, 5].map(i => Math.round(p(i)).toString(16).padStart(2, '0')).join(''); };
  const shares = d => { const t = {}; let n = 0; Object.values(d).forEach(e => Object.entries(e).forEach(([k, v]) => { t[k] = (t[k] || 0) + v; n += v; })); return { t, n }; };
  let uid = 0;
  function figure(host, key, opts) {
    const d = D[key], id = 'bw' + (uid++), { t, n } = shares(d);
    host.innerHTML = bodySVG(id);
    const svg = host.querySelector('svg'); svg.style.cssText = 'height:' + (opts.h || 460) + 'px;width:auto;display:block;margin:0 auto';
    const max = Math.max(...Object.values(d).map(e => Object.values(e).reduce((a, b) => a + b, 0)));
    host.querySelectorAll('.organ').forEach(el => {
      const e = d[el.dataset.organ]; if (!e) { el.style.fill = 'transparent'; return; }
      const es = Object.entries(e).sort((a, b) => b[1] - a[1]), tot = es.reduce((a, b) => a + b[1], 0);
      const c = mix('#2a323f', EC[es[0][0]], Math.min(1, .38 + .62 * Math.sqrt(tot / max)));
      if (el.getAttribute('fill') === 'none') { el.style.stroke = c; el.style.fill = 'none'; } else el.style.fill = c;
    });
    if (opts.bar) {
      const bar = document.createElement('div'); bar.className = 'bw-bar';
      ORDER.forEach(k => { const s = document.createElement('span'); s.style.cssText = 'width:' + (100 * (t[k] || 0) / n) + '%;background:' + EC[k]; const p = Math.round(100 * (t[k] || 0) / n); s.textContent = p >= 9 ? p + '%' : ''; bar.appendChild(s); });
      host.appendChild(bar);
    }
  }
  const legend = host => { host.innerHTML = ORDER.map(k => '<span><i style="background:' + EC[k] + '"></i>' + LAB[k] + '</span>').join(''); };
  let ready = false;
  function build() {
    if (ready) return; ready = true;
    figure(document.getElementById('bwx-fig'), 'book', { h: 520 });
    [['bwp1', 'part1'], ['bwp2', 'part2'], ['bwp3', 'part3'], ['bwc1', 'daiyu'], ['bwc2', 'baoyu'], ['bwc3', 'xifeng']].forEach(([id, k]) => figure(document.getElementById(id), k, { h: 290, bar: true }));
    document.querySelectorAll('.bw-legend').forEach(legend);
  }
  ['s-bw-feel', 's-bw-parts', 's-bw-chars'].forEach(id => { H[id] = { enter: build, render: build }; });
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
