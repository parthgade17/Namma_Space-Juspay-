import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/useStore';

export const NavigationPuck: React.FC = () => {
  const userPosition = useStore((s) => s.userPosition);
  const userRotation = useStore((s) => s.userRotation);
  const isAutoWalking = useStore((s) => s.isAutoWalking);
  const activePath = useStore((s) => s.activePath);
  const isEmergency = useStore((s) => s.isEmergency);

  const pulseRingRef = useRef<THREE.Mesh>(null);
  const markerGroupRef = useRef<THREE.Group>(null);
  const avatarBobRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Google Maps Pulse Wave Ring
    if (pulseRingRef.current) {
      const pulseT = (t * 1.6) % 1; // 0 to 1 cycle
      const scale = 1.0 + pulseT * 0.9;
      pulseRingRef.current.scale.set(scale, scale, 1);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 0.6 * (1.0 - pulseT));
      }
    }

    // 2. Walking Avatar Bobbing animation while walking
    if (avatarBobRef.current) {
      if (isAutoWalking) {
        const bob = Math.abs(Math.sin(t * 8.0)) * 0.04;
        const tilt = Math.sin(t * 8.0) * 0.08;
        avatarBobRef.current.position.y = 0.35 + bob;
        avatarBobRef.current.rotation.z = tilt;
      } else {
        avatarBobRef.current.position.y = 0.35 + Math.sin(t * 2.5) * 0.015;
        avatarBobRef.current.rotation.z = 0;
      }
    }
  });

  const cyanColor = isEmergency ? '#ef4444' : '#22d3ee';
  const pulseColor = isEmergency ? '#f87171' : '#38bdf8';

  return (
    <group
      ref={markerGroupRef}
      position={[userPosition[0], 0.03, userPosition[2]]}
      rotation={[0, userRotation, 0]}
    >
      {/* 1. Google Maps Floor Location Disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 0.28, 32]} />
        <meshBasicMaterial color={cyanColor} transparent opacity={0.85} depthWrite={false} />
      </mesh>

      {/* White outer border on disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.26, 0.3, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} depthWrite={false} />
      </mesh>

      {/* 2. Google Maps Radial Pulse Wave */}
      <mesh ref={pulseRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.28, 0.36, 32]} />
        <meshBasicMaterial color={pulseColor} transparent opacity={0.6} depthWrite={false} />
      </mesh>

      {/* 3. Forward Directional Flashlight Beam */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -0.6]}>
        <coneGeometry args={[0.55, 1.2, 16, 1, true, -Math.PI / 2, Math.PI]} />
        <meshBasicMaterial color={cyanColor} transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* 4. White Forward Direction Heading Chevron on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -0.12]}>
        <coneGeometry args={[0.1, 0.18, 3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* 5. 3D Floating Walking Person / Navigation Avatar Indicator */}
      <group ref={avatarBobRef} position={[0, 0.35, 0]}>
        {/* Floating Halo */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.16, 0.2, 24]} />
          <meshBasicMaterial color={cyanColor} transparent opacity={0.7} />
        </mesh>

        {/* 3D Stylized Walking Character / Pin Head */}
        <mesh position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={cyanColor} roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Torso / Body Pillar */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.14, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Dynamic Walking Stride Legs (visible when walking) */}
        {isAutoWalking && (
          <group position={[0, -0.06, 0]}>
            <mesh position={[-0.03, 0, 0.03]}>
              <boxGeometry args={[0.025, 0.1, 0.025]} />
              <meshStandardMaterial color={cyanColor} />
            </mesh>
            <mesh position={[0.03, 0, -0.03]}>
              <boxGeometry args={[0.025, 0.1, 0.025]} />
              <meshStandardMaterial color={cyanColor} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
};
