import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import floorPlanData from '../data/floorplan.json';
import {
  getFloorTileTexture,
  getPegboardTexture,
  getSafetyPostersTexture,
  getQRPosterTexture,
  getPowerSocketsTexture,
  getTVScreenTexture,
} from './materials/labTextures';

const CEILING_HEIGHT = 2.85;

export const RealLabMeshModel: React.FC = () => {
  const isTopDownView = useStore((s) => s.isTopDownView);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const floorPlanTransform = useStore((s) => s.floorPlanTransform);
  const setSelectedObject = useStore((s) => s.setSelectedObject);

  // 1. Textures & Materials
  const floorTileTex = useMemo(() => getFloorTileTexture(), []);
  const pegboardTex = useMemo(() => getPegboardTexture(), []);
  const safetyPostersTex = useMemo(() => getSafetyPostersTexture(), []);
  const qrPosterTex = useMemo(() => getQRPosterTexture(), []);
  const powerSocketsTex = useMemo(() => getPowerSocketsTexture(), []);
  const tvScreenTex = useMemo(() => getTVScreenTexture(), []);

  // Shared Realistic Materials
  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: floorTileTex,
        roughness: 0.28,
        metalness: 0.05,
      }),
    [floorTileTex]
  );

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f3f4f6', // Matte white paint
        roughness: 0.9,
        metalness: 0.02,
      }),
    []
  );

  const aluminiumFrameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e2229', // Black powder-coated aluminium
        roughness: 0.35,
        metalness: 0.85,
      }),
    []
  );

  const partitionLaminateMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ece7de', // Off-white/cream laminate lower panel
        roughness: 0.45,
        metalness: 0.05,
      }),
    []
  );

  const clearGlassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.35,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.9,
        ior: 1.5,
      }),
    []
  );

  const frostedGlassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#e2e8f0',
        transparent: true,
        opacity: 0.65,
        roughness: 0.55,
        metalness: 0.05,
        transmission: 0.6,
      }),
    []
  );

  const deskOakMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d6ba8f', // Light oak laminate tops
        roughness: 0.38,
        metalness: 0.05,
      }),
    []
  );

  const steelLegsMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#64748b', // Grey steel legs
        roughness: 0.3,
        metalness: 0.8,
      }),
    []
  );

  const greyPlasticChairMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#94a3b8', // Grey plastic stacking chairs
        roughness: 0.55,
        metalness: 0.1,
      }),
    []
  );

  const blackMeshChairMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#18181b', // Black mesh office chair
        roughness: 0.7,
        metalness: 0.2,
      }),
    []
  );

  // Opacity modulation in Align Mode (50% opacity so splat is visible underneath)
  const groupOpacity = isAlignMode ? 0.5 : 1.0;

  return (
    <group
      position={[floorPlanTransform.x, 0, floorPlanTransform.z]}
      rotation={[0, floorPlanTransform.rotation, 0]}
      scale={floorPlanTransform.scale}
    >
      {/* 1. REAL VITRIFIED TILE FLOOR */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        material={floorMaterial}
      >
        <planeGeometry args={[18, 11]} />
      </mesh>

      {/* 2. OUTER PERIMETER WALLS (Matte White) */}
      {/* North Exterior Wall with Window Cutouts */}
      <group position={[0, CEILING_HEIGHT / 2, -5.2]}>
        <mesh receiveShadow material={wallMaterial}>
          <boxGeometry args={[17.5, CEILING_HEIGHT, 0.15]} />
        </mesh>
        {/* Exterior Windows with white metal grills */}
        {[-4.5, 0.5, 5.5].map((wx, idx) => (
          <group key={`win-n-${idx}`} position={[wx, 0.1, 0]}>
            {/* Window Glass */}
            <mesh material={clearGlassMaterial}>
              <boxGeometry args={[2.4, 1.4, 0.05]} />
            </mesh>
            {/* White Metal Grills */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((gx, gIdx) => (
              <mesh key={`grill-n-${gIdx}`} position={[gx, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 1.4, 8]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.7} roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* South Exterior Wall with Windows */}
      <group position={[0, CEILING_HEIGHT / 2, 5.0]}>
        <mesh receiveShadow material={wallMaterial}>
          <boxGeometry args={[17.5, CEILING_HEIGHT, 0.15]} />
        </mesh>
        {[-5.0, -0.2, 4.6].map((wx, idx) => (
          <group key={`win-s-${idx}`} position={[wx, 0.1, 0]}>
            <mesh material={clearGlassMaterial}>
              <boxGeometry args={[2.4, 1.4, 0.05]} />
            </mesh>
            {[-0.8, -0.4, 0, 0.4, 0.8].map((gx, gIdx) => (
              <mesh key={`grill-s-${gIdx}`} position={[gx, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 1.4, 8]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.7} roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* West Wall (Entrance Side) */}
      <group position={[-8.75, CEILING_HEIGHT / 2, 0]}>
        {/* Upper & side wall parts around main door */}
        <mesh position={[0, 0, -2.9]} material={wallMaterial}>
          <boxGeometry args={[0.15, CEILING_HEIGHT, 4.5]} />
        </mesh>
        <mesh position={[0, 0, 2.9]} material={wallMaterial}>
          <boxGeometry args={[0.15, CEILING_HEIGHT, 4.5]} />
        </mesh>
        <mesh position={[0, 1.35, 0]} material={wallMaterial}>
          <boxGeometry args={[0.15, 0.55, 1.3]} />
        </mesh>
        {/* Wooden Entrance Door */}
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.06, 2.3, 1.2]} />
          <meshStandardMaterial color="#854d0e" roughness={0.4} metalness={0.1} />
        </mesh>
      </group>

      {/* East End Wall */}
      <mesh position={[8.5, CEILING_HEIGHT / 2, 0]} material={wallMaterial}>
        <boxGeometry args={[0.15, CEILING_HEIGHT, 10.4]} />
      </mesh>

      {/* 3. ALUMINIUM GLASS PARTITIONS LINING CENTRAL CORRIDOR (Z = -0.75 and Z = +0.75) */}
      {/* North Partition Line (Z = -0.75) with Door Gaps */}
      {/* Workshop partition (-7.5 to -2.2) with door at -4.8 */}
      <group position={[0, 0, -0.75]}>
        {/* Left section of workshop */}
        <PartitionSection startX={-7.5} endX={-5.4} />
        {/* Right section of workshop */}
        <PartitionSection startX={-4.2} endX={-2.2} />
        {/* Electronics section (-2.2 to 3.4) with door at 0.6 */}
        <PartitionSection startX={-2.2} endX={0.0} />
        <PartitionSection startX={1.2} endX={3.4} />
        {/* 3D Printing section (3.4 to 8.0) with door at 5.6 */}
        <PartitionSection startX={3.4} endX={5.0} />
        <PartitionSection startX={6.2} endX={8.0} />
      </group>

      {/* South Partition Line (Z = +0.75) with Door Gaps */}
      <group position={[0, 0, 0.75]}>
        {/* Laser Cutter (-7.5 to -2.8) with door at -5.2 */}
        <PartitionSection startX={-7.5} endX={-5.8} />
        <PartitionSection startX={-4.6} endX={-2.8} />
        {/* Meeting Room (-2.8 to 2.6) with door at -0.2 */}
        <PartitionSection startX={-2.8} endX={-0.8} />
        <PartitionSection startX={0.4} endX={2.6} isFrosted />
        {/* Study Area (2.6 to 6.8) with door at 4.5 */}
        <PartitionSection startX={2.6} endX={3.9} />
        <PartitionSection startX={5.1} endX={6.8} />
        {/* Storage (6.8 to 8.5) with door at 7.6 */}
        <PartitionSection startX={6.8} endX={7.1} />
        <PartitionSection startX={8.1} endX={8.5} />
      </group>

      {/* Cross Dividing Partitions between Rooms */}
      <PartitionCrossDivider z1={-5.2} z2={-0.75} x={-2.2} />
      <PartitionCrossDivider z1={-5.2} z2={-0.75} x={3.4} />
      <PartitionCrossDivider z1={0.75} z2={5.0} x={-2.8} />
      <PartitionCrossDivider z1={0.75} z2={5.0} x={2.6} />
      <PartitionCrossDivider z1={0.75} z2={5.0} x={6.8} />

      {/* 4. REAL LAB FURNITURE & EQUIPMENT (MATCHING 15 PHOTOS) */}

      {/* ENTRANCE: Face Recognition Kiosk & QR Poster */}
      <group position={[-7.8, 0, 0.45]}>
        {/* Kiosk Pedestal */}
        <mesh position={[0, 0.6, 0]} material={aluminiumFrameMaterial}>
          <cylinderGeometry args={[0.035, 0.045, 1.2, 16]} />
        </mesh>
        {/* Kiosk Base */}
        <mesh position={[0, 0.02, 0]} material={aluminiumFrameMaterial}>
          <cylinderGeometry args={[0.2, 0.22, 0.04, 16]} />
        </mesh>
        {/* Kiosk Tablet Display with Face Recognition Screen */}
        <mesh position={[0, 1.25, 0]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.22, 0.34, 0.03]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.25, 0.016]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[0.18, 0.28]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* QR Poster on glass partition */}
      <mesh position={[-7.8, 1.45, -0.74]}>
        <planeGeometry args={[0.55, 0.78]} />
        <meshBasicMaterial map={qrPosterTex} side={THREE.DoubleSide} />
      </mesh>

      {/* MECHANICAL WORKSHOP */}
      {/* Blue Pegboard Tool Wall with Hand Tools */}
      <mesh position={[-4.8, 1.35, -5.14]}>
        <planeGeometry args={[3.6, 1.3]} />
        <meshStandardMaterial map={pegboardTex} roughness={0.5} />
      </mesh>
      {/* 4 Yellow Safety Posters above tool wall */}
      <mesh position={[-4.8, 2.3, -5.14]}>
        <planeGeometry args={[3.4, 0.55]} />
        <meshBasicMaterial map={safetyPostersTex} />
      </mesh>
      {/* Long Heavy Wooden Workbench */}
      <WoodenDesk
        pos={[-4.8, 0, -4.2]}
        size={[3.8, 0.85, 0.9]}
        topMat={deskOakMaterial}
        legMat={steelLegsMaterial}
      />
      {/* Bench Drill Press on Workbench */}
      <group position={[-6.0, 0.85, -4.2]}>
        {/* Base */}
        <mesh position={[0, 0.03, 0]} material={steelLegsMaterial}>
          <boxGeometry args={[0.3, 0.06, 0.35]} />
        </mesh>
        {/* Column */}
        <mesh position={[0, 0.45, -0.08]} material={steelLegsMaterial}>
          <cylinderGeometry args={[0.035, 0.035, 0.85, 16]} />
        </mesh>
        {/* Motor Head & Pulley */}
        <mesh position={[0, 0.85, 0.02]} material={aluminiumFrameMaterial}>
          <boxGeometry args={[0.22, 0.26, 0.42]} />
        </mesh>
        {/* Drill Chuck & Lever */}
        <mesh position={[0, 0.62, 0.12]}>
          <cylinderGeometry args={[0.02, 0.02, 0.18, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      {/* Metal Chop Saw on Workbench */}
      <group position={[-3.6, 0.85, -4.2]}>
        <mesh position={[0, 0.03, 0]} material={steelLegsMaterial}>
          <boxGeometry args={[0.42, 0.06, 0.42]} />
        </mesh>
        {/* Circular Blade Housing & Pivot */}
        <mesh position={[0, 0.22, 0]} rotation={[0.4, 0, 0]} material={aluminiumFrameMaterial}>
          <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
        </mesh>
      </group>
      {/* White A-Frame Step Stool */}
      <group position={[-2.7, 0, -3.2]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.35, 0.6, 0.38]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
      </group>
      {/* Grey Plastic Stacking Chairs in Workshop */}
      <GreyPlasticChair pos={[-5.2, 0, -3.2]} rot={3.14} mat={greyPlasticChairMaterial} />
      <GreyPlasticChair pos={[-4.2, 0, -3.2]} rot={3.14} mat={greyPlasticChairMaterial} />

      {/* ELECTRONICS BENCH ROOM */}
      {/* Long Wall-Mounted Wooden Desk */}
      <WoodenDesk
        pos={[0.6, 0, -4.6]}
        size={[5.0, 0.78, 0.8]}
        topMat={deskOakMaterial}
        legMat={steelLegsMaterial}
      />
      {/* Row of Power Sockets above desk */}
      <mesh position={[0.6, 1.15, -5.16]}>
        <planeGeometry args={[4.8, 0.14]} />
        <meshBasicMaterial map={powerSocketsTex} />
      </mesh>
      {/* Digital Oscilloscope on desk */}
      <group position={[-1.2, 0.78, -4.6]}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.34, 0.22, 0.2]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Illuminated Screen */}
        <mesh position={[0.04, 0.12, 0.102]}>
          <planeGeometry args={[0.18, 0.12]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>
      {/* DC Bench Power Supply */}
      <group position={[-0.3, 0.78, -4.6]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.26, 0.18, 0.24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Red LED Readouts */}
        <mesh position={[0, 0.13, 0.122]}>
          <planeGeometry args={[0.16, 0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
      {/* Lab Laptop */}
      <group position={[1.4, 0.78, -4.5]}>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.32, 0.015, 0.22]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.11, -0.1]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.32, 0.2, 0.012]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>
      </group>
      {/* Wall Fire Extinguisher */}
      <group position={[-2.14, 1.3, -2.5]} rotation={[0, 1.57, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.45, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
      </group>
      {/* Chairs in Electronics Room */}
      <GreyPlasticChair pos={[-0.8, 0, -3.7]} rot={3.14} mat={greyPlasticChairMaterial} />
      <GreyPlasticChair pos={[1.2, 0, -3.7]} rot={3.14} mat={greyPlasticChairMaterial} />

      {/* 3D PRINTING AREA */}
      <WoodenDesk
        pos={[5.6, 0, -4.4]}
        size={[4.0, 0.8, 0.85]}
        topMat={deskOakMaterial}
        legMat={steelLegsMaterial}
      />
      {/* Two Enclosed 3D Printers */}
      {[4.3, 5.5].map((px, idx) => (
        <group key={`printer-${idx}`} position={[px, 0.8, -4.4]}>
          {/* Black Frame */}
          <mesh position={[0, 0.24, 0]} material={aluminiumFrameMaterial}>
            <boxGeometry args={[0.45, 0.48, 0.42]} />
          </mesh>
          {/* Acrylic Front Inspection Door */}
          <mesh position={[0, 0.24, 0.212]}>
            <planeGeometry args={[0.38, 0.4]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transparent
              opacity={0.35}
              roughness={0.1}
              transmission={0.8}
            />
          </mesh>
          {/* Filament Spool on top */}
          <mesh position={[0.1, 0.54, 0]} rotation={[0, 0, 1.57]}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Desktop Slicer PC Workstation */}
      <group position={[6.8, 0.8, -4.4]}>
        <mesh position={[0, 0.22, -0.05]} material={aluminiumFrameMaterial}>
          <boxGeometry args={[0.52, 0.32, 0.03]} />
        </mesh>
        <mesh position={[0, 0.22, -0.03]}>
          <planeGeometry args={[0.48, 0.28]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh position={[0.35, 0.18, 0]} material={aluminiumFrameMaterial}>
          <boxGeometry args={[0.16, 0.36, 0.36]} />
        </mesh>
      </group>
      <GreyPlasticChair pos={[6.8, 0, -3.5]} rot={3.14} mat={greyPlasticChairMaterial} />

      {/* LASER CUTTER CABIN */}
      {/* Grey/Blue CNC Laser Machine */}
      <group position={[-5.2, 0, 3.5]} rotation={[0, 3.14, 0]}>
        {/* Main Chassis */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.8, 0.9, 1.25]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Tinted Acrylic Inspection Lid */}
        <mesh position={[0, 0.91, 0]}>
          <boxGeometry args={[1.5, 0.04, 0.95]} />
          <meshPhysicalMaterial
            color="#f97316"
            transparent
            opacity={0.45}
            roughness={0.1}
            transmission={0.7}
          />
        </mesh>
        {/* Control Console */}
        <mesh position={[0.7, 0.94, -0.45]}>
          <boxGeometry args={[0.25, 0.08, 0.22]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>
      </group>
      {/* Laser Operator Desk & Black Office Chair */}
      <WoodenDesk
        pos={[-3.4, 0, 3.6]}
        size={[1.0, 0.75, 0.6]}
        topMat={deskOakMaterial}
        legMat={steelLegsMaterial}
      />
      <BlackOfficeChair pos={[-3.4, 0, 2.7]} rot={3.14} mat={blackMeshChairMaterial} />

      {/* MEETING ROOM */}
      {/* Large Wooden Meeting Table */}
      <WoodenDesk
        pos={[-0.1, 0, 2.8]}
        size={[3.2, 0.76, 1.4]}
        topMat={deskOakMaterial}
        legMat={steelLegsMaterial}
      />
      {/* Wall-Mounted Black TV Displaying Real Spatial Dashboard */}
      <group position={[-0.1, 1.55, 4.93]} rotation={[0, 3.14, 0]}>
        <mesh material={aluminiumFrameMaterial}>
          <boxGeometry args={[1.8, 1.05, 0.06]} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[1.74, 0.98]} />
          <meshBasicMaterial map={tvScreenTex} />
        </mesh>
      </group>
      {/* 6 Meeting Chairs around table */}
      {[-1.0, 0.0, 1.0].map((cx, idx) => (
        <React.Fragment key={`meet-chairs-${idx}`}>
          <GreyPlasticChair pos={[cx, 0, 2.0]} rot={0} mat={greyPlasticChairMaterial} />
          <GreyPlasticChair pos={[cx, 0, 3.6]} rot={3.14} mat={greyPlasticChairMaterial} />
        </React.Fragment>
      ))}

      {/* STUDY AREA ALONG WINDOWS */}
      <WoodenDesk
        pos={[4.7, 0, 4.4]}
        size={[3.6, 0.76, 0.7]}
        topMat={deskOakMaterial}
        legMat={steelLegsMaterial}
      />
      {/* 3 Black Mesh Office Chairs */}
      <BlackOfficeChair pos={[3.6, 0, 3.6]} rot={0} mat={blackMeshChairMaterial} />
      <BlackOfficeChair pos={[4.7, 0, 3.6]} rot={0} mat={blackMeshChairMaterial} />
      <BlackOfficeChair pos={[5.8, 0, 3.6]} rot={0} mat={blackMeshChairMaterial} />

      {/* STORAGE CORNER */}
      {/* Cardboard sheets and stacked material boxes */}
      <group position={[7.6, 0, 3.5]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.8, 0.5, 0.8]} />
          <meshStandardMaterial color="#b45309" roughness={0.9} />
        </mesh>
        <mesh position={[0.1, 0.65, 0]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.6, 0.35, 0.6]} />
          <meshStandardMaterial color="#92400e" roughness={0.9} />
        </mesh>
        <mesh position={[-0.45, 0.6, 0]} rotation={[0, 0, -0.1]} castShadow>
          <boxGeometry args={[0.08, 1.1, 0.9]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      </group>

      {/* 5. COOL-WHITE CEILING WITH LED PANEL LIGHT FIXTURES (6000K) */}
      {/* Hidden when in Top-Down Plan view */}
      {!isTopDownView && (
        <group position={[0, CEILING_HEIGHT, 0]}>
          {/* Ceiling Slab */}
          <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[18, 11]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>

          {/* Embedded Cool-White LED Light Panels (6000 K) with Faint Glow */}
          {[
            // Corridor LED panels
            [-5.5, 0],
            [-2.0, 0],
            [1.5, 0],
            [5.0, 0],
            // Workshop LED panels
            [-4.8, -3.0],
            // Electronics room LED panels
            [0.6, -3.0],
            // 3D printing LED panels
            [5.6, -3.0],
            // Laser cutter LED panel
            [-5.2, 2.8],
            // Meeting room LED panel
            [-0.1, 2.8],
            // Study area LED panel
            [4.7, 2.8],
          ].map(([lx, lz], idx) => (
            <group key={`light-fixture-${idx}`} position={[lx, -0.01, lz]}>
              {/* LED Diffuser Panel (1200 x 600 mm) */}
              <mesh>
                <boxGeometry args={[1.2, 0.03, 0.6]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#f0f9ff"
                  emissiveIntensity={1.4}
                  roughness={0.1}
                />
              </mesh>
              {/* Soft Area Point Light */}
              <pointLight color="#f0f9ff" intensity={0.45} distance={7.5} />
            </group>
          ))}
        </group>
      )}
    </group>
  );
};

/**
 * Standard Partition Section:
 * - 5 cm black aluminium frame
 * - Lower panel up to 1.0 m (cream laminate)
 * - Upper panel 1.0 to 2.4 m (clear architectural glass / frosted)
 */
const PartitionSection: React.FC<{
  startX: number;
  endX: number;
  isFrosted?: boolean;
}> = ({ startX, endX, isFrosted }) => {
  const width = Math.abs(endX - startX);
  const midX = (startX + endX) / 2;

  const aluMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e2229',
        roughness: 0.35,
        metalness: 0.85,
      }),
    []
  );

  const lamMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ece7de',
        roughness: 0.45,
        metalness: 0.05,
      }),
    []
  );

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: isFrosted ? 0.65 : 0.32,
        roughness: isFrosted ? 0.5 : 0.05,
        metalness: 0.08,
        transmission: isFrosted ? 0.6 : 0.9,
      }),
    [isFrosted]
  );

  return (
    <group position={[midX, 0, 0]}>
      {/* Lower Cream Laminate Panel (0 to 1.0 m) */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={lamMat}>
        <boxGeometry args={[width - 0.05, 0.98, 0.04]} />
      </mesh>

      {/* Upper Glass Panel (1.0 to 2.4 m) */}
      <mesh position={[0, 1.7, 0]} material={glassMat}>
        <boxGeometry args={[width - 0.05, 1.38, 0.02]} />
      </mesh>

      {/* Vertical Aluminium Frame Mullions (5 cm) */}
      <mesh position={[-width / 2 + 0.025, 1.2, 0]} material={aluMat}>
        <boxGeometry args={[0.05, 2.4, 0.05]} />
      </mesh>
      <mesh position={[width / 2 - 0.025, 1.2, 0]} material={aluMat}>
        <boxGeometry args={[0.05, 2.4, 0.05]} />
      </mesh>

      {/* Horizontal Divider Transom Rail at 1.0m */}
      <mesh position={[0, 1.0, 0]} material={aluMat}>
        <boxGeometry args={[width, 0.04, 0.05]} />
      </mesh>

      {/* Top Aluminium Header Rail at 2.4m */}
      <mesh position={[0, 2.4, 0]} material={aluMat}>
        <boxGeometry args={[width, 0.05, 0.05]} />
      </mesh>
    </group>
  );
};

/**
 * Cross Divider Partition between Adjacent Rooms
 */
const PartitionCrossDivider: React.FC<{ z1: number; z2: number; x: number }> = ({
  z1,
  z2,
  x,
}) => {
  const depth = Math.abs(z2 - z1);
  const midZ = (z1 + z2) / 2;

  const aluMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e2229',
        roughness: 0.35,
        metalness: 0.85,
      }),
    []
  );

  const lamMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ece7de',
        roughness: 0.45,
        metalness: 0.05,
      }),
    []
  );

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.32,
        roughness: 0.05,
        metalness: 0.08,
        transmission: 0.9,
      }),
    []
  );

  return (
    <group position={[x, 0, midZ]}>
      {/* Lower panel */}
      <mesh position={[0, 0.5, 0]} material={lamMat}>
        <boxGeometry args={[0.04, 0.98, depth - 0.05]} />
      </mesh>
      {/* Upper glass */}
      <mesh position={[0, 1.7, 0]} material={glassMat}>
        <boxGeometry args={[0.02, 1.38, depth - 0.05]} />
      </mesh>
      {/* Aluminium rails */}
      <mesh position={[0, 1.0, 0]} material={aluMat}>
        <boxGeometry args={[0.05, 0.04, depth]} />
      </mesh>
      <mesh position={[0, 2.4, 0]} material={aluMat}>
        <boxGeometry args={[0.05, 0.05, depth]} />
      </mesh>
    </group>
  );
};

