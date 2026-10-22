import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import { GaussianSplatScene } from './GaussianSplatScene';
import { ProceduralEnvironment } from './ProceduralEnvironment';
import { FloatingLabels } from './FloatingLabels';
import { RoutePathVisualizer } from '../navigation/RoutePathVisualizer';
import { FirstPersonControls } from '../roaming/FirstPersonControls';
import { AlignModeControls } from './AlignModeControls';
import { useAutoWalkController } from '../navigation/autoWalk';

// Internal controller running auto-walk and scene ref binding
const SceneBridge: React.FC<{ sceneRef?: React.MutableRefObject<any> }> = ({ sceneRef }) => {
  const { scene } = useThree();
  useAutoWalkController();

  useEffect(() => {
    if (sceneRef) {
      sceneRef.current = scene;
    }
  }, [scene, sceneRef]);

  return null;
};

interface Props {
  sceneRef?: React.MutableRefObject<any>;
}

export const SceneContainer: React.FC<Props> = ({ sceneRef }) => {
  const scanConfig = useStore((s) => s.scanConfig);
  const quality = useStore((s) => s.quality);
  const isAlignMode = useStore((s) => s.isAlignMode);

  // Pixel ratio based on quality setting
  const dpr = quality === 'high' ? 2 : quality === 'balanced' ? 1.5 : 1;

  return (
    <div className="w-full h-full absolute inset-0 bg-[#0d1117]">
      <Canvas
        // Spark requires antialias: false
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
        }}
        dpr={dpr}
        camera={{
          fov: scanConfig.fov || 62,
          near: scanConfig.near || 0.35,
          far: 500,
          position: [scanConfig.start?.[0] || 0, scanConfig.eyeHeight || 1.6, scanConfig.start?.[1] || 0],
        }}
      >
        {/* Scene Bridge for hooks */}
        <SceneBridge sceneRef={sceneRef} />

        {/* Real Gaussian Splatting Photorealistic Scene */}
        <GaussianSplatScene />

        {/* Navigation Proxy Layer (Invisible by default; faint wireframe when toggled) */}
        <ProceduralEnvironment />

        {/* Thin 8cm Cyan Route Ribbon with animated chevrons */}
        <RoutePathVisualizer />

        {/* Small Frosted 3D Labels (max 6 visible) */}
        <FloatingLabels />

        {/* Roaming Controls: First-person Walk or Align Orthographic mode */}
        {isAlignMode ? <AlignModeControls /> : <FirstPersonControls />}
      </Canvas>
    </div>
  );
};
