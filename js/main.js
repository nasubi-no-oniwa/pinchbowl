// =============================================
//  ピンチボウル  ゲームの流れ
//  ピンをえらぶ → （投げる番／よける番）を交代で3回ずつ → 残ったピンの数で勝負
//  ・よける人の画面が、その人のレーンの物理を動かす（オンラインでも同じ）
// =============================================
(function () {
  const C = PB.C, R = PB.R, I = PB.In, S = PB.S;
  const $ = id => document.getElementById(id);
  const T = I18N.t;
  const PICK_T = 12, INTRO_T = 1.7, RES_T = 2.6, TURNS = C.THROWS * 2;
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const look = { col: +(store('pb_col') || 0) % PB.COLORS.length, hat: +(store('pb_hat') || 0) % PB.HATS.length };
  let G = null;            // 試合
  let room = null;         // オンライン
  let lv = 'normal';
  // ---------- 画面切りかえ ----------
  function show(id) { for (const s of document.querySelectorAll('.screen')) s.classList.toggle('active', s.id === id); }
  function hud(on) { $('hud').classList.toggle('hide', !on); }
  let banT = null;
  function banner(txt, cls, sec = 1.6) {
    const b = $('banner'); b.className = 'banner' + (cls ? ' ' + cls : ''); b.innerHTML = txt; void b.offsetWidth; b.classList.add('show');
    clearTimeout(banT); if (sec > 0) banT = setTimeout(() => b.classList.remove('show'), sec * 1000);
  }
  function hideBanner() { clearTimeout(banT); $('banner').classList.remove('show'); }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // ---------- タイトル ----------
  function buildTitle() {
    const cr = $('col-row'); cr.innerHTML = '';
    PB.COLORS.forEach((c, i) => { const b = document.createElement('button'); b.className = 'sw' + (i === look.col ? ' on' : ''); b.style.background = c.c; b.title = T(c.name); b.onclick = () => { look.col = i; store('pb_col', i); S.ui(); buildTitle(); R.setLook(look); }; cr.appendChild(b); });
    const hr = $('hat-row'); hr.innerHTML = '';
    PB.HATS.forEach((h, i) => { const b = document.createElement('button'); b.className = 'hat' + (i === look.hat ? ' on' : ''); b.textContent = T(h.name); b.onclick = () => { look.hat = i; store('pb_hat', i); S.ui(); buildTitle(); R.setLook(look); }; hr.appendChild(b); });
  }
  const titleView = (() => { const L = PB.layout(); return { pins: L.map(([x, z]) => [x, PB.PIN_CM, z, 0, 0, 0, 1]), ball: null, me: 0, stoppable: false, held: false, blown: false, bv: 0, out: true }; })();
  function toTitle() {
    if (room) { room.leave(); room = null; }
    G = null; I.mode = 'none'; I.reset(); hud(false); hideBanner(); show('s-title'); R.setLook(look); R.setFace('me'); R.aim(0, 0, 0, 0, false);
    PB.bgm.start('title'); PB.S.roll(0);
  }
  // ---------- 試合のはじまり ----------
  function newMatch(o) {
    G = Object.assign({
      mode: 'cpu', slot: 0, names: [T('you'), 'CPU'], looks: [look, look], lanes: [null, null], views: [null, null], remain: [100, 100], downs: [[], []],
      k: -1, phase: 'pick', pt: 0, snaps: [[], []], picks: [null, null], aimX: 0, spinK: 0, charge: -1, thrown: false, camMode: 0, blownBy: -1, seed: (Math.random() * 1e9) | 0,
    }, o);
    G.pickIdx = null;
    hud(true); show(null); hideBanner(); $('hud').className = ''; PB.bgm.start('bgm');
    for (const s of [0, 1]) { const el = $('pl' + s), c = PB.COLORS[G.looks[s].col]; el.querySelector('.bn').textContent = ''; el.querySelector('.nm').textContent = G.names[s]; el.querySelector('.dot').style.background = c.c; el.querySelector('.dot').style.color = c.c; el.querySelector('.cnt').textContent = 100; }
    // 自分の見え方（観戦ならスロット0）
    G.my = G.slot >= 0 ? G.slot : 0;
    startPick();
  }
  function startPick() {
    G.phase = 'pick'; G.pt = 0; $('hud').classList.add('pick'); I.mode = G.slot >= 0 ? 'pick' : 'none';
    R.setLook(G.looks[G.my]);
    G.snapCam = true;
    G.pickView = { pins: titleView.pins.map(p => p.slice()), ball: null, me: -1, stoppable: false, held: false, blown: false, bv: 0, out: true };
    if (G.slot >= 0) { banner(T('pick_tap'), 'yel', 2.2); $('hint').textContent = T('pick_hint'); }
    else $('hint').textContent = T('pick_wait');
  }
  function choosePin(i) {
    if (G.phase !== 'pick' || G.picks[G.my] != null || G.slot < 0) return;
    G.picks[G.my] = i; G.pickView.me = i; S.pick(); banner(T('pick_me'), 'blue', 1.4); $('hint').textContent = '';
    if (G.mode === 'net') room.sendPick(i);
  }
  function autoPick() { const L = PB.layout(); const pool = L.map((p, i) => [i, p[2]]).filter(a => a[1] >= 6); return pool[(Math.random() * pool.length) | 0][0]; }
  function bothPicked() {
    $('hud').classList.remove('pick'); I.mode = 'none';
    for (const s of [0, 1]) if (isLocal(s)) G.lanes[s] = new PB.Lane({ me: G.picks[s], seed: G.seed + s * 77 });
    if (G.mode === 'cpu') G.dodger = new PB.Dodger(G.lv);
    for (const s of [0, 1]) { const b = bonusOf(G.picks[s]); $('pl' + s).querySelector('.bn').textContent = b ? '+' + b : ''; }
    nextTurn();
  }
  const bonusOf = i => { if (i == null) return 0; const r = PB.layout()[i][2]; for (const [a, b, p] of C.BONUS) if (r >= a && r <= b) return p; return 0; };
  const score = s => G.remain[s] + (G.blownBy === s ? 0 : bonusOf(G.picks[s]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function toast(txt, ok) { const t = document.createElement('div'); t.className = 'toast' + (ok ? ' ok' : ''); t.textContent = txt; $('toasts').appendChild(t); setTimeout(() => t.remove(), 1500); }
  const isLocal = s => G.mode === 'cpu' || (G.mode === 'net' && s === G.slot);
  const thrower = k => k % 2, defender = k => 1 - (k % 2);
  const isCpu = s => G.mode === 'cpu' && s === 1;
  // ---------- ターン ----------
  function nextTurn() {
    G.k++;
    if (G.k >= TURNS) return finish(-1);
    const th = thrower(G.k), df = defender(G.k);
    G.snaps = [[], []]; G.phase = 'intro'; G.pt = 0; G.thrown = false; G.aimX = 0; G.spinK = 0; G.charge = -1; G.resShown = false; G.firstCrash = false; G.stoppedSaid = false; G.lastWarn = 0;
    G.cpuAt = 1.6 + Math.random() * 2.6; G.cpuPlan = null;
    G.bm = null; G.placing = false; G.slowUntil = 0; G.slowCrash = false; G.slowNear = false; G.selfT = -9; G.selfAcc = 0; R.setBumper(null);
    $('bump-ui').classList.remove('on', 'used'); $('hud').classList.remove('throw');
    R.setLook(G.looks[df]); R.setBall(G.looks[th].col); R.setFace('me'); R.trailPts.length = 0;
    const me = G.slot;
    const n = Math.floor(G.k / 2) + 1;
    $('tn').textContent = T('throw_n', { n, m: C.THROWS });
    for (const s of [0, 1]) $('pl' + s).classList.toggle('turn', s === df);
    let t;
    if (me === th) t = T('t_me_throw', { name: esc(G.names[df]) });
    else if (me === df) t = T('t_me_dodge', { name: esc(G.names[th]) });
    else t = T('t_watch', { a: esc(G.names[th]), b: esc(G.names[df]) });
    banner(t, me === df ? 'blue' : '', INTRO_T); S.turn();
    G.before = G.lanes[df] ? G.lanes[df].standing() : G.remain[df];
    if (G.lanes[df]) G.lanes[df].takeEv();
  }
  function startAim() {
    G.phase = 'aim'; G.pt = 0;
    const th = thrower(G.k), df = defender(G.k);
    $('hud').classList.toggle('dodge', G.slot === df);
    if (G.slot === th) { I.mode = 'throw'; $('hud').classList.add('throw'); $('hint').textContent = T('hint_throw'); }
    else if (G.slot === df) { I.mode = 'dodge'; $('hint').textContent = T('hint_dodge'); }
    else { I.mode = 'none'; $('hint').textContent = ''; }
    $('ph').textContent = T(G.slot === th ? 'ph_aim' : G.slot === df ? 'ph_dodge' : 'ph_watch');
    if (G.pendingThrow && (G.pendingThrow.k == null || G.pendingThrow.k === G.k)) { const t = G.pendingThrow; G.pendingThrow = null; launch(t); }
    else G.pendingThrow = null;
  }
  // 投げる（自分か CPU）
  function doThrow(t) {
    if (G.thrown || G.phase !== 'aim') return;
    if (t.bm === undefined) t.bm = G.bm || null;
    G.placing = false; $('hud').classList.remove('throw'); $('bump-ui').classList.remove('on');
    G.thrown = true; I.mode = G.slot === defender(G.k) ? 'dodge' : 'none'; R.aim(0, 0, 0, 0, false); $('kbar').classList.remove('on');
    if (G.mode === 'net' && !isLocal(defender(G.k))) room.sendThrow(G.k, t);
    else launch(t);
  }
  function launch(t) {
    const df = defender(G.k), L = G.lanes[df];
    G.thrown = true; G.bm = t.bm || null; L.setBumper(G.bm); L.throwBall(t); G.phase = 'roll'; G.pt = 0; G.lastT = t;
    $('hud').classList.add('roll'); $('hint').textContent = G.slot === df ? T('hint_roll') : '';
    if (G.mode === 'net') room.sendState(L, 'roll', G.k, true);
  }
  // ---------- 1フレーム ----------
  let last = performance.now(), acc = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (G && !G.paused) step(dt); else if (!G) titleStep(dt);
    if (!PB.noRender) R.render();
  }
  let tt = 0;
  function titleStep(dt) {
    tt += dt; R.zoom = 1;
    R.draw(titleView, dt, { showMe: true });
    const port = innerWidth / innerHeight < 1, a = Math.sin(tt * 0.3) * 0.55;
    const d = port ? 3.0 : 1.9, cx = Math.sin(a) * d, cz = C.HEAD_Z - Math.cos(a) * d;
    R.camTo(new THREE.Vector3(cx, port ? 1.2 : 0.95, cz), new THREE.Vector3(0, port ? -0.9 : 0.5, C.HEAD_Z), 1);
  }
  function step(dt) {
    G.pt += dt;
    const th = G.k >= 0 ? thrower(G.k) : -1, df = G.k >= 0 ? defender(G.k) : -1;
    // ---- ピンえらび ----
    R.zones.visible = G.phase === 'pick';
    if (G.phase === 'pick') {
      R.draw(G.pickView, dt, { showMe: G.pickView.me >= 0, arrow: true });
      camPick();
      const left = Math.max(0, PICK_T - G.pt); $('ph').textContent = T('ph_pick', { n: Math.ceil(left) }); $('tbar').style.width = (left / PICK_T * 100) + '%'; $('tn').textContent = '';
      if (G.slot >= 0 && G.picks[G.my] == null && left <= 0) choosePin(autoPick());
      if (G.mode === 'cpu' && G.picks[1] == null && G.pt > 0.8) G.picks[1] = PB.cpuPick(G.lv);
      const ready = G.picks[0] != null && G.picks[1] != null;
      if (ready) { G.pickWait = (G.pickWait || 0) + dt; if (G.pickWait > 1.3) bothPicked(); }
      return;
    }
    if (G.phase === 'end') { drawActive(dt); camDeck(0.04); return; }
    const L = G.lanes[df];
    // ---- 物理 ----
    if (L) {
      // よけるピンの入力
      let mx = 0, mz = 0;
      if (G.phase === 'aim' || G.phase === 'roll') {
        if (G.slot === df) { const [sx, sy] = I.stick(); if (G.camMode === 0) { mx = sx; mz = sy; } else { mx = sx; mz = sy; } }
        else if (isCpu(df)) [mx, mz] = G.dodger.think(L, dt);
      }
      L.setMove(mx, mz); G.moving = Math.hypot(mx, mz) > 0.15;
      const sl = G.pt < G.slowUntil ? 0.3 : 1; acc += dt * sl; let n = 0; while (acc >= 1 / 60 && n < 3) { L.step(1 / 60); acc -= 1 / 60; n++; } if (n === 3) acc = 0;
      G.views[df] = L.view();
      // ニアミス：速い球が自分のピンのすぐ横を通る → スロー
      if (G.phase === 'roll' && !G.slowNear && L.ball && !L.ballOut && !L.blown && !L.stoppable()) { const m = L.me.b.position, b = L.ball.position; if (Math.hypot(m.x - b.x, m.z - b.z) < 1.25 && b.z < m.z + 0.2) { G.slowNear = true; G.slowUntil = G.pt + 0.75; } }
      const evs = L.takeEv(); handleEv(evs, df); if (G.mode === 'net' && room) room.queueEv(evs);
      if (G.mode === 'net') room.sendState(L, G.phase, G.k);
    }
    const v = G.views[df];
    // ---- 進行 ----
    if (G.phase === 'intro' && G.pt >= INTRO_T) startAim();
    if (G.phase === 'aim') {
      const left = Math.max(0, C.AIM_T - G.pt); $('tbar').style.width = (left / C.AIM_T * 100) + '%';
      if (G.slot === th) aimInput(dt);
      if (isCpu(th)) cpuAim(dt, v);
      if (G.slot === th && left <= 0 && !G.thrown) doThrow({ x: G.aimX, ang: 0, pow: 0.45, spin: 0 });
      if (G.mode === 'net' && G.slot === th) room.sendAim(G.k, G.aimX, G.thrown, G.bm);
    }
    if (G.phase === 'roll' && L) {
      const done = (L.ballOut && L.settled() && G.pt > 1.5) || G.pt > C.ROLL_T || (L.ballOut && G.pt > (L.blown ? 2.2 : 6));
      if (L.blown && !G.blownT) { G.blownT = G.pt; }
      if (done || (L.blown && G.pt - G.blownT > 2.4)) endRoll(L);
    }
    if (G.phase === 'res' && G.pt >= RES_T) {
      if (G.blownBy >= 0) return finish(G.blownBy);
      nextTurn();
    }
    if (G.phase === 'res' && L && !G.swept && G.pt > 1.2) { G.swept = true; L.sweep(); S.sweep(); G.views[df] = L.view(); if (G.mode === 'net') room.sendState(L, 'res', G.k, true); }
    drawActive(dt);
    camera(dt, th, df, v);
    hudStep(v, th, df);
    drawMini(isLocal(df) ? v : (smooth(df) || v), th, df);
  }
  function endRoll(L) {
    const df = defender(G.k);
    const st = L.standing(), down = G.before - st;
    G.remain[df] = st; G.downs[df].push(down);
    const res = { k: G.k, n: st, down, blown: L.blown, stop: L.stopped || L.held };
    if (G.mode === 'net') room.sendRes(res);
    showRes(res);
  }
  function showRes(res) {
    const df = defender(res.k);
    G.phase = 'res'; G.pt = 0; G.swept = false; G.blownT = 0; I.mode = 'none'; I.reset();
    $('hud').classList.remove('roll'); $('hud').classList.remove('dodge'); $('hint').textContent = '';
    G.remain[df] = res.n; if (G.mode === 'net' && !isLocal(df)) G.downs[df].push(res.down);
    $('pl' + df).querySelector('.cnt').textContent = res.n;
    PB.S.roll(0);
    if (res.blown) { G.blownBy = df; return; }
    const mine = G.slot === df, thMe = G.slot === thrower(res.k);
    let t = T('down_n', { n: res.down }), cls = '';
    if (res.down === 0) t = T('nodmg');
    if (res.down >= 45) { t = T('big') + '<small>' + T('down_n', { n: res.down }) + '</small>'; cls = 'yel'; }
    if (res.stop) t = T('stop') + '<small>' + T('down_n', { n: res.down }) + '</small>', cls = 'blue';
    banner(t + '<small>' + T('left_n', { n: res.n }) + '</small>', cls, RES_T - 0.2);
    if (mine) (res.down <= 15 ? S.good : S.bad)(); else if (thMe) (res.down >= 25 ? S.good : S.ui)();
  }
  function finish(loser) {
    G.phase = 'end'; G.pt = 0; I.mode = 'none'; I.reset(); hideBanner(); PB.S.roll(0);
    $('hud').className = '';
    const r = G.remain; let win;
    const tot = [score(0), score(1)];
    if (loser >= 0) win = 1 - loser; else win = tot[0] === tot[1] ? -1 : (tot[0] > tot[1] ? 0 : 1);
    G.winner = win;
    if (G.mode === 'net' && room && G.slot === 0) room.finish();
    setTimeout(() => {
      if (!G || G.phase !== 'end') return;
      const me = G.slot;
      const t = $('res-t'); t.className = 'res-t';
      if (me < 0) { t.textContent = win < 0 ? T('res_draw') : T('x_wins', { name: G.names[win] }); }
      else if (win < 0) t.textContent = T('res_draw');
      else if (win === me) { t.textContent = T('res_win'); t.classList.add('win'); S.win(); }
      else { t.textContent = T('res_lose'); S.lose(); }
      $('res-why').textContent = loser >= 0 ? T('why_blown', { name: G.names[loser] }) : T('why_score');
      for (const s of [0, 1]) $('rs' + s).innerHTML = `<div class="n" style="color:${PB.COLORS[G.looks[s].col].d}">${esc(G.names[s])}</div><div class="c">${loser === s ? T('out') : tot[s]}<small>${loser === s ? '' : T('pts')}</small></div>${loser === s ? '' : `<div class="bo">${T('rem_n', { n: r[s] })}${bonusOf(G.picks[s]) ? T('bonus_plus', { b: bonusOf(G.picks[s]) }) : ''}</div>`}<div class="ls">${G.downs[s].map(d => '−' + d).join(' ')}</div>`;
      $('res-note').textContent = '';
      $('btn-again').classList.toggle('hide', G.mode === 'net' && G.slot < 0);
      show('s-result');
    }, loser >= 0 ? 400 : 1200);
  }
  // ---------- 投げる人の操作 ----------
  let swipeLive = null;
  function aimInput(dt) {
    const k = I.keys;
    if (G.thrown) return;
    if (k.ArrowLeft || k.KeyA) G.aimX += 3.2 * dt; if (k.ArrowRight || k.KeyD) G.aimX -= 3.2 * dt;
    G.aimX = Math.max(-C.LANE_HW + 0.4, Math.min(C.LANE_HW - 0.4, G.aimX));
    if (G.charge >= 0) { G.charge += dt; const p = 1 - Math.abs(1 - (G.charge * 0.9) % 2); $('kbar-i').style.width = (p * 100) + '%'; G.kpow = p; }
    // ねらい線
    if (swipeLive) R.aim(G.aimX, swipeLive.ang, swipeLive.spin, swipeLive.pow, true, G.bm);
    else if (G.charge >= 0) R.aim(G.aimX, 0, G.spinK, G.kpow || 0, true, G.bm);
    else R.aim(G.aimX, 0, G.spinK, 0.35, true, G.bm);
  }
  function mapSwipe(r) {
    if (!r) return null;
    return { ang: Math.max(-0.32, Math.min(0.32, -r.ang * 0.5)), pow: Math.max(0, Math.min(1, (r.sp - 0.8) / 3.0)), spin: Math.max(-1, Math.min(1, -r.curve * 1.7)) };
  }
  I.cb.slide = dx => { if (!G || G.phase !== 'aim' || G.thrown) return; G.aimX -= dx / innerWidth * C.LANE_HW * 2.2; G.aimX = Math.max(-C.LANE_HW + 0.4, Math.min(C.LANE_HW - 0.4, G.aimX)); };
  I.cb.swipe = g => { if (!g.up) { swipeLive = null; return; } const r = I.read(g); swipeLive = r ? mapSwipe(r) : null; };
  I.cb.swipeEnd = r => { swipeLive = null; if (!G || G.phase !== 'aim' || G.slot !== thrower(G.k)) return; const m = mapSwipe(r); if (!m) return; doThrow({ x: G.aimX, ang: m.ang, pow: m.pow, spin: m.spin }); };
  I.cb.tap = (x, y) => {
    if (!G || G.phase !== 'pick') return;
    let best = -1, bd = 1e9;
    G.pickView.pins.forEach((p, i) => { const [sx, sy] = R.toScreen(p[0], 0.5, p[2]); const d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = i; } });
    if (best >= 0 && bd < Math.max(30, innerWidth * 0.05)) choosePin(best);
  };
  I.cb.key = code => {
    if (!G) return;
    if (code === 'Escape' || code === 'KeyP') { if (G.mode === 'cpu') togglePause(); return; }
    if (G.phase === 'aim' && G.slot === thrower(G.k) && !G.thrown) {
      if (code === 'KeyQ') G.spinK = Math.max(-1, G.spinK - 0.25);
      if (code === 'KeyE') G.spinK = Math.min(1, G.spinK + 0.25);
      if (code === 'Space' && G.charge < 0) { G.charge = 0; $('kbar').classList.add('on'); }
    }
    if (code === 'KeyV' && G.slot === defender(G.k)) G.camMode ^= 1;
  };
  I.cb.keyUp = code => { if (code === 'Space' && G && G.charge >= 0 && G.phase === 'aim') { const p = G.kpow || 0; G.charge = -1; doThrow({ x: G.aimX, ang: 0, pow: p, spin: -G.spinK }); } };
  // ---------- バンパーを置く ----------
  I.cb.place = (x, y) => {
    if (!G || !G.placing || !G.bm) return; const p = R.floorAt(x, y); if (!p) return;
    G.bm.x = clamp(p.x, -C.LANE_HW + 0.5, C.LANE_HW - 0.5); G.bm.z = clamp(p.z, C.BUMP_Z0, C.BUMP_Z1);
  };
  function placeMode(on) {
    if (!G || G.phase !== 'aim' || G.thrown || G.slot !== thrower(G.k)) return;
    G.placing = on; I.mode = on ? 'place' : 'throw'; I.reset(); $('bump-ui').classList.toggle('on', on);
    $('hint').textContent = on ? T('hint_bump') : T('hint_throw');
    if (on) R.aim(0, 0, 0, 0, false);
  }
  // ---------- 小さな地図（上から） ----------
  function drawMini(v, th, df) {
    const show = v && (G.slot !== df) && (G.phase === 'aim' || G.phase === 'roll' || G.phase === 'intro');
    $('hud').classList.toggle('mini', !!show); if (!show) return;
    const cvs = $('mini'), g = cvs.getContext('2d'), W = cvs.width, H = cvs.height, z0 = 5, z1 = 30.5;
    const X = x => W / 2 + x / (C.LANE_HW + 0.3) * (W / 2 - 4), Z = z => H - 4 - (z - z0) / (z1 - z0) * (H - 8);
    g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(214,170,120,.28)'; g.fillRect(X(-C.LANE_HW), Z(z1), X(C.LANE_HW) - X(-C.LANE_HW), Z(z0) - Z(z1));
    const bm = (G.phase !== 'roll' && !G.thrown) ? G.bm : v.bm;
    if (bm) { g.strokeStyle = '#ffd23a'; g.lineWidth = 4; g.beginPath(); const ux = Math.cos(bm.a) * C.BUMP_L / 2, uz = -Math.sin(bm.a) * C.BUMP_L / 2; g.moveTo(X(bm.x - ux), Z(bm.z - uz)); g.lineTo(X(bm.x + ux), Z(bm.z + uz)); g.stroke(); }
    if (G.slot === th && G.phase === 'aim' && !G.thrown && !G.placing) {
      const a = swipeLive || { ang: 0, spin: G.spinK, pow: G.charge >= 0 ? (G.kpow || 0) : 0.35 }, sp = C.POW_MIN + (C.POW_MAX - C.POW_MIN) * a.pow;
      const P = PB.predict(G.aimX, 0.3, Math.sin(a.ang) * sp, Math.cos(a.ang) * sp, a.spin * C.SPIN_MAX, 2.6, [], G.bm);
      g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(X(G.aimX), Z(0.3)); for (const p of P) g.lineTo(X(p[0]), Z(p[1])); g.stroke(); g.setLineDash([]);
    }
    g.fillStyle = '#fff'; v.pins.forEach((p, i) => { if (p && i !== v.me) g.fillRect(X(p[0]) - 1.5, Z(p[2]) - 1.5, 3, 3); });
    const m = v.pins[v.me]; if (m) { g.fillStyle = PB.COLORS[G.looks[df].col].c; g.beginPath(); g.arc(X(m[0]), Z(m[2]), 5, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); }
    const b = v.ball; if (b && !v.out) { g.fillStyle = v.stoppable ? '#4ac8ff' : '#ff4d6d'; g.beginPath(); g.arc(X(b[0]), Z(b[2]), 4, 0, Math.PI * 2); g.fill(); }
    else if (G.phase === 'aim' && !G.thrown) { g.fillStyle = PB.COLORS[G.looks[th].col].c; g.beginPath(); g.arc(X(G.aimX), Z(z0 + 0.4), 4, 0, Math.PI * 2); g.fill(); }
  }
  // ---------- CPU が投げる ----------
  function cpuAim(dt, v) {
    if (G.thrown) return;
    if (!G.cpuPlan && G.pt > 0.6 && v) { G.cpuPlan = PB.cpuThrow(v, G.lv); G.bm = G.cpuPlan.bm || null; if (G.bm) G.cpuAt += 0.8; }
    if (G.cpuPlan) {
      G.aimX += (G.cpuPlan.x - G.aimX) * Math.min(1, dt * 2.5);
      if (G.pt > G.cpuAt && Math.abs(G.aimX - G.cpuPlan.x) < 0.1) doThrow(G.cpuPlan);
    }
  }
  // ---------- 音とかけら ----------
  function handleEv(evs, df) {
    const cx = R.cam.position.x;
    for (const e of evs) {
      const pan = e.x != null ? Math.max(-1, Math.min(1, -(e.x - cx) / 6)) : null;
      if (e.k === 'pin') { S.pin(Math.min(1, e.v / 13), pan); R.burst(e.x, 0.5, e.z, 3, '#ffffff', 3); if (!G.firstCrash && e.v > 7) { G.firstCrash = true; S.crash(Math.min(1, e.v / 12)); R.shake = 0.18; if (e.v > 8.5 && !G.slowCrash) { G.slowCrash = true; G.slowUntil = Math.max(G.slowUntil, G.pt + 0.5); } } }
      else if (e.k === 'pp') { if (Math.random() < 0.35) S.pin(Math.min(0.6, e.v / 10), pan); }
      else if (e.k === 'rail') { S.rail(Math.min(1, e.v / 12), pan); R.shake = Math.max(R.shake, 0.06); }
      else if (e.k === 'bumper') { S.rail(Math.min(1, e.v / 12), pan); R.burst(e.x, 0.4, e.z, 8, '#ffd23a', 3); R.shake = Math.max(R.shake, 0.08); }
      else if (e.k === 'self') { G.selfAcc++; if (G.pt - G.selfT > 0.5) { toast(T(G.slot === df ? 'self' : 'opp_self') + ' −' + G.selfAcc); G.selfAcc = 0; G.selfT = G.pt; } }
      else if (e.k === 'bump') { S.bump(Math.min(1, e.v / 3), pan); }
      else if (e.k === 'stop') { S.stop(); R.burst(R.ball.position.x, 0.4, R.ball.position.z, 12, '#4ac8ff', 3); banner(T('stop'), 'blue', 1.2); G.stoppedSaid = true; }
      else if (e.k === 'blown') { S.blown(); R.shake = 0.5; G.slowUntil = G.pt + 1.3; const m = G.views[df] && G.views[df].pins[G.views[df].me]; if (m) R.burst(m[0], 0.6, m[2], 20, '#ffd23a', 5); banner(G.slot === df ? T('blown_me') : T('blown_x', { name: esc(G.names[df]) }), 'yel', 2.6); }
      else if (e.k === 'throw') S.throw();
    }
  }
  // ---------- 描く ----------
  function drawActive(dt) {
    const df = G.k >= 0 ? defender(G.k) : G.my;
    let v = G.views[df]; if (!v) return;
    if (!isLocal(df)) v = smooth(df) || v;
    const me = G.slot === df;
    // 表情
    if (v.blown) R.setFace('x');
    else if (v.held) R.setFace('happy');
    else if (v.ball && !v.out && !v.stoppable) { const m = v.pins[v.me], b = v.ball; const d = m ? Math.hypot(m[0] - b[0], m[2] - b[2]) : 99; R.setFace(d < 6 ? 'scared' : 'me'); }
    else R.setFace('me');
    R.setBumper((G.phase === 'aim' || G.phase === 'intro') && !G.thrown ? G.bm : (G.phase === 'roll' || G.phase === 'res' ? v.bm : null), G.placing);
    R.draw(v, dt, { showMe: true, arrow: me ? G.phase !== 'roll' : ((G.phase === 'aim' || G.phase === 'intro') ? 'far' : false), moving: G.moving, thrower: G.slot === thrower(G.k) });
    if (G.phase === 'aim' && !G.thrown && v) {
      // 投げる前の球（手前でかまえている）
      R.ball.visible = true; R.ball.position.set(G.aimX, C.BALL_R, -0.4); R.ball.quaternion.set(0, 0, 0, 1);
    }
  }
  // 相手のレーンは少し遅らせて、前後のようすの間をなめらかにつなぐ
  function smooth(s) {
    const q = G.snaps[s]; if (!q || q.length < 2) return null;
    const t = performance.now() - 110;
    let i = q.length - 2; while (i > 0 && q[i].at > t) i--;
    const a = q[i], b = q[i + 1]; if (!a || !b) return null;
    const f = Math.max(0, Math.min(1, (t - a.at) / Math.max(1, b.at - a.at)));
    const mix = (p, r) => { if (!p || !r) return r || null; const o = new Array(7); for (let k = 0; k < 3; k++) o[k] = p[k] + (r[k] - p[k]) * f; let d = p[3] * r[3] + p[4] * r[4] + p[5] * r[5] + p[6] * r[6], sg = d < 0 ? -1 : 1, l = 0; for (let k = 3; k < 7; k++) { o[k] = p[k] + (r[k] * sg - p[k]) * f; l += o[k] * o[k]; } l = Math.sqrt(l) || 1; for (let k = 3; k < 7; k++) o[k] /= l; return o; };
    const pins = b.pins.map((r, i) => mix(a.pins[i], r));
    return Object.assign({}, b, { pins, ball: b.ball && a.ball ? mix(a.ball, b.ball) : b.ball });
  }
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  function camPick() {
    R.zoom = 1;
    const port = innerWidth / innerHeight < 1;
    R.camTo(V3(0, port ? 21 : 13.5, C.HEAD_Z - (port ? 3.5 : 4.6)), V3(0, 0, C.HEAD_Z + 4.4), G.snapCam ? 1 : 0.08); G.snapCam = false;
  }
  function camDeck(k) { const port = innerWidth / innerHeight < 1; R.camTo(V3(0, port ? 15 : 9, C.HEAD_Z - (port ? 6 : 6.5)), V3(0, 0, C.HEAD_Z + 4.5), k); }
  function camera(dt, th, df, v) {
    const port = innerWidth / innerHeight < 1, k = Math.min(1, dt * 4);
    R.zoom = (G.slot === th && (G.phase === 'intro' || (G.phase === 'aim' && !G.thrown))) ? (port ? 0.42 : 0.6) : 1;
    if (G.placing) { R.zoom = 1; return R.camTo(V3(0, port ? 17 : 9.5, port ? 4 : 3.2), V3(0, 0, 12.2), k); }
    if (G.pt < G.slowUntil) R.zoom *= 0.85;
    const b = v && v.ball, m = v && v.pins[v.me];
    if (G.phase === 'res' || (G.phase === 'roll' && v && v.blown)) {
      if (v && v.blown && m) return R.camTo(V3(m[0] * 0.3, Math.max(6, m[1] + 4) + (port ? 4 : 0), Math.min(m[2], C.PIT_Z - 2) - 10), V3(m[0], Math.max(0.5, m[1] * 0.8), Math.min(m[2], C.PIT_Z) + 1), k * 0.8);
      return camDeck(k * 0.5);
    }
    if (G.slot === df && m) {
      // うしろの壁より奥にカメラが入らないように（入ると画面が暗くなる）。足りない分は高さでおぎなう
      const zMax = C.PIT_Z - 0.8;
      if (G.camMode === 0) { const want = m[2] + (port ? 4.6 : 3.4), cz = Math.min(want, zMax), e = want - cz; return R.camTo(V3(m[0] * 0.85, (port ? 4.6 : 3.3) + e * 1.6, cz), V3(m[0] * 0.92, 0.3, m[2] - (port ? 4 : 5.5) + e * 1.6), k); }
      { const want = m[2] + (port ? 3.5 : 2.6), cz = Math.min(want, zMax); return R.camTo(V3(m[0] * 0.6, port ? 15 : 10, cz), V3(m[0] * 0.6, 0, m[2] - 3.2 - (want - cz)), k); }
    }
    // 投げる人・観戦
    if (G.phase === 'intro' || (G.phase === 'aim' && !G.thrown)) {
      if (G.slot === th) return R.camTo(V3(G.aimX * 0.75, port ? 3.4 : 2.7, port ? -4.2 : -2.8), V3(G.aimX * 0.3, 0, 17), k);
      return R.camTo(V3(G.aimX * 0.5, port ? 3.6 : 2.9, port ? -4.6 : -3.4), V3(0, 0, 17), k);
    }
    if (b && b[2] < C.HEAD_Z - 5.5 && !v.out) return R.camTo(V3(b[0] * 0.7, port ? 3 : 2.3, b[2] - (port ? 5.2 : 4.2)), V3(b[0] * 0.5, 0.3, b[2] + 7), Math.min(1, dt * 6));
    return R.camTo(V3((b ? b[0] : 0) * 0.3, port ? 8 : 4.8, C.HEAD_Z - (port ? 8 : 6.8)), V3(0, 0, C.HEAD_Z + 4), Math.min(1, dt * 2.2));
  }
  // ---------- HUD ----------
  let lastSpd = -1;
  function hudStep(v, th, df) {
    if (G.phase === 'roll' && v) {
      const sp = Math.round(v.bv * 3.6), ok = v.stoppable;
      if (sp !== lastSpd) { $('spd-v').textContent = v.held ? '0' : sp; lastSpd = sp; }
      $('spd').classList.toggle('ok', ok || v.held);
      $('spd').querySelector('span').textContent = T(ok ? 'can_stop' : 'speed');
      $('ph').textContent = T(G.slot === df ? 'ph_dodge2' : 'ph_go');
      $('tbar').style.width = '0%';
      if (v.ball && !v.out) PB.S.roll(Math.min(1, v.bv / 14), Math.max(-1, Math.min(1, -(v.ball[0] - R.cam.position.x) / 6))); else PB.S.roll(0);
      // あぶない！の合図
      if (G.slot === df && v.ball && !v.out && !v.stoppable) { const m = v.pins[v.me]; if (m) { const d = Math.hypot(m[0] - v.ball[0], m[2] - v.ball[2]); if (d < 5 && G.pt - G.lastWarn > 0.6) { G.lastWarn = G.pt; S.warn(); } } }
    }
    if (G.phase === 'intro') { $('ph').textContent = ''; $('tbar').style.width = '100%'; }
  }
  // ---------- 一時停止 ----------
  function togglePause() {
    if (!G || G.mode !== 'cpu' || G.phase === 'end') return;
    G.paused = !G.paused; show(G.paused ? 's-pause' : null); I.reset();
  }
  // ---------- オンライン ----------
  function loadScript(src) { return new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => rej(new Error(T('err_net'))); document.head.appendChild(el); }); }
  async function getDb() {
    if (PB._db) return PB._db;
    const v = '10.12.2';
    if (!window.firebase || !firebase.database) { await loadScript('https://www.gstatic.com/firebasejs/' + v + '/firebase-app-compat.js'); await loadScript('https://www.gstatic.com/firebasejs/' + v + '/firebase-database-compat.js'); }
    if (!firebase.apps.length) firebase.initializeApp(PB.FIREBASE_CONFIG);
    return PB._db = firebase.database();
  }
  async function joinOnline() {
    const name = $('in-name').value.trim() || T('noname'), code = $('in-code').value.trim();
    store('pb_name', name); store('pb_code', code); $('on-err').textContent = '';
    if (!PB.cleanCode(code)) { $('on-err').textContent = T('err_code_short'); return; }
    let db; try { db = await getDb(); } catch (e) { $('on-err').textContent = e.message; return; }
    $('btn-join').disabled = true;
    try {
      room = new PB.Room(db, code, name, roomCb, { col: look.col, hat: look.hat });
      const r = await room.join();
      $('on-form').classList.add('hide'); $('on-wait').classList.remove('hide');
      $('on-msg').textContent = r.watching ? T('watch_wait') : T('waiting');
    } catch (e) { $('on-err').textContent = e.message || T('err_conn'); room = null; }
    $('btn-join').disabled = false;
  }
  const roomCb = {
    onPeople(p) {
      const n = p.names.map(x => x || '…');
      $('on-people').textContent = n[0] + ' VS ' + n[1];
    },
    onWatchers(n) { },
    onMatch(m) {   // 試合がはじまる
      newMatch({ mode: 'net', slot: m.slot, names: m.names.map(x => x || '?'), looks: m.looks, seed: m.seed, lv: 'normal' });
      if (m.slot < 0) $('hud').classList.add('watch');
      G.m = m.m;
    },
    onPick(s, i) { if (G && G.mode === 'net' && G.picks[s] == null) { G.picks[s] = i; if (s === G.my) G.pickView.me = i; } },
    onAim(k, x, bm) { if (G && G.k === k && !isLocal(thrower(k)) && !G.thrown) { G.aimX = x; G.bm = bm; } },
    onThrow(k, t) {
      if (!G || G.mode !== 'net') return;
      if (isLocal(defender(k))) { if (G.k === k && G.phase === 'aim') launch(t); else if (G.k === k && G.phase === 'intro') G.pendingThrow = t; else if (G.k === k - 1 || (G.k === k && G.phase === 'pick')) G.pendingThrow = Object.assign({ k }, t); }
      else if (G.k === k) G.thrown = true;
    },
    onState(s, v) {
      if (!G || G.mode !== 'net' || isLocal(s)) return;
      if (G.m != null && v.m !== G.m) return;
      if (G.slot < 0 && v.k >= 0 && v.k !== G.k && v.k > G.k) { G.k = v.k - 1; $('hud').classList.remove('pick'); nextTurn(); }
      if (v.k !== G.k) return;
      v.at = performance.now(); const q = G.snaps[s] || (G.snaps[s] = []); q.push(v); if (q.length > 6) q.shift();
      G.views[s] = v;
      if (v.ev) handleEv(v.ev, s);
      if (v.k === G.k && v.ph === 'roll' && G.phase === 'aim') { G.phase = 'roll'; G.pt = 0; G.thrown = true; $('hud').classList.add('roll'); R.aim(0, 0, 0, 0, false); I.mode = 'none'; }
    },
    onRes(res) {
      if (!G || G.mode !== 'net') return; const df = defender(res.k);
      if (isLocal(df)) return;
      if (res.k === G.k && G.phase !== 'res' && G.phase !== 'end') showRes(res);
      else if (res.k < G.k) { G.remain[df] = res.n; $('pl' + df).querySelector('.cnt').textContent = res.n; if (G.downs[df].length < Math.floor(res.k / 2) + 1) G.downs[df].push(res.down); }
    },
    onOver(o) { if (G && G.mode === 'net' && o.gone && G.phase !== 'end') { banner(T('opp_gone'), '', 2.5); setTimeout(() => toTitle(), 2600); } },
    onLeft() { if (G && G.mode === 'net' && G.phase !== 'end') { G.phase = 'end'; banner(T('opp_gone'), '', 2.5); setTimeout(() => toTitle(), 2600); } else if (!G) { $('on-msg').textContent = T('waiting'); } },
  };
  // ---------- ボタン ----------
  function bind() {
    for (const b of document.querySelectorAll('.btn.lv')) b.onclick = () => { PB.audio(); S.ui(); lv = b.dataset.lv; newMatch({ mode: 'cpu', lv, looks: [Object.assign({}, look), { col: (look.col + 1 + Math.floor(Math.random() * (PB.COLORS.length - 1))) % PB.COLORS.length, hat: Math.floor(Math.random() * PB.HATS.length) }] }); };
    $('btn-online').onclick = () => { PB.audio(); S.ui(); $('in-name').value = store('pb_name') || ''; $('in-code').value = store('pb_code') || ''; $('on-form').classList.remove('hide'); $('on-wait').classList.add('hide'); $('on-err').textContent = ''; show('s-online'); };
    $('btn-join').onclick = () => { PB.audio(); joinOnline(); };
    $('btn-on-back').onclick = () => { S.ui(); if (room) { room.leave(); room = null; } show('s-title'); };
    $('btn-howto').onclick = () => { PB.audio(); S.ui(); show('s-howto'); };
    $('btn-how-back').onclick = () => { S.ui(); show('s-title'); };
    $('btn-snd').onclick = () => { PB.audio(); const m = !PB.mute(); PB.mute(m); $('snd-name').textContent = T(m ? 'snd_off' : 'snd_on'); };
    $('snd-name').textContent = T(PB.mute() ? 'snd_off' : 'snd_on');
    document.addEventListener('langchange', () => { $('snd-name').textContent = T(PB.mute() ? 'snd_off' : 'snd_on'); buildTitle(); });
    $('btn-pause').onclick = () => { if (G && G.mode === 'net') { if (confirmLeave()) toTitle(); return; } togglePause(); };
    $('btn-resume').onclick = () => togglePause();
    $('btn-quit').onclick = () => { if (G) G.paused = false; toTitle(); };
    $('btn-cam').onclick = () => { if (G) { G.camMode ^= 1; S.ui(); } };
    $('btn-bump').onclick = () => { if (!G || G.thrown) return; S.ui(); if (!G.bm) G.bm = { x: 0, z: 11.5, a: 0.6 }; placeMode(true); };
    $('btn-rot').onclick = () => { if (!G || !G.bm) return; S.ui(); G.bm.a = G.bm.a + 0.3 > 0.95 ? -0.9 : Math.round((G.bm.a + 0.3) * 10) / 10; };
    $('btn-bdel').onclick = () => { if (!G) return; S.ui(); G.bm = null; placeMode(false); };
    $('btn-bok').onclick = () => { if (!G) return; S.ui(); placeMode(false); };
    $('btn-auto').onclick = () => { if (G && G.phase === 'pick') choosePin(autoPick()); };
    $('btn-again').onclick = () => {
      S.ui();
      if (G && G.mode === 'net' && room) { $('res-note').textContent = T('waiting'); room.rematch(); return; }
      const o = G; newMatch({ mode: 'cpu', lv: o.lv, looks: o.looks });
    };
    $('btn-title').onclick = () => { S.ui(); toTitle(); };
    document.addEventListener('visibilitychange', () => { if (document.hidden && G && G.mode === 'cpu' && !G.paused && G.phase !== 'end') togglePause(); });
  }
  let leaveAsk = 0;
  function confirmLeave() { const n = Date.now(); if (n - leaveAsk < 2500) return true; leaveAsk = n; banner(T('leave_confirm'), '', 2.4); return false; }
  // ---------- 起動 ----------
  function boot() {
    R.init($('view')); I.attach(document.body); bind(); buildTitle(); R.setLook(look);
    $('loading').classList.add('done');
    // 最初のタッチで音を有効に
    const unlock = () => { PB.audio(); if (!G) PB.bgm.start('title'); };
    window.addEventListener('pointerdown', unlock, { once: false });
    toTitle();
    requestAnimationFrame(frame);
  }
  PB.dbg = () => G;
  PB.newMatch = newMatch; PB.toTitle = toTitle; PB.doThrow = t => doThrow(t); PB.choosePin = i => choosePin(i);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
