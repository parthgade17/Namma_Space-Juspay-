import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export function exportSceneToGLB(scene: THREE.Scene, fileName = 'raasta3d_floorplan.glb') {
  const exporter = new GLTFExporter();

  // Create a clean clone without helpers or camera
  const exportGroup = new THREE.Group();
  scene.children.forEach((child) => {
    // Exclude camera, lights, UI helpers from export if desired, or include meshes
    if (child.type === 'Group' || child.type === 'Mesh') {
      exportGroup.add(child.clone());
    }
  });

  exporter.parse(
    scene,
    (gltf) => {
      const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    (error) => {
      console.error('Error exporting scene to GLB:', error);
      alert('Failed to export GLB model.');
    },
    { binary: true }
  );
}