/**
 * Wooden Desk with bevelled oak laminate tabletop & steel legs
 */
const WoodenDesk: React.FC<{
  pos: [number, number, number];
  size: [number, number, number];
  topMat: THREE.Material;
  legMat: THREE.Material;
}> = ({ pos, size, topMat, legMat }) => {
  const [w, h, d] = size;
  return (
    <group position={pos}>
      {/* Tabletop */}
      <mesh position={[0, h - 0.025, 0]} castShadow receiveShadow material={topMat}>
        <boxGeometry args={[w, 0.05, d]} />
      </mesh>
      {/* 4 Steel Legs */}
      <mesh position={[-w / 2 + 0.06, h / 2 - 0.025, -d / 2 + 0.06]} castShadow material={legMat}>
        <cylinderGeometry args={[0.025, 0.025, h - 0.05, 12]} />
      </mesh>
      <mesh position={[w / 2 - 0.06, h / 2 - 0.025, -d / 2 + 0.06]} castShadow material={legMat}>
        <cylinderGeometry args={[0.025, 0.025, h - 0.05, 12]} />
      </mesh>
      <mesh position={[-w / 2 + 0.06, h / 2 - 0.025, d / 2 - 0.06]} castShadow material={legMat}>
        <cylinderGeometry args={[0.025, 0.025, h - 0.05, 12]} />
      </mesh>
      <mesh position={[w / 2 - 0.06, h / 2 - 0.025, d / 2 - 0.06]} castShadow material={legMat}>
        <cylinderGeometry args={[0.025, 0.025, h - 0.05, 12]} />
      </mesh>
    </group>
  );
};

