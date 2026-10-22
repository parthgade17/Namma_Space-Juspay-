# Raasta 3D — Indoor Spatial Digital Twin & Autonomous Navigation Engine

> **Techfest, IIT Bombay — Namma Space Competition**  
> An interactive 3D digital twin platform converting standard smartphone captures of indoor spaces into interactive virtual walkthroughs, semantic Point of Interest (POI) search, and obstacle-aware indoor pathfinding.

---

## 🏆 IIT Bombay Namma Space Overview & Rules Alignment

The **Namma Space** challenge by Techfest, IIT Bombay requires participants to build an intelligent spatial engine:
* **Round 1 (3D Reconstruction & Roaming)**: Map an indoor space following a Standard Operating Procedure (SOP), provide a proof-of-concept web viewer link, code repository, and free-roaming demo.
* **Round 2 (POIs & Navigation)**: Interactive spatial POI tagging, search indexing, and obstacle-aware desktop pathfinding navigation.
* **Round 3 (On-Site Capture at IIT Bombay Campus)**: Day 1 on-site venue capture, 3D twin reconstruction, POI annotation; Day 2 live pitch and technical Q&A with judges.

### ⚠️ Honest Disclosure on Synthetic vs Real Reconstruction
Per competition evaluation guidelines:
1. **Procedural Demonstration**: Clearly badged as `Demo mode: synthetic data` on the reconstruction pipeline landing screen.
2. **Real-Scan Compatibility**: Features a one-click **"Load your own model"** interface that ingests real `.glb`, `.gltf`, or `.ply` meshes generated from standard phone video (processed via Luma AI, Polycam, KIRI Engine, or COLMAP), normalizes bounding box scales, and allows live floor POI tagging.

---

## 🏗️ Architecture Diagram

```mermaid
flowchart TD
    subgraph Capture["1. Smartphone Video Capture (SOP)"]
        A[iPhone / Android 4K 60fps Video] --> B[Trajectory Walking Loop & Overlap]
    end

    subgraph Reconstruction["2. Photogrammetry / Neural Reconstruction Pipeline"]
        B --> C[Keyframe Extraction & Camera Poses]
        C --> D[SIFT / SuperPoint Feature Matching]
        D --> E[Structure from Motion (SfM) / COLMAP]
        E --> F[Dense Multi-View Stereo / 3D Gaussian Splats]
        F --> G[Poisson Surface Reconstruction & PBR Normal Baking]
        G --> H[Export .GLB / .PLY]
    end

    subgraph Engine["3. Raasta 3D Web Viewer & Spatial Engine"]
        H --> I[Three.js / @react-three/fiber Loader]
        J[floorplan.json Procedural Generator] --> I
        I --> K[Dynamic Walkable NavGrid (0.3m cell + 0.35m obstacle padding)]
        K --> L[8-Directional A* Pathfinding + String-Pulling Smoothing]
        L --> M[Glowing Directional Floor Ribbon & Turn-by-Turn Guidance]
    end

    subgraph Interaction["4. Interactive Roaming & UI"]
        M --> N[First-Person WASD + Collision Detection (1.6m eye height)]
        M --> O[Dollhouse Top-Down Orbit Inspection]
        M --> P[Semantic Search Autocomplete: Rooms, PCs, Faculty, Exits]
        M --> Q[Interactive 2D Minimap with FOV Heading Cone]
        M --> R[Emergency 1-Click Evacuation to Nearest Exit]
        M --> S[Mobile On-Screen Virtual Dual Joystick]
    end
```

---

## 🌟 Key Features

### 1. Procedural College Floor Environment (`/src/data/floorplan.json`)
* Complete digital twin of an academic department:
  * **Main Central Corridor** (42m long) with lounge seating, water stations, and indoor palms.
  * **Computer Lab 1 (High Performance Computing)**: 24 student workstations (`PC-01` to `PC-24`), instructor console, whiteboard, 4K projector screen, HPC server rack cluster.
  * **Computer Lab 2 (AI, IoT & Robotics)**: 10 workstations (`PC-25` to `PC-34`), edge TPU cluster rack, faculty console.
  * **HOD Cabin**: Executive desk, visitor seating, lounge sofa, department publication archives.
  * **Faculty Staff Room**: 6 dedicated professor cubicles, notice board, and beverage lounge.
  * **Restrooms / Washroom**: Dual sinks and private cubicles.
  * **Central Staircase**: Fire stairwell and high-speed elevator core.
  * **Main Entrance & Skywalk Exit**: Security checkpoint, RFID gate, and fire extinguisher stations.
* **Instanced Rendering**: Repeated meshes (PCs, monitors, keyboards, chairs) rendered via instancing to maintain < 40k triangles and solid 60 FPS on laptops.
* **Dynamic JSON Architecture**: Modify `floorplan.json` bounds, doors, or furniture to re-render the entire layout without touching geometry code.

