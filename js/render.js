// =============================================
//  ピンチボウル  画面（three.js）
//  ・ふつうのピンは InstancedMesh（1回でまとめて描く）
//  ・自分のピンだけ、色とかざりと表情がつく
// =============================================
(function () {
  const C = PB.C, T = THREE;
  const R = PB.R = {};
  const lo = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  R.lo = lo;
  PB.COLORS = [
    { name: 'あか', c: '#ff4d6d', d: '#b3123a' }, { name: 'あお', c: '#3aa0ff', d: '#1554a8' }, { name: 'みどり', c: '#3ad17a', d: '#13804a' },
    { name: 'きいろ', c: '#ffc93a', d: '#b7820a' }, { name: 'むらさき', c: '#a76bff', d: '#5b2bb0' }, { name: 'ピンク', c: '#ff7ad9', d: '#b52a8c' },
  ];
  PB.HATS = [
    { k: 'party', name: 'パーティ' }, { k: 'ribbon', name: 'リボン' }, { k: 'crown', name: 'おうかん' },
    { k: 'cap', name: 'ぼうし' }, { k: 'glasses', name: 'めがね' }, { k: 'band', name: 'はちまき' },
  ];
  // ---------- テクスチャ ----------
  function cv(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; }
  // ピンのもよう：u（まわり）、v（高さ）。u=0.5 がボウラーのほう（顔）
  const tint = (hex, k) => { const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; const m = c => Math.round(c + (255 - c) * k); return `rgb(${m(r)},${m(g)},${m(b)})`; };
  function pinTex(col, face, body) {
    return cv(512, 512, (g, W, H) => {
      const grd = g.createLinearGradient(0, 0, W, 0);
      if (body) { grd.addColorStop(0, tint(body, 0.35)); grd.addColorStop(0.5, tint(body, 0.62)); grd.addColorStop(1, tint(body, 0.35)); }
      else { grd.addColorStop(0, '#e9e4dc'); grd.addColorStop(0.5, '#ffffff'); grd.addColorStop(1, '#e9e4dc'); }
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      const y = v => (1 - v) * H;
      g.fillStyle = col || '#d81e2c';
      g.fillRect(0, y(0.665), W, (0.665 - 0.635) * H); g.fillRect(0, y(0.715), W, (0.715 - 0.69) * H);
      const ex = W * 0.5, s = W * 0.034;
      if (face === 'x') {
        g.strokeStyle = '#222'; g.lineWidth = s * 0.45; g.lineCap = 'round';
        for (const dx of [-1, 1]) { const cx = ex + dx * s * 1.7, cy = y(0.83); g.beginPath(); g.moveTo(cx - s * 0.7, cy - s * 0.7); g.lineTo(cx + s * 0.7, cy + s * 0.7); g.moveTo(cx + s * 0.7, cy - s * 0.7); g.lineTo(cx - s * 0.7, cy + s * 0.7); g.stroke(); }
        return;
      }
      const big = face === 'me' || face === 'scared' || face === 'happy';
      const er = big ? s * 1.05 : s * 0.75;
      for (const dx of [-1, 1]) {
        const cx = ex + dx * s * 1.75, cy = y(0.835);
        if (face === 'happy') { g.strokeStyle = '#2a1a1a'; g.lineWidth = s * 0.5; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy + er * 0.3, er * 0.8, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); continue; }
        g.fillStyle = '#231815'; g.beginPath(); g.ellipse(cx, cy, er * 0.82, er * (face === 'scared' ? 1.25 : 1.05), 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(cx - er * 0.25, cy - er * 0.35, er * 0.32, 0, Math.PI * 2); g.fill();
        if (big) { g.beginPath(); g.arc(cx + er * 0.25, cy + er * 0.3, er * 0.14, 0, Math.PI * 2); g.fill(); }
      }
      // ほっぺ
      if (big) { g.fillStyle = 'rgba(255,120,140,0.55)'; for (const dx of [-1, 1]) { g.beginPath(); g.ellipse(ex + dx * s * 3.1, y(0.795), s * 0.75, s * 0.42, 0, 0, Math.PI * 2); g.fill(); } }
      // くち
      g.strokeStyle = '#3a1a1a'; g.lineWidth = s * 0.32; g.lineCap = 'round'; g.beginPath();
      if (face === 'scared') { g.fillStyle = '#3a1a1a'; g.ellipse(ex, y(0.785), s * 0.55, s * 0.75, 0, 0, Math.PI * 2); g.fill(); }
      else if (face === 'happy') { g.fillStyle = '#c0283c'; g.arc(ex, y(0.80), s * 0.9, 0, Math.PI); g.fill(); }
      else { g.arc(ex, y(0.80), s * 0.55, 0.2, Math.PI - 0.2); g.stroke(); }
    });
  }
  function woodTex() {
    return cv(512, 2048, (g, W, H) => {
      const boards = 20, bw = W / boards;
      for (let i = 0; i < boards; i++) {
        const l = 70 + ((i * 37) % 11) - 5; g.fillStyle = `hsl(32,${52 + (i % 3) * 4}%,${l}%)`; g.fillRect(i * bw, 0, bw, H);
        for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(120,70,30,${0.03 + Math.random() * 0.05})`; g.fillRect(i * bw + Math.random() * bw, Math.random() * H, 1 + Math.random() * 2, 40 + Math.random() * 300); }
        g.fillStyle = 'rgba(90,50,20,0.35)'; g.fillRect(i * bw, 0, 1.5, H);
      }
    });
  }
  function ballTex(col, dark) {
    return cv(512, 256, (g, W, H) => {
      g.fillStyle = col; g.fillRect(0, 0, W, H);
      // マーブルもよう
      for (let k = 0; k < 26; k++) {
        g.strokeStyle = k % 2 ? dark : 'rgba(255,255,255,0.35)'; g.lineWidth = 6 + Math.random() * 14; g.globalAlpha = 0.55;
        g.beginPath(); let x = Math.random() * W, y = Math.random() * H; g.moveTo(x, y);
        for (let j = 0; j < 6; j++) { x += (Math.random() - 0.3) * 120; y += (Math.random() - 0.5) * 70; g.quadraticCurveTo(x - 30, y + 40, x, y); }
        g.stroke();
      }
      g.globalAlpha = 1;
      // 指の穴
      g.fillStyle = '#111';
      for (const [x, y, r] of [[0.25, 0.32, 13], [0.31, 0.32, 13], [0.28, 0.48, 16]]) { g.beginPath(); g.ellipse(x * W, y * H, r, r * 1.6, 0, 0, Math.PI * 2); g.fill(); }
    });
  }
  function textTex(txt, opt = {}) {
    const fs = opt.fs || 96, W = opt.w || 1024, H = opt.h || 192;
    return cv(W, H, (g) => {
      g.font = `${opt.weight || 900} ${fs}px "Dela Gothic One","M PLUS Rounded 1c",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      if (opt.glow) { g.shadowColor = opt.glow; g.shadowBlur = fs * 0.35; }
      g.lineWidth = fs * 0.12; g.strokeStyle = opt.stroke || 'rgba(0,0,0,0)'; if (opt.stroke) g.strokeText(txt, W / 2, H / 2);
      g.fillStyle = opt.color || '#fff'; g.fillText(txt, W / 2, H / 2); if (opt.glow) g.fillText(txt, W / 2, H / 2);
    });
  }
  function glowTex(col) {
    return cv(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, col); r.addColorStop(0.35, col.replace('1)', '0.5)')); r.addColorStop(1, col.replace('1)', '0)')); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  }
  // ---------- ピンの形 ----------
  function pinGeo() {
    const P = [[0, 0], [0.066, 0], [0.085, 0.03], [0.118, 0.1], [0.146, 0.2], [0.156, 0.3], [0.146, 0.4], [0.118, 0.5], [0.085, 0.58], [0.064, 0.64], [0.062, 0.7], [0.074, 0.76], [0.086, 0.83], [0.082, 0.9], [0.062, 0.96], [0.03, 0.992], [0, 1]];
    const pts = []; const cur = new T.SplineCurve(P.map(p => new T.Vector2(p[0], p[1])));
    for (let i = 0; i <= 40; i++) { const p = cur.getPoint(i / 40); pts.push(new T.Vector2(Math.max(0, p.x), p.y)); }
    pts[0].x = 0; pts[pts.length - 1].x = 0;
    const g = new T.LatheGeometry(pts, lo ? 18 : 28);
    const pos = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setY(i, pos.getY(i));
    g.translate(0, -PB.PIN_CM, 0); g.computeVertexNormals();
    return g;
  }
  // ---------- かざり ----------
  function hatMesh(k, col) {
    const g = new T.Group(), m = c => new T.MeshStandardMaterial({ color: c, roughness: 0.5 });
    const top = 1 - PB.PIN_CM;
    if (k === 'party') { const c = new T.Mesh(new T.ConeGeometry(0.075, 0.24, 16), m(col)); c.position.y = top + 0.08; c.rotation.z = 0.15; const b = new T.Mesh(new T.SphereGeometry(0.03, 10, 8), m('#ffffff')); b.position.set(-0.018, top + 0.2, 0); g.add(c, b); }
    if (k === 'ribbon') { for (const s of [-1, 1]) { const r = new T.Mesh(new T.ConeGeometry(0.06, 0.11, 12), m(col)); r.rotation.z = s * Math.PI / 2; r.position.set(s * 0.06, top - 0.01, 0.0); g.add(r); } const k2 = new T.Mesh(new T.SphereGeometry(0.03, 10, 8), m(col)); k2.position.y = top - 0.01; g.add(k2); g.rotation.x = 0.4; }
    if (k === 'crown') { const c = new T.Mesh(new T.CylinderGeometry(0.075, 0.07, 0.08, 10, 1, true), new T.MeshStandardMaterial({ color: '#ffd23a', metalness: 0.6, roughness: 0.3, side: T.DoubleSide })); c.position.y = top - 0.01; g.add(c); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const s = new T.Mesh(new T.ConeGeometry(0.018, 0.05, 6), c.material); s.position.set(Math.sin(a) * 0.072, top + 0.05, Math.cos(a) * 0.072); g.add(s); } }
    if (k === 'cap') { const c = new T.Mesh(new T.SphereGeometry(0.088, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), m(col)); c.position.y = top - 0.06; const v = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.012, 16, 1, false, Math.PI * 0.6, Math.PI * 0.8), m(col)); v.position.set(0, top - 0.055, -0.04); g.add(c, v); }
    if (k === 'glasses') { const mm = new T.MeshStandardMaterial({ color: '#222', roughness: 0.3 }); for (const s of [-1, 1]) { const r = new T.Mesh(new T.TorusGeometry(0.03, 0.007, 6, 16), mm); r.position.set(s * 0.034, top - 0.165, -0.082); g.add(r); } const br = new T.Mesh(new T.BoxGeometry(0.02, 0.006, 0.006), mm); br.position.set(0, top - 0.165, -0.088); g.add(br); }
    if (k === 'band') { const b = new T.Mesh(new T.TorusGeometry(0.083, 0.014, 6, 20), m(col)); b.rotation.x = Math.PI / 2; b.position.y = top - 0.09; const t = new T.Mesh(new T.BoxGeometry(0.02, 0.07, 0.01), m(col)); t.position.set(0.02, top - 0.12, 0.085); t.rotation.z = 0.5; g.add(b, t); }
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  // ---------- 初期化 ----------
  R.init = function (el) {
    const ren = R.ren = new T.WebGLRenderer({ antialias: !lo, powerPreference: 'high-performance', preserveDrawingBuffer: !!window.__pvCap });
    ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, lo ? 1.5 : 2));
    ren.shadowMap.enabled = true; ren.shadowMap.type = (lo || window.__pvFast) ? T.PCFShadowMap : T.PCFSoftShadowMap;
    ren.outputColorSpace = T.SRGBColorSpace; ren.toneMapping = T.ACESFilmicToneMapping; ren.toneMappingExposure = 1.05;
    el.appendChild(ren.domElement);
    const sc = R.sc = new T.Scene(); sc.background = new T.Color('#160b26'); sc.fog = new T.Fog('#160b26', 30, 70);
    const cam = R.cam = new T.PerspectiveCamera(55, 1, 0.1, 200); cam.position.set(0, 3, -4);
    sc.add(new T.HemisphereLight('#e8e0ff', '#3a2a1a', 0.8));
    const sun = R.sun = new T.DirectionalLight('#fff1dc', 1.6); sun.position.set(-4, 18, 17); sun.target.position.set(0, 0, 23);
    sun.castShadow = true; const ss = lo ? 1024 : 2048; sun.shadow.mapSize.set(ss, ss);
    Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 14, bottom: -14, near: 1, far: 50 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
    sc.add(sun, sun.target);
    const fill = new T.PointLight('#ff7ad9', 18, 30, 1.6); fill.position.set(0, 5, 34); sc.add(fill);
    const rim = new T.DirectionalLight('#9fe8ff', 0.55); rim.position.set(3, 6, 40); rim.target.position.set(0, 0, 22); sc.add(rim, rim.target);
    const front = new T.DirectionalLight('#ffe2c4', 0.35); front.position.set(0, 5, 0); front.target.position.set(0, 0, 22); sc.add(front, front.target);
    buildAlley();
    // ピン
    R.pinGeo = pinGeo();
    R.pinMat = new T.MeshStandardMaterial({ map: pinTex('#d81e2c', 'n'), roughness: 0.32, metalness: 0.0 });
    R.inst = new T.InstancedMesh(R.pinGeo, R.pinMat, 100); R.inst.castShadow = true; R.inst.receiveShadow = true; R.inst.frustumCulled = false;
    sc.add(R.inst);
    // 自分のピン
    R.me = new T.Group(); R.meBody = new T.Mesh(R.pinGeo, new T.MeshStandardMaterial({ roughness: 0.3 })); R.meBody.castShadow = true; R.me.add(R.meBody); sc.add(R.me);
    R.meRing = new T.Mesh(new T.RingGeometry(0.24, 0.3, 32), new T.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: 0.85, depthWrite: false }));
    R.meRing.rotation.x = -Math.PI / 2; sc.add(R.meRing);
    R.meArrow = new T.Mesh(new T.ConeGeometry(0.12, 0.24, 4), new T.MeshBasicMaterial({ color: '#fff' })); R.meArrow.rotation.x = Math.PI; sc.add(R.meArrow);
    R.faceTex = {}; R.meTex = null;
    // 球
    R.ball = new T.Mesh(new T.SphereGeometry(C.BALL_R, 32, 20), new T.MeshStandardMaterial({ roughness: 0.18, metalness: 0.15 })); R.ball.castShadow = true; sc.add(R.ball);
    R.glowRed = glowTex('rgba(255,70,60,1)'); R.glowBlue = glowTex('rgba(80,200,255,1)');
    R.aura = new T.Sprite(new T.SpriteMaterial({ map: R.glowRed, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); R.aura.scale.set(1.6, 1.6, 1); sc.add(R.aura);
    R.okTag = new T.Sprite(new T.SpriteMaterial({ map: textTex('とめられる！', { color: '#bff1ff', stroke: '#0a3a6a', fs: 90 }), transparent: true, depthTest: false })); R.okTag.scale.set(3.0, 0.56, 1); R.okTag.renderOrder = 5; sc.add(R.okTag);
    // 球の通ったあと
    R.trailN = 40; R.trailPts = [];
    R.trail = new T.Mesh(new T.BufferGeometry(), new T.MeshBasicMaterial({ color: '#ff5a4a', transparent: true, opacity: 0.35, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending }));
    R.trail.geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(R.trailN * 2 * 3), 3));
    const idx = []; for (let i = 0; i < R.trailN - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } R.trail.geometry.setIndex(idx); R.trail.frustumCulled = false; sc.add(R.trail);
    // ねらい線
    const dots = []; for (let i = 0; i < 26; i++) dots.push(new T.Vector3());
    R.aimG = new T.Group(); R.aimDots = [];
    for (let i = 0; i < 26; i++) { const d = new T.Mesh(new T.CircleGeometry(0.07, 10), new T.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: 0.8 - i * 0.028, depthWrite: false })); d.rotation.x = -Math.PI / 2; R.aimG.add(d); R.aimDots.push(d); }
    sc.add(R.aimG); R.aimG.visible = false;
    // パーティクル（ピンのかけら・星）
    R.parts = []; R.partGeo = new T.SphereGeometry(0.04, 6, 4);
    R.mats = {};
    // 投げる人が置くバンパー
    const bstripe = cv(256, 32, (g, W, H) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#1a1a2e' : '#ffd23a'; g.fillRect(i * W / 8, 0, W / 8, H); } });
    R.bump = new T.Group();
    const bb = new T.Mesh(new T.BoxGeometry(C.BUMP_L, 0.8, 0.28), new T.MeshStandardMaterial({ map: bstripe, roughness: 0.45, transparent: true }));
    bb.position.y = 0.4; bb.castShadow = true; R.bump.add(bb); R.bumpMat = bb.material;
    const glow = new T.Mesh(new T.PlaneGeometry(C.BUMP_L + 0.6, 0.9), new T.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.25, depthWrite: false, blending: T.AdditiveBlending }));
    glow.rotation.x = -Math.PI / 2; glow.position.y = 0.01; R.bump.add(glow);
    R.bump.visible = false; sc.add(R.bump);
    // 前の列ボーナスの帯（ピンをえらぶときだけ）
    R.zones = new T.Group(); const dzr = C.SP * Math.sqrt(3) / 2;
    for (const [r0, r1, pt] of C.BONUS) {
      const z0 = C.HEAD_Z + r0 * dzr - 0.4, z1 = C.HEAD_Z + r1 * dzr + 0.4;
      const band = new T.Mesh(new T.PlaneGeometry(C.LANE_HW * 2, z1 - z0), new T.MeshBasicMaterial({ color: pt > 10 ? '#ff4fd8' : '#3af0ff', transparent: true, opacity: 0.16, depthWrite: false }));
      band.rotation.x = -Math.PI / 2; band.position.set(0, 0.012, (z0 + z1) / 2); R.zones.add(band);
      for (const sx of [-1, 1]) { const lab = new T.Sprite(new T.SpriteMaterial({ map: textTex('+' + pt, { color: '#fff', glow: pt > 10 ? '#ff4fd8' : '#3af0ff', fs: 130, w: 256, h: 192 }), transparent: true, depthTest: false })); lab.scale.set(1.9, 1.4, 1); lab.position.set(sx * (C.LANE_HW - 1.2), 0.8, (z0 + z1) / 2); lab.renderOrder = 6; R.zones.add(lab); }
    }
    R.zones.visible = false; sc.add(R.zones);
    window.addEventListener('resize', R.resize); R.resize();
    R.camT = { pos: new T.Vector3(0, 3, -4), look: new T.Vector3(0, 0, 10) }; R.camLook = new T.Vector3(0, 0, 10);
    R.shake = 0; R.dummy = new T.Object3D(); R.hidden = new T.Matrix4().makeScale(0, 0, 0);
  };
  R.resize = function () {
    const w = window.innerWidth, h = window.innerHeight; R.ren.setSize(w, h); R.cam.aspect = w / h;
    R.baseFov = w / h < 1 ? 72 : 55; R.cam.fov = R.baseFov * (R.zoom || 1); R.cam.updateProjectionMatrix();
  };
  // ---------- ボウリング場 ----------
  function buildAlley() {
    const sc = R.sc;
    const wood = woodTex(); wood.wrapS = wood.wrapT = T.RepeatWrapping; wood.repeat.set(1, 3);
    const laneW = C.LANE_HW * 2, len = C.PIT_Z + 6;
    const lane = new T.Mesh(new T.PlaneGeometry(laneW, len), new T.MeshStandardMaterial({ map: wood, roughness: 0.25, metalness: 0.05 }));
    lane.rotation.x = -Math.PI / 2; lane.position.set(0, 0, len / 2 - 4); lane.receiveShadow = true; sc.add(lane);
    // しるし（矢印・点・ファウルライン）
    const mk = new T.MeshBasicMaterial({ color: '#7a3a14', transparent: true, opacity: 0.75 });
    for (let i = -3; i <= 3; i++) { const a = new T.Mesh(new T.CircleGeometry(0.16, 3), mk); a.rotation.x = -Math.PI / 2; a.rotation.z = Math.PI / 2; a.position.set(i * 1.2, 0.005, 6 + Math.abs(i) * 0.6); sc.add(a); }
    for (let i = -4; i <= 4; i++) { const a = new T.Mesh(new T.CircleGeometry(0.05, 10), mk); a.rotation.x = -Math.PI / 2; a.position.set(i * 1.0, 0.005, 2.2); sc.add(a); }
    const fl = new T.Mesh(new T.PlaneGeometry(laneW, 0.08), new T.MeshBasicMaterial({ color: '#c0283c' })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.006, 0); sc.add(fl);
    // ピンの場所の点
    const spot = new T.MeshBasicMaterial({ color: '#8a4a20', transparent: true, opacity: 0.4 });
    for (const [x, z] of PB.layout()) { const s = new T.Mesh(new T.CircleGeometry(0.08, 10), spot); s.rotation.x = -Math.PI / 2; s.position.set(x, 0.004, z); sc.add(s); }
    // ガードレール（子供用のバンパー：しましま）
    const stripe = cv(64, 512, (g, W, H) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#ff4d6d'; g.fillRect(0, i * H / 16, W, H / 16); } });
    stripe.wrapT = T.RepeatWrapping; stripe.repeat.set(1, 6);
    const railLen = C.PIT_Z + 2;
    for (const s of [-1, 1]) {
      const r = new T.Mesh(new T.CapsuleGeometry(0.2, railLen, 4, 12), new T.MeshStandardMaterial({ map: stripe, roughness: 0.4 }));
      r.rotation.x = Math.PI / 2; r.position.set(s * (C.LANE_HW + 0.2), 0.42, railLen / 2 - 1.5); r.castShadow = true; r.receiveShadow = true; sc.add(r);
      for (let z = 0; z < railLen; z += 3) { const p = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.42, 8), new T.MeshStandardMaterial({ color: '#d6d6e0', metalness: 0.6, roughness: 0.3 })); p.position.set(s * (C.LANE_HW + 0.2), 0.21, z - 1.2); sc.add(p); }
      // みぞとかべ
      const gut = new T.Mesh(new T.PlaneGeometry(1.4, len), new T.MeshStandardMaterial({ color: '#20203a', roughness: 0.6 })); gut.rotation.x = -Math.PI / 2; gut.position.set(s * (C.LANE_HW + 0.9), -0.02, len / 2 - 4); gut.receiveShadow = true; sc.add(gut);
    }
    // 奥（ピット・マスキング）
    const pit = new T.Mesh(new T.PlaneGeometry(laneW + 3, 3), new T.MeshStandardMaterial({ color: '#0c0614' })); pit.rotation.x = -Math.PI / 2; pit.position.set(0, -0.3, C.PIT_Z + 0.7); sc.add(pit);
    const back = new T.Mesh(new T.PlaneGeometry(laneW + 3, 3), new T.MeshStandardMaterial({ color: '#1c0f2e', roughness: 0.9 })); back.position.set(0, 1.2, C.PIT_Z + 1.4); back.rotation.y = Math.PI; sc.add(back);
    const mask = new T.Mesh(new T.BoxGeometry(laneW + 3, 2.4, 0.3), new T.MeshStandardMaterial({ color: '#2a1550', roughness: 0.8 })); mask.position.set(0, 3.9, C.PIT_Z + 0.4); sc.add(mask);
    const sign = new T.Mesh(new T.PlaneGeometry(9, 1.7), new T.MeshBasicMaterial({ map: textTex('ピンチボウル', { color: '#fff4fb', glow: '#ff4fd8', fs: 120, w: 1024, h: 200 }), transparent: true }));
    sign.position.set(0, 3.95, C.PIT_Z + 0.2); sign.rotation.y = Math.PI; sc.add(sign); R.sign = sign;
    // ネオンの線
    for (const [y, c] of [[2.65, '#3af0ff'], [5.15, '#ff4fd8']]) { const n = new T.Mesh(new T.BoxGeometry(laneW + 3, 0.06, 0.06), new T.MeshBasicMaterial({ color: c })); n.position.set(0, y, C.PIT_Z + 0.2); sc.add(n); }
    // となりのレーン（かざり）
    const nb = new T.MeshStandardMaterial({ map: wood, roughness: 0.35, color: '#c8b8a8' });
    const smallPin = new T.MeshStandardMaterial({ map: pinTex('#d81e2c', 'n'), roughness: 0.35 });
    const g10 = pinGeo();
    for (const s of [-1, 1]) for (const k of [1, 2]) {
      const cx = s * (laneW + 3.4) * k;
      const l = new T.Mesh(new T.PlaneGeometry(laneW * 0.55, len), nb); l.rotation.x = -Math.PI / 2; l.position.set(cx, -0.01, len / 2 - 4); l.receiveShadow = true; sc.add(l);
      const im = new T.InstancedMesh(g10, smallPin, 10); const d = new T.Object3D(); let n = 0;
      for (let r = 0; r < 4; r++) for (let j = 0; j <= r; j++) { d.position.set(cx + (j - r / 2) * 0.62, PB.PIN_CM, C.HEAD_Z + 6 + r * 0.54); d.updateMatrix(); im.setMatrixAt(n++, d.matrix); }
      sc.add(im);
      const ms = new T.Mesh(new T.BoxGeometry(laneW * 0.6 + 2, 2.4, 0.3), new T.MeshStandardMaterial({ color: k === 1 ? '#3a1d66' : '#22124a' })); ms.position.set(cx, 3.9, C.PIT_Z + 0.4); sc.add(ms);
      const pc = ['#3af0ff', '#ffd23a', '#7dff8a', '#ff7a3a'][(s + 1) + k - 1];
      const nl = new T.Mesh(new T.BoxGeometry(laneW * 0.6 + 2, 0.06, 0.06), new T.MeshBasicMaterial({ color: pc })); nl.position.set(cx, 2.65, C.PIT_Z + 0.2); sc.add(nl);
    }
    // 天井のライト
    for (let z = 2; z < C.PIT_Z; z += 6) { const l = new T.Mesh(new T.PlaneGeometry(laneW * 0.8, 0.4), new T.MeshBasicMaterial({ color: '#fff6e8' })); l.rotation.x = Math.PI / 2; l.position.set(0, 7.5, z); sc.add(l); }
    // 手前のゆか（投げる場所）
    const app = new T.Mesh(new T.PlaneGeometry(laneW + 30, 8), new T.MeshStandardMaterial({ color: '#2b1b3d', roughness: 0.8 })); app.rotation.x = -Math.PI / 2; app.position.set(0, -0.005, -4.0); app.receiveShadow = true; sc.add(app);
    // まわりの暗いかべ（遠くのネオンの点）
    const dots = new T.BufferGeometry(); const dp = []; for (let i = 0; i < 300; i++) dp.push((Math.random() - 0.5) * 120, 4 + Math.random() * 14, 36 + Math.random() * 10);
    dots.setAttribute('position', new T.Float32BufferAttribute(dp, 3)); sc.add(new T.Points(dots, new T.PointsMaterial({ color: '#ff9af0', size: 0.15, transparent: true, opacity: 0.6 })));
  }
  // ---------- 見た目のせってい ----------
  R.setLook = function (look) {  // look: {col, hat, ball}
    R.look = look; const col = PB.COLORS[look.col] || PB.COLORS[0];
    const key = look.col + '_';
    for (const f of ['me', 'scared', 'happy', 'x']) { R.faceTex[f] && R.faceTex[f].dispose(); R.faceTex[f] = pinTex(col.d, f, col.c); }
    R.meBody.material.map = R.faceTex.me; R.meBody.material.needsUpdate = true; R.meFace = 'me';
    if (R.hat) R.me.remove(R.hat); R.hat = hatMesh((PB.HATS[look.hat] || PB.HATS[0]).k, col.c); R.me.add(R.hat);
    R.meRing.material.color.set(col.c); R.meArrow.material.color.set(col.c);
  };
  R.setBall = function (ci) {
    const col = PB.COLORS[ci] || PB.COLORS[0];
    if (R.ballCi === ci) return; R.ballCi = ci;
    R.ball.material.map && R.ball.material.map.dispose(); R.ball.material.map = ballTex(col.c, col.d); R.ball.material.needsUpdate = true;
  };
  R.setFace = function (f) { if (R.meFace === f || !R.faceTex[f]) return; R.meFace = f; R.meBody.material.map = R.faceTex[f]; };
  // ---------- 毎フレーム ----------
  // v：Lane.view() と同じ形
  R.draw = function (v, dt, o = {}) {
    const d = R.dummy;
    let n = 0;
    for (let i = 0; i < 100; i++) {
      const p = v.pins[i];
      if (!p || i === v.me) { R.inst.setMatrixAt(i, R.hidden); continue; }
      d.position.set(p[0], p[1], p[2]); d.quaternion.set(p[3], p[4], p[5], p[6]); d.scale.set(1, 1, 1); d.updateMatrix(); R.inst.setMatrixAt(i, d.matrix); n++;
    }
    R.inst.instanceMatrix.needsUpdate = true;
    const mp = v.pins[v.me];
    R.me.visible = !!mp && o.showMe !== false;
    if (mp) {
      R.me.position.set(mp[0], mp[1], mp[2]); R.me.quaternion.set(mp[3], mp[4], mp[5], mp[6]);
      // 少しだけゆらゆら（生きてる感じ）
      if (!v.blown) { R.wob = (R.wob || 0) + dt * (o.moving ? 11 : 2.2); R.meBody.rotation.z = Math.sin(R.wob) * (o.moving ? 0.07 : 0.02); }
      else R.meBody.rotation.z = 0;
      R.meRing.visible = !v.blown && o.showMe !== false; R.meRing.position.set(mp[0], 0.01, mp[2]); const pul = 1 + Math.sin(performance.now() / 180) * 0.08; R.meRing.scale.set(pul, pul, 1);
      R.meArrow.visible = !v.blown && !!o.arrow; const big = o.arrow === 'far' ? 2.6 : 1; R.meArrow.scale.set(big, big, big); R.meArrow.position.set(mp[0], 1.0 + 0.6 * big + Math.sin(performance.now() / 200) * 0.08 * big, mp[2]);
    } else { R.meRing.visible = false; R.meArrow.visible = false; }
    // 球
    const b = v.ball;
    R.ball.visible = !!b; R.aura.visible = false; R.okTag.visible = false;
    if (b) {
      R.ball.position.set(b[0], b[1], b[2]); R.ball.quaternion.set(b[3], b[4], b[5], b[6]);
      const live = !v.out || v.held;
      if (live && !v.held) {
        R.aura.visible = true; R.aura.position.set(b[0], b[1], b[2]);
        const ok = v.stoppable; R.aura.material.map = ok ? R.glowBlue : R.glowRed;
        const s = ok ? 1.5 + Math.sin(performance.now() / 120) * 0.25 : 1.3 + Math.min(1, v.bv / 14) * 0.6; R.aura.scale.set(s, s, 1);
        R.okTag.visible = ok && !o.thrower; R.okTag.position.set(b[0], b[1] + 0.85, b[2]);
        R.trail.material.color.set(ok ? '#4ac8ff' : '#ff5a4a');
      }
      R.pushTrail(live && !v.held ? b : null);
    } else R.pushTrail(null);
    R.stepParts(dt);
  };
  R.pushTrail = function (b) {
    const P = R.trailPts;
    if (b) P.unshift([b[0], b[2]]); else if (P.length) P.pop();
    if (P.length > R.trailN) P.length = R.trailN;
    const a = R.trail.geometry.attributes.position.array;
    for (let i = 0; i < R.trailN; i++) {
      const p = P[Math.min(i, P.length - 1)] || [0, -99], q = P[Math.min(i + 1, P.length - 1)] || p;
      let dx = q[0] - p[0], dz = q[1] - p[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      const w = C.BALL_R * 0.9 * (1 - i / R.trailN);
      a[i * 6] = p[0] - dz * w; a[i * 6 + 1] = 0.02; a[i * 6 + 2] = p[1] + dx * w;
      a[i * 6 + 3] = p[0] + dz * w; a[i * 6 + 4] = 0.02; a[i * 6 + 5] = p[1] - dx * w;
    }
    R.trail.geometry.attributes.position.needsUpdate = true; R.trail.visible = P.length > 1;
  };
  // ねらい線（投げる人だけ）
  R.aim = function (x, ang, spin, pow, on, bm) {
    R.aimG.visible = !!on; if (!on) return;
    const v = C.POW_MIN + (C.POW_MAX - C.POW_MIN) * pow;
    const P = PB.predict(x, 0.3, Math.sin(ang) * v, Math.cos(ang) * v, spin * C.SPIN_MAX, 3, R.aimPath || (R.aimPath = []), bm);
    // 道のりにそって等間隔に点を置く（長さは強さで変わる）
    const maxLen = 6 + pow * 14; let acc = 0, k = 0, px = x, pz = 0.3, next = 0;
    for (const d of R.aimDots) d.visible = false;
    for (const p of P) {
      const l = Math.hypot(p[0] - px, p[1] - pz); acc += l; px = p[0]; pz = p[1];
      if (acc > maxLen) break;
      if (acc >= next && k < R.aimDots.length) { const d = R.aimDots[k++]; d.position.set(p[0], 0.02, p[1]); d.visible = true; next += 0.75; }
    }
  };
  R.floorAt = function (sx, sy) {
    const v = new T.Vector3(sx / window.innerWidth * 2 - 1, -(sy / window.innerHeight) * 2 + 1, 0.5).unproject(R.cam);
    const o = R.cam.position, d = v.sub(o).normalize(); if (d.y > -1e-3) return null;
    const t = -o.y / d.y; return { x: o.x + d.x * t, z: o.z + d.z * t };
  };
  // ---------- かけら ----------
  R.burst = function (x, y, z, n, col, sp) {
    if (lo) n = Math.ceil(n / 2);
    const key = col; if (!R.mats[key]) R.mats[key] = new T.MeshBasicMaterial({ color: col });
    for (let i = 0; i < n; i++) {
      let m = R.parts.find(p => !p.on);
      if (!m) { if (R.parts.length > 120) return; m = { mesh: new T.Mesh(R.partGeo, R.mats[key]) }; R.sc.add(m.mesh); R.parts.push(m); }
      m.on = true; m.mesh.material = R.mats[key]; m.mesh.visible = true; m.mesh.position.set(x, y, z);
      const a = Math.random() * Math.PI * 2, s = (sp || 3) * (0.4 + Math.random());
      m.v = [Math.cos(a) * s, 2 + Math.random() * 4, Math.sin(a) * s]; m.t = 0.5 + Math.random() * 0.4; const sc = 0.6 + Math.random(); m.mesh.scale.set(sc, sc, sc);
    }
  };
  R.stepParts = function (dt) {
    for (const p of R.parts) {
      if (!p.on) continue; p.t -= dt; if (p.t <= 0) { p.on = false; p.mesh.visible = false; continue; }
      p.v[1] -= 18 * dt; const m = p.mesh.position; m.x += p.v[0] * dt; m.y = Math.max(0.03, m.y + p.v[1] * dt); m.z += p.v[2] * dt;
    }
  };
  // ---------- カメラ ----------
  R.camTo = function (pos, look, k) {
    const c = R.cam; const f = k == null ? 1 : k;
    c.position.lerp(pos, f); R.camLook.lerp(look, f);
    if (R.shake > 0) { c.position.x += (Math.random() - 0.5) * R.shake; c.position.y += (Math.random() - 0.5) * R.shake; R.shake *= 0.86; if (R.shake < 0.005) R.shake = 0; }
    const fw = R.baseFov * (R.zoom || 1); if (Math.abs(c.fov - fw) > 0.05) { c.fov += (fw - c.fov) * Math.max(f, 0.08); c.updateProjectionMatrix(); }
    c.lookAt(R.camLook); c.updateMatrixWorld();
  };
  R.setBumper = function (bm, ghost) {
    R.bump.visible = !!bm; if (!bm) return;
    R.bump.position.set(bm.x, 0, bm.z); R.bump.rotation.y = bm.a; R.bumpMat.opacity = ghost ? 0.55 : 1;
  };
  R.render = function () { R.ren.render(R.sc, R.cam); };
  // 画面上の位置（ピンをえらぶとき）
  R.toScreen = function (x, y, z) { const v = new T.Vector3(x, y, z).project(R.cam); return [(v.x + 1) / 2 * window.innerWidth, (1 - v.y) / 2 * window.innerHeight, v.z]; };
})();
