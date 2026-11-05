import React, { useState, useEffect, useRef } from 'react';
import { Panel, Pulse, getTopSeverity, type VizProps } from './kit';

export const PacketFlowViz: React.FC<VizProps> = ({
  params,
  values,
  outcomes,
  onParamChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [lostLink, setLostLink] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const packetGroupRef = useRef<SVGGElement>(null);

  const layerParam = params.find((p) => /layer|header|depth/i.test(p.name)) || params[0];
  const hopParam = params.find((p) => /hop|nodes|distance/i.test(p.name));

  const layersCount = Math.max(1, Math.min(5, Math.round(values[layerParam?.name || ''] ?? 3)));
  const hopsCount = Math.max(2, Math.min(4, Math.round(values[hopParam?.name || ''] ?? 3)));

  const nodes = Array.from({ length: hopsCount }).map((_, i) => ({
    id: i,
    label: i === 0 ? 'SRC' : i === hopsCount - 1 ? 'DST' : `R${i}`,
    x: 40 + (i / (hopsCount - 1)) * 280,
    y: 75,
  }));

  // Per-frame animation via refs and rAF with IntersectionObserver & visibilityState
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let start = performance.now();
    const cycle = 3000;
    let isIntersecting = true;

    const observer = window.IntersectionObserver
      ? new IntersectionObserver(([entry]) => {
          isIntersecting = entry.isIntersecting;
        })
      : null;

    if (containerRef.current && observer) {
      observer.observe(containerRef.current);
    }

    const frame = (t: number) => {
      if (!document.hidden && isIntersecting && packetGroupRef.current) {
        const elapsed = (t - start) % cycle;
        const progress = elapsed / cycle;
        const currentHopIndex = Math.min(hopsCount - 2, Math.floor(progress * (hopsCount - 1)));
        const hopProgress = (progress * (hopsCount - 1)) % 1;
        const fromNode = nodes[currentHopIndex];
        const toNode = nodes[currentHopIndex + 1];

        if (fromNode && toNode) {
          const px = fromNode.x + (toNode.x - fromNode.x) * hopProgress;
          const isDropping = lostLink === currentHopIndex;
          packetGroupRef.current.setAttribute(
            'transform',
            `translate(${px - 14}, 50)`
          );
          packetGroupRef.current.style.opacity = isDropping ? '0' : '1';
        }
      }
      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animId);
      observer?.disconnect();
    };
  }, [isPlaying, hopsCount, lostLink, nodes]);

  const headerLabels = ['ETH', 'IP', 'TCP', 'HTTP', 'PAYLOAD'].slice(0, layersCount);
  const topSev = getTopSeverity(outcomes);

  return (
    <Panel
      title="Multi-Hop Encapsulation & Packet Flow"
      figId="FIG 0.2 / PACKET HOP TRACE"
      outcomes={outcomes}
      controls={{
        isPlaying,
        onTogglePlay: () => setIsPlaying((p) => !p),
        onReset: () => setLostLink(null),
      }}
    >
      <div
        ref={containerRef}
        className="relative w-full h-44 bg-background/80 rounded-sm border border-border/40 bg-dotted-grid flex flex-col justify-between p-2"
      >
        <svg viewBox="0 0 360 110" className="w-full h-28 select-none">
          {/* Links between nodes */}
          {nodes.slice(0, -1).map((n, i) => (
            <g key={`link-${i}`} onClick={() => setLostLink(lostLink === i ? null : i)}>
              <line
                x1={n.x}
                y1={n.y}
                x2={nodes[i + 1].x}
                y2={nodes[i + 1].y}
                stroke={lostLink === i ? '#ff4d4d' : '#5ce1e6'}
                strokeWidth={lostLink === i ? 2 : 1.5}
                strokeDasharray={lostLink === i ? '4 3' : undefined}
                className="cursor-pointer"
              />
              <text
                x={(n.x + nodes[i + 1].x) / 2}
                y={n.y - 12}
                fill={lostLink === i ? '#ff4d4d' : '#8a8a8f'}
                fontSize="7"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                className="cursor-pointer"
              >
                {lostLink === i ? 'LINK FAULT' : 'TAP TO DROP'}
              </text>
            </g>
          ))}

          {/* Traveling Packet directly mutated via ref without React re-renders */}
          <g ref={packetGroupRef} transform={`translate(${nodes[0].x - 14}, 50)`}>
            <rect
              width={28}
              height={16}
              fill="#0f0f11"
              stroke="#c6ff3d"
              strokeWidth={1.5}
              rx={2}
            />
            <text
              x={14}
              y={11}
              fill="#c6ff3d"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="JetBrains Mono"
            >
              PKT
            </text>
          </g>

          {/* Node Circles */}
          {nodes.map((n) => (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
              <circle
                cx={0}
                cy={0}
                r={12}
                fill="#0f0f11"
                stroke="#ededed"
                strokeWidth={1.5}
                className="cursor-pointer"
                onClick={() => {
                  if (layerParam) {
                    const next = (layersCount % 5) + 1;
                    onParamChange(layerParam.name, next);
                  }
                }}
              />
              <text
                x={0}
                y={3}
                fill="#ededed"
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Header Stack Inspection */}
        <div className="flex items-center justify-between border-t border-border/40 pt-1.5 text-[9px]">
          <span className="text-muted">ENCAPSULATION STACK ({layersCount} LAYERS):</span>
          <div className="flex gap-1">
            {headerLabels.map((lbl, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 bg-surface border border-lime/40 text-lime font-mono rounded-xs"
              >
                {lbl}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
};
