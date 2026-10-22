import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/useStore';

export const RoutePathVisualizer: React.FC = () => {
  const activePath = useStore((s) => s.activePath);
  const isEmergency = useStore((s) => s.isEmergency);
  const activeDestination = useStore((s) => s.activeDestination);

  const lineMatRef = useRef<THREE.LineDashedMaterial>(null);
  const beaconRingRef = useRef<THREE.Mesh>(null);
  const beaconCoreRef = useRef<THREE.Mesh>(null);

  // Generate smooth curve and points from activePath
  const { lineGeometry, curvePoints, chevronTransforms } = useMemo(() => {
    if (activePath.length < 2) {
      return { lineGeometry: null, curvePoints: [], chevronTransforms: [] };
    }

    const vectors = activePath.map((p) => new THREE.Vector3(p[0], 0.08, p[2]));
    // CatmullRom curve for silky smooth visual interpolation
    const curve = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.2);
    const divisions = Math.max(50, activePath.length * 20);
    const sampled = curve.getPoints(divisions);

    const geom = new THREE.BufferGeometry().setFromPoints(sampled);

    // Compute line distances for dashed material animation
    const lineGeom = geom;
    const distances = [0];
    for (let i = 1; i < sampled.length; i++) {
      distances.push(distances[i - 1] + sampled[i].distanceTo(sampled[i - 1]));
    }
    lineGeom.setAttribute('lineDistance', new THREE.Float32BufferAttribute(distances, 1));

    // Place directional chevron arrows along the curve every 1.5m
    const totalDist = distances[distances.length - 1];
    const chevronCount = Math.floor(totalDist / 1.5);
    const transforms: { pos: [number, number, number]; rot: number }[] = [];

    for (let i = 1; i <= chevronCount; i++) {
      const u = (i * 1.5) / totalDist;
      if (u < 0.98) {
        const pt = curve.getPointAt(u);
        const tangent = curve.getTangentAt(u);
        const angle = Math.atan2(tangent.x, tangent.z);
        transforms.push({
          pos: [pt.x, 0.09, pt.z],
          rot: angle,
        });
      }
    }

    return { lineGeometry: lineGeom, curvePoints: sampled, chevronTransforms: transforms };
  }, [activePath]);

  // Animate pulse & dashed texture
  useFrame((_, delta) => {
    if (lineMatRef.current) {
      lineMatRef.current.dashOffset -= delta * 3.5;
    }
    if (beaconRingRef.current) {
      beaconRingRef.current.rotation.z += delta * 1.5;
      const s = 1 + Math.sin(Date.now() * 0.005) * 0.2;
      beaconRingRef.current.scale.set(s, s, s);
    }
    if (beaconCoreRef.current) {
      beaconCoreRef.current.position.y = 0.5 + Math.sin(Date.now() * 0.006) * 0.2;
    }
  });

  if (!lineGeometry || activePath.length < 2) return null;

  const pathColor = isEmergency ? '#ef4444' : '#10b981';
  const glowColor = isEmergency ? '#dc2626' : '#06b6d4';

  const destPoint = activePath[activePath.length - 1];

  return (
    <group>
      {/* 1. Base Glow Ribbon under the line */}
      <mesh position={[0, 0.02, 0]}>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3(activePath.map(p => new THREE.Vector3(p[0], 0.04, p[2]))),
          64,
          0.12,
          8,
          false
        ]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Primary Animated Dashed Line */}
      {/* @ts-expect-error Three R3F line */}
      <line geometry={lineGeometry}>
        <lineDashedMaterial
          ref={lineMatRef}
          color={pathColor}
          dashSize={0.6}
          gapSize={0.3}
          linewidth={4}
          transparent
          opacity={0.95}
        />
      </line>

      {/* 3. Direction Arrows / Chevrons */}
      {chevronTransforms.map((t, idx) => (
        <group key={idx} position={t.pos} rotation={[-Math.PI / 2, 0, -t.rot]}>
          {/* Chevron triangle */}
          <mesh rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.2, 0.35, 3]} />
            <meshBasicMaterial color={pathColor} transparent opacity={0.85} />
          </mesh>
        </group>
      ))}

      {/* 4. Target Destination Pulsing Beacon */}
      {destPoint && (
        <group position={[destPoint[0], 0, destPoint[2]]}>
          {/* Expanding target ring */}
          <mesh ref={beaconRingRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.65, 32]} />
            <meshBasicMaterial color={pathColor} side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>

          {/* Vertical beacon column */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.04, 0.1, 2.4, 16]} />
            <meshBasicMaterial color={pathColor} transparent opacity={0.5} />
          </mesh>

          {/* Floating diamond at top */}
          <mesh ref={beaconCoreRef} position={[0, 2.2, 0]} rotation={[0.4, 0.4, 0]}>
            <octahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial
              color={pathColor}
              emissive={pathColor}
              emissiveIntensity={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Floor spot illumination */}
          <pointLight color={pathColor} intensity={2.5} distance={3} position={[0, 0.5, 0]} />
        </group>
      )}
    </group>
  );
};
