import React, { useRef } from 'react';
import { useStore } from './state/useStore';
import { SceneContainer } from './scene/SceneContainer';
import { TopNavBar } from './ui/TopNavBar';
import { Minimap } from './ui/Minimap';
import { DirectionHUD } from './ui/DirectionHUD';
import { ArrivalToast } from './ui/ArrivalToast';
import { BottomDock } from './ui/BottomDock';
import { OnboardingModal } from './ui/OnboardingModal';
import { ObjectInfoCard } from './ui/ObjectInfoCard';
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
      
      {/* 1. 3D WebGL Canvas Layer (3D Model / Real Scan / Navigation Ribbon / Pooled Labels) */}
      <SceneContainer sceneRef={sceneRef} />

      {/* 2. Top Navigation Bar: Top-Left View Switch, Top-Center Search with Chips, Top-Right Emergency */}
      <TopNavBar />

      {/* 3. Turn-by-Turn Compact Route Card / Collapsible Walking Pill */}
      <DirectionHUD />

      {/* 4. Arrival Toast Feedback */}
      <ArrivalToast />

      {/* 5. Bottom Right: 2D Radar Minimap (Rounded, Rotates with Heading, Expandable) */}
      <div className="fixed bottom-16 sm:bottom-4 right-3 sm:right-4 z-30 pointer-events-auto">
        <Minimap />
      </div>

      {/* 6. Bottom Dock: Destinations, Tour, Settings, Help */}
      <BottomDock />

      {/* 7. First-Run 3-Step Onboarding Modal */}
      <OnboardingModal />

      {/* 8. Equipment & Room Inspection Card */}
      <ObjectInfoCard />

      {/* 9. Calibration Panel (Key T) */}
      <CalibrationPanel />

      {/* 10. Floor Plan Alignment Toolbar (when in Align Mode) */}
      {isAlignMode && <FloorPlanAlignToolbar />}

      {/* 11. Emergency Evacuation Alert Vignette */}
      <EmergencyOverlay />

      {/* 12. Mobile Touch Dual Joystick */}
      <VirtualJoystick />

      {/* 13. Splat Loading Progress Bar (only during Real Scan load) */}
      <SplatLoadingOverlay />

      {/* 14. Honest Reconstruction Pipeline Modal */}
      {currentMode === 'pipeline' && <ReconstructionScreen />}

    </main>
  );
}

export default App;
