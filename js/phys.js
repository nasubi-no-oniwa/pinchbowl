// =============================================
//  ピンチボウル  物理（cannon-es）
//  1人ぶんのレーン（ピン100本・球・自分のピン）を動かす
//  画面がなくても動く（node でもテストできる）
// =============================================
(function () {
  const C = PB.C, K = (typeof CANNON !== 'undefined') ? CANNON : require('cannon-es');
  // ---- ピンのならび（100本）：三角形で10本まで広がって、9,10,9,10 と続き、最後が7本 ----
  PB.layout = function () {
    const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 10, 9, 10, 7], out = [];
    const dz = C.SP * Math.sqrt(3) / 2;
    rows.forEach((n, r) => { for (let j = 0; j < n; j++) out.push([(j - (n - 1) / 2) * C.SP, C.HEAD_Z + r * dz, r]); });
    return out;
  };
  PB.DECK_END = C.HEAD_Z + 14 * C.SP * Math.sqrt(3) / 2;
  // ピンの形（重心がからだの原点。高さ0〜1のピンで、重心は 0.38）
  const CM = 0.38;
  PB.PIN_CM = CM;
  const PIN_SPH = [[0.15, 0.12], [0.30, 0.155], [0.45, 0.115], [0.61, 0.07], [0.85, 0.085], [0.74, 0.07]];
  const RING = 4, RING_R = 0.055, RING_S = 0.03;
  function pinShape(b) {
    for (const [y, r] of PIN_SPH) b.addShape(new K.Sphere(r), new K.Vec3(0, y - CM, 0));
    for (let i = 0; i < RING; i++) { const a = i / RING * Math.PI * 2 + Math.PI / 4; b.addShape(new K.Sphere(RING_S), new K.Vec3(Math.cos(a) * RING_R, RING_S - CM, Math.sin(a) * RING_R)); }
  }
  const UP = new K.Vec3(0, 1, 0), tmp = new K.Vec3(), tmp2 = new K.Vec3();
  const G_FLOOR = 1, G_RAIL = 2, G_BALL = 4, G_PIN = 8;
  class Lane {
    constructor(opt = {}) {
      this.opt = opt;
      const w = this.w = new K.World({ gravity: new K.Vec3(0, -C.G, 0) });
      w.allowSleep = true; w.broadphase = new K.SAPBroadphase(w); w.solver.iterations = 10; w.defaultContactMaterial.friction = 0.3;
      const mMe = new K.Material('me'), mFloor = new K.Material('floor'), mPin = new K.Material('pin'), mBall = new K.Material('ball'), mRail = new K.Material('rail');
      this.mat = { mFloor, mPin, mBall, mRail, mMe };
      const cm = (a, b, f, r) => w.addContactMaterial(new K.ContactMaterial(a, b, { friction: f, restitution: r }));
      cm(mMe, mFloor, 0.0, 0.0); cm(mMe, mPin, 0.1, 0.2); cm(mMe, mRail, 0.0, 0.2); cm(mBall, mFloor, 0.04, 0.0); cm(mPin, mFloor, 0.35, 0.1); cm(mPin, mPin, 0.15, 0.45); cm(mBall, mPin, 0.08, 0.35); cm(mBall, mRail, 0.02, 0.72); cm(mPin, mRail, 0.1, 0.4);
      const floor = new K.Body({ mass: 0, material: mFloor, collisionFilterGroup: G_FLOOR }); floor.addShape(new K.Plane()); floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0); w.addBody(floor);
      // ガードレール（子供用のバンパー）
      const len = C.PIT_Z + 2;
      for (const s of [-1, 1]) {
        const r = new K.Body({ mass: 0, material: mRail, collisionFilterGroup: G_RAIL }); r.addShape(new K.Box(new K.Vec3(0.2, 0.45, len / 2))); r.position.set(s * (C.LANE_HW + 0.2), 0.45, len / 2 - 1.5); w.addBody(r);
      }
      // 奥のかべ
      const back = new K.Body({ mass: 0, material: mRail, collisionFilterGroup: G_RAIL }); back.addShape(new K.Box(new K.Vec3(C.LANE_HW + 1, 1.5, 0.2))); back.position.set(0, 1.5, C.PIT_Z + 1.2); w.addBody(back);
      // ピン
      this.pins = []; const L = PB.layout();
      this.meIdx = opt.me != null ? opt.me : 50;
      L.forEach(([x, z, row], i) => {
        const b = new K.Body({ mass: C.PIN_M, material: mPin, linearDamping: 0.05, angularDamping: 0.12, collisionFilterGroup: G_PIN, collisionFilterMask: G_FLOOR | G_RAIL | G_PIN });
        pinShape(b); b.position.set(x, CM, z); b.allowSleep = true; b.sleepSpeedLimit = 0.08; b.sleepTimeLimit = 0.25;
        b.pid = i; w.addBody(b); b.sleep();
        this.pins.push({ b, i, row, gone: false, down: false, hitT: -1, lastHit: -9 });
      });
      this.setMe(this.meIdx);
      let sd = (opt.seed || 12345) >>> 0; this.rnd = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      this.ball = null; this.t = 0; this.ev = []; this.blown = false; this.stopped = false; this.moveX = 0; this.moveZ = 0; this.lastBallV = 0;
      w.addEventListener('beginContact', e => this.contact(e.bodyA, e.bodyB));
    }
    setMe(i) {
      const old = this.pins[this.meIdx];
      if (old && old.b.isMe) { old.b.isMe = false; old.b.material = this.mat.mPin; old.b.fixedRotation = false; old.b.updateMassProperties(); old.b.allowSleep = true; }
      this.meIdx = i; const p = this.pins[i]; p.b.isMe = true; p.b.material = this.mat.mMe; p.b.fixedRotation = true; p.b.quaternion.set(0, 0, 0, 1); p.b.angularVelocity.set(0, 0, 0); p.b.updateMassProperties(); p.b.allowSleep = false; p.b.wakeUp();
      this.me = p;
    }
    // ---- 球を投げる ----  x：投げる位置 ang：向き（0がまっすぐ、＋は右） pow：速さ0〜1 spin：-1〜1
    throwBall(t) {
      const K2 = K; if (this.ball) this.w.removeBody(this.ball);
      const v = C.POW_MIN + (C.POW_MAX - C.POW_MIN) * Math.max(0, Math.min(1, t.pow));
      const b = new K2.Body({ mass: C.BALL_M, material: this.mat.mBall, linearDamping: 0.01, angularDamping: 0.01, collisionFilterGroup: G_BALL, collisionFilterMask: G_FLOOR | G_RAIL });
      b.addShape(new K2.Sphere(C.BALL_R)); b.position.set(Math.max(-C.LANE_HW + C.BALL_R, Math.min(C.LANE_HW - C.BALL_R, t.x)), C.BALL_R, 0.3);
      b.velocity.set(Math.sin(t.ang) * v, 0, Math.cos(t.ang) * v); b.angularVelocity.set(v / C.BALL_R * Math.cos(t.ang), 0, -v / C.BALL_R * Math.sin(t.ang));
      b.allowSleep = false; b.isBall = true; this.w.addBody(b); this.ball = b; this.spin = Math.max(-1, Math.min(1, t.spin || 0)) * C.SPIN_MAX;
      this.ballT = 0; this.ballOut = false; this.stopped = false; this.firstHit = false; this.ballIdle = 0; this.ev.push({ k: 'throw' });
    }
    ballV() { if (!this.ball) return 0; const v = this.ball.velocity; return Math.hypot(v.x, v.z); }
    stoppable() { return !!this.ball && !this.ballOut && !this.stopped && this.ballV() < C.STOP_V; }
    contact(a, b) {
      if (b.isBall || b.isMe) [a, b] = [b, a];
      if (a.isBall) { if (b.mass === 0 && Math.abs(b.position.x) > 1) this.ev.push({ k: 'rail', v: this.lastBallV }); return; }
      if (a.isMe && b.pid != null) { const rv = tmp; b.velocity.vsub(a.velocity, rv); if (rv.length() > 0.4) this.ev.push({ k: 'bump', v: rv.length(), x: b.position.x, z: b.position.z }); return; }
      if (a.pid != null && b.pid != null) { const rv = tmp; a.velocity.vsub(b.velocity, rv); const s = rv.length(); if (s > 0.8) this.ev.push({ k: 'pp', v: s, x: a.position.x, z: a.position.z }); }
    }
    // 球とピン：ぶつかり方を自分で決める（ピンは前に飛び、球は少しずつ遅くなる）
    ballPins() {
      const b = this.ball, bp = b.position, bv = b.velocity, R = C.BALL_R + 0.13;
      for (const p of this.pins) {
        if (p.gone) continue; const pb = p.b, pp = pb.position;
        if (Math.abs(pp.x - bp.x) > 1.4 || Math.abs(pp.z - bp.z) > 1.4) continue;
        if (this.t - p.lastHit < 0.22) continue;
        // ピンの軸（下から上）にいちばん近い点
        pb.quaternion.vmult(UP, tmp); const ax = tmp;
        const bx = pp.x - ax.x * PB.PIN_CM, by = pp.y - ax.y * PB.PIN_CM, bz = pp.z - ax.z * PB.PIN_CM;
        let u = (bp.x - bx) * ax.x + (bp.y - by) * ax.y + (bp.z - bz) * ax.z; u = Math.max(0, Math.min(1, u));
        const cx = bx + ax.x * u, cy = by + ax.y * u, cz = bz + ax.z * u;
        let nx = cx - bp.x, ny = cy - bp.y, nz = cz - bp.z; const d = Math.hypot(nx, ny, nz);
        const rr = pb.isMe ? C.BALL_R + 0.15 : R;
        if (d > rr) continue;
        let hl = Math.hypot(nx, nz); if (hl < 1e-4) { nx = 0; nz = 1; hl = 1; } nx /= hl; nz /= hl;
        const vn = bv.x * nx + bv.z * nz; if (vn < 0.3) continue;
        const sp = Math.hypot(bv.x, bv.z);
        if (pb.isMe) { this.lastBallV = sp; this.touchMe(); if (this.ballOut || this.blown) return; continue; }
        p.lastHit = this.t; pb.wakeUp();
        const lying = p.down || ax.y < 0.6;
        if (!lying) {
          const k = 1.55, r = () => (this.rnd() - 0.5);
          pb.velocity.set(pb.velocity.x + nx * vn * k + bv.x * 0.18 + r() * 0.8, pb.velocity.y + 1.2 + vn * 0.32, pb.velocity.z + nz * vn * k + bv.z * 0.18 + r() * 0.8);
          // 上が向こうに倒れる回転
          const w = vn * (2.2 + this.rnd() * 1.2);
          pb.angularVelocity.set(pb.angularVelocity.x + nz * w + r() * 4, pb.angularVelocity.y + r() * 10, pb.angularVelocity.z - nx * w + r() * 4);
          const loss = C.BALL_LOSS * (0.45 + 0.55 * vn / Math.max(1, sp));
          bv.x -= nx * vn * loss * 1.6; bv.z -= nz * vn * loss * 1.6; bv.x *= 1 - loss * 0.35; bv.z *= 1 - loss * 0.35;
          this.ev.push({ k: 'pin', v: sp, x: pp.x, z: pp.z, i: p.i });
          if (!this.firstHit) { this.firstHit = true; this.spin *= 0.35; }
          if (p.hitT < 0) p.hitT = this.t;
        } else {
          // 寝ているピンは横へはじく（球は少しだけ遅くなる）
          pb.velocity.set(pb.velocity.x + nx * vn * 0.9, pb.velocity.y + 0.6, pb.velocity.z + nz * vn * 0.9);
          pb.angularVelocity.y += (this.rnd() - 0.5) * 8;
          bv.x *= 0.985; bv.z *= 0.985; this.ev.push({ k: 'roll', v: sp, x: pp.x, z: pp.z });
        }
      }
    }
    touchMe() {
      if (this.blown || this.stopped || this.ballOut) return;
      const v = this.lastBallV;
      if (v < C.STOP_V) {   // 止めた！
        this.stopped = true; this.ev.push({ k: 'stop', v });
        const b = this.ball; b.velocity.set(0, 0, 0); b.angularVelocity.set(0, 0, 0); b.type = K.Body.STATIC; b.mass = 0; b.updateMassProperties();
        const m = this.me.b; const dx = b.position.x - m.position.x, dz = b.position.z - m.position.z, d = Math.hypot(dx, dz) || 1;
        b.position.set(m.position.x + dx / d * 0.42, C.BALL_R, m.position.z + dz / d * 0.42); this.ballOut = true; this.held = true;
      } else this.blow(v);
    }
    blow(v) {
      this.blown = true; this.ev.push({ k: 'blown', v });
      const m = this.me.b, bv = this.ball.velocity; m.fixedRotation = false; m.updateMassProperties();
      m.velocity.set(bv.x * 0.5 + (this.rnd() - 0.5) * 3, 10 + v * 0.25, bv.z * 0.5); m.angularVelocity.set((this.rnd() - 0.5) * 30, (this.rnd() - 0.5) * 10, (this.rnd() - 0.5) * 30); m.allowSleep = false;
    }
    setMove(x, z) { this.moveX = x; this.moveZ = z; }
    step(dt) {
      const n = Math.max(1, Math.round(dt / (1 / 120)));
      for (let i = 0; i < n; i++) this.sub(1 / 120);
    }
    sub(h) {
      this.t += h;
      // 自分のピンを歩かせる
      const m = this.me.b;
      if (!this.blown) {
        let mx = this.moveX, mz = this.moveZ; const l = Math.hypot(mx, mz); if (l > 1) { mx /= l; mz /= l; }
        const tx = mx * C.ME_V, tz = mz * C.ME_V, k = Math.min(1, h * 12);
        m.velocity.x += (tx - m.velocity.x) * k; m.velocity.z += (tz - m.velocity.z) * k;
        // レーンの外・ピンの場所よりうしろ・前に行きすぎない
        const lim = C.LANE_HW - 0.2;
        if (m.position.x < -lim) { m.position.x = -lim; m.velocity.x = Math.max(0, m.velocity.x); }
        if (m.position.x > lim) { m.position.x = lim; m.velocity.x = Math.min(0, m.velocity.x); }
        const zmin = C.HEAD_Z - 4, zmax = PB.DECK_END + 0.6;
        if (m.position.z < zmin) { m.position.z = zmin; m.velocity.z = Math.max(0, m.velocity.z); }
        if (m.position.z > zmax) { m.position.z = zmax; m.velocity.z = Math.min(0, m.velocity.z); }
        m.quaternion.set(0, 0, 0, 1);
      }
      // 球：曲がる（ゆかの油がうすくなる 6m あたりから）
      const b = this.ball;
      if (b && !this.ballOut) {
        this.ballT += h;
        const v = b.velocity, sp = Math.hypot(v.x, v.z);
        this.lastBallV = sp;
        if (sp > 0.5 && b.position.z > 5 && Math.abs(this.spin) > 0.01) {
          const f = this.spin * Math.min(1, (b.position.z - 5) / 4) * h;
          v.x += (v.z / sp) * f; v.z -= (v.x / sp) * f;
        }
        if (b.position.z > C.PIT_Z || b.position.y < -2) { this.ballOut = true; this.ev.push({ k: 'pit' }); this.w.removeBody(b); }
        if (sp < 0.25) this.ballIdle += h; else this.ballIdle = 0;
        if (this.ballIdle > 0.6) this.ballOut = true;
      }
      if (b && !this.ballOut) this.ballPins();
      this.w.step(h);
      // 落ちた・奥に飛んだピン
      for (const p of this.pins) {
        if (p.gone) continue;
        const pb = p.b;
        if (!pb.isMe && (pb.position.z > C.PIT_Z + 0.5 || pb.position.y < -3 || Math.abs(pb.position.x) > C.LANE_HW + 3)) { p.gone = true; p.down = true; this.w.removeBody(pb); continue; }
        if (!p.down && !pb.isMe) { pb.quaternion.vmult(UP, tmp); if (tmp.y < 0.6) { p.down = true; this.ev.push({ k: 'down', i: p.i }); } }
      }
    }
    standing() { let n = 0; for (const p of this.pins) if (!p.gone && !p.down && !(p.b.isMe && this.blown)) n++; return n; }
    // すべてが止まったか
    settled() {
      if (this.ball && !this.ballOut) return false;
      for (const p of this.pins) if (!p.gone && p.b.sleepState !== K.Body.SLEEPING && !p.b.isMe) { const v = p.b.velocity, w = p.b.angularVelocity; if (v.lengthSquared() + w.lengthSquared() * 0.05 > 0.01) return false; }
      return true;
    }
    // 投げ終わったあと：倒れたピンをかたづける（ピンセッター）
    sweep() {
      if (this.ball) { this.w.removeBody(this.ball); this.ball = null; }
      this.held = false; this.ballOut = false; this.stopped = false;
      for (const p of this.pins) {
        if (p.gone) continue;
        if (p.down) { p.gone = true; this.w.removeBody(p.b); continue; }
        if (!p.b.isMe) { p.b.velocity.set(0, 0, 0); p.b.angularVelocity.set(0, 0, 0); p.b.sleep(); }
        p.hitT = -1;
      }
      this.me.b.velocity.set(0, 0, 0);
    }
    // 画面にわたす形（オンラインで送る形と同じ）
    view() {
      const pins = this.pins.map(p => p.gone ? null : [p.b.position.x, p.b.position.y, p.b.position.z, p.b.quaternion.x, p.b.quaternion.y, p.b.quaternion.z, p.b.quaternion.w]);
      const b = this.ball, ball = b ? [b.position.x, b.position.y, b.position.z, b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w] : null;
      return { pins, ball, me: this.meIdx, stoppable: this.stoppable(), held: !!this.held, blown: this.blown, bv: this.ballV(), out: this.ballOut };
    }
    takeEv() { const e = this.ev; this.ev = []; return e; }
  }
  PB.Lane = Lane;
  PB.CANNON = K;
})();
