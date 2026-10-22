# Raasta 3D — Photorealistic 3D Digital Twin & Autonomous Navigation

> **Techfest, IIT Bombay — Namma Space Competition**  
> An interactive spatial engine converting standard smartphone video captures of indoor spaces into a photorealistic 3D Gaussian Radiance Field digital twin, featuring real-time collision detection, semantic search, and A* obstacle-aware navigation.

---

## 📸 Photorealistic Gaussian Splatting Architecture

Unlike synthetic or procedural mesh representations, **Raasta 3D** loads and renders a **real 3D Gaussian Splatting scan (`public/lab.spz`)** containing **968,065 Gaussians** trained with Nerfstudio's `splatfacto` model from an actual smartphone video walk of the computer lab.

### Key Architectural Highlights
1. **Photoreal Gaussian Splat Viewer**: Built using `@sparkjsdev/spark 2.4.0` and `three.js >= 0.180`, leveraging WebGL compute and sorting shaders (`antialias: false`, tonemapping aligned with splat radiance values).
2. **First-Person Eye-Height Lock**: Default walking experience starts inside the lab at eye height (1.6m), with realistic near-clipping (0.35m) and field-of-view (62°) derived from `scanConfig.json`.
3. **Aligned Navigation Proxy**: Procedural geometry from `floorplan.json` acts as an invisible collision & pathfinding proxy (`showNavLayer` toggles a faint 20% white wireframe labeled *"Navigation layer (floor-plan proxy)"*).
4. **Interactive Plan Alignment Mode**: Top-down orthographic view allowing fine translation, rotation, and scaling of the floor plan against the Gaussian splat, with a one-click **"Copy JSON"** button.
5. **Real-time Calibration (Key `T`)**: Hidden in-app calibration drawer with sliders for model rotation, scale, elevation, eye height, bounds clamping, and near/FOV adjustments.

---

## 🔬 End-to-End Reconstruction Pipeline

```
[Phone Video 1080p30 (2m 26s)]
               │
               ▼
   [730 Frames extracted @ 5fps]
               │
               ▼
[Laplacian Blur Filter (684 sharp frames)]
               │
               ▼
[COLMAP SfM: 331 registered, 27,330 sparse points, 0.79px error]
               │
               ▼
[Nerfstudio splatfacto (15k steps on Tesla T4 GPU)]
               │
               ▼
      [968,065 Gaussians]
               │
               ▼
  [SPZ Compression: 16.1 MB payload]
               │
               ▼
[Raasta 3D Spark Viewer + A* Nav Engine]
```

### Verified Processing Telemetry
- **Video Input**: 1080p @ 30fps handheld smartphone walk, 2 minutes 26 seconds duration.
- **Sampling**: Extracted 730 raw frames at 5 fps.
- **Pre-filtering**: Laplacian variance scoring filtered out 46 motion-blurred frames, leaving **684 high-clarity keyframes**.
- **Structure from Motion (SfM)**: COLMAP sequential matching registered **331 camera poses** with **27,330 sparse 3D triangulated points** and a mean reprojection error of **0.79 px**.
- **Neural Radiance Field Optimization**: Trained for **15,000 steps** on an NVIDIA Tesla T4 GPU using Nerfstudio `splatfacto` with adaptive density cloning and spherical harmonics.
- **Output**: **968,065 Gaussian ellipsoids**.
- **Compression**: Packed into a 16.1 MB `.spz` binary file for instantaneous browser loading at 60 FPS.

---

## 🧭 Navigation & Pathfinding System

1. **A\* 8-Directional Pathfinding**: Evaluates optimal paths across a 0.3m grid padded by 0.35m around physical obstacle footprints.
2. **String-Pulling Path Smoothing**: Eliminates jagged grid steps via raycasting line-of-sight tests.
3. **Floor Route Ribbon**: Thin 8 cm translucent cyan ribbon floating 2 cm above the floor with soft directional chevrons and a minimal destination ring.
4. **Turn-by-Turn Guidance HUD**: Displays distance in meters, estimated walking time, and step-by-step turn directions.
5. **Auto-Walk**: Smoothly animates the camera along waypoints with look-ahead yaw and celebration confetti on arrival.
6. **2D Radar Minimap**: Real-time canvas radar showing room boundaries, active route, and user position with heading FOV cone (click to teleport).
7. **Emergency Evacuation**: One-click trigger that routes to the nearest fire exit with a pulsing red route and alert vignette.

---

## 🔄 How to Replace `lab.spz` with a New Scan

To visualize your own scanned room or hostel room:
1. **Capture Video**: Record ~1–2 minutes of continuous video in 1080p/4K walking in a serpentine pattern with 70% overlap.
2. **Process**:
   - *Option A (Fastest, ~20 mins)*: Upload to **Luma AI**, **Polycam**, or **KIRI Engine**, export as `.ply` or `.spz`.
   - *Option B (Nerfstudio)*: Run `ns-process-data video --data video.mp4 --output-dir data/lab`, then `ns-train splatfacto --data data/lab/`. Convert to `.spz` using `playcanvas/splat-transform`.
3. **Drop into Project**:
   - Save your `.spz` file into `public/` (e.g. `public/my_scan.spz`).
   - Open [public/scanConfig.json](file:///d:/Namaspace/public/scanConfig.json) and set `"splatUrl": "/my_scan.spz"`.
4. **Calibrate**:
   - Run the app, press **Key `T`** to open the calibration drawer.
   - Adjust rotation, scale, and eye-height sliders until aligned, then click **"Copy Config"** and paste back into `public/scanConfig.json`.

---

## 📜 Open-Source Credits & Licenses

Raasta 3D builds upon exceptional open-source tools and libraries:

| Project | License | Purpose |
| :--- | :--- | :--- |
| **Three.js** | MIT | Core 3D WebGL scenegraph and rendering pipeline |
| **Spark (`@sparkjsdev/spark`)** | MIT | High-performance Gaussian Splat WebGL renderer & SPZ loader |
| **React / `@react-three/fiber` / `@react-three/drei`** | MIT | Declarative WebGL component lifecycle management |
| **Zustand** | MIT | Lightweight centralized reactive application state management |
| **Tailwind CSS** | MIT | Utility-first glassmorphic dark user interface styling |
| **COLMAP** | BSD 3-Clause | Multi-view Structure from Motion (SfM) feature extraction and triangulation |
| **Nerfstudio** | Apache 2.0 | Neural radiance field & Gaussian Splatting optimization framework |
| **gsplat** | Apache 2.0 | CUDA-accelerated rasterization backend for Gaussian Splatting |
| **FFmpeg** | LGPL v2.1+ | Video frame extraction and timecode synchronization |
| **PlayCanvas SuperSplat / splat-transform** | MIT | 3D Gaussian Splatting compression and SPZ packing |

---

## 🚀 Running Locally & Production Build

### Development Server
```bash
npm install
npm run dev
```
Visit `http://localhost:5173/` in your browser.

### Production Build (Vercel / Netlify)
```bash
npm run build
npm run preview
```
The output directory `dist/` is completely static and ready for zero-backend static hosting on Vercel, Netlify, or GitHub Pages.
