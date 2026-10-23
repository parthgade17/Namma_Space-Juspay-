import * as THREE from 'three';

// Cache generated textures
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * 600x600 light grey vitrified tiles with thin grout lines and slight gloss
 */
export function getFloorTileTexture(): THREE.CanvasTexture {
  if (textureCache.has('floor')) return textureCache.get('floor')!;

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Light grey base with subtle marble/concrete grain
  ctx.fillStyle = '#dcdfe4';
  ctx.fillRect(0, 0, size, size);

  // Subtle tonal noise
  for (let i = 0; i < 40000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = Math.random() * 0.035;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Draw 2x2 grid representing four 600x600mm tiles
  ctx.strokeStyle = 'rgba(70, 75, 85, 0.45)';
  ctx.lineWidth = 4;

  // Outer border & cross
  ctx.strokeRect(0, 0, size, size);
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();

  // Highlight along tile edge for bevelled appearance
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size / 2 + 3, 0);
  ctx.lineTo(size / 2 + 3, size);
  ctx.moveTo(0, size / 2 + 3);
  ctx.lineTo(size, size / 2 + 3);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 4); // Repeat to scale 600mm tiles accurately
  tex.anisotropy = 8;
  textureCache.set('floor', tex);
  return tex;
}

/**
 * Blue pegboard tool wall with hand tools (wrenches, pliers, hammer, screwdrivers)
 */
export function getPegboardTexture(): THREE.CanvasTexture {
  if (textureCache.has('pegboard')) return textureCache.get('pegboard')!;

  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep industrial workshop blue
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, w, h);

  // Perforated hole grid
  ctx.fillStyle = '#0f172a';
  const spacing = 16;
  for (let x = 8; x < w; x += spacing) {
    for (let y = 8; y < h; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw tool silhouettes & hanging tools
  ctx.fillStyle = '#e2e8f0';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;

  // 1. Hanging Wrenches Set (left)
  for (let i = 0; i < 7; i++) {
    const wx = 80 + i * 45;
    const wy = 90;
    const len = 120 + i * 20;

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(wx - 5, wy, 10, len);
    // Wrench heads
    ctx.beginPath();
    ctx.arc(wx, wy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wx, wy + len, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(wx, wy, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Heavy Claw Hammer & Mallet (middle)
  ctx.fillStyle = '#d97706'; // wooden handle
  ctx.fillRect(440, 140, 14, 180);
  ctx.fillStyle = '#475569'; // steel head
  ctx.fillRect(415, 110, 65, 30);

  // Rubber Mallet
  ctx.fillStyle = '#d97706';
  ctx.fillRect(520, 140, 14, 180);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(495, 100, 65, 45);

  // 3. Pliers & Wire Cutters (middle right)
  for (let i = 0; i < 4; i++) {
    const px = 620 + i * 50;
    ctx.fillStyle = '#dc2626'; // red insulated handles
    ctx.fillRect(px - 10, 150, 8, 90);
    ctx.fillRect(px + 2, 150, 8, 90);
    ctx.fillStyle = '#cbd5e1'; // metal jaws
    ctx.fillRect(px - 8, 110, 16, 40);
  }

  // 4. Screwdriver Rack (right)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(840, 120, 150, 18);
  for (let i = 0; i < 6; i++) {
    const sx = 855 + i * 22;
    ctx.fillStyle = '#f59e0b'; // yellow handles
    ctx.fillRect(sx - 5, 60, 10, 60);
    ctx.fillStyle = '#94a3b8'; // shafts
    ctx.fillRect(sx - 2, 138, 4, 110);
  }

  // Silver metal shelf at bottom
  ctx.fillStyle = '#64748b';
  ctx.fillRect(30, h - 35, w - 60, 20);

  const tex = new THREE.CanvasTexture(canvas);
  textureCache.set('pegboard', tex);
  return tex;
}

/**
 * 4 Yellow industrial safety posters
 */
export function getSafetyPostersTexture(): THREE.CanvasTexture {
  if (textureCache.has('safety')) return textureCache.get('safety')!;

  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  const posters = [
    { title: 'SAFETY FIRST', sub: 'WEAR EYE PROTECTION AT ALL TIMES', icon: 'EYES' },
    { title: 'CAUTION', sub: 'KEEP HANDS CLEAR OF ROTATING PARTS', icon: 'GEAR' },
    { title: 'NOTICE', sub: 'REPORT ALL INJURIES TO LAB INSTRUCTOR', icon: 'CROSS' },
    { title: 'WARNING', sub: 'AUTHORIZED STUDENTS & STAFF ONLY', icon: 'LOCK' },
  ];

  posters.forEach((p, idx) => {
    const x = 20 + idx * 250;
    const y = 15;
    const pw = 230;
    const ph = 226;

    // Bright safety yellow border & background
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x, y, pw, ph);

    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 8, y + 8, pw - 16, 48);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.title, x + pw / 2, y + 40);

    // Inner white panel
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 8, y + 60, pw - 16, ph - 68);

    // Warning symbol
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(x + pw / 2, y + 105, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('!', x + pw / 2, y + 114);

    // Subtitle text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(p.sub.split(' ').slice(0, 3).join(' '), x + pw / 2, y + 155);
    ctx.fillText(p.sub.split(' ').slice(3).join(' '), x + pw / 2, y + 175);
  });

  const tex = new THREE.CanvasTexture(canvas);
  textureCache.set('safety', tex);
  return tex;
}

/**
 * QR poster on partition
 */
export function getQRPosterTexture(): THREE.CanvasTexture {
  if (textureCache.has('qr')) return textureCache.get('qr')!;

  const w = 512;
  const h = 720;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Top header banner
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, w, 110);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LABORATORY ACCESS', w / 2, 50);
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText('IIT BOMBAY ROBOTICS & PROTOTYPING', w / 2, 85);

  // Fake stylized QR code
  const qx = 96;
  const qy = 170;
  const qw = 320;
  ctx.fillStyle = '#000000';
  ctx.fillRect(qx, qy, qw, qw);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qx + 16, qy + 16, qw - 32, qw - 32);

  // Corner markers
  const drawCorner = (cx: number, cy: number) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx, cy, 64, 64);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx + 12, cy + 12, 40, 40);
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx + 20, cy + 20, 24, 24);
  };
  drawCorner(qx + 24, qy + 24);
  drawCorner(qx + qw - 88, qy + 24);
  drawCorner(qx + 24, qy + qw - 88);

  // Random pixel grid
  ctx.fillStyle = '#000000';
  for (let r = 0; r < 14; r++) {
    for (let c = 0; c < 14; c++) {
      if ((r < 4 && (c < 4 || c > 9)) || (r > 9 && c < 4)) continue;
      if ((r * 17 + c * 31) % 3 === 0) {
        ctx.fillRect(qx + 96 + c * 10, qy + 96 + r * 10, 10, 10);
      }
    }
  }

  // Footer text
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 20px Inter, sans-serif';
  ctx.fillText('SCAN TO LOG ATTENDANCE', w / 2, 550);
  ctx.font = '14px Inter, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Authorized Students & Faculty Only', w / 2, 585);
  ctx.fillText('Emergency Helpdesk: Ext. 4022', w / 2, 620);

  const tex = new THREE.CanvasTexture(canvas);
  textureCache.set('qr', tex);
  return tex;
}

