/* Minimal step-based slide engine (dark variant of the DHG502 deck engine).
 *
 * - Each <section class="slide" data-sec="id"> is one slide; window.SECTIONS lists the sections.
 * - Elements with data-step="n" appear when the slide's step >= n
 *   (optional data-until="m" hides them again from step m on).
 *   The number of steps of a slide is the largest data-step in it (or data-steps on the slide).
 * - window.HOOKS[slideId] = { render(step, el), key(e, step, el), enter(el), leave(el) }.
 * - → / Space / PageDown: next step (then next slide). ← / PageUp: back.
 * - 1–9: jump to a section. Home / End. F: fullscreen.
 */
(function () {
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const hooks = window.HOOKS || {};
  const sections = window.SECTIONS || [];
  let cur = 0, step = 0, prevSlide = null;

  const maxStep = s => {
    let m = +(s.dataset.steps || 0);
    s.querySelectorAll('[data-step]').forEach(e => { m = Math.max(m, +e.dataset.step); });
    return m;
  };
  const firstOf = id => slides.findIndex(s => s.dataset.sec === id);

  // chrome: footer, progress bar, prev/next buttons
  const foot = document.createElement('div');
  foot.id = 'foot';
  foot.innerHTML = '<span class="brand"><b>qh · china</b><span class="sec"> &nbsp;/&nbsp; <span id="secname"></span></span></span><span id="num"></span>';
  stage.appendChild(foot);
  const bar = document.createElement('div'); bar.id = 'bar'; stage.appendChild(bar);
  const nav = document.createElement('div'); nav.id = 'nav';
  [['‹', 'Previous', () => prev()], ['›', 'Next', () => next()]].forEach(([t, label, fn]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = t; b.setAttribute('aria-label', label);
    b.addEventListener('click', e => { e.stopPropagation(); b.blur(); fn(); });
    nav.appendChild(b);
  });
  stage.appendChild(nav);

  // kicker on every sectioned slide; inside a case study it also names the case ("2.1 Case studies: Parallelism")
  let curCase = null;
  slides.forEach(s => {
    if (s.dataset.case) curCase = { sec: s.dataset.sec, n: s.dataset.caseN, title: s.dataset.case };
    else if (curCase && curCase.sec !== s.dataset.sec) curCase = null;
    const i = sections.findIndex(x => x.id === s.dataset.sec);
    if (i < 0) return;
    const inCase = curCase && curCase.sec === s.dataset.sec && !s.dataset.case && !s.hasAttribute('data-nocase');
    const n = inCase ? curCase.n : String(i + 1).padStart(2, '0');
    const name = inCase ? `${sections[i].name}: ${curCase.title}` : sections[i].name;
    const html = `<span class="n">${n}</span><span>${name}</span>`;
    if (!s.classList.contains('nokicker')) {
      const k = document.createElement('div');
      k.className = 'kicker';
      k.innerHTML = html;
      s.insertBefore(k, s.firstChild);
    } else if (inCase) {
      const k = s.querySelector('.kicker');
      if (k) k.innerHTML = html;
    }
  });

  function fit() {
    const k = Math.min(innerWidth / 1280, innerHeight / 720);
    stage.style.transform = `translate(-50%, -50%) scale(${k})`;
  }

  function apply() {
    const s = slides[cur];
    if (prevSlide !== s) {
      if (prevSlide) { const h = hooks[prevSlide.id]; if (h && h.leave) h.leave(prevSlide); }
      const h = hooks[s.id]; if (h && h.enter) h.enter(s);
      prevSlide = s;
    }
    slides.forEach((x, i) => x.classList.toggle('active', i === cur));
    stage.classList.toggle('dark', s.classList.contains('dark'));
    s.querySelectorAll('[data-step]').forEach(e => {
      const from = +e.dataset.step;
      const until = e.dataset.until != null ? +e.dataset.until : Infinity;
      e.classList.toggle('on', step >= from && step < until);
    });
    const h = hooks[s.id];
    if (h && h.render) h.render(step, s);

    const ci = sections.findIndex(x => x.id === s.dataset.sec);
    document.getElementById('secname').textContent = ci >= 0 ? sections[ci].name : 'Teaching Literature with Language Machines';
    foot.classList.toggle('hide', s.classList.contains('nofoot'));
    // the section already shows in the slide's own kicker, so the footer does not repeat it
    foot.classList.toggle('nosec', !!s.querySelector('.kicker'));
    let done = 0, total = 0;
    slides.forEach((x, i) => { const n = maxStep(x) + 1; if (i < cur) done += n; if (i === cur) done += step; total += n; });
    bar.style.width = (100 * done / Math.max(1, total - 1)) + '%';
    document.getElementById('num').textContent = `${String(cur + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    history.replaceState(null, '', `#${cur + 1}.${step}`);
  }

  function next() {
    if (step < maxStep(slides[cur])) step++;
    else if (cur < slides.length - 1) { cur++; step = 0; }
    apply();
  }
  function prev() {
    if (step > 0) step--;
    else if (cur > 0) { cur--; step = maxStep(slides[cur]); }
    apply();
  }
  function go(i, st) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    step = Math.max(0, Math.min(maxStep(slides[cur]), st || 0));
    apply();
  }

  // click the slide counter to type a slide number
  const numEl = document.getElementById('num');
  let editing = false;
  numEl.addEventListener('click', e => {
    e.stopPropagation();
    if (editing) return;
    editing = true;
    const inp = document.createElement('input');
    inp.type = 'text'; inp.inputMode = 'numeric'; inp.value = String(cur + 1); inp.setAttribute('aria-label', 'Go to slide');
    numEl.textContent = '';
    numEl.appendChild(inp);
    numEl.appendChild(document.createTextNode(` / ${String(slides.length).padStart(2, '0')}`));
    inp.focus(); inp.select();
    const done = ok => {
      if (!editing) return;
      editing = false;
      const v = parseInt(inp.value, 10);
      if (ok && v >= 1 && v <= slides.length) go(v - 1, 0); else apply();
    };
    inp.addEventListener('keydown', ev => {
      ev.stopPropagation();
      if (ev.key === 'Enter') done(true); else if (ev.key === 'Escape') done(false);
    });
    inp.addEventListener('blur', () => done(false));
  });

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const h = hooks[slides[cur].id];
    if (h && h.key && h.key(e, step, slides[cur])) { e.preventDefault(); apply(); return; }
    if (/^[1-9]$/.test(e.key) && sections[+e.key - 1]) { go(firstOf(sections[+e.key - 1].id), 0); e.preventDefault(); return; }
    switch (e.key) {
      case 'ArrowRight': case ' ': case 'PageDown': case 'Enter': next(); break;
      case 'ArrowLeft': case 'PageUp': case 'Backspace': prev(); break;
      case 'Home': go(0, 0); break;
      case 'End': go(slides.length - 1, 99); break;
      case 'f': case 'F':
        if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen();
        break;
      default: return;
    }
    e.preventDefault();
  });
  addEventListener('resize', fit);

  // red laser pointer: press C to swap the cursor for a red dot (C or Esc to switch back)
  const laser = document.createElement('div');
  laser.id = 'laser';
  document.body.appendChild(laser);
  let lx = -100, ly = -100;
  const place = () => { laser.style.transform = `translate(${lx}px, ${ly}px)`; };
  addEventListener('mousemove', e => { lx = e.clientX; ly = e.clientY; place(); }, { passive: true });
  const setLaser = on => { document.body.classList.toggle('laser', on); place(); };
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName))) return;
    if (e.key === 'c' || e.key === 'C') setLaser(!document.body.classList.contains('laser'));
    else if (e.key === 'Escape') setLaser(false);
  });

  fit();
  const m = location.hash.match(/^#(\d+)\.?(\d+)?/);
  if (m) go(+m[1] - 1, +(m[2] || 0)); else apply();
})();
