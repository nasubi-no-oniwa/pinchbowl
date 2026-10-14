// =============================================
//  ピンチボウル  そうさ
//  ・よける番：左がわを触るとスティック（PCは WASD / 矢印）
//  ・投げる番：左右にドラッグで位置、上にスワイプで投げる（指を曲げるとカーブ）
// =============================================
(function () {
  const I = PB.In = { mode: 'none', sx: 0, sy: 0, keys: {}, cb: {} };
  const stickEl = () => document.getElementById('stick'), knobEl = () => document.getElementById('knob');
  let stickId = null, sx0 = 0, sy0 = 0, gest = null;
  const R = 62;
  const isUi = t => t && t.closest && t.closest('button,.ui,input,label,a');
  function down(id, x, y, target) {
    if (isUi(target)) return false;
    if (I.mode === 'dodge' || I.mode === 'pick') {
      if (I.mode === 'pick') { if (I.cb.tap) I.cb.tap(x, y); return true; }
      if (stickId === null) { stickId = id; sx0 = x; sy0 = y; const s = stickEl(); s.style.left = x + 'px'; s.style.top = y + 'px'; s.classList.add('on'); knobEl().style.transform = 'translate(-50%,-50%)'; }
      return true;
    }
    if (I.mode === 'throw' && !gest) { gest = { id, pts: [[x, y, performance.now()]], low: y, lowI: 0, up: false, lastX: x }; return true; }
    return false;
  }
  function move(id, x, y) {
    if (id === stickId) {
      let dx = x - sx0, dy = y - sy0; const l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; }
      I.sx = dx / R; I.sy = dy / R; knobEl().style.transform = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
      return;
    }
    if (gest && id === gest.id) {
      const p = [x, y, performance.now()]; gest.pts.push(p);
      if (!gest.up) {
        if (y >= gest.low - 2) { gest.low = Math.max(gest.low, y); gest.lowI = gest.pts.length - 1; }
        if (gest.low - y > 22) gest.up = true;
        else { if (I.cb.slide) I.cb.slide(x - gest.lastX); gest.lastX = x; }
      }
      if (I.cb.swipe) I.cb.swipe(gest);
    }
  }
  function up(id, x, y) {
    if (id === stickId) { stickId = null; I.sx = 0; I.sy = 0; const s = stickEl(); s && s.classList.remove('on'); return; }
    if (gest && id === gest.id) {
      const g = gest; gest = null; if (x != null) g.pts.push([x, y, performance.now()]);
      const r = I.read(g); if (I.cb.swipeEnd) I.cb.swipeEnd(r);
    }
  }
  // スワイプを数字にする：上向きの部分だけを使う
  I.read = function (g) {
    const H = window.innerHeight;
    const P = g.pts.slice(g.lowI); if (P.length < 3) return null;
    const a = P[0], b = P[P.length - 1];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    if (-dy < H * 0.09) return null;
    // 速さは最後の 0.18 秒ぶん
    let k = P.length - 1; while (k > 0 && b[2] - P[k][2] < 180) k--;
    const q = P[k]; const dt = Math.max(16, b[2] - q[2]) / 1000;
    const sp = Math.hypot(b[0] - q[0], b[1] - q[1]) / H / dt;
    // まがり：前半と後半の向きのちがい
    const m = P[Math.floor(P.length / 2)];
    const a1 = Math.atan2(m[0] - a[0], -(m[1] - a[1])), a2 = Math.atan2(b[0] - m[0], -(b[1] - m[1]));
    let curve = a2 - a1; while (curve > Math.PI) curve -= Math.PI * 2; while (curve < -Math.PI) curve += Math.PI * 2;
    const r = { ang: Math.atan2(dx, -dy), sp, curve, len: Math.hypot(dx, dy) / H }; I.lastRead = r; return r;
  };
  I.live = () => gest;
  I.reset = function () { stickId = null; gest = null; I.sx = 0; I.sy = 0; const s = stickEl(); s && s.classList.remove('on'); };
  I.attach = function (el) {
    el.addEventListener('touchstart', e => { for (const t of e.changedTouches) if (down(t.identifier, t.clientX, t.clientY, e.target)) e.preventDefault(); }, { passive: false });
    el.addEventListener('touchmove', e => { for (const t of e.changedTouches) move(t.identifier, t.clientX, t.clientY); if (I.mode !== 'none') e.preventDefault(); }, { passive: false });
    const end = e => { for (const t of e.changedTouches) up(t.identifier, t.clientX, t.clientY); };
    el.addEventListener('touchend', end); el.addEventListener('touchcancel', end);
    el.addEventListener('mousedown', e => { if (e.button === 0) down('m', e.clientX, e.clientY, e.target); });
    window.addEventListener('mousemove', e => move('m', e.clientX, e.clientY));
    window.addEventListener('mouseup', e => up('m', e.clientX, e.clientY));
    window.addEventListener('keydown', e => { if (e.target && e.target.tagName === 'INPUT') return; I.keys[e.code] = true; if (I.cb.key) I.cb.key(e.code); if (/Arrow|Space/.test(e.code) && I.mode !== 'none') e.preventDefault(); });
    window.addEventListener('keyup', e => { I.keys[e.code] = false; if (I.cb.keyUp) I.cb.keyUp(e.code); });
    window.addEventListener('blur', () => { I.keys = {}; I.reset(); });
  };
  // よける向き（画面の上＝ボウラーのほう）
  I.stick = function () {
    let x = I.sx, y = I.sy; const k = I.keys;
    if (k.KeyA || k.ArrowLeft) x -= 1; if (k.KeyD || k.ArrowRight) x += 1; if (k.KeyW || k.ArrowUp) y -= 1; if (k.KeyS || k.ArrowDown) y += 1;
    const gp = navigator.getGamepads ? [...navigator.getGamepads()].find(g => g) : null;
    if (gp) { const gx = gp.axes[0] || 0, gy = gp.axes[1] || 0; if (Math.hypot(gx, gy) > 0.2) { x += gx; y += gy; } }
    const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    return [x, y];
  };
})();
