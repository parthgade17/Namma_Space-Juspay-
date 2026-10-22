import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/useStore';

export const RoutePathVisualizer: React.FC = () => {
  const activePath = useStore((s) => s.activePath);
  const isEmergency = useStore((s) => s.isEmergency);

  const dashMatRef = useRef<THREE.LineDashedMaterial>(null);
  const targetRingRef = useRef<THREE.Mesh>(null);

  // Generate 8cm thin ribbon and chevron transforms
  const { lineGeometry, chevronTransforms, destPoint } = useMemo(() => {
    if (activePath.length < 2) {
      return { lineGeometry: null, chevronTransforms: [], destPoint: null };
    }

    // Elevation: exactly 2 cm (0.02m) above floor
    const vectors = activePath.map((p) => new THREE.Vector3(p[0], 0.02, p[2]));
    const curve = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.15);
    const divisions = Math.max(40, activePath.length * 15);
    const sampled = curve.getPoints(divisions);

    const geom = new THREE.BufferGeometry().setFromPoints(sampled);

    // Compute line distances for soft dashed animated flow
    const distances = [0];
    for (let i = 1; i < sampled.length; i++) {
      distances.push(distances[i - 1] + sampled[i].distanceTo(sampled[i - 1]));
    }
    geom.setAttribute('lineDistance', new THREE.Float32BufferAttribute(distances, 1));

    // Direction chevrons every 1.8m
    const totalDist = distances[distances.length - 1];
    const count = Math.floor(totalDist / 1.8);
    const transforms: { pos: [number, number, number]; rot: number }[] = [];

    for (let i = 1; i <= count; i++) {
      const u = (i * 1.8) / totalDist;
      if (u < 0.96) {
        const pt = curve.getPointAt(u);
        const tangent = curve.getTangentAt(u);
        const angle = Math.atan2(tangent.x, tangent.z);
        transforms.push({
          pos: [pt.x, 0.025, pt.z],
          rot: angle,
        });
      }
    }

    return {
      lineGeometry: geom,
      chevronTransforms: transforms,
      destPoint: activePath[activePath.length - 1],
    };
  }, [activePath]);

  // Subtle animations
  useFrame((_, delta) => {
    if (dashMatRef.current) {
      (dashMatRef.current as any).dashOffset -= delta * 2.0;
    }
    if (targetRingRef.current) {
      const s = 1 + Math.sin(Date.now() * 0.004) * 0.12;
      targetRingRef.current.scale.set(s, s, s);
    }
  });

  if (!lineGeometry || activePath.length < 2) return null;

  const cyanColor = isEmergency ? '#ef4444' : '#22d3ee'; // Cyan #22d3ee accent

  return (
    <group>
      {/* 1. Thin (8 cm) translucent cyan ribbon 2 cm above floor */}
      <mesh position={[0, 0.02, 0]}>
        <tubeGeometry
          args={[
            new THREE.CatmullRomCurve3(
              activePath.map((p) => new THREE.Vector3(p[0], 0.02, p[2]))
            ),
            Math.max(32, activePath.length * 10),
            0.04, // 8cm diameter tube / thin flat ribbon
            6,
            false,
          ]}
        />
        <meshBasicMaterial
          color={cyanColor}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Soft animated dashed centerline */}
      {/* @ts-expect-error Three R3F line */}
      <line geometry={lineGeometry}>
        <lineDashedMaterial
          ref={dashMatRef}
          color={cyanColor}
          dashSize={0.4}
          gapSize={0.2}
          linewidth={2}
          transparent
          opacity={0.85}
        />
      </line>

      {/* 3. Soft animated chevron arrows */}
      {chevronTransforms.map((t, idx) => (
        <group key={idx} position={t.pos} rotation={[-Math.PI / 2, 0, -t.rot]}>
          <mesh rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.08, 0.16, 3]} />
            <meshBasicMaterial color={cyanColor} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {/* 4. Destination = small ring on the floor (NO big glowing spheres) */}
      {destPoint && (
        <group position={[destPoint[0], 0.025, destPoint[2]]}>
          <mesh ref={targetRingRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.32, 32]} />
            <meshBasicMaterial
              color={cyanColor}
              side={THREE.DoubleSide}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.08, 16]} />
            <meshBasicMaterial color={cyanColor} side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
};
