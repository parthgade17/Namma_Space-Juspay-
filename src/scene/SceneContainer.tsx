import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import { Lighting } from './Lighting';
import { ProceduralEnvironment } from './ProceduralEnvironment';
import { CustomModelLoader } from './CustomModelLoader';
import { FloatingLabels } from './FloatingLabels';
import { RoutePathVisualizer } from '../navigation/RoutePathVisualizer';
import { FirstPersonControls } from '../roaming/FirstPersonControls';
import { OrbitControlsWrapper } from '../roaming/OrbitControlsWrapper';
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
  const cameraMode = useStore((s) => s.cameraMode);
  const showShadows = useStore((s) => s.showShadows);
  const performanceMode = useStore((s) => s.performanceMode);
  const customModel = useStore((s) => s.customModel);

  return (
    <div className="w-full h-full absolute inset-0 bg-[#0a0d14]">
      <Canvas
        shadows={showShadows && !performanceMode}
        dpr={performanceMode ? 1 : [1, 2]}
        gl={{
          antialias: !performanceMode,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        camera={{
          fov: 65,
          near: 0.1,
          far: 200,
          position: [0, 24, 18],
        }}
      >
        {/* Scene Bridge for hooks and GLTF exporter */}
        <SceneBridge sceneRef={sceneRef} />

        {/* Dynamic Studio & Room Lighting */}
        <Lighting />

        {/* 3D Scene Geometry: Procedural Twin or Uploaded Scan */}
        {customModel ? <CustomModelLoader /> : <ProceduralEnvironment />}

        {/* Glowing 3D Navigation Path */}
        <RoutePathVisualizer />

        {/* Floating 3D Room & POI Badges */}
        <FloatingLabels />

        {/* Camera Modes */}
        {cameraMode === 'fps' ? <FirstPersonControls /> : <OrbitControlsWrapper />}
      </Canvas>
    </div>
  );
};
