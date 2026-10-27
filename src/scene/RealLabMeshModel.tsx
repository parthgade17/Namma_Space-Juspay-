import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useStore } from '../state/useStore';
import {
  getFloorTileTexture,
  getWallPlasterTexture,
  getCeilingGridTexture,
  getDeskWoodTexture,
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

  // 1. TEXTURES
  const floorTileTex = useMemo(() => getFloorTileTexture(), []);
  const wallPlasterTex = useMemo(() => getWallPlasterTexture(), []);
  const ceilingGridTex = useMemo(() => getCeilingGridTexture(), []);
  const deskWoodTex = useMemo(() => getDeskWoodTexture(), []);
  const pegboardTex = useMemo(() => getPegboardTexture(), []);
  const safetyPostersTex = useMemo(() => getSafetyPostersTexture(), []);
  const qrPosterTex = useMemo(() => getQRPosterTexture(), []);
  const powerSocketsTex = useMemo(() => getPowerSocketsTexture(), []);
  const tvScreenTex = useMemo(() => getTVScreenTexture(), []);

  // 2. REALISTIC PBR MATERIALS
  const materials = useMemo(() => {
    return {
      floor: new THREE.MeshStandardMaterial({
        map: floorTileTex,
        roughness: 0.35, // Gives soft specular reflections of ceiling lights
        metalness: 0.04,
      }),
      wall: new THREE.MeshStandardMaterial({
        map: wallPlasterTex,
        roughness: 0.88,
        metalness: 0.02,
      }),
      ceiling: new THREE.MeshStandardMaterial({
        map: ceilingGridTex,
        roughness: 0.85,
        metalness: 0.05,
      }),
      aluminiumFrame: new THREE.MeshStandardMaterial({
        color: '#1a1d20', // Black powder-coated aluminium with slight metallic sheen
        roughness: 0.32,
        metalness: 0.82,
      }),
      skirting: new THREE.MeshStandardMaterial({
        color: '#181b1e', // Dark aluminium kickplate / skirting
        roughness: 0.4,
        metalness: 0.7,
      }),
      partitionLaminate: new THREE.MeshStandardMaterial({
        color: '#ebe5db', // Warm cream architectural laminate
        roughness: 0.48,
        metalness: 0.04,
      }),
      clearGlass: new THREE.MeshPhysicalMaterial({
        color: '#f0fdf4', // Slight glass green-tint
        transmission: 0.95,
        roughness: 0.05,
        thickness: 0.01,
        ior: 1.52,
        transparent: true,
        opacity: 0.32,
        reflectivity: 0.6,
      }),
      frostedGlass: new THREE.MeshPhysicalMaterial({
        color: '#e2e8f0',
        transmission: 0.65,
        roughness: 0.6,
        thickness: 0.015,
        transparent: true,
        opacity: 0.68,
      }),
      deskOak: new THREE.MeshStandardMaterial({
        map: deskWoodTex,
        roughness: 0.42,
        metalness: 0.02,
      }),
      steelLegs: new THREE.MeshStandardMaterial({
        color: '#475569',
        roughness: 0.28,
        metalness: 0.88,
      }),
      plasticChair: new THREE.MeshStandardMaterial({
        color: '#64748b', // Grey molded polypropylene stacking chairs
        roughness: 0.5,
        metalness: 0.05,
      }),
      meshChair: new THREE.MeshStandardMaterial({
        color: '#1e293b', // Black breathable mesh office chairs
        roughness: 0.75,
        metalness: 0.15,
      }),
      lightDiffuser: new THREE.MeshBasicMaterial({
        color: '#ffffff', // 6000K cool white LED glow
      }),
      lightHousing: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.3,
        metalness: 0.6,
      }),
      metalHandles: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.15,
        metalness: 0.95,
      }),
      doorWood: new THREE.MeshStandardMaterial({
        color: '#78350f',
        roughness: 0.45,
        metalness: 0.08,
      }),
    };
  }, [floorTileTex, wallPlasterTex, ceilingGridTex, deskWoodTex]);

  // 3. MERGED STATIC ARCHITECTURAL GEOMETRIES (DRASTIC DRAW CALL REDUCTION)
  const {
    mergedFramesGeo,
    mergedLaminateGeo,
    mergedClearGlassGeo,
    mergedFrostedGlassGeo,
    mergedWallsGeo,
    mergedSkirtingGeo,
    mergedGrillsGeo,
    mergedCableTraysGeo,
  } = useMemo(() => {
    const frameGeos: THREE.BufferGeometry[] = [];
    const laminateGeos: THREE.BufferGeometry[] = [];
    const clearGlassGeos: THREE.BufferGeometry[] = [];
    const frostedGlassGeos: THREE.BufferGeometry[] = [];
    const wallGeos: THREE.BufferGeometry[] = [];
    const skirtingGeos: THREE.BufferGeometry[] = [];
    const grillGeos: THREE.BufferGeometry[] = [];
    const trayGeos: THREE.BufferGeometry[] = [];

    // Helper: add BoxGeometry transformed
    const addBox = (
      targetList: THREE.BufferGeometry[],
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number
    ) => {
      const g = new THREE.BoxGeometry(w, h, d);
      g.translate(x, y, z);
      targetList.push(g);
    };

    // Helper: Corridor Partition Section (Frames + Laminate + Glass)
    const addCorridorPartition = (
      startX: number,
      endX: number,
      zPos: number,
      isFrosted = false
    ) => {
      const len = Math.abs(endX - startX);
      const midX = (startX + endX) / 2;
      const frameThick = 0.05;

      // Bottom horizontal aluminium rail
      addBox(frameGeos, len, frameThick, frameThick, midX, frameThick / 2, zPos);
      // Mid horizontal aluminium rail (at 1m junction)
      addBox(frameGeos, len, frameThick, frameThick, midX, 1.0, zPos);
      // Top horizontal aluminium rail (at 2.85m ceiling)
      addBox(frameGeos, len, frameThick, frameThick, midX, CEILING_HEIGHT - frameThick / 2, zPos);

      // Vertical posts every ~1.2m
      const postCount = Math.max(2, Math.round(len / 1.2) + 1);
      for (let i = 0; i < postCount; i++) {
        const px = startX + (len / (postCount - 1)) * i;
        addBox(frameGeos, frameThick, CEILING_HEIGHT, frameThick, px, CEILING_HEIGHT / 2, zPos);
      }

      // Lower cream laminate panel (0 to 1m)
      addBox(laminateGeos, len - 0.02, 0.95, 0.03, midX, 0.5, zPos);

      // Upper glass panel (1m to 2.85m)
      const glassList = isFrosted ? frostedGlassGeos : clearGlassGeos;
      addBox(glassList, len - 0.02, CEILING_HEIGHT - 1.05, 0.01, midX, 1.0 + (CEILING_HEIGHT - 1.0) / 2, zPos);
    };

    // Helper: Dividing wall/partition between rooms
    const addCrossDivider = (xPos: number, z1: number, z2: number) => {
      const len = Math.abs(z2 - z1);
      const midZ = (z1 + z2) / 2;
      const frameThick = 0.05;

      addBox(frameGeos, frameThick, frameThick, len, xPos, frameThick / 2, midZ);
      addBox(frameGeos, frameThick, frameThick, len, xPos, 1.0, midZ);
      addBox(frameGeos, frameThick, frameThick, len, xPos, CEILING_HEIGHT - frameThick / 2, midZ);
      addBox(frameGeos, frameThick, CEILING_HEIGHT, frameThick, xPos, CEILING_HEIGHT / 2, z1);
      addBox(frameGeos, frameThick, CEILING_HEIGHT, frameThick, xPos, CEILING_HEIGHT / 2, z2);

      addBox(laminateGeos, 0.03, 0.95, len - 0.02, xPos, 0.5, midZ);
      addBox(clearGlassGeos, 0.01, CEILING_HEIGHT - 1.05, len - 0.02, xPos, 1.0 + (CEILING_HEIGHT - 1.0) / 2, midZ);
    };

    // A. CENTRAL CORRIDOR PARTITIONS (Z = -0.75 North, Z = +0.75 South)
    // North Partition Sections (with Door Gaps)
    addCorridorPartition(-7.5, -5.4, -0.75); // Workshop Left
    addCorridorPartition(-4.2, -2.2, -0.75); // Workshop Right
    addCorridorPartition(-2.2, 0.0, -0.75);  // Electronics Left
    addCorridorPartition(1.2, 3.4, -0.75);   // Electronics Right
    addCorridorPartition(3.4, 5.0, -0.75);   // 3D Printing Left
    addCorridorPartition(6.2, 8.0, -0.75);   // 3D Printing Right

    // South Partition Sections (with Door Gaps)
    addCorridorPartition(-7.5, -5.8, 0.75);  // Laser Cutter Left
    addCorridorPartition(-4.6, -2.8, 0.75);  // Laser Cutter Right
    addCorridorPartition(-2.8, -0.8, 0.75);  // Meeting Left
    addCorridorPartition(0.4, 2.6, 0.75, true); // Meeting Right (Frosted)
    addCorridorPartition(2.6, 3.9, 0.75);   // Study Area Left
    addCorridorPartition(5.1, 6.8, 0.75);   // Study Area Right
    addCorridorPartition(6.8, 7.1, 0.75);   // Storage Left
    addCorridorPartition(8.1, 8.5, 0.75);   // Storage Right

    // B. CROSS DIVIDER PARTITIONS
    addCrossDivider(-2.2, -5.2, -0.75); // Workshop / Electronics divider
    addCrossDivider(3.4, -5.2, -0.75);  // Electronics / 3D Printing divider
    addCrossDivider(-2.8, 0.75, 5.0);   // Laser Cutter / Meeting divider
    addCrossDivider(2.6, 0.75, 5.0);    // Meeting / Study divider
    addCrossDivider(6.8, 0.75, 5.0);    // Study / Storage divider

    // C. EXTERIOR PERIMETER WALLS & CUTOUTS
    // North Exterior Wall (Z = -5.2) with Window Openings
    addBox(wallGeos, 17.5, 0.9, 0.15, 0, 0.45, -5.2); // Wall below windows
    addBox(wallGeos, 17.5, 0.55, 0.15, 0, 2.57, -5.2); // Wall above windows
    // Spandrel pillars between windows
    addBox(wallGeos, 2.0, 1.4, 0.15, -7.75, 1.6, -5.2);
    addBox(wallGeos, 1.5, 1.4, 0.15, -2.0, 1.6, -5.2);
    addBox(wallGeos, 1.5, 1.4, 0.15, 3.0, 1.6, -5.2);
    addBox(wallGeos, 2.0, 1.4, 0.15, 7.75, 1.6, -5.2);

    // North Window Glass Panes & Grills
    [-4.5, 0.5, 5.5].forEach((wx) => {
      addBox(clearGlassGeos, 2.4, 1.35, 0.02, wx, 1.6, -5.2);
      [-0.8, -0.4, 0, 0.4, 0.8].forEach((gx) => {
        addBox(grillGeos, 0.02, 1.35, 0.02, wx + gx, 1.6, -5.2);
      });
    });

    // South Exterior Wall (Z = 5.0) with Window Openings
    addBox(wallGeos, 17.5, 0.9, 0.15, 0, 0.45, 5.0);
    addBox(wallGeos, 17.5, 0.55, 0.15, 0, 2.57, 5.0);
    addBox(wallGeos, 2.0, 1.4, 0.15, -7.75, 1.6, 5.0);
    addBox(wallGeos, 1.5, 1.4, 0.15, -2.0, 1.6, 5.0);
    addBox(wallGeos, 1.5, 1.4, 0.15, 3.0, 1.6, 5.0);
    addBox(wallGeos, 2.0, 1.4, 0.15, 7.75, 1.6, 5.0);

    // South Window Glass Panes & Grills
    [-5.0, -0.2, 4.6].forEach((wx) => {
      addBox(clearGlassGeos, 2.4, 1.35, 0.02, wx, 1.6, 5.0);
      [-0.8, -0.4, 0, 0.4, 0.8].forEach((gx) => {
        addBox(grillGeos, 0.02, 1.35, 0.02, wx + gx, 1.6, 5.0);
      });
    });

    // West Wall (Entrance Wall, X = -8.75)
    addBox(wallGeos, 0.15, CEILING_HEIGHT, 4.4, -8.75, CEILING_HEIGHT / 2, -2.9);
    addBox(wallGeos, 0.15, CEILING_HEIGHT, 4.4, -8.75, CEILING_HEIGHT / 2, 2.9);
    addBox(wallGeos, 0.15, 0.55, 1.4, -8.75, 2.57, 0); // Lintel above entrance door

    // East End Wall (X = 8.5)
    addBox(wallGeos, 0.15, CEILING_HEIGHT, 10.4, 8.5, CEILING_HEIGHT / 2, 0);

    // D. SKIRTING BOARDS (10cm black kickplate at base of perimeter walls)
    addBox(skirtingGeos, 17.4, 0.1, 0.02, 0, 0.05, -5.11);
    addBox(skirtingGeos, 17.4, 0.1, 0.02, 0, 0.05, 4.91);
    addBox(skirtingGeos, 0.02, 0.1, 10.2, 8.41, 0.05, 0);
    addBox(skirtingGeos, 0.02, 0.1, 4.3, -8.66, 0.05, -2.9);
    addBox(skirtingGeos, 0.02, 0.1, 4.3, -8.66, 0.05, 2.9);

    // E. CABLE TRAYS (Perforated cable channel suspended below ceiling along corridor)
    addBox(trayGeos, 16.0, 0.05, 0.25, 0, CEILING_HEIGHT - 0.12, 0);

    return {
      mergedFramesGeo: mergeGeometries(frameGeos, false),
      mergedLaminateGeo: mergeGeometries(laminateGeos, false),
      mergedClearGlassGeo: mergeGeometries(clearGlassGeos, false),
      mergedFrostedGlassGeo: mergeGeometries(frostedGlassGeos, false),
      mergedWallsGeo: mergeGeometries(wallGeos, false),
      mergedSkirtingGeo: mergeGeometries(skirtingGeos, false),
      mergedGrillsGeo: mergeGeometries(grillGeos, false),
      mergedCableTraysGeo: mergeGeometries(trayGeos, false),
    };
  }, []);

  // 4. INSTANCED MESHES FOR REPEATED OBJECTS (CHAIRS & LIGHTS)
  const plasticChairRef = useRef<THREE.InstancedMesh>(null);
  const officeChairRef = useRef<THREE.InstancedMesh>(null);
  const lightHousingRef = useRef<THREE.InstancedMesh>(null);
  const lightDiffuserRef = useRef<THREE.InstancedMesh>(null);

  // Chair data: [x, y, z, rotationY]
  const plasticChairData = useMemo<[number, number, number, number][]>(
    () => [
      [-5.2, 0, -3.2, Math.PI],
      [-4.2, 0, -3.2, Math.PI],
      [-3.4, 0, -3.2, Math.PI],
      [-1.8, 0, 2.2, 0],
      [-1.0, 0, 2.2, 0],
      [-0.2, 0, 2.2, 0],
      [0.6, 0, 2.2, 0],
      [1.4, 0, 2.2, 0],
    ],
    []
  );

  const officeChairData = useMemo<[number, number, number, number][]>(
    () => [
      [-5.4, 0, 2.8, 0],   // Laser cutter console
      [3.2, 0, 2.6, 0],    // Study desk chair 1
      [4.2, 0, 2.6, 0],    // Study desk chair 2
      [5.2, 0, 2.6, 0],    // Study desk chair 3
      [6.2, 0, 2.6, 0],    // Study desk chair 4
      [5.8, 0, -2.8, Math.PI], // 3D printing workstation
    ],
    []
  );

  // Ceiling lights grid: 18 fixtures across all lab spaces
  const lightData = useMemo<[number, number, number][]>(
    () => [
      // Corridor lights
      [-6.0, CEILING_HEIGHT - 0.02, 0],
      [-3.0, CEILING_HEIGHT - 0.02, 0],
      [0.0, CEILING_HEIGHT - 0.02, 0],
      [3.0, CEILING_HEIGHT - 0.02, 0],
      [6.0, CEILING_HEIGHT - 0.02, 0],
      // Workshop lights
      [-5.0, CEILING_HEIGHT - 0.02, -2.8],
      [-5.0, CEILING_HEIGHT - 0.02, -4.2],
      // Electronics lights
      [0.6, CEILING_HEIGHT - 0.02, -2.8],
      [0.6, CEILING_HEIGHT - 0.02, -4.2],
      // 3D Printing lights
      [5.5, CEILING_HEIGHT - 0.02, -2.8],
      [5.5, CEILING_HEIGHT - 0.02, -4.2],
      // Laser cutter lights
      [-5.0, CEILING_HEIGHT - 0.02, 2.8],
      // Meeting room lights
      [-0.1, CEILING_HEIGHT - 0.02, 2.8],
      // Study area lights
      [4.6, CEILING_HEIGHT - 0.02, 2.8],
      [4.6, CEILING_HEIGHT - 0.02, 4.2],
      // Storage lights
      [7.6, CEILING_HEIGHT - 0.02, 2.8],
    ],
    []
  );

  useEffect(() => {
    const dummy = new THREE.Object3D();

    // Populate plastic stacking chairs
    if (plasticChairRef.current) {
      plasticChairData.forEach((ch, idx) => {
        dummy.position.set(ch[0], ch[1], ch[2]);
        dummy.rotation.set(0, ch[3], 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        plasticChairRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      plasticChairRef.current.instanceMatrix.needsUpdate = true;
    }

    // Populate office mesh chairs
    if (officeChairRef.current) {
      officeChairData.forEach((ch, idx) => {
        dummy.position.set(ch[0], ch[1], ch[2]);
        dummy.rotation.set(0, ch[3], 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        officeChairRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      officeChairRef.current.instanceMatrix.needsUpdate = true;
    }

    // Populate ceiling LED light panels
    if (lightHousingRef.current && lightDiffuserRef.current) {
      lightData.forEach((lp, idx) => {
        dummy.position.set(lp[0], lp[1], lp[2]);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        lightHousingRef.current!.setMatrixAt(idx, dummy.matrix);
        lightDiffuserRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      lightHousingRef.current.instanceMatrix.needsUpdate = true;
      lightDiffuserRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [plasticChairData, officeChairData, lightData]);

  // Single Compound Chair Geometries for Instancing
  const plasticChairCompoundGeo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    // Seat
    const seat = new THREE.BoxGeometry(0.44, 0.04, 0.42);
    seat.translate(0, 0.44, 0);
    parts.push(seat);
    // Backrest
    const back = new THREE.BoxGeometry(0.42, 0.38, 0.03);
    back.translate(0, 0.68, -0.2);
    parts.push(back);
    // Legs
    const legGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.44, 8);
    const leg1 = legGeo.clone().translate(-0.19, 0.22, 0.18);
    const leg2 = legGeo.clone().translate(0.19, 0.22, 0.18);
    const leg3 = legGeo.clone().translate(-0.19, 0.22, -0.18);
    const leg4 = legGeo.clone().translate(0.19, 0.22, -0.18);
    parts.push(leg1, leg2, leg3, leg4);
    return mergeGeometries(parts, false);
  }, []);

  const officeChairCompoundGeo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    // Molded cushion seat
    const seat = new THREE.BoxGeometry(0.48, 0.08, 0.48);
    seat.translate(0, 0.48, 0);
    parts.push(seat);
    // Ergonomic curved mesh back
    const back = new THREE.BoxGeometry(0.45, 0.52, 0.04);
    back.translate(0, 0.78, -0.22);
    parts.push(back);
    // Central gas lift piston
    const stem = new THREE.CylinderGeometry(0.025, 0.025, 0.38, 12);
    stem.translate(0, 0.22, 0);
    parts.push(stem);
    // 5-Star base
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const leg = new THREE.BoxGeometry(0.28, 0.03, 0.03);
      leg.rotateY(angle);
      leg.translate((Math.cos(angle) * 0.28) / 2, 0.04, (Math.sin(angle) * 0.28) / 2);
      parts.push(leg);
    }
    return mergeGeometries(parts, false);
  }, []);

  return (
    <group
      position={[floorPlanTransform.x, 0, floorPlanTransform.z]}
      rotation={[0, floorPlanTransform.rotation, 0]}
      scale={[floorPlanTransform.scale, floorPlanTransform.scale, floorPlanTransform.scale]}
    >
      {/* 1. SEAMLESS VITRIFIED TILE FLOOR (600x600 PBR with 0.35 Roughness) */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        material={materials.floor}
      >
        <planeGeometry args={[18, 11]} />
      </mesh>

      {/* 2. ACOUSTIC GRID CEILING (Only in First-Person Roam View) */}
      {!isTopDownView && (
        <mesh
          position={[0, CEILING_HEIGHT, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={materials.ceiling}
        >
          <planeGeometry args={[18, 11]} />
        </mesh>
      )}

      {/* 3. MERGED ARCHITECTURAL PARTICLES (1 DRAW CALL EACH) */}
      {mergedFramesGeo && (
        <mesh geometry={mergedFramesGeo} material={materials.aluminiumFrame} castShadow receiveShadow />
      )}
      {mergedLaminateGeo && (
        <mesh geometry={mergedLaminateGeo} material={materials.partitionLaminate} receiveShadow />
      )}
      {mergedClearGlassGeo && (
        <mesh geometry={mergedClearGlassGeo} material={materials.clearGlass} />
      )}
      {mergedFrostedGlassGeo && (
        <mesh geometry={mergedFrostedGlassGeo} material={materials.frostedGlass} />
      )}
      {mergedWallsGeo && (
        <mesh geometry={mergedWallsGeo} material={materials.wall} receiveShadow />
      )}
      {mergedSkirtingGeo && (
        <mesh geometry={mergedSkirtingGeo} material={materials.skirting} />
      )}
      {mergedGrillsGeo && (
        <mesh geometry={mergedGrillsGeo} material={materials.steelLegs} />
      )}
      {mergedCableTraysGeo && (
        <mesh geometry={mergedCableTraysGeo} material={materials.aluminiumFrame} />
      )}

      {/* 4. INSTANCED FURNITURE (8 Plastic Chairs in 1 Draw Call, 6 Mesh Chairs in 1 Draw Call) */}
      <instancedMesh
        ref={plasticChairRef}
        args={[plasticChairCompoundGeo, materials.plasticChair, plasticChairData.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={officeChairRef}
        args={[officeChairCompoundGeo, materials.meshChair, officeChairData.length]}
        castShadow
        receiveShadow
      />

      {/* 5. INSTANCED CEILING LIGHT PANELS (16 Fixtures in 2 Draw Calls) */}
      {!isTopDownView && (
        <>
          <instancedMesh
            ref={lightHousingRef}
            args={[undefined, materials.lightHousing, lightData.length]}
          >
            <boxGeometry args={[1.24, 0.04, 0.64]} />
          </instancedMesh>
          <instancedMesh
            ref={lightDiffuserRef}
            args={[undefined, materials.lightDiffuser, lightData.length]}
          >
            <boxGeometry args={[1.2, 0.02, 0.6]} />
          </instancedMesh>
        </>
      )}

      {/* 6. ENTRANCE DETAILS */}
      <group position={[-7.8, 0, 0.45]}>
        {/* Kiosk Pedestal */}
        <mesh position={[0, 0.6, 0]} material={materials.aluminiumFrame}>
          <cylinderGeometry args={[0.035, 0.045, 1.2, 16]} />
        </mesh>
        <mesh position={[0, 0.02, 0]} material={materials.aluminiumFrame}>
          <cylinderGeometry args={[0.2, 0.22, 0.04, 16]} />
        </mesh>
        {/* Facial Recognition Display */}
        <mesh position={[0, 1.25, 0]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.22, 0.34, 0.03]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.25, 0.016]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[0.18, 0.28]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Wooden Entrance Door & Brushed Handle */}
      <group position={[-8.75, 1.15, 0]}>
        <mesh material={materials.doorWood} castShadow>
          <boxGeometry args={[0.06, 2.3, 1.2]} />
        </mesh>
        {/* Brushed metal lever handle */}
        <mesh position={[0.04, 0, 0.45]} material={materials.metalHandles}>
          <cylinderGeometry args={[0.012, 0.012, 0.14, 12]} />
        </mesh>
      </group>

      {/* Visitor QR poster */}
      <mesh position={[-7.8, 1.45, -0.74]}>
        <planeGeometry args={[0.55, 0.78]} />
        <meshBasicMaterial map={qrPosterTex} side={THREE.DoubleSide} />
      </mesh>

      {/* 7. MECHANICAL WORKSHOP */}
      {/* Blue Tool Pegboard */}
      <mesh position={[-4.8, 1.35, -5.14]}>
        <planeGeometry args={[3.6, 1.3]} />
        <meshStandardMaterial map={pegboardTex} roughness={0.5} />
      </mesh>
      {/* 4 Yellow Safety Posters */}
      <mesh position={[-4.8, 2.3, -5.14]}>
        <planeGeometry args={[3.4, 0.55]} />
        <meshBasicMaterial map={safetyPostersTex} />
      </mesh>
      {/* Heavy Wooden Workbench */}
      <group position={[-4.8, 0, -4.2]}>
        {/* Oak Top with Bevel */}
        <mesh position={[0, 0.83, 0]} material={materials.deskOak} castShadow receiveShadow>
          <boxGeometry args={[3.8, 0.06, 0.9]} />
        </mesh>
        {/* Steel Legs Frame */}
        <mesh position={[-1.75, 0.4, -0.38]} material={materials.steelLegs}>
          <boxGeometry args={[0.06, 0.8, 0.06]} />
        </mesh>
        <mesh position={[1.75, 0.4, -0.38]} material={materials.steelLegs}>
          <boxGeometry args={[0.06, 0.8, 0.06]} />
        </mesh>
        <mesh position={[-1.75, 0.4, 0.38]} material={materials.steelLegs}>
          <boxGeometry args={[0.06, 0.8, 0.06]} />
        </mesh>
        <mesh position={[1.75, 0.4, 0.38]} material={materials.steelLegs}>
          <boxGeometry args={[0.06, 0.8, 0.06]} />
        </mesh>
      </group>

      {/* Benchtop Drill Press */}
      <group position={[-6.0, 0.86, -4.2]}>
        <mesh position={[0, 0.03, 0]} material={materials.steelLegs}>
          <boxGeometry args={[0.3, 0.06, 0.35]} />
        </mesh>
        <mesh position={[0, 0.45, -0.08]} material={materials.steelLegs}>
          <cylinderGeometry args={[0.035, 0.035, 0.85, 16]} />
        </mesh>
        <mesh position={[0, 0.85, 0.02]} material={materials.aluminiumFrame}>
          <boxGeometry args={[0.22, 0.26, 0.42]} />
        </mesh>
        <mesh position={[0, 0.62, 0.12]}>
          <cylinderGeometry args={[0.02, 0.02, 0.18, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Metal Chop Saw */}
      <group position={[-3.6, 0.86, -4.2]}>
        <mesh position={[0, 0.03, 0]} material={materials.steelLegs}>
          <boxGeometry args={[0.42, 0.06, 0.42]} />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[0.4, 0, 0]} material={materials.aluminiumFrame}>
          <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
        </mesh>
      </group>

      {/* 8. ELECTRONICS BENCH ROOM */}
      <group position={[0.6, 0, -4.6]}>
        <mesh position={[0, 0.75, 0]} material={materials.deskOak} castShadow receiveShadow>
          <boxGeometry args={[5.0, 0.05, 0.8]} />
        </mesh>
        {/* Steel Frame Rails */}
        {[-2.3, 0, 2.3].map((lx) => (
          <mesh key={`elec-leg-${lx}`} position={[lx, 0.36, 0]} material={materials.steelLegs}>
            <boxGeometry args={[0.06, 0.72, 0.7]} />
          </mesh>
        ))}
        {/* Industrial Power Socket Strip mounted on wall behind desk */}
        <mesh position={[0, 0.96, -0.38]}>
          <planeGeometry args={[4.8, 0.16]} />
          <meshStandardMaterial map={powerSocketsTex} />
        </mesh>
      </group>

      {/* Oscilloscope */}
      <group position={[-1.2, 0.78, -4.6]}>
        <mesh position={[0, 0.14, 0]} material={materials.steelLegs}>
          <boxGeometry args={[0.38, 0.24, 0.28]} />
        </mesh>
        <mesh position={[0, 0.14, 0.141]}>
          <planeGeometry args={[0.22, 0.16]} />
          <meshBasicMaterial color="#064e3b" />
        </mesh>
      </group>

      {/* Dual DC Power Supply */}
      <group position={[-0.4, 0.78, -4.6]}>
        <mesh position={[0, 0.12, 0]} material={materials.steelLegs}>
          <boxGeometry args={[0.28, 0.22, 0.26]} />
        </mesh>
        <mesh position={[0, 0.16, 0.131]}>
          <planeGeometry args={[0.18, 0.08]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* Electronics Laptops */}
      {[0.5, 1.8].map((lx, idx) => (
        <group key={`laptop-${idx}`} position={[lx, 0.78, -4.5]}>
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[0.32, 0.015, 0.24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.11, -0.1]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.32, 0.22, 0.01]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Red CO2 Fire Extinguisher */}
      <group position={[3.1, 0.8, -5.0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.55, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.32, 0]} material={materials.aluminiumFrame}>
          <boxGeometry args={[0.04, 0.1, 0.08]} />
        </mesh>
      </group>

      {/* 9. 3D PRINTING WORKSPACE */}
      <group position={[5.8, 0, -4.4]}>
        <mesh position={[0, 0.75, 0]} material={materials.deskOak} castShadow>
          <boxGeometry args={[4.2, 0.05, 0.8]} />
        </mesh>
        {[-1.9, 0, 1.9].map((lx) => (
          <mesh key={`pr-leg-${lx}`} position={[lx, 0.36, 0]} material={materials.steelLegs}>
            <boxGeometry args={[0.06, 0.72, 0.7]} />
          </mesh>
        ))}
      </group>

      {/* Two Enclosed CoreXY 3D Printers */}
      {[4.6, 6.2].map((px, idx) => (
        <group key={`printer-${idx}`} position={[px, 0.78, -4.4]}>
          {/* Outer Black Metal Enclosure */}
          <mesh position={[0, 0.25, 0]} material={materials.aluminiumFrame}>
            <boxGeometry args={[0.48, 0.5, 0.48]} />
          </mesh>
          {/* Acrylic Front Door */}
          <mesh position={[0, 0.25, 0.241]} material={materials.clearGlass}>
            <planeGeometry args={[0.38, 0.42]} />
          </mesh>
          {/* Illuminated Print Bed */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.3]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          {/* Filament Spool mounted on top */}
          <mesh position={[0.18, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.06, 16]} />
            <meshStandardMaterial color="#f97316" roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* 10. LASER CUTTER CABIN */}
      <group position={[-5.0, 0, 3.8]}>
        {/* Large Industrial Blue/Grey Laser Machine */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.5, 1.0, 1.1]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Glass Viewing Hood */}
        <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.clearGlass}>
          <planeGeometry args={[1.3, 0.9]} />
        </mesh>
        {/* Operator Console Desk & Laptop */}
        <mesh position={[1.1, 0.4, 0]} material={materials.steelLegs}>
          <boxGeometry args={[0.6, 0.8, 0.7]} />
        </mesh>
        <mesh position={[1.1, 0.81, 0]}>
          <boxGeometry args={[0.32, 0.02, 0.24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
      </group>

      {/* 11. MEETING ROOM: Dark Glossy TV Screen & Conference Table */}
      {/* Wall TV Screen: Plain dark glossy screen with subtle reflection */}
      <group position={[-0.1, 1.6, 4.88]} rotation={[0, Math.PI, 0]}>
        {/* TV Bezel */}
        <mesh material={materials.aluminiumFrame}>
          <boxGeometry args={[1.9, 1.1, 0.06]} />
        </mesh>
        {/* Glossy OLED Screen with Reflection Sheen */}
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[1.82, 1.02]} />
          <meshStandardMaterial
            map={tvScreenTex}
            roughness={0.08}
            metalness={0.85}
          />
        </mesh>
      </group>

      {/* Conference Table */}
      <group position={[-0.1, 0, 2.8]}>
        <mesh position={[0, 0.74, 0]} material={materials.deskOak} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.05, 1.2]} />
        </mesh>
        <mesh position={[-1.1, 0.36, 0]} material={materials.steelLegs}>
          <boxGeometry args={[0.1, 0.72, 0.9]} />
        </mesh>
        <mesh position={[1.1, 0.36, 0]} material={materials.steelLegs}>
          <boxGeometry args={[0.1, 0.72, 0.9]} />
        </mesh>
      </group>

      {/* 12. STUDY AREA: Long Wall Desk */}
      <group position={[4.7, 0, 4.4]}>
        <mesh position={[0, 0.74, 0]} material={materials.deskOak} castShadow receiveShadow>
          <boxGeometry args={[3.8, 0.05, 0.8]} />
        </mesh>
        {[-1.7, 0, 1.7].map((lx) => (
          <mesh key={`study-leg-${lx}`} position={[lx, 0.36, 0]} material={materials.steelLegs}>
            <boxGeometry args={[0.06, 0.72, 0.7]} />
          </mesh>
        ))}
        {/* Power Socket strip above study desk */}
        <mesh position={[0, 0.95, 0.38]}>
          <planeGeometry args={[3.6, 0.16]} />
          <meshStandardMaterial map={powerSocketsTex} />
        </mesh>
      </group>

      {/* 13. STORAGE CORNER: Real Materials (Cardboard Boxes & Material Stock) */}
      <group position={[7.6, 0, 3.6]}>
        {/* Cardboard Boxes */}
        <mesh position={[-0.3, 0.25, -0.2]}>
          <boxGeometry args={[0.6, 0.5, 0.5]} />
          <meshStandardMaterial color="#b48256" roughness={0.9} />
        </mesh>
        <mesh position={[0.3, 0.2, 0.2]}>
          <boxGeometry args={[0.5, 0.4, 0.4]} />
          <meshStandardMaterial color="#9d6d42" roughness={0.9} />
        </mesh>
        <mesh position={[-0.2, 0.65, -0.2]}>
          <boxGeometry args={[0.45, 0.35, 0.45]} />
          <meshStandardMaterial color="#c29267" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
