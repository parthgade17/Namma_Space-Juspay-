import React, { useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import { RealLabMeshModel } from './RealLabMeshModel';
import { GaussianSplatScene } from './GaussianSplatScene';
import { RoutePathVisualizer } from '../navigation/RoutePathVisualizer';
import { FirstPersonControls } from '../roaming/FirstPersonControls';
import { AlignModeControls } from './AlignModeControls';
import { useAutoWalkController } from '../navigation/autoWalk';
import { PooledLabelsOverlay } from '../ui/PooledLabelsOverlay';
import { findPath } from '../navigation/astar';

// Performance, shadow freezer & auto-walk bridge
const SceneBridge: React.FC<{ sceneRef?: React.MutableRefObject<any> }> = ({ sceneRef }) => {
  const { scene, gl } = useThree();
  const quality = useStore((s) => s.quality);
  const autoDpr = useStore((s) => s.autoDpr);
  const setAutoDpr = useStore((s) => s.setAutoDpr);
  const viewMode = useStore((s) => s.viewMode);

  useAutoWalkController();

  // Bind scene ref
  useEffect(() => {
    if (sceneRef) {
      sceneRef.current = scene;
    }
  }, [scene, sceneRef]);

  // Freeze shadow map after initial frame to save massive render costs
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
  }, [gl, viewMode, quality]);

  // Dynamic Auto-Quality Throttle: monitors frame time and lowers dpr if fps < 45
  const frameCount = useRef(0);
  const lastCheck = useRef(performance.now());

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    if (now - lastCheck.current >= 1500) {
      const currentFps = (frameCount.current * 1000) / (now - lastCheck.current);
      frameCount.current = 0;
      lastCheck.current = now;

      if (quality === 'auto') {
        if (currentFps < 45 && autoDpr > 1.0) {
          setAutoDpr(Math.max(1.0, autoDpr - 0.25));
        } else if (currentFps > 56 && autoDpr < 1.5) {
          setAutoDpr(Math.min(1.5, autoDpr + 0.1));
        }
      }
    }
  });

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
      enableRotate={false}
      enablePan={true}
      enableZoom={true}
      target={[0, 0, 0]}
    />
  );
};

// Interactive Floor Click-to-Walk Listener
const FloorWalkTarget: React.FC = () => {
  const userPosition = useStore((s) => s.userPosition);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);
  const setIsAutoWalking = useStore((s) => s.setIsAutoWalking);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const isTopDownView = useStore((s) => s.isTopDownView);

  const handleClick = (e: any) => {
    if (isAlignMode || isTopDownView) return;
    e.stopPropagation();
    const point = e.point;
    if (!point) return;

    // Generate route to clicked floor point
    const path = findPath(userPosition[0], userPosition[2], point.x, point.z);

    if (path.length >= 2) {
      let totalDist = 0;
      for (let i = 0; i < path.length - 1; i++) {
        totalDist += Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][2] - path[i][2]);
      }
      setNavigationRoute(path, [], totalDist);
      setIsAutoWalking(true);
    }
  };

  return (
    <mesh
      position={[0, 0.01, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={false}
      onClick={handleClick}
    >
      <planeGeometry args={[20, 14]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
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
  const autoDpr = useStore((s) => s.autoDpr);
  const showPerf = useStore((s) => s.showPerf);
  const scanConfig = useStore((s) => s.scanConfig);

  // Compute adaptive pixel ratio
  const maxCap = quality === 'high' ? 1.5 : quality === 'balanced' ? 1.25 : quality === 'low' ? 1.0 : autoDpr;
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, maxCap) : 1;

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
          toneMappingExposure: 1.1,
        }}
        camera={{
          fov: scanConfig.fov || 65,
          near: scanConfig.near || 0.25,
          far: 250,
          position: [scanConfig.start?.[0] || -4.0, scanConfig.eyeHeight || 1.6, scanConfig.start?.[1] || 0],
        }}
      >
        <SceneBridge sceneRef={sceneRef} />

        {/* 1. PROFESSIONAL ARCHITECTURAL LIGHTING */}
        {showMesh && (
          <group>
            {/* Ambient cool fill */}
            <ambientLight intensity={0.48} color="#f0f9ff" />

            {/* Single Sun Directional Light with Frozen 1024 Shadow Map */}
            <directionalLight
              position={[8, 11, 7]}
              intensity={0.65}
              color="#fff8ee"
              castShadow={quality !== 'low'}
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-near={1}
              shadow-camera-far={35}
              shadow-camera-left={-12}
              shadow-camera-right={12}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
              shadow-bias={-0.0003}
            />

            {/* Poly Haven Indoor Reflection Environment */}
            <Environment preset="city" environmentIntensity={0.25} />
          </group>
        )}

        {/* 2. REAL LAB 3D ARCHITECTURAL MESH MODEL */}
        {showMesh && <RealLabMeshModel />}

        {/* 3. GAUSSIAN SPLATTING SCAN */}
        {showSplat && <GaussianSplatScene />}

        {/* 4. NAVIGATION ROUTE RIBBON */}
        <RoutePathVisualizer />

        {/* 5. INTERACTIVE FLOOR CLICK-TO-WALK PLANE */}
        <FloorWalkTarget />

        {/* 6. CAMERA ROAMING & CONTROLS */}
        {isAlignMode ? (
          <AlignModeControls />
        ) : isTopDownView ? (
          <TopDownPlanControls />
        ) : (
          <FirstPersonControls />
        )}

        {/* 7. PERFORMANCE PROFILER (r3f-perf) */}
        {showPerf && <Perf position="bottom-left" minimal={true} />}
      </Canvas>

      {/* 8. HIGH-PERFORMANCE POOLED DOM LABELS (OUTSIDE CANVAS) */}
      <PooledLabelsOverlay sceneRef={sceneRef} />
    </div>
  );
};
