import React, { useState } from 'react';
import { Pulse, type OutcomeSeverity } from '../kit';

interface Node2D {
  id: string;
  label: string;
  x: number;
  y: number;
  alive: boolean;
}

interface Edge2D {
  u: string;
  v: string;
  alive: boolean;
}

export const Topology2D: React.FC<{
  nodeCount: number;
  topSev: OutcomeSeverity | null;
  onKillToggle: () => void;
}> = ({ nodeCount, topSev }) => {
  const [nodes, setNodes] = useState<Node2D[]>([
    { id: 'N0', label: 'GW-01', x: 60, y: 70, alive: true },
    { id: 'N1', label: 'SW-CORE', x: 180, y: 35, alive: true },
    { id: 'N2', label: 'SW-DIST', x: 180, y: 105, alive: true },
    { id: 'N3', label: 'EDGE-A', x: 300, y: 45, alive: true },
    { id: 'N4', label: 'EDGE-B', x: 300, y: 95, alive: true },
  ]);

  const [edges, setEdges] = useState<Edge2D[]>([
    { u: 'N0', v: 'N1', alive: true },
    { u: 'N0', v: 'N2', alive: true },
    { u: 'N1', v: 'N2', alive: true },
    { u: 'N1', v: 'N3', alive: true },
    { u: 'N2', v: 'N4', alive: true },
    { u: 'N3', v: 'N4', alive: true },
  ]);

  const toggleNode = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, alive: !n.alive } : n))
    );
  };

  const toggleEdge = (u: string, v: string) => {
    setEdges((prev) =>
      prev.map((e) =>
        (e.u === u && e.v === v) || (e.u === v && e.v === u)
          ? { ...e, alive: !e.alive }
          : e
      )
    );
  };

  const activeNodes = nodes.slice(0, Math.max(3, Math.min(5, nodeCount)));
  const nodeMap = new Map(activeNodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 360 140" className="w-full h-36 select-none bg-background/80">
      {/* Links */}
      {edges.map((e, idx) => {
        const u = nodeMap.get(e.u);
        const v = nodeMap.get(e.v);
        if (!u || !v) return null;
        const isUp = e.alive && u.alive && v.alive;

        return (
          <g key={idx} onClick={() => toggleEdge(e.u, e.v)} className="cursor-pointer">
            <line
              x1={u.x}
              y1={u.y}
              x2={v.x}
              y2={v.y}
              stroke={isUp ? '#5ce1e6' : '#ff4d4d'}
              strokeWidth={isUp ? 1.5 : 1}
              strokeDasharray={isUp ? undefined : '3 3'}
            />
          </g>
        );
      })}

      {/* Nodes */}
      {activeNodes.map((n) => (
        <g
          key={n.id}
          transform={`translate(${n.x}, ${n.y})`}
          onClick={() => toggleNode(n.id)}
          className="cursor-pointer"
        >
          {n.alive && <Pulse x={0} y={0} r={12} severity={topSev} />}
          <circle
            cx={0}
            cy={0}
            r={11}
            fill="#0f0f11"
            stroke={n.alive ? '#c6ff3d' : '#ff4d4d'}
            strokeWidth={1.5}
          />
          <text
            x={0}
            y={3}
            fill={n.alive ? '#ededed' : '#ff4d4d'}
            fontSize="7"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="JetBrains Mono"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

