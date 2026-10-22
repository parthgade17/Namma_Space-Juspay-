import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import { FurnitureItem, RoomDefinition } from '../types/floorplan';
import floorPlanData from '../data/floorplan.json';

const floorPlan = floorPlanData;

export const InstancedFurniture: React.FC = () => {
  const setSelectedObject = useStore((s) => s.setSelectedObject);
  const showWireframe = useStore((s) => s.showWireframe);

  // Group furniture items
  const { pcs, desks, chairs, whiteboards, sofas, plants, racks } = useMemo(() => {
    const pcList: { item: FurnitureItem; room: RoomDefinition }[] = [];
    const deskList: { item: FurnitureItem; room: RoomDefinition }[] = [];
    const chairList: { item: FurnitureItem; room: RoomDefinition }[] = [];
    const whiteboardList: { item: FurnitureItem; room: RoomDefinition }[] = [];
    const sofaList: { item: FurnitureItem; room: RoomDefinition }[] = [];
    const plantList: { item: FurnitureItem; room: RoomDefinition }[] = [];
    const rackList: { item: FurnitureItem; room: RoomDefinition }[] = [];

    floorPlan.rooms.forEach((room) => {
      room.furniture.forEach((item) => {
        const itemWithRoom = { item: item as unknown as FurnitureItem, room: room as unknown as RoomDefinition };
        if (item.type === 'desk_pc') {
          pcList.push(itemWithRoom);
          deskList.push(itemWithRoom);
          chairList.push(itemWithRoom);
        } else if (item.type === 'teacher_desk' || item.type === 'cubicle') {
          deskList.push(itemWithRoom);
          chairList.push(itemWithRoom);
        } else if (item.type === 'whiteboard' || item.type === 'projector') {
          whiteboardList.push(itemWithRoom);
        } else if (item.type === 'sofa') {
          sofaList.push(itemWithRoom);
        } else if (item.type === 'potted_plant') {
          plantList.push(itemWithRoom);
        } else if (item.type === 'server_rack' || item.type === 'cabinet') {
          rackList.push(itemWithRoom);
        }
      });
    });

    return {
      pcs: pcList,
      desks: deskList,
      chairs: chairList,
      whiteboards: whiteboardList,
      sofas: sofaList,
      plants: plantList,
      racks: rackList,
    };
  }, []);

  // Shared Materials
  const deskMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.4,
    metalness: 0.1,
    wireframe: showWireframe,
  }), [showWireframe]);

  const legMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.3,
    metalness: 0.8,
    wireframe: showWireframe,
  }), [showWireframe]);

  const pcCaseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.2,
    metalness: 0.5,
    wireframe: showWireframe,
  }), [showWireframe]);

  const screenMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f172a',
    emissive: '#0284c7',
    emissiveIntensity: 0.35,
    roughness: 0.2,
    wireframe: showWireframe,
  }), [showWireframe]);

  const chairMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.7,
    wireframe: showWireframe,
  }), [showWireframe]);

  return (
    <group>
      {/* 1. Computer Desks & Workstations */}
      {desks.map(({ item, room }) => {
        const isDeskPc = item.type === 'desk_pc';
        const isTeacher = item.type === 'teacher_desk';
        const w = isTeacher ? 1.8 : isDeskPc ? 1.4 : 1.6;
        const d = isTeacher ? 0.9 : 0.75;
        const h = 0.75;

        return (
          <group
            key={item.id}
            position={item.position}
            rotation={item.rotation}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedObject({
                id: item.id,
                name: item.label || item.id,
                room: room.name,
                type: item.type === 'desk_pc' ? 'Student Workstation' : item.type === 'teacher_desk' ? 'Faculty Podium' : 'Office Cubicle',
                position: item.position,
                meta: item.meta as any,
              });
            }}
          >
            {/* Tabletop */}
            <mesh position={[0, h - 0.02, 0]} castShadow receiveShadow material={deskMat}>
              <boxGeometry args={[w, 0.04, d]} />
            </mesh>

            {/* Table Legs */}
            <mesh position={[-w / 2 + 0.05, h / 2, -d / 2 + 0.05]} castShadow material={legMat}>
              <cylinderGeometry args={[0.025, 0.025, h, 8]} />
            </mesh>
            <mesh position={[w / 2 - 0.05, h / 2, -d / 2 + 0.05]} castShadow material={legMat}>
              <cylinderGeometry args={[0.025, 0.025, h, 8]} />
            </mesh>
            <mesh position={[-w / 2 + 0.05, h / 2, d / 2 - 0.05]} castShadow material={legMat}>
              <cylinderGeometry args={[0.025, 0.025, h, 8]} />
            </mesh>
            <mesh position={[w / 2 - 0.05, h / 2, d / 2 - 0.05]} castShadow material={legMat}>
              <cylinderGeometry args={[0.025, 0.025, h, 8]} />
            </mesh>

            {/* PC Monitor + Tower if workstation */}
            {isDeskPc && (
              <group position={[0, h, 0]}>
                {/* Monitor Stand */}
                <mesh position={[0, 0.1, -0.1]} material={legMat}>
                  <boxGeometry args={[0.15, 0.2, 0.1]} />
                </mesh>
                {/* Monitor Bezel */}
                <mesh position={[0, 0.28, -0.08]} castShadow material={pcCaseMat}>
                  <boxGeometry args={[0.62, 0.36, 0.03]} />
                </mesh>
                {/* Glowing Screen face */}
                <mesh position={[0, 0.28, -0.06]}>
                  <planeGeometry args={[0.58, 0.32]} />
                  <meshStandardMaterial
                    color="#0369a1"
                    emissive="#38bdf8"
                    emissiveIntensity={0.5}
                    roughness={0.2}
                  />
                </mesh>
                {/* PC Tower beside desk */}
                <mesh position={[0.48, 0.22, 0]} castShadow material={pcCaseMat}>
                  <boxGeometry args={[0.18, 0.44, 0.42]} />
                </mesh>
                {/* Power LED dot */}
                <mesh position={[0.48, 0.4, 0.215]}>
                  <sphereGeometry args={[0.012, 8, 8]} />
                  <meshBasicMaterial color="#10b981" />
                </mesh>
                {/* Keyboard & Mouse */}
                <mesh position={[0, 0.01, 0.12]} material={pcCaseMat}>
                  <boxGeometry args={[0.44, 0.015, 0.14]} />
                </mesh>
                <mesh position={[0.28, 0.01, 0.14]} material={pcCaseMat}>
                  <boxGeometry args={[0.06, 0.02, 0.1]} />
                </mesh>
              </group>
            )}

            {/* Ergonomic Chair */}
            <group position={[0, 0, 0.55]} rotation={[0, Math.PI, 0]}>
              {/* Chair seat */}
              <mesh position={[0, 0.48, 0]} castShadow material={chairMat}>
                <boxGeometry args={[0.46, 0.06, 0.44]} />
              </mesh>
              {/* Chair backrest */}
              <mesh position={[0, 0.76, 0.18]} castShadow material={chairMat}>
                <boxGeometry args={[0.42, 0.5, 0.05]} />
              </mesh>
              {/* Central post */}
              <mesh position={[0, 0.24, 0]} material={legMat}>
                <cylinderGeometry args={[0.03, 0.03, 0.48, 8]} />
              </mesh>
              {/* 5-star base */}
              <mesh position={[0, 0.05, 0]} material={legMat}>
                <cylinderGeometry args={[0.26, 0.28, 0.04, 5]} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* 2. Whiteboards & AV Projector Screens */}
      {whiteboards.map(({ item, room }) => (
        <group
          key={item.id}
          position={item.position}
          rotation={item.rotation}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedObject({
              id: item.id,
              name: item.label || item.id,
              room: room.name,
              type: 'Presentation & Visualizer Equipment',
              position: item.position,
            });
          }}
        >
          {item.type === 'whiteboard' ? (
            <group>
              <mesh castShadow>
                <boxGeometry args={[3.6, 1.4, 0.05]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.1} />
              </mesh>
              {/* Frame */}
              <mesh position={[0, 0, -0.01]}>
                <boxGeometry args={[3.7, 1.5, 0.04]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} />
              </mesh>
            </group>
          ) : (
            // Projector Screen
            <group>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[3.2, 0.12, 0.12]} />
                <meshStandardMaterial color="#334155" metalness={0.7} />
              </mesh>
              <mesh position={[0, -0.9, 0]}>
                <planeGeometry args={[3.0, 1.7]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#0284c7"
                  emissiveIntensity={0.15}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* 3. Server Racks & Cabinets */}
      {racks.map(({ item, room }) => (
        <group
          key={item.id}
          position={item.position}
          rotation={item.rotation}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedObject({
              id: item.id,
              name: item.label || item.id,
              room: room.name,
              type: 'Network Infrastructure / Storage',
              position: item.position,
            });
          }}
        >
          {item.type === 'server_rack' ? (
            <group>
              <mesh position={[0, 1.1, 0]} castShadow>
                <boxGeometry args={[0.9, 2.2, 0.8]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Blinking status LEDs on rack face */}
              <mesh position={[0, 1.2, 0.405]}>
                <planeGeometry args={[0.7, 1.8]} />
                <meshStandardMaterial
                  color="#0284c7"
                  emissive="#10b981"
                  emissiveIntensity={0.6}
                />
              </mesh>
            </group>
          ) : (
            // Storage Cabinet
            <mesh position={[0, 0.9, 0]} castShadow>
              <boxGeometry args={[1.2, 1.8, 0.6]} />
              <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.5} />
            </mesh>
          )}
        </group>
      ))}

      {/* 4. Sofas & Lounge Benches */}
      {sofas.map(({ item, room }) => (
        <group
          key={item.id}
          position={item.position}
          rotation={item.rotation}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedObject({
              id: item.id,
              name: item.label || item.id,
              room: room.name,
              type: 'Seating / Lounge',
              position: item.position,
            });
          }}
        >
          {/* Base cushion */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.8, 0.35, 0.75]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Back cushion */}
          <mesh position={[0, 0.55, -0.28]} castShadow>
            <boxGeometry args={[1.8, 0.45, 0.22]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 5. Indoor Decorative Plants */}
      {plants.map(({ item, room }) => (
        <group
          key={item.id}
          position={item.position}
          rotation={item.rotation}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedObject({
              id: item.id,
              name: item.label || item.id,
              room: room.name,
              type: 'Indoor Botanical Element',
              position: item.position,
            });
          }}
        >
          {/* Planter Pot */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.22, 0.6, 16]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.3} />
          </mesh>
          {/* Foliage Spheres */}
          <mesh position={[0, 0.85, 0]} castShadow>
            <dodecahedronGeometry args={[0.42, 1]} />
            <meshStandardMaterial color="#15803d" roughness={0.6} />
          </mesh>
          <mesh position={[0.1, 1.15, 0]} castShadow>
            <dodecahedronGeometry args={[0.3, 1]} />
            <meshStandardMaterial color="#16a34a" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
