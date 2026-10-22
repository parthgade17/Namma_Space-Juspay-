import React, { useRef } from 'react';
import { useStore } from './state/useStore';
import { SceneContainer } from './scene/SceneContainer';
import { TopNavBar } from './ui/TopNavBar';
import { Minimap } from './ui/Minimap';
import { DirectionHUD } from './ui/DirectionHUD';
import { ObjectInfoCard } from './ui/ObjectInfoCard';
import { ControlsOverlay } from './ui/ControlsOverlay';
import { EmergencyOverlay } from './ui/EmergencyOverlay';
import { VirtualJoystick } from './roaming/VirtualJoystick';
import { ReconstructionScreen } from './pipeline/ReconstructionScreen';

export function App() {
  const currentMode = useStore((s) => s.currentMode);
  const sceneRef = useRef<any>(null);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0d14] text-slate-100 font-sans select-none">
      
      {/* 1. 3D WebGL Canvas Layer */}
      <SceneContainer sceneRef={sceneRef} />

      {/* 2. Top Navigation Bar (Search, Camera mode, Upload, Emergency) */}
      <TopNavBar sceneRef={sceneRef} />

      {/* 3. Turn-by-Turn Guidance HUD */}
      <DirectionHUD />

      {/* 4. Object & POI Inspection Card */}
      <ObjectInfoCard />

      {/* 5. Bottom Right: Interactive 2D Minimap Radar */}
      <div className="absolute bottom-4 right-4 z-30 pointer-events-auto">
        <Minimap />
      </div>

      {/* 6. Bottom Left: Rendering Toggles, FPS counter & Shortcuts */}
      <ControlsOverlay />

      {/* 7. Emergency Evacuation Overlay */}
      <EmergencyOverlay />

      {/* 8. Mobile Dual Virtual Joystick */}
      <VirtualJoystick />

      {/* 9. Scan → Reconstruct Pipeline Simulation Screen */}
      {currentMode === 'pipeline' && <ReconstructionScreen />}

    </main>
  );
}

export default App;
