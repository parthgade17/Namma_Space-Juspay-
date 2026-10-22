import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';
import { useStore } from '../state/useStore';

export const GaussianSplatScene: React.FC = () => {
  const { gl, scene, camera } = useThree();
  const scanConfig = useStore((s) => s.scanConfig);
  const setScanConfig = useStore((s) => s.setScanConfig);
  const setSplatLoading = useStore((s) => s.setSplatLoading);

  const splatMeshRef = useRef<any>(null);
  const sparkRendererRef = useRef<any>(null);

  // 1. Fetch scanConfig.json on startup
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const r = await fetch('/scanConfig.json', { cache: 'no-store' });
        if (r.ok) {
          const json = await r.json();
          if (isMounted) {
            setScanConfig(json);
          }
        }
      } catch (err) {
        console.warn('Could not fetch scanConfig.json, using defaults.', err);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, [setScanConfig]);

  // 2. Initialize SparkRenderer once
  useEffect(() => {
    if (!sparkRendererRef.current) {
      try {
        const sparkRenderer = new SparkRenderer({ renderer: gl });
        scene.add(sparkRenderer);
        sparkRendererRef.current = sparkRenderer;
      } catch (e) {
        console.error('Failed to create SparkRenderer:', e);
      }
    }

    return () => {
      if (sparkRendererRef.current) {
        scene.remove(sparkRendererRef.current);
        sparkRendererRef.current.dispose?.();
        sparkRendererRef.current = null;
      }
    };
  }, [gl, scene]);

  // 3. Initialize SplatMesh with real scan /lab.spz
  useEffect(() => {
    setSplatLoading({ isLoaded: false, progress: 10, error: null });

    const url = scanConfig.splatUrl || '/lab.spz';
    let mesh: any;

    try {
      mesh = new SplatMesh({ url });
      splatMeshRef.current = mesh;

      // Fake progress increment while network transfer and decompression happen
      let progress = 15;
      const progressTimer = setInterval(() => {
        progress = Math.min(95, progress + (98 - progress) * 0.12);
        setSplatLoading({ progress: Math.round(progress) });
      }, 150);

      const onReady = () => {
        clearInterval(progressTimer);
        setSplatLoading({ isLoaded: true, progress: 100, error: null });
      };

      const onError = (err: any) => {
        clearInterval(progressTimer);
        console.error('Failed to initialize SplatMesh:', err);
        setSplatLoading({
          isLoaded: false,
          error: `Could not load 3D Gaussian splat (${url}). Ensure public/lab.spz exists.`,
        });
      };

      if (mesh.initialized && typeof mesh.initialized.then === 'function') {
        mesh.initialized.then(onReady, onError);
      } else {
        setTimeout(onReady, 1200);
      }
    } catch (err: any) {
      console.error('Error creating SplatMesh:', err);
      setSplatLoading({
        isLoaded: false,
        error: `Error creating SplatMesh: ${err?.message || err}`,
      });
    }

    return () => {
      if (mesh) {
        mesh.dispose?.();
      }
    };
  }, [scanConfig.splatUrl, setSplatLoading]);

  // 4. Apply transforms matching reference viewer exactly
  useEffect(() => {
    const mesh = splatMeshRef.current;
    if (!mesh) return;

    const d = THREE.MathUtils.degToRad;
    mesh.rotation.set(
      d(scanConfig.rotation[0]),
      d(scanConfig.rotation[1]),
      d(scanConfig.rotation[2])
    );
    mesh.scale.setScalar(scanConfig.scale);
    mesh.position.set(0, scanConfig.modelY, 0);

    // Update camera near & fov from config
    const perspCamera = camera as THREE.PerspectiveCamera;
    if (perspCamera.isPerspectiveCamera) {
      if (scanConfig.fov && perspCamera.fov !== scanConfig.fov) {
        perspCamera.fov = scanConfig.fov;
        perspCamera.updateProjectionMatrix();
      }
      if (scanConfig.near && perspCamera.near !== scanConfig.near) {
        perspCamera.near = scanConfig.near;
        perspCamera.updateProjectionMatrix();
      }
    }
  }, [
    scanConfig.rotation,
    scanConfig.scale,
    scanConfig.modelY,
    scanConfig.fov,
    scanConfig.near,
    camera,
  ]);

  if (!splatMeshRef.current) return null;

  return <primitive object={splatMeshRef.current} />;
};
