// =============================================
//  ピンチボウル  あいことば対戦（Firebase Realtime Database）
//  ・よける人の画面がそのレーンを動かして、ようすを送る（1秒に12回）
//  ・投げる人は「どこから・どう投げたか」だけを送る
//
//  データの形： pinchbowl/{あいことば}/
//    players/{0|1} : { id, name, col, hat }     watchers/{id} : { name }     ready/{0|1} : 何試合目をやりたいか
//    game          : { m:試合, seed, over }    0番の人が書く
//    pk/{m}/{0|1}  : えらんだピン
//    aim/{0|1}     : "m,k,x"   投げる前の位置
//    th/{m}/{k}    : { x, ang, pow, spin }
//    st/{0|1}      : レーンのようす（文字列）
//    res/{m}/{k}   : { n:のこり, down, blown, stop }
// =============================================
(function () {
  const clean = s => String(s || '').replace(/[.#$\[\]\/\s]/g, '').slice(0, 20);
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const q = v => Math.round(v * 100);
  class Room {
    constructor(db, code, name, cb, look) {
      this.db = db; this.code = clean(code); this.name = (String(name || '').trim().slice(0, 8)) || 'ななし'; this.cb = cb || {};
      this.look = { col: (look && look.col) | 0, hat: (look && look.hat) | 0 };
      this.id = uid(); this.slot = -1; this.watching = false; this.players = {}; this.ready = {}; this.game = null; this.subs = []; this.ms = []; this.left = false;
      this.root = db.ref('pinchbowl/' + this.code); this.evq = []; this.lastSt = 0; this.lastAim = 0;
    }
    call(n, ...a) { if (this.cb[n]) this.cb[n](...a); }
    on(ref, ev, fn, list) { ref.on(ev, fn); (list || this.subs).push([ref, ev, fn]); }
    async join() {
      if (!this.code) throw new Error('あいことばを入れてください');
      for (const s of [0, 1]) {
        const res = await this.root.child('players/' + s).transaction(cur => (cur ? undefined : { id: this.id, name: this.name, col: this.look.col, hat: this.look.hat }));
        if (res.committed && res.snapshot.val() && res.snapshot.val().id === this.id) { this.slot = s; break; }
      }
      if (this.slot < 0) {
        const w = (await this.root.child('watchers').once('value')).val() || {};
        if (Object.keys(w).length >= 10) throw new Error('この部屋は観戦の人でいっぱいです（10人まで）');
        this.watching = true; const me = this.root.child('watchers/' + this.id); await me.set({ name: this.name }); me.onDisconnect().remove();
      } else {
        for (const k of ['players/', 'ready/', 'st/', 'aim/']) this.root.child(k + this.slot).onDisconnect().remove();
        const g0 = (await this.root.child('game').once('value')).val(); this.joinM = ((g0 && g0.m) || 0) + 1;
        const other = (await this.root.child('players/' + (1 - this.slot)).once('value')).val();
        if (!other) { for (const k of ['game', 'ready', 'pk', 'th', 'res', 'st', 'aim']) await this.root.child(k).remove(); this.joinM = 1; }
        else if (g0 && !g0.over) await this.root.child('game').set(Object.assign({}, g0, { over: 1 }));
      }
      this.on(this.root.child('players'), 'value', snap => {
        const prev = this.players; this.players = snap.val() || {}; this.call('onPeople', this.people());
        if (!this.watching && prev[1 - this.slot] && !this.players[1 - this.slot]) {
          if (this.game && !this.game.over) this.root.child('game').set(Object.assign({}, this.game, { over: 1, gone: 1 }));
          this.call('onLeft');
        } else if (this.watching && ((prev[0] && !this.players[0]) || (prev[1] && !this.players[1]))) this.call('onLeft');
        this.tryStart();
      });
      this.on(this.root.child('ready'), 'value', snap => { this.ready = snap.val() || {}; this.tryStart(); });
      this.on(this.root.child('game'), 'value', snap => this.onGame(snap.val()));
      for (const s of [0, 1]) {
        if (s === this.slot) continue;
        this.on(this.root.child('st/' + s), 'value', snap => { const v = snap.val(); if (v) { const d = Room.decode(v); if (d) this.call('onState', s, d); } });
        this.on(this.root.child('aim/' + s), 'value', snap => { const v = snap.val(); if (!v || !this.game) return; const [m, k, x, bx, bz, ba] = String(v).split(',').map(Number); if (m === this.game.m) this.call('onAim', k, x / 100, isNaN(bx) ? null : { x: bx / 100, z: bz / 100, a: ba / 100 }); });
      }
      if (this.slot >= 0) await this.root.child('ready/' + this.slot).set(this.joinM);
      return { slot: this.slot, code: this.code, watching: this.watching };
    }
    people() { return { names: [0, 1].map(s => (this.players[s] ? this.players[s].name : null)), looks: [0, 1].map(s => ({ col: (this.players[s] && this.players[s].col) | 0, hat: (this.players[s] && this.players[s].hat) | 0 })), slot: this.slot, watching: this.watching }; }
    tryStart() {
      if (this.slot !== 0 || this.left || !this.joinM) return;
      const r = this.ready || {}, next = (this.game && this.game.m ? this.game.m : 0) + 1;
      if (!this.players[0] || !this.players[1]) return;
      if (!(r[0] >= next && r[1] >= next) || this.starting === next) return;
      if (this.game && !this.game.over && this.game.m) return;
      this.starting = next;
      // 前の試合のかたづけ
      for (const k of ['pk', 'th', 'res']) this.root.child(k).remove();
      this.root.child('game').set({ m: next, seed: (Math.random() * 1e9) | 0 });
    }
    onGame(g) {
      if (this.left) return;
      this.game = g; if (!g) return;
      if (!this.watching && g.m < (this.joinM || 0)) return;
      const k = g.m + (g.over ? 'x' : ''); if (this.gk === k) return; this.gk = k;
      for (const [ref, ev, fn] of this.ms) ref.off(ev, fn); this.ms = [];
      if (g.over) { this.call('onOver', { m: g.m, gone: !!g.gone }); return; }
      const p = this.people();
      this.call('onMatch', { m: g.m, seed: g.seed, slot: this.slot, names: p.names, looks: p.looks });
      this.on(this.root.child('pk/' + g.m), 'value', snap => { const v = snap.val() || {}; for (const s of [0, 1]) if (v[s] != null) this.call('onPick', s, v[s]); }, this.ms);
      this.on(this.root.child('th/' + g.m), 'child_added', snap => { const v = snap.val(); if (v) this.call('onThrow', +snap.key, v); }, this.ms);
      this.on(this.root.child('res/' + g.m), 'child_added', snap => { const v = snap.val(); if (v) this.call('onRes', Object.assign({ k: +snap.key }, v)); }, this.ms);
    }
    // ---- 送る ----
    sendPick(i) { if (this.slot < 0 || !this.game) return; this.root.child('pk/' + this.game.m + '/' + this.slot).set(i); }
    sendAim(k, x, thrown, bm) {
      if (this.slot < 0 || !this.game || thrown) return; const n = Date.now(); if (n - this.lastAim < 120) return;
      const v = this.game.m + ',' + k + ',' + q(x) + (bm ? ',' + q(bm.x) + ',' + q(bm.z) + ',' + q(bm.a) : ''); if (v === this.lastAimV) return; this.lastAim = n; this.lastAimV = v; this.root.child('aim/' + this.slot).set(v);
    }
    sendThrow(k, t) { if (this.slot < 0 || !this.game) return; this.root.child('th/' + this.game.m + '/' + k).set({ x: Math.round(t.x * 1000) / 1000, ang: Math.round(t.ang * 10000) / 10000, pow: Math.round(t.pow * 1000) / 1000, spin: Math.round(t.spin * 1000) / 1000, bm: t.bm ? { x: Math.round(t.bm.x * 100) / 100, z: Math.round(t.bm.z * 100) / 100, a: Math.round(t.bm.a * 100) / 100 } : null }); }
    sendRes(r) { if (this.slot < 0 || !this.game) return; this.root.child('res/' + this.game.m + '/' + r.k).set({ n: r.n, down: r.down, blown: r.blown ? 1 : 0, stop: r.stop ? 1 : 0 }); }
    queueEv(evs) { for (const e of evs) if (e.k !== 'down' && e.k !== 'pp') this.evq.push(e); else if (e.k === 'pp' && Math.random() < 0.3) this.evq.push(e); if (this.evq.length > 12) this.evq.splice(0, this.evq.length - 12); }
    sendState(L, ph, k, force) {
      if (this.slot < 0 || !this.game || this.left) return;
      const n = Date.now(), gap = ph === 'roll' ? 80 : 160;
      if (!force && n - this.lastSt < gap) return; this.lastSt = n;
      this.root.child('st/' + this.slot).set(Room.encode(L.view(), ph, k, this.game.m, this.evq)); this.evq = [];
    }
    finish() { if (this.slot === 0 && this.game && !this.game.over) this.root.child('game').set(Object.assign({}, this.game, { over: 1 })); }
    rematch() { if (this.slot >= 0 && this.game) this.root.child('ready/' + this.slot).set(this.game.m + 1); }
    leave() {
      if (this.left) return; this.left = true;
      for (const [ref, ev, fn] of this.subs.concat(this.ms)) ref.off(ev, fn); this.subs = []; this.ms = [];
      if (this.watching) this.root.child('watchers/' + this.id).remove();
      else if (this.slot >= 0) for (const k of ['players/', 'ready/', 'st/', 'aim/']) this.root.child(k + this.slot).remove();
    }
    // レーンのようす ⇔ 文字列
    static encode(v, ph, k, m, evq) {
      const pins = v.pins.map(p => p ? p.map(q).join(',') : '').join(';');
      const b = v.ball ? v.ball.map(q).join(',') : '';
      const fl = (v.stoppable ? 1 : 0) | (v.held ? 2 : 0) | (v.blown ? 4 : 0) | (v.out ? 8 : 0);
      const ev = (evq || []).map(e => [e.k, q(e.v || 0), q(e.x || 0), q(e.z || 0)].join(',')).join(';');
      return [m, k, ph, v.me, fl, q(v.bv), b, ev, pins, v.bm ? [q(v.bm.x), q(v.bm.z), q(v.bm.a)].join(',') : '', v.self | 0].join('|');
    }
    static decode(s) {
      try {
        const a = String(s).split('|'); if (a.length < 9) return null;
        const num = t => t.split(',').map(x => +x / 100);
        const fl = +a[4];
        return {
          m: +a[0], k: +a[1], ph: a[2], me: +a[3], stoppable: !!(fl & 1), held: !!(fl & 2), blown: !!(fl & 4), out: !!(fl & 8), bv: +a[5] / 100,
          ball: a[6] ? num(a[6]) : null,
          ev: a[7] ? a[7].split(';').map(t => { const [k, v, x, z] = t.split(','); return { k, v: +v / 100, x: +x / 100, z: +z / 100 }; }) : [],
          pins: a[8].split(';').map(t => (t ? num(t) : null)),
          bm: a[9] ? (([x, z, an]) => ({ x, z, a: an }))(num(a[9])) : null, self: +(a[10] || 0),
        };
      } catch (e) { return null; }
    }
  }
  PB.Room = Room; PB.cleanCode = clean;
})();
