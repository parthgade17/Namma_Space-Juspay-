import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import { RealLabMeshModel } from './RealLabMeshModel';
import { GaussianSplatScene } from './GaussianSplatScene';
import { RoutePathVisualizer } from '../navigation/RoutePathVisualizer';
import { FloatingLabels } from './FloatingLabels';
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

// Top-down architectural plan view camera controller for mesh
const TopDownPlanControls: React.FC = () => {
  const isTopDownView = useStore((s) => s.isTopDownView);
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (isTopDownView) {
      camera.position.set(0, 16, 0.01);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
  }, [isTopDownView, camera]);

  if (!isTopDownView) return null;

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate={false} // Orthographic top-down pan and zoom
      enablePan={true}
      enableZoom={true}
      target={[0, 0, 0]}
    />
  );
};

interface Props {
  sceneRef?: React.MutableRefObject<any>;
}

export const SceneContainer: React.FC<Props> = ({ sceneRef }) => {
  const viewMode = useStore((s) => s.viewMode);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const isTopDownView = useStore((s) => s.isTopDownView);
  const quality = useStore((s) => s.quality);
  const scanConfig = useStore((s) => s.scanConfig);

  const dpr = quality === 'high' ? 2 : quality === 'balanced' ? 1.5 : 1;

  // Determine whether to show mesh and/or splat
  const showMesh = viewMode === 'mesh' || isAlignMode;
  const showSplat = viewMode === 'splat' || isAlignMode;

  return (
    <div className="w-full h-full absolute inset-0 bg-[#0d1117]">
      <Canvas
        shadows={quality !== 'low'}
        dpr={dpr}
        gl={{
          antialias: viewMode === 'mesh',
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        camera={{
          fov: scanConfig.fov || 65,
          near: scanConfig.near || 0.25,
          far: 250,
          position: [scanConfig.start?.[0] || -4.0, scanConfig.eyeHeight || 1.6, scanConfig.start?.[1] || 0],
        }}
      >
        <SceneBridge sceneRef={sceneRef} />

        {/* 1. REALISTIC ARCHITECTURAL LIGHTING */}
        {showMesh && (
          <group>
            {/* Soft Ambient Cool-White Fill (6000K) */}
            <ambientLight intensity={0.55} color="#f0f9ff" />

            {/* Sunlight Streaming Through Windows with Soft Shadows */}
            <directionalLight
              position={[8, 12, 10]}
              intensity={0.7}
              color="#ffffff"
              castShadow={quality !== 'low'}
              shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
              shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
              shadow-camera-near={1}
              shadow-camera-far={40}
              shadow-camera-left={-12}
              shadow-camera-right={12}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
              shadow-bias={-0.0004}
            />

            {/* Indoor Environment Reflection Map */}
            <Environment preset="city" environmentIntensity={0.35} />
          </group>
        )}

        {/* 2. REAL LAB 3D MESH MODEL (DEFAULT VIEW) */}
        {showMesh && <RealLabMeshModel />}

        {/* 3. REAL GAUSSIAN SPLATTING SCAN */}
        {showSplat && <GaussianSplatScene />}

        {/* 4. THIN 8CM CYAN NAVIGATION RIBBON */}
        <RoutePathVisualizer />

        {/* 5. FROSTED 3D LABELS (MAX 4 VISIBLE, 2M TO 10M) */}
        {!isTopDownView && <FloatingLabels />}

        {/* 6. CAMERA ROAMING & CONTROLS */}
        {isAlignMode ? (
          <AlignModeControls />
        ) : isTopDownView ? (
          <TopDownPlanControls />
        ) : (
          <FirstPersonControls />
        )}
      </Canvas>
    </div>
  );
};
