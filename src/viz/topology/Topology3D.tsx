import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js';
import { Text } from '@react-three/drei/core/Text.js';
import * as THREE from 'three';

interface Node3D {
  id: string;
  name: string;
  pos: [number, number, number];
  alive: boolean;
}

const INITIAL_NODES: Node3D[] = [
  { id: 'gw', name: 'GATEWAY', pos: [-2, 0, 0], alive: true },
  { id: 'core1', name: 'CORE-A', pos: [0, 1.2, 0], alive: true },
  { id: 'core2', name: 'CORE-B', pos: [0, -1.2, 0], alive: true },
  { id: 'edge1', name: 'EDGE-01', pos: [2, 1, 0], alive: true },
  { id: 'edge2', name: 'EDGE-02', pos: [2, -1, 0], alive: true },
];

function Scene({
  nodes,
  onToggleNode,
}: {
  nodes: Node3D[];
  onToggleNode: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const geometriesRef = useRef<THREE.BufferGeometry[]>([]);
  const materialsRef = useRef<THREE.Material[]>([]);

  useFrame((_, delta) => {
    if (document.hidden) return;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  useEffect(() => {
    return () => {
      geometriesRef.current.forEach((g) => g.dispose());
      materialsRef.current.forEach((m) => m.dispose());
    };
  }, []);

  const lines = [
    [nodes[0], nodes[1]],
    [nodes[0], nodes[2]],
    [nodes[1], nodes[2]],
    [nodes[1], nodes[3]],
    [nodes[2], nodes[4]],
    [nodes[3], nodes[4]],
  ];

  return (
    <group ref={groupRef}>
      {/* Edges */}
      {lines.map(([u, v], i) => {
        const isAlive = u.alive && v.alive;
        const pts = [new THREE.Vector3(...u.pos), new THREE.Vector3(...v.pos)];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
          color: isAlive ? 0x5ce1e6 : 0xff4d4d,
          linewidth: 2,
        });

        geometriesRef.current.push(geo);
        materialsRef.current.push(mat);

        return (
          <primitive
            key={`line-${i}`}
            object={new THREE.Line(geo, mat)}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => (
        <group
          key={node.id}
          position={node.pos}
          onClick={(e) => {
            e.stopPropagation();
            onToggleNode(node.id);
          }}
        >
          <mesh>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial
              color={node.alive ? 0xc6ff3d : 0xff4d4d}
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>
          <Text
            position={[0, 0.45, 0]}
            fontSize={0.2}
            color={node.alive ? '#ededed' : '#ff4d4d'}
            anchorX="center"
            anchorY="middle"
          >
            {node.name}
          </Text>
        </group>
      ))}
    </group>
  );
}

export default function Topology3D() {
  const [nodes, setNodes] = useState<Node3D[]>(INITIAL_NODES);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // IntersectionObserver to pause when offscreen
  useEffect(() => {
    if (!containerRef.current || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleToggle = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, alive: !n.alive } : n))
    );
  };

  return (
    <div ref={containerRef} className="w-full h-36 relative bg-background/90">
      {isVisible && (
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Scene nodes={nodes} onToggleNode={handleToggle} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      )}
      <div className="absolute bottom-1 right-2 text-[8px] text-muted/60 pointer-events-none font-mono">
        DRAG TO ORBIT &bull; CLICK NODE TO TOGGLE
      </div>
    </div>
  );
}