/**
 * Grey plastic stacking chair
 */
const GreyPlasticChair: React.FC<{
  pos: [number, number, number];
  rot: number;
  mat: THREE.Material;
}> = ({ pos, rot, mat }) => {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.44, 0]} castShadow material={mat}>
        <boxGeometry args={[0.42, 0.04, 0.4]} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.72, -0.18]} castShadow material={mat}>
        <boxGeometry args={[0.38, 0.45, 0.03]} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.17, 0.22, -0.16]}>
        <cylinderGeometry args={[0.014, 0.014, 0.44, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.17, 0.22, -0.16]}>
        <cylinderGeometry args={[0.014, 0.014, 0.44, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-0.17, 0.22, 0.16]}>
        <cylinderGeometry args={[0.014, 0.014, 0.44, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.17, 0.22, 0.16]}>
        <cylinderGeometry args={[0.014, 0.014, 0.44, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};

/**
 * Black mesh office chair
 */
const BlackOfficeChair: React.FC<{
  pos: [number, number, number];
  rot: number;
  mat: THREE.Material;
}> = ({ pos, rot, mat }) => {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {/* Seat cushion */}
      <mesh position={[0, 0.48, 0]} castShadow material={mat}>
        <boxGeometry args={[0.46, 0.06, 0.44]} />
      </mesh>
      {/* Ergonomic mesh back */}
      <mesh position={[0, 0.78, -0.2]} castShadow material={mat}>
        <boxGeometry args={[0.42, 0.52, 0.04]} />
      </mesh>
      {/* Central spindle & 5-star base */}
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.48, 8]} />
        <meshStandardMaterial color="#1e2229" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.04, 5]} />
        <meshStandardMaterial color="#1e2229" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};
