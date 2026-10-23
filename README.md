# Raasta 3D — Architectural Digital Twin & Autonomous Indoor Navigation

> **Techfest, IIT Bombay — Namma Space Competition**  
> An interactive spatial digital twin and indoor navigation engine for the innovation lab. Features a clean architectural 3D mesh twin (default view) modeled from ground-truth photo references, alongside a real 3D Gaussian Radiance Field scan (`.spz`), real-time collision detection, semantic search, and A* obstacle-aware navigation.

---

## 🏛️ Dual-Engine Spatial Architecture

Raasta 3D offers two complementary spatial visualizations toggleable in real-time from the top bar:

### 1. 3D Model (Default View — Architectural Digital Twin)
- **Design Philosophy**: A clean, architectural mesh representation of the actual lab built with Three.js, matching the 15 walking-order reference photos (`reference/lab_photos/`).
- **Materials & Aesthetics**:
  - **Partitions**: 5 cm black powder-coated aluminium frames with 1 m lower cream laminate panels and 2.4 m upper clear/frosted glass panels.
  - **Flooring**: Vitrified 600×600 mm grey ceramic floor tiles with subtle grout bump mapping and reflective clearcoat.
  - **Lighting**: 6000K cool-white recessed LED panel light fixtures in the ceiling (visible in first-person walking mode, automatically unclipped in top-down plan view).
  - **True Lab Spaces**:
    - **Entrance**: Wooden door, facial recognition kiosk tablet on stand, visitor QR poster.
    - **Mechanical Workshop**: Heavy wooden workbenches, blue pegboard tool wall with hanging tools, 4 yellow safety posters, drill press, metal chop saw, A-frame stepladder, grey workshop chairs.
    - **Electronics Bench**: Long wall bench with industrial power socket conduit bar, digital oscilloscope, dual-channel DC power supply, laptops, red CO2 fire extinguisher, window security grills.
    - **3D Printing Area**: Two enclosed CoreXY 3D printers with spool holders and a dedicated slice workstation.
    - **Laser Cutter Cabin**: Enclosed cabin with industrial blue/grey CO2 laser cutter machine, control console, and black mesh chair.
    - **Study Area**: Long wall study desk, black mesh task chairs, and white power conduits.
    - **Meeting Room**: Wall-mounted TV screen displaying an active IoT analytics dashboard, conference table, and seating.
    - **Storage Area**: Cardboard sheets, material stock boxes, and equipment shelving.
- **Performance**: High fidelity with < 40,000 polygons, maintaining steady 60 FPS on laptops.

### 2. Real Scan (Gaussian Radiance Field — `public/lab.spz`)
- **Technology**: Real 3D Gaussian Splatting scan (`968,065 Gaussians`) trained with Nerfstudio's `splatfacto` from a continuous smartphone video walk.
- **Rendering**: Realized via `@sparkjsdev/spark 2.4.0` with WebGL compute shaders, custom camera calibration (`scanConfig.json`), and bounds clamping.

### 3. Plan Alignment Mode ("Align Plan")
- Displays both the **Real Scan** and the **3D Model** (rendered at 50% opacity) in an orthographic top-down viewport with interactive translation, rotation, and scale handles, alongside a one-click **"Copy JSON"** button to persist alignment parameters.

---

## 🔬 Honest Reconstruction Pipeline & Attribution

Raasta 3D maintains strict technical honesty across all UI screens:
- **"Real Scan"**: A genuine neural radiance capture processed from handheld smartphone video through COLMAP Structure from Motion (SfM) and Nerfstudio Gaussian Splatting (`splatfacto`).
- **"3D Model"**: A clean architectural digital twin modeled to sub-decimeter accuracy matching reference photos and aligned to the real scan coordinate system. It is never misrepresented as an automatic surface mesh reconstruction.

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