### 2. "Scan → Reconstruct" Pipeline Simulation
* Landing screen demonstrating how real-world video translates into a 3D digital twin.
* Six simulated pipeline stages with live telemetry:
  1. *Frame Extraction* (214 frames @ 4K)
  2. *Feature Matching & SfM* (18,450 keypoints, 0.38px reprojection error)
  3. *Sparse Point Cloud* (42,100 points)
  4. *Dense Neural Reconstruction* (240,000 dense points)
  5. *Poisson Surface Meshing & UV Texture* (38,420 triangles)
  6. *Semantic POI Segmentation* (42 landmarks indexed)

### 3. Roaming & Multi-Camera Modes
* **First-Person View (FPS)**:
  * Pointer lock mouse look + WASD / Arrow keys movement.
  * Smooth collision sliding against walls and desks (eye height 1.6 m).
  * Shift key sprint (3.5 m/s to 5.5 m/s).
* **Dollhouse Mode**:
  * Ceilings automatically toggle off for an architectural cross-section view.
  * 360° pan, tilt, zoom with OrbitControls.
* **Mobile Touch Controls**:
  * Dual virtual touch zones: left virtual thumb joystick for movement + right touch swipe for look rotation.

### 4. Autonomous Navigation Engine
* **2D Walkable NavGrid**:
  * Generated dynamically with 0.3m resolution, padded by 0.35m around all furniture and walls.
  * Doorways preserved as open walkable portals.
* **Optimized A\* Pathfinding**:
  * 8-directional movement with diagonal corner-cutting prevention.
  * String-pulling raycast line-of-sight smoothing for natural human walking trajectories.
* **Visual & Audio Turn Guidance**:
  * Glowing neon ribbon with animated chevrons pointing toward destination.
  * Pulsing target beacon with ground illumination.
  * Turn-by-turn guidance HUD with distance (m) and walking time (s).
  * **Auto-Walk**: Smoothly animates camera along waypoints with arrival confetti!
  * **Auto Rerouting**: If the user wanders off-path by > 1.8m, recalculates the shortest path automatically.

### 5. Interactive UI & Emergency Mode
* **Search Bar**: Instant autocomplete with fuzzy match across 42+ POIs (e.g. `PC-17`, `Computer Lab 2`, `HOD Cabin`, `Exit`).
* **Interactive 2D Minimap**: Real-time radar canvas showing room bounds, active route, and user position with heading FOV cone (click to teleport).
* **One-Click Emergency Mode**: Sounds visual evacuation alarm, identifies the closest fire exit, and paints a glowing red escape route.
* **Object Inspector**: Click any desk or equipment in 3D to inspect specifications, room zone, and navigate directly.
* **Rendering Toggles**: Ceiling, 3D Labels, Shadows, Wireframe, LiDAR Point Cloud, Low-End Performance Mode.

### 6. "Load Your Own Model" Real-Scan Ready
* Ingests `.glb`, `.gltf`, or `.ply` files exported from photogrammetry tools.
* Auto-normalizes scale, centers geometry, and grounds it on the floor.
* **Interactive POI Tagger**: Click anywhere on the scanned floor/desks to drop and name custom POI tags.
* One-click **"Export .glb"** button to download the 3D twin.

---

## 📱 How This Maps to a Real Smartphone Pipeline

```
[Smartphone 4K Video] ──► [Frame Extraction] ──► [COLMAP / NeRF / 3DGS] ──► [Meshing & Texture] ──► [Export .GLB] ──► [Raasta 3D Engine]
```

### Standard Operating Procedure (SOP) for Smartphone Capture:
1. **Video Parameters**: Record in **4K @ 60fps** (or 30fps) with HDR disabled and fixed exposure/white balance.
2. **Trajectory**:
   * Walk at a steady, slow pace (~0.5 m/s) in a continuous "lawnmower" or serpentine pattern.
   * Maintain 60-80% visual overlap between adjacent passes.
   * Capture rooms from multiple eye heights: waist height (furniture tops), eye height (1.6m), and angled upward (ceiling fixtures).
   * Perform a 360° perimeter loop around central pillars, instructor podiums, and desks.
3. **Processing Options**:
   * **Free Cloud Tools (Fastest, ~30 mins)**: Upload the video to **Luma AI**, **Polycam**, or **KIRI Engine**, select "Mesh / Gaussian Splat Export", and download `.glb` or `.ply`.
   * **Local Open-Source (Full Control)**: Run **COLMAP** for camera pose triangulation + **OpenMVS** or **Poisson Surface Reconstruction** to produce a textured `.glb`.
4. **Integration**:
   * Open Raasta 3D, click **"Load Scan"**, select your `.glb` file.
   * Click **"Drop POI Pin"** to label desks and rooms directly on your real mesh!

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18+ (tested on Node v24)
* **npm**: v9+

### Installation & Run Locally

```bash
# Clone the repository
git clone https://github.com/your-username/raasta-3d.git
cd raasta-3d

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

The output in `/dist` is a purely static bundle ready to deploy on **Vercel**, **Netlify**, or **GitHub Pages**.

---

## 🛠️ Tech Stack

* **Framework**: React 19 + TypeScript + Vite
* **3D Engine**: Three.js, `@react-three/fiber`, `@react-three/drei`
* **State Management**: Zustand
* **Styling**: Tailwind CSS, Lucide Icons, Canvas Confetti
* **Deployment**: Static Site (Zero backend dependencies)