/**
 * Long horizontal power sockets conduit strip
 */
export function getPowerSocketsTexture(): THREE.CanvasTexture {
  if (textureCache.has('sockets')) return textureCache.get('sockets')!;

  const w = 1024;
  const h = 64;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // White PVC electrical raceway channel
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, h);

  // Repeating 3-pin sockets + switches
  for (let x = 30; x < w - 30; x += 120) {
    // Socket module
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x, 10, 50, 44);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(x, 10, 50, 44);

    // 3 pins (triangular configuration)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(x + 25, 20, 3.5, 0, Math.PI * 2); // Earth
    ctx.arc(x + 16, 36, 2.5, 0, Math.PI * 2); // Neutral
    ctx.arc(x + 34, 36, 2.5, 0, Math.PI * 2); // Live
    ctx.fill();

    // Red rocker switch
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 60, 16, 18, 32);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 63, 20, 12, 10);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  textureCache.set('sockets', tex);
  return tex;
}

/**
 * Wall-mounted TV screen showing IIT Bombay Robotics / Spatial Engine dashboard
 */
export function getTVScreenTexture(): THREE.CanvasTexture {
  if (textureCache.has('tv')) return textureCache.get('tv')!;

  const w = 1024;
  const h = 576;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Dark cyber-dashboard
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, w, h);

  // Top header bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, 70);

  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('RAASTA 3D — SPATIAL DIGITAL TWIN LAB', 30, 46);

  ctx.fillStyle = '#10b981';
  ctx.font = '16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('LIVE STATUS: ALL SYSTEMS NORMAL', w - 30, 46);

  // Telemetry widgets
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(30, 100, 460, 200);
  ctx.fillRect(520, 100, 470, 200);
  ctx.fillRect(30, 330, 960, 210);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MECHANICAL & ROBOTICS WORKBENCHES', 50, 135);
  ctx.fillText('ELECTRONICS TESTING & EMBEDDED RACKS', 540, 135);
  ctx.fillText('CAMPUS SPATIAL TWIN & A* INDOOR NAVIGATION', 50, 365);

  // Waveform graph
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 50; x < 450; x += 10) {
    const y = 220 + Math.sin(x * 0.05) * 40;
    if (x === 50) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  textureCache.set('tv', tex);
  return tex;
}
