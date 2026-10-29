import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/useStore';

export const NavigationPuck: React.FC = () => {
  const userPosition = useStore((s) => s.userPosition);
  const userRotation = useStore((s) => s.userRotation);
  const isAutoWalking = useStore((s) => s.isAutoWalking);
  const isEmergency = useStore((s) => s.isEmergency);
  const cameraPerspective = useStore((s) => s.cameraPerspective);

  // References for dynamic joint animations
  const markerGroupRef = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const leftStepRippleRef = useRef<THREE.Mesh>(null);
  const rightStepRippleRef = useRef<THREE.Mesh>(null);
  const bodyRootRef = useRef<THREE.Group>(null);
  const leftHipRef = useRef<THREE.Group>(null);
  const rightHipRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const floatingPinRef = useRef<THREE.Group>(null);

  const walkCycle = useRef(0);
  const lastUserPos = useRef<[number, number, number]>([...userPosition]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Detect if character is actively moving (either through autoWalk or manual controls)
    const distMoved = Math.hypot(
      userPosition[0] - lastUserPos.current[0],
      userPosition[2] - lastUserPos.current[2]
    );
    lastUserPos.current = [...userPosition];
    const isMoving = isAutoWalking || distMoved > 0.005;

    // 2. Google Maps Floor Radial Radar Pulse
    if (pulseRingRef.current) {
      const pulseT = (t * 1.5) % 1; // 0 to 1
      const scale = 1.0 + pulseT * 1.1;
      pulseRingRef.current.scale.set(scale, scale, 1);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 0.55 * (1.0 - pulseT));
      }
    }

    // 3. Floating AR Navigation Waypoint Diamond above head
    if (floatingPinRef.current) {
      floatingPinRef.current.rotation.y = t * 1.8;
      floatingPinRef.current.position.y = 1.72 + Math.sin(t * 3.0) * 0.035;
    }

    // 4. Human Walk Cycle Animation (cadence ~ 7.2 rad/s = ~1.7 steps/s)
    if (isMoving) {
      walkCycle.current += delta * 7.5;
      const cycle = walkCycle.current;

      // Legs swing back & forth (counter-phase)
      const legAngle = Math.sin(cycle) * 0.55;
      if (leftHipRef.current) leftHipRef.current.rotation.x = -legAngle;
      if (rightHipRef.current) rightHipRef.current.rotation.x = legAngle;

      // Natural knee bend when leg moves backward
      if (leftKneeRef.current) {
        leftKneeRef.current.rotation.x = Math.max(0, -Math.sin(cycle)) * 0.55;
      }
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = Math.max(0, Math.sin(cycle)) * 0.55;
      }

      // Arms swing in opposition to legs (human gait mechanics)
      const armAngle = Math.sin(cycle) * 0.45;
      if (leftArmRef.current) leftArmRef.current.rotation.x = armAngle;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -armAngle;

      // Torso vertical bounce (two footsteps per stride cycle)
      if (bodyRootRef.current) {
        bodyRootRef.current.position.y = Math.abs(Math.sin(cycle * 2)) * 0.035;
        bodyRootRef.current.rotation.y = Math.sin(cycle) * 0.05; // gentle pelvic twist
        bodyRootRef.current.rotation.z = Math.sin(cycle) * 0.03; // slight weight shift
      }

      // Dynamic floor footstep ripples when feet strike the ground
      if (leftStepRippleRef.current) {
        const leftDown = Math.sin(cycle);
        const lScale = Math.max(0.2, (leftDown + 1) * 0.4);
        leftStepRippleRef.current.scale.set(lScale, lScale, 1);
        (leftStepRippleRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.4 * -leftDown);
      }
      if (rightStepRippleRef.current) {
        const rightDown = -Math.sin(cycle);
        const rScale = Math.max(0.2, (rightDown + 1) * 0.4);
        rightStepRippleRef.current.scale.set(rScale, rScale, 1);
        (rightStepRippleRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.4 * -rightDown);
      }
    } else {
      // Idle Standing Pose with natural breathing
      const breathe = Math.sin(t * 2.2) * 0.012;
      if (bodyRootRef.current) {
        bodyRootRef.current.position.y = breathe;
        bodyRootRef.current.rotation.set(0, 0, 0);
      }
      if (leftHipRef.current) leftHipRef.current.rotation.x = 0;
      if (rightHipRef.current) rightHipRef.current.rotation.x = 0;
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = 0;
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.05;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.05;
    }
  });

  const cyanColor = isEmergency ? '#ef4444' : '#06b6d4';
  const glowColor = isEmergency ? '#f87171' : '#22d3ee';
  const jacketColor = isEmergency ? '#7f1d1d' : '#0f172a';
  const showFullAvatar = cameraPerspective === 'follow';

  return (
    <group
      ref={markerGroupRef}
      position={[userPosition[0], 0.02, userPosition[2]]}
      rotation={[0, userRotation, 0]}
    >
      {/* ========================================================= */}
      {/* 1. GOOGLE MAPS FLOOR BLUE BEACON & FLASHLIGHT CONE       */}
      {/* ========================================================= */}

      {/* Main Floor Beacon Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 32]} />
        <meshBasicMaterial color={cyanColor} transparent opacity={0.88} depthWrite={false} />
      </mesh>

      {/* High-contrast crisp white border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.30, 0.34, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} depthWrite={false} />
      </mesh>

      {/* Radar Pulse Wave Ring */}
      <mesh ref={pulseRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.32, 0.42, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.5} depthWrite={false} />
      </mesh>

      {/* Forward Directional Flashlight Cone Beam */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -0.75]}>
        <coneGeometry args={[0.7, 1.5, 16, 1, true, -Math.PI / 2, Math.PI]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.18}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Forward Heading Direction Chevron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -0.16]}>
        <coneGeometry args={[0.11, 0.22, 3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Left Footstep Ripple Ring */}
      <mesh ref={leftStepRippleRef} rotation={[-Math.PI / 2, 0, 0]} position={[-0.10, 0.002, 0]}>
        <ringGeometry args={[0.06, 0.12, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Right Footstep Ripple Ring */}
      <mesh ref={rightStepRippleRef} rotation={[-Math.PI / 2, 0, 0]} position={[0.10, 0.002, 0]}>
        <ringGeometry args={[0.06, 0.12, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* ========================================================= */}
      {/* 2. 3D REALISTIC WALKING MAN / NAVIGATION AVATAR          */}
      {/* ========================================================= */}
      <group visible={showFullAvatar}>
        {/* Floating Navigation Waypoint Diamond above head */}
        <group ref={floatingPinRef} position={[0, 1.72, 0]}>
          <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
            <octahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={0.6}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </group>

        {/* Dynamic Body Root (Bobs & sways with walking) */}
        <group ref={bodyRootRef} position={[0, 0, 0]}>
          
          {/* HIPS / WAIST (Pivot at y = 0.70m) */}
          <mesh position={[0, 0.70, 0]}>
            <cylinderGeometry args={[0.14, 0.12, 0.14, 16]} />
            <meshStandardMaterial color={jacketColor} roughness={0.4} />
          </mesh>

          {/* TORSO / ATHLETIC JACKET (y = 0.77 to 1.18m) */}
          <group position={[0, 0.95, 0]}>
            {/* Main Upper Body */}
            <mesh>
              <cylinderGeometry args={[0.18, 0.14, 0.38, 16]} />
              <meshStandardMaterial color={jacketColor} roughness={0.3} metalness={0.2} />
            </mesh>

            {/* Cyan Center Zipper Accent */}
            <mesh position={[0, 0, -0.16]}>
              <boxGeometry args={[0.025, 0.36, 0.02]} />
              <meshBasicMaterial color={glowColor} />
            </mesh>

            {/* Chest Cyan Accent Emblem */}
            <mesh position={[0.06, 0.08, -0.16]}>
              <boxGeometry args={[0.04, 0.04, 0.015]} />
              <meshBasicMaterial color={glowColor} />
            </mesh>
          </group>

          {/* NECK (y = 1.16m) */}
          <mesh position={[0, 1.18, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.08, 12]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>

          {/* HEAD & AR VISOR (y = 1.34m) */}
          <group position={[0, 1.32, 0]}>
            {/* Head Sphere */}
            <mesh>
              <sphereGeometry args={[0.11, 18, 18]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Glowing AR Visor / Sunglasses pointing forward */}
            <mesh position={[0, 0.015, -0.095]}>
              <boxGeometry args={[0.16, 0.045, 0.05]} />
              <meshStandardMaterial
                color={glowColor}
                emissive={glowColor}
                emissiveIntensity={0.8}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>

            {/* Modern Hair/Helmet Cap */}
            <mesh position={[0, 0.05, 0.02]}>
              <sphereGeometry args={[0.115, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={jacketColor} roughness={0.6} />
            </mesh>
          </group>

          {/* LEFT ARM (Shoulder at [-0.21, 1.10, 0]) */}
          <group ref={leftArmRef} position={[-0.21, 1.10, 0]}>
            {/* Shoulder Ball */}
            <mesh>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color={jacketColor} />
            </mesh>
            {/* Upper Arm */}
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.04, 0.035, 0.22, 12]} />
              <meshStandardMaterial color={jacketColor} />
            </mesh>
            {/* Forearm & Hand */}
            <mesh position={[0, -0.28, -0.03]} rotation={[0.25, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.03, 0.20, 12]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
          </group>

          {/* RIGHT ARM (Shoulder at [0.21, 1.10, 0]) */}
          <group ref={rightArmRef} position={[0.21, 1.10, 0]}>
            {/* Shoulder Ball */}
            <mesh>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color={jacketColor} />
            </mesh>
            {/* Upper Arm */}
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.04, 0.035, 0.22, 12]} />
              <meshStandardMaterial color={jacketColor} />
            </mesh>
            {/* Forearm & Hand */}
            <mesh position={[0, -0.28, -0.03]} rotation={[0.25, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.03, 0.20, 12]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
          </group>

          {/* LEFT LEG (Hip at [-0.09, 0.65, 0]) */}
          <group ref={leftHipRef} position={[-0.09, 0.65, 0]}>
            {/* Upper Leg / Thigh */}
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.055, 0.045, 0.30, 12]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Left Knee Pivot */}
            <group ref={leftKneeRef} position={[0, -0.30, 0]}>
              {/* Lower Leg / Calf */}
              <mesh position={[0, -0.15, 0]}>
                <cylinderGeometry args={[0.045, 0.038, 0.30, 12]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>

              {/* Shoe / Sneaker with white sole */}
              <group position={[0, -0.32, -0.04]}>
                <mesh position={[0, 0.03, 0]}>
                  <boxGeometry args={[0.07, 0.06, 0.16]} />
                  <meshStandardMaterial color={glowColor} />
                </mesh>
                <mesh position={[0, 0.005, 0]}>
                  <boxGeometry args={[0.075, 0.02, 0.17]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            </group>
          </group>

          {/* RIGHT LEG (Hip at [0.09, 0.65, 0]) */}
          <group ref={rightHipRef} position={[0.09, 0.65, 0]}>
            {/* Upper Leg / Thigh */}
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.055, 0.045, 0.30, 12]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Right Knee Pivot */}
            <group ref={rightKneeRef} position={[0, -0.30, 0]}>
              {/* Lower Leg / Calf */}
              <mesh position={[0, -0.15, 0]}>
                <cylinderGeometry args={[0.045, 0.038, 0.30, 12]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>

              {/* Shoe / Sneaker with white sole */}
              <group position={[0, -0.32, -0.04]}>
                <mesh position={[0, 0.03, 0]}>
                  <boxGeometry args={[0.07, 0.06, 0.16]} />
                  <meshStandardMaterial color={glowColor} />
                </mesh>
                <mesh position={[0, 0.005, 0]}>
                  <boxGeometry args={[0.075, 0.02, 0.17]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            </group>
          </group>

        </group>
      </group>
    </group>
  );
};
