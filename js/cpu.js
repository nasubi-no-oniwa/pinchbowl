// =============================================
//  ピンチボウル  CPU（投げる人・よけるピン）
// =============================================
(function () {
  const C = PB.C;
  // 球の通り道をざっくり計算（ピンは無視。曲がりとガードレールだけ）
  PB.predict = function (x, z, vx, vz, spin, sec, out, bm) {
    out = out || []; out.length = 0;
    const h = 1 / 30; let t = 0, cool = 0;
    const bc = bm ? Math.cos(bm.a) : 0, bs = bm ? Math.sin(bm.a) : 0;   // バンパーの向き（x軸を a だけ回したもの）
    while (t < sec) {
      const sp = Math.hypot(vx, vz); if (sp < 0.3) break;
      if (z > 5 && Math.abs(spin) > 0.01) { const f = spin * Math.min(1, (z - 5) / 4) * h; vx += (vz / sp) * f; vz -= (vx / sp) * f; }
      x += vx * h; z += vz * h; t += h;
      const lim = C.LANE_HW - C.BALL_R; if (x > lim) { x = lim; vx = -Math.abs(vx) * 0.72; } if (x < -lim) { x = -lim; vx = Math.abs(vx) * 0.72; }
      if (bm && cool <= 0) {
        // バンパーの線分（中心 bm、長さ BUMP_L、向き (cos a, -sin a)）ではね返る
        const ux = bc, uz = -bs, rx = x - bm.x, rz = z - bm.z;
        const along = Math.max(-C.BUMP_L / 2, Math.min(C.BUMP_L / 2, rx * ux + rz * uz));
        const nx0 = rx - ux * along, nz0 = rz - uz * along, d = Math.hypot(nx0, nz0);
        if (d < C.BALL_R + 0.14 && d > 1e-4) {
          const nx = nx0 / d, nz = nz0 / d, vn = vx * nx + vz * nz;
          if (vn < 0) { vx -= (1 + 0.72) * vn * nx; vz -= (1 + 0.72) * vn * nz; cool = 0.2; }
        }
      }
      cool -= h;
      out.push([x, z, t, sp]); if (z > C.PIT_Z) break;
    }
    return out;
  };
  const LV = {
    easy: { bump: 0.15, n: 40, err: 0.07, perr: 0.25, serr: 0.4, react: 0.5, miss: 0.35, kill: 0.3 },
    normal: { bump: 0.3, n: 120, err: 0.03, perr: 0.12, serr: 0.2, react: 0.28, miss: 0.15, kill: 0.6 },
    hard: { bump: 0.4, n: 260, err: 0.012, perr: 0.06, serr: 0.08, react: 0.12, miss: 0.04, kill: 0.9 },
  };
  PB.CPU_LV = LV;
  // 投げ方を決める  v：相手のレーンの見た目（view）
  PB.cpuThrow = function (v, lv, rnd) {
    const L = LV[lv] || LV.normal; rnd = rnd || Math.random;
    const pins = []; v.pins.forEach((p, i) => { if (p && i !== v.me) pins.push([p[0], p[2]]); });
    const me = v.pins[v.me]; const path = [];
    const wantKill = rnd() < L.kill;
    let best = null;
    for (let k = 0; k < L.n; k++) {
      const t = { x: (rnd() * 2 - 1) * (C.LANE_HW - 0.5), ang: (rnd() * 2 - 1) * 0.28, pow: 0.35 + rnd() * 0.65, spin: (rnd() * 2 - 1) };
      if (rnd() < L.bump) t.bm = { x: (rnd() * 2 - 1) * (C.LANE_HW - 1), z: C.BUMP_Z0 + rnd() * (C.BUMP_Z1 - C.BUMP_Z0), a: (rnd() * 2 - 1) * 0.9 };
      const sc = PB.scoreThrow(t, pins, me, path, wantKill);
      if (!best || sc > best.sc) best = { t, sc };
    }
    const t = best.t;
    return { bm: t.bm, x: t.x + (rnd() - 0.5) * L.err * 20, ang: t.ang + (rnd() - 0.5) * L.err, pow: Math.max(0, Math.min(1, t.pow + (rnd() - 0.5) * L.perr)), spin: Math.max(-1, Math.min(1, t.spin + (rnd() - 0.5) * L.serr)) };
  };
  PB.scoreThrow = function (t, pins, me, path, wantKill) {
    const v = C.POW_MIN + (C.POW_MAX - C.POW_MIN) * t.pow;
    PB.predict(t.x, 0.3, Math.sin(t.ang) * v, Math.cos(t.ang) * v, t.spin * C.SPIN_MAX, 6, path, t.bm);
    let sp = v, hit = 0, sc = 0; const used = new Set(); const R = C.BALL_R + 0.16;
    for (const [x, z] of path) {
      if (z < C.HEAD_Z - 1) continue;
      for (let i = 0; i < pins.length; i++) {
        if (used.has(i)) continue; const p = pins[i];
        if (Math.abs(p[1] - z) < 0.2 && Math.abs(p[0] - x) < R) { used.add(i); hit++; sp *= 1 - C.BALL_LOSS * 0.7; }
      }
      if (me && Math.abs(me[2] - z) < 0.2 && Math.abs(me[0] - x) < C.BALL_R + 0.15) {
        if (sp > C.STOP_V * 1.15) sc += wantKill ? 400 : 60; else sc -= 30;
        break;
      }
      if (sp < 1) break;
    }
    return sc + hit * 3 + Math.min(hit, 12) * 2;
  };
  // ---- よけるピン ----
  class Dodger {
    constructor(lv, rnd) { this.L = LV[lv] || LV.normal; this.rnd = rnd || Math.random; this.wait = 0; this.mx = 0; this.mz = 0; this.path = []; this.plan = null; this.mood = 0; }
    // lane：自分のレーン（Lane）  ballInfo：球の状態
    think(lane, dt) {
      this.wait -= dt;
      if (this.wait > 0) return [this.mx, this.mz];
      this.wait = this.L.react * (0.6 + this.rnd() * 0.8);
      const me = lane.me.b.position, b = lane.ball;
      this.mx = 0; this.mz = 0;
      if (!b || lane.ballOut || lane.blown) return [0, 0];
      const v = b.velocity, sp = Math.hypot(v.x, v.z);
      const path = PB.predict(b.position.x, b.position.z, v.x, v.z, lane.spin, 2.5, this.path, lane.bumper);
      // いちばん近づくところ
      let best = 9, at = null, est = sp, cnt = 0;
      for (const p of path) { const d = Math.hypot(p[0] - me.x, p[1] - me.z); if (d < best) { best = d; at = p; } }
      // ピンにぶつかってどれだけ遅くなるか（ざっくり）
      if (at) { for (const q of lane.pins) { if (q.gone || q.down || q.b.isMe) continue; const qp = q.b.position; if (qp.z > b.position.z && qp.z < at[1] && Math.abs(qp.x - this.lineX(path, qp.z)) < C.BALL_R + 0.16) cnt++; } est = sp * Math.pow(1 - C.BALL_LOSS * 0.75, cnt); }
      const danger = at && best < C.BALL_R + 0.75 && est > C.STOP_V * 0.92;
      if (lane.stoppable() && !danger) {
        // 遅い球はとりにいく（ピンを守る）
        const d = Math.hypot(b.position.x - me.x, b.position.z - me.z);
        if (d < 3.2 && this.rnd() > this.L.miss) { this.go(lane, b.position.x - me.x, b.position.z - me.z, 1); }
        return [this.mx, this.mz];
      }
      if (danger && this.rnd() > this.L.miss) {
        // 進む向きに直角に逃げる（ピンの少ない方へ）
        const vx = at ? (path[Math.min(path.length - 1, path.indexOf(at) + 1)][0] - at[0]) : v.x, vz = at ? (path[Math.min(path.length - 1, path.indexOf(at) + 1)][1] - at[1]) : v.z;
        const l = Math.hypot(vx, vz) || 1; let px = -vz / l, pz = vx / l;
        const side = (me.x - at[0]) * px + (me.z - at[1]) * pz;
        if (side < 0) { px = -px; pz = -pz; }
        if (Math.abs(me.x + px) > C.LANE_HW - 0.4) { px = -px; pz = -pz; }
        this.go(lane, px, pz, 1);
      }
      return [this.mx, this.mz];
    }
    lineX(path, z) { for (const p of path) if (p[1] >= z) return p[0]; return 99; }
    // ピンにぶつからない向きを選んで動く
    go(lane, dx, dz, s) {
      const me = lane.me.b.position; const base = Math.atan2(dx, dz); let bestA = base, bestC = 1e9;
      for (const off of [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2]) {
        const a = base + off, ux = Math.sin(a), uz = Math.cos(a); let c = Math.abs(off) * 1.5;
        for (const q of lane.pins) {
          if (q.gone || q.down || q.b.isMe) continue; const qp = q.b.position;
          const rx = qp.x - me.x, rz = qp.z - me.z, f = rx * ux + rz * uz; if (f < 0 || f > 0.7) continue;
          const side = Math.abs(rx * uz - rz * ux); if (side < 0.36) c += 3;
        }
        if (c < bestC) { bestC = c; bestA = a; }
      }
      this.mx = Math.sin(bestA) * s; this.mz = Math.cos(bestA) * s;
    }
  }
  PB.Dodger = Dodger;
  // CPUがえらぶピン（うしろの方が多め）
  PB.cpuPick = function (lv, rnd) {
    rnd = rnd || Math.random; const L = PB.layout();
    const front = rnd() < (lv === 'hard' ? 0.45 : lv === 'normal' ? 0.3 : 0.15);   // ボーナスねらいで前に出ることも
    const pool = L.map((p, i) => [i, p[2]]).filter(([i, r]) => front ? (r >= 2 && r <= 9) : r >= (lv === 'easy' ? 3 : 8));
    return pool[Math.floor(rnd() * pool.length)][0];
  };
})();
