import React from 'react';
import { useStore } from '../state/useStore';

export const Lighting: React.FC = () => {
  const showShadows = useStore((s) => s.showShadows);
  const performanceMode = useStore((s) => s.performanceMode);

  return (
    <group>
      {/* Soft Ambient Light */}
      <ambientLight intensity={performanceMode ? 0.9 : 0.65} color="#e0f2fe" />

      {/* Main Directional Sun Light (simulating daylight through exterior windows) */}
      <directionalLight
        position={[15, 20, -18]}
        intensity={performanceMode ? 0.8 : 1.2}
        color="#fffbeb"
        castShadow={showShadows && !performanceMode}
        shadow-mapSize-width={performanceMode ? 512 : 2048}
        shadow-mapSize-height={performanceMode ? 512 : 2048}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0005}
      />

      {/* Secondary Fill Directional Light */}
      <directionalLight position={[-15, 12, 18]} intensity={0.4} color="#bfdbfe" />

      {/* Corridor Accent Lights */}
      <pointLight position={[-10, 3.0, 0]} intensity={0.5} distance={12} color="#ffffff" />
      <pointLight position={[0, 3.0, 0]} intensity={0.5} distance={12} color="#ffffff" />
      <pointLight position={[10, 3.0, 0]} intensity={0.5} distance={12} color="#ffffff" />

      {/* Computer Lab 1 & 2 Center Lights */}
      <pointLight position={[-12, 3.2, -7]} intensity={0.7} distance={14} color="#f0fdf4" />
      <pointLight position={[-13, 3.2, 7]} intensity={0.7} distance={14} color="#f0f9ff" />

      {/* HOD & Staff Room Ambient Points */}
      <pointLight position={[1.5, 3.2, -7]} intensity={0.6} distance={10} color="#fef3c7" />
      <pointLight position={[14, 3.2, -7]} intensity={0.6} distance={12} color="#ecfdf5" />
    </group>
  );
};
