import React, { useRef } from 'react';
import { useStore } from './state/useStore';
import { SceneContainer } from './scene/SceneContainer';
import { TopNavBar } from './ui/TopNavBar';
import { Minimap } from './ui/Minimap';
import { DirectionHUD } from './ui/DirectionHUD';
import { ControlsOverlay } from './ui/ControlsOverlay';
import { CalibrationPanel } from './ui/CalibrationPanel';
import { FloorPlanAlignToolbar } from './ui/FloorPlanAlignToolbar';
import { EmergencyOverlay } from './ui/EmergencyOverlay';
import { VirtualJoystick } from './roaming/VirtualJoystick';
import { SplatLoadingOverlay } from './ui/SplatLoadingOverlay';
import { ReconstructionScreen } from './pipeline/ReconstructionScreen';

export function App() {
  const currentMode = useStore((s) => s.currentMode);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const sceneRef = useRef<any>(null);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0d1117] text-slate-100 font-sans select-none">
      
      {/* 1. 3D WebGL Canvas Layer with Real Gaussian Splat */}
      <SceneContainer sceneRef={sceneRef} />

      {/* 2. Top Navigation Bar (Search, Real Pipeline, Align Mode, Emergency) */}
      <TopNavBar />

      {/* 3. Turn-by-Turn Guidance HUD */}
      <DirectionHUD />

      {/* 4. Bottom Right: 2D Radar Minimap */}
      <div className="absolute bottom-4 right-4 z-30 pointer-events-auto">
        <Minimap />
      </div>

      {/* 5. Bottom Left: Quality, Nav Layer Toggle, FPS Counter */}
      <ControlsOverlay />

      {/* 6. Calibration Panel (Press Key T) */}
      <CalibrationPanel />

      {/* 7. Floor Plan Alignment Toolbar (when in Align Mode) */}
      <FloorPlanAlignToolbar />

      {/* 8. Emergency Evacuation Alert */}
      <EmergencyOverlay />

      {/* 9. Mobile Touch Dual Joystick */}
      <VirtualJoystick />

      {/* 10. Splat Loading Progress Bar & Ready Card */}
      <SplatLoadingOverlay />

      {/* 11. Honest Reconstruction Pipeline Modal */}
      {currentMode === 'pipeline' && <ReconstructionScreen />}

    </main>
  );
}

export default App;
