// =============================================
//  ピンチボウル  音
//  効果音は Kenney「Impact Sounds」（CC0）＋合成、BGMは自作（ファイル）
// =============================================
(function () {
  let ac = null, bus = null, master = null, mus = null, nbuf = null, sfx = null, SP = null, MB = {}, mark = 0, roll = null;
  let muted = (() => { try { return localStorage.getItem('pb_mute') === '1'; } catch (e) { return false; } })();
  const A = () => {
    try {
      if (!ac) {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        const c = ac.createDynamicsCompressor(); c.threshold.value = -14; c.ratio.value = 4; c.attack.value = 0.003; c.release.value = 0.15;
        master = ac.createGain(); master.gain.value = muted ? 0 : 1; c.connect(master); master.connect(ac.destination); bus = c;
        mus = ac.createGain(); mus.gain.value = 0.34; mus.connect(master);
        nbuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        loadBufs();
        ac.onstatechange = () => { if (ac.state === 'running' && bgm.want && !bgm.src) bgm.start(bgm.want); };
      }
      if (ac.state === 'suspended') ac.resume();
    } catch (e) {} return ac;
  };
  const ok = () => { const a = A(); return a && a.state === 'running' ? a : null; };
  function out(pan) { if (pan == null || !ac.createStereoPanner) return bus; const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); p.connect(bus); return p; }
  function tone(f, d, type = 'triangle', v = 0.07, delay = 0, f2, pan) { const a = ok(); if (!a) return; const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(out(pan)); o.start(t); o.stop(t + d + 0.02); }
  function noise(d, v = 0.15, f = 1200, type = 'lowpass', delay = 0, pan, f2) { const a = ok(); if (!a) return; const t = a.currentTime + delay, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.buffer = nbuf; s.connect(fl); fl.connect(g); g.connect(out(pan)); s.start(t, Math.random() * 1.5, d + 0.05); }
  async function getBuf(name) { const r = await fetch(PB.url(name)); const ab = await r.arrayBuffer(); return await new Promise((res, rej) => ac.decodeAudioData(ab, res, rej)); }
  function firstLoud(b, th) { const d = b.getChannelData(0), n = Math.min(d.length, b.sampleRate * 0.4); for (let i = 0; i < n; i++) if (Math.abs(d[i]) > th) return i / b.sampleRate; return 0; }
  async function loadBufs() {
    try { const [b, j] = await Promise.all([getBuf('sfx.mp3'), fetch(PB.url('sfx.json')).then(r => r.json())]); sfx = b; SP = j; mark = firstLoud(b, 0.5); } catch (e) { sfx = null; }
    for (const k of ['bgm', 'title']) { try { MB[k] = await getBuf(k + '.mp3'); MB[k].lp = firstLoud(MB[k], 0.002); } catch (e) {} }
    if (bgm.want) bgm.start(bgm.want);
  }
  function smp(name, v = 1, pan, rate = 1, delay = 0, i) {
    const a = A(); if (!a || !sfx || !SP || !SP[name]) return false; if (a.state !== 'running') return true;
    const L = SP[name], it = L[i != null ? i % L.length : (Math.random() * L.length) | 0];
    const s = a.createBufferSource(), g = a.createGain(); s.buffer = sfx; s.playbackRate.value = rate; g.gain.value = v; s.connect(g); g.connect(out(pan));
    s.start(a.currentTime + delay, mark + it[0], it[1] + 0.02); return true;
  }
  const rr = (a, b) => a + Math.random() * (b - a);
  function chime(f, d, v, delay = 0, pan) { [1, 2.01, 3.03].forEach((r, i) => tone(f * r, d / (1 + i * 0.6), 'sine', v / (1 + i * 1.4), delay, null, pan)); }
  let lastPin = 0, pinN = 0;
  const S = {
    // ピンが鳴る（たくさん同時に鳴りすぎないように）
    pin(v = 1, pan) {
      const a = ok(); if (!a) return; const now = a.currentTime;
      if (now - lastPin < 0.025) { if (++pinN > 3) return; } else pinN = 0; lastPin = now;
      const k = v > 0.7 ? 'pinH' : v > 0.35 ? 'pinM' : 'pinL';
      if (!smp(k, Math.min(1, 0.35 + v * 0.6), pan, rr(1.05, 1.35))) noise(0.08, 0.2 * v, 2400, 'bandpass', 0, pan);
      if (v > 0.6) smp('plank', 0.3 * v, pan, rr(1.2, 1.5), 0.01);
    },
    crash(v = 1) { smp('pinH', 0.9 * v, -0.3, 1.1); smp('pinH', 0.8 * v, 0.3, 1.25, 0.03); smp('plank', 0.7 * v, 0, 1.0, 0.05); smp('pinM', 0.6 * v, 0.1, 1.4, 0.09); noise(0.5, 0.12 * v, 3000, 'bandpass', 0.02, null, 900); },
    rail(v = 1, pan) { if (!smp('rail', 0.4 + v * 0.4, pan, rr(0.9, 1.1))) noise(0.1, 0.2 * v, 900, 'lowpass', 0, pan); tone(180, 0.12, 'sine', 0.08 * v, 0, 120, pan); },
    bump(v = 1, pan) { smp('pinL', 0.4 + v * 0.3, pan, rr(1.4, 1.7)); },
    throw() { noise(0.25, 0.1, 400, 'lowpass', 0, null, 150); tone(90, 0.25, 'sine', 0.14, 0, 60); },
    stop() { smp('soft', 0.9, null, 0.9); [784, 988, 1319].forEach((f, i) => chime(f, 0.35, 0.06, 0.05 + i * 0.07)); },
    blown() { smp('punch', 1, null, 0.8); smp('pinH', 1, null, 0.9, 0.02); tone(200, 0.8, 'sawtooth', 0.06, 0.05, 50); noise(0.6, 0.3, 2000, 'bandpass', 0, null, 300); },
    warn() { tone(1400, 0.07, 'square', 0.03); tone(1400, 0.07, 'square', 0.03, 0.11); },
    tick() { tone(880, 0.04, 'square', 0.025); },
    pick() { [660, 990].forEach((f, i) => chime(f, 0.25, 0.05, i * 0.06)); },
    turn() { [523, 784].forEach((f, i) => tone(f, 0.18, 'square', 0.04, i * 0.09)); },
    sweep() { noise(0.9, 0.08, 500, 'bandpass', 0, null, 1500); tone(70, 0.6, 'sine', 0.08); },
    strike() { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => chime(f, 0.5, 0.06, i * 0.07)); smp('bell', 0.4, null, 1.2, 0.1); },
    good() { [784, 1047, 1319].forEach((f, i) => chime(f, 0.4, 0.05, i * 0.08)); },
    bad() { [392, 330].forEach((f, i) => tone(f, 0.25, 'triangle', 0.06, i * 0.14)); },
    win() { [523, 659, 784, 1047, 1319].forEach((f, i) => chime(f, 0.5, 0.07, i * 0.1)); },
    lose() { [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'triangle', 0.08, i * 0.16)); },
    ui() { tone(880, 0.05, 'square', 0.03); },
    step(pan) { smp('step', 0.25, pan, rr(1.3, 1.6)); },
  };
  // 球が転がる音（ゴロゴロ）
  S.roll = function (v, pan) {
    const a = ok(); if (!a) return;
    if (!roll) {
      const s = a.createBufferSource(); s.buffer = nbuf; s.loop = true; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180; f.Q.value = 2;
      const o = a.createOscillator(); o.type = 'sine'; o.frequency.value = 55; const og = a.createGain(); og.gain.value = 0.25;
      const g = a.createGain(); g.gain.value = 0; const p = a.createStereoPanner ? a.createStereoPanner() : null;
      s.connect(f); f.connect(g); o.connect(og); og.connect(g); if (p) { g.connect(p); p.connect(bus); } else g.connect(bus);
      s.start(); o.start(); roll = { s, f, g, o, p };
    }
    const t = a.currentTime;
    roll.g.gain.setTargetAtTime(Math.min(0.9, v) * 0.55, t, 0.05); roll.f.frequency.setTargetAtTime(120 + v * 260, t, 0.05); roll.o.frequency.setTargetAtTime(40 + v * 30, t, 0.05);
    if (roll.p && pan != null) roll.p.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), t, 0.05);
  };
  const SEC = { bgm: 32 * 16 * 60 / 116 / 4, title: 16 * 16 * 60 / 92 / 4 };
  const bgm = {
    want: null, cur: null, src: null, g: null,
    start(k = 'bgm') {
      this.want = k; const a = A(); if (!a || a.state !== 'running') return;
      if (this.cur === k && this.src) return;
      const B = MB[k]; if (!B) return;
      this.stop(true); this.want = k;
      const s = a.createBufferSource(), g = a.createGain(); s.buffer = B; s.loop = true; s.loopStart = B.lp; s.loopEnd = Math.min(B.duration, B.lp + SEC[k]);
      g.gain.setValueAtTime(0, a.currentTime); g.gain.linearRampToValueAtTime(1, a.currentTime + 0.6); s.connect(g); g.connect(mus); s.start(a.currentTime, B.lp);
      this.src = s; this.g = g; this.cur = k;
    },
    duck(on) { if (this.g && ac) this.g.gain.setTargetAtTime(on ? 0.45 : 1, ac.currentTime, 0.2); },
    stop(quick) {
      const a = ac; if (this.src && a) { const s = this.src, g = this.g; g.gain.cancelScheduledValues(a.currentTime); g.gain.setValueAtTime(g.gain.value, a.currentTime); g.gain.linearRampToValueAtTime(0, a.currentTime + (quick ? 0.25 : 0.8)); s.stop(a.currentTime + (quick ? 0.3 : 0.9)); }
      this.src = null; this.cur = null; if (!quick) this.want = null;
    }
  };
  PB.S = S; PB.bgm = bgm; PB.audio = A;
  PB.mute = v => { if (v != null) { muted = v; try { localStorage.setItem('pb_mute', v ? '1' : '0'); } catch (e) {} if (master) master.gain.value = v ? 0 : 1; } return muted; };
  PB.url = name => (PB.ASSETS && PB.ASSETS[name]) || ('assets/' + name);
})();
