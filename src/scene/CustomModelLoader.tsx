import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { useStore } from '../state/useStore';

export const CustomModelLoader: React.FC = () => {
  const customModel = useStore((s) => s.customModel);
  const isPlacingPOI = useStore((s) => s.isPlacingPOI);
  const addCustomPOI = useStore((s) => s.addCustomPOI);
  const setIsPlacingPOI = useStore((s) => s.setIsPlacingPOI);

  const [sceneObject, setSceneObject] = useState<THREE.Object3D | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!customModel || !customModel.url) {
      setSceneObject(null);
      return;
    }

    setLoadError(null);

    if (customModel.format === 'ply') {
      const loader = new PLYLoader();
      loader.load(
        customModel.url,
        (geometry) => {
          geometry.computeVertexNormals();
          // Create mesh or points depending on whether faces exist
          let obj: THREE.Object3D;
          if (geometry.index || geometry.attributes.normal) {
            const mat = new THREE.MeshStandardMaterial({
              color: '#94a3b8',
              roughness: 0.5,
              metalness: 0.1,
              side: THREE.DoubleSide,
            });
            obj = new THREE.Mesh(geometry, mat);
          } else {
            const mat = new THREE.PointsMaterial({
              size: 0.05,
              vertexColors: !!geometry.attributes.color,
              color: geometry.attributes.color ? undefined : '#38bdf8',
            });
            obj = new THREE.Points(geometry, mat);
          }

          normalizeObject(obj);
          setSceneObject(obj);
        },
        undefined,
        (err) => {
          console.error('PLY load error', err);
          setLoadError('Failed to parse PLY file.');
        }
      );
    } else {
      // GLTF / GLB loader
      const loader = new GLTFLoader();
      loader.load(
        customModel.url,
        (gltf) => {
          const root = gltf.scene;
          normalizeObject(root);
          setSceneObject(root);
        },
        undefined,
        (err) => {
          console.error('GLTF load error', err);
          setLoadError('Failed to load GLTF / GLB model.');
        }
      );
    }
  }, [customModel]);

  // Center and normalize scale so it fits nicely in our coordinate system
  const normalizeObject = (obj: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Target width roughly 30m
    const maxDim = Math.max(size.x, size.z);
    if (maxDim > 0) {
      const scaleFactor = 30 / maxDim;
      obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    // Re-center so floor rests on Y = 0
    const updatedBox = new THREE.Box3().setFromObject(obj);
    obj.position.x = -updatedBox.getCenter(new THREE.Vector3()).x;
    obj.position.y = -updatedBox.min.y;
    obj.position.z = -updatedBox.getCenter(new THREE.Vector3()).z;

    // Enable shadows
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  };

  const handlePointerDown = (e: any) => {
    if (!isPlacingPOI) return;
    e.stopPropagation();

    const intersectPt = e.point;
    const labelName = prompt('Enter a name for this Point of Interest (POI):', 'Custom Station');
    if (labelName && labelName.trim()) {
      addCustomPOI({
        id: `poi-custom-${Date.now()}`,
        name: labelName.trim(),
        category: 'workstation',
        roomId: 'custom-scanned-space',
        roomName: 'Custom Scanned Model',
        position: [intersectPt.x, intersectPt.y + 0.1, intersectPt.z],
        description: 'User-tagged spatial landmark',
      });
      setIsPlacingPOI(false);
    }
  };

  if (!customModel || !sceneObject) return null;

  return (
    <primitive
      object={sceneObject}
      onPointerDown={handlePointerDown}
      className={isPlacingPOI ? 'cursor-crosshair' : undefined}
    />
  );
};
