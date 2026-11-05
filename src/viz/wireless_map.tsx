import React, { useState, useRef } from 'react';
import { Panel, Pulse, getTopSeverity, type VizProps } from './kit';
import { Wifi } from 'lucide-react';

export const WirelessMapViz: React.FC<VizProps> = ({
  params,
  values,
  outcomes,
  onParamChange,
}) => {
  const distParam = params.find((p) => /dist|snr|range|power/i.test(p.name)) || params[0];
  const pName = distParam?.name || 'distance';

  // AP position fixed at (180, 70), Client position draggable
  const [clientPos, setClientPos] = useState<{ x: number; y: number }>({ x: 260, y: 70 });
  const isDragging = useRef(false);

  const apPos = { x: 180, y: 70 };
  const dx = clientPos.x - apPos.x;
  const dy = clientPos.y - apPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Compute SNR based on distance (path loss exponent ~2.5)
  const snr = Math.max(5, Math.min(45, Math.round(50 - (dist / 140) * 45)));

  // MCS index table: SNR to MCS
  const mcsIndex = snr >= 35 ? 9 : snr >= 28 ? 7 : snr >= 20 ? 4 : snr >= 12 ? 2 : 0;
  const rateMbps = [6.5, 13, 26, 39, 52, 78, 104, 117, 130, 144][mcsIndex];

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * 360;
    const cy = ((e.clientY - rect.top) / rect.height) * 140;
    setClientPos({
      x: Math.min(330, Math.max(30, cx)),
      y: Math.min(120, Math.max(20, cy)),
    });

    const d = Math.sqrt(Math.pow(cx - apPos.x, 2) + Math.pow(cy - apPos.y, 2));
    onParamChange(pName, Math.round(d));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const topSev = getTopSeverity(outcomes);

  return (
    <Panel
      title="802.11 RF Floorplan & Adaptive MCS"
      figId="FIG 0.11 / RF PROPAGATION PLAN"
      outcomes={outcomes}
      controls={{
        isPlaying: false,
        onTogglePlay: () => {},
        onReset: () => setClientPos({ x: 260, y: 70 }),
      }}
    >
      <div className="relative w-full bg-background/80 rounded-sm border border-border/40 bg-dotted-grid flex flex-col">
        <svg
          viewBox="0 0 360 140"
          className="w-full h-36 select-none cursor-move touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* AP Coverage Rings */}
          <circle cx={apPos.x} cy={apPos.y} r={130} fill="none" stroke="rgba(92,225,230,0.1)" strokeWidth={1} />
          <circle cx={apPos.x} cy={apPos.y} r={85} fill="none" stroke="rgba(92,225,230,0.2)" strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={apPos.x} cy={apPos.y} r={45} fill="none" stroke="rgba(198,255,61,0.25)" strokeWidth={1} />

          {/* Line of Sight */}
          <line
            x1={apPos.x}
            y1={apPos.y}
            x2={clientPos.x}
            y2={clientPos.y}
            stroke="#5ce1e6"
            strokeWidth={1}
            strokeDasharray="2 2"
          />

          {/* Access Point Icon */}
          <g transform={`translate(${apPos.x}, ${apPos.y})`}>
            <circle cx={0} cy={0} r={12} fill="#0f0f11" stroke="#5ce1e6" strokeWidth={1.5} />
            <text x={0} y={3} fill="#5ce1e6" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
              AP-1
            </text>
          </g>

          {/* Client Node (Draggable) */}
          <g transform={`translate(${clientPos.x}, ${clientPos.y})`}>
            <Pulse x={0} y={0} r={10} severity={topSev} />
            <circle cx={0} cy={0} r={9} fill="#c6ff3d" stroke="#0a0a0b" strokeWidth={1.5} />
            <text x={0} y={15} fill="#ededed" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono">
              STA
            </text>
          </g>
        </svg>

        {/* Readout Footer */}
        <div className="px-3 py-1.5 border-t border-border/40 flex items-center justify-between text-[10px] font-mono">
          <div className="flex gap-2">
            <span className="text-muted">DIST: {Math.round(dist)}m</span>
            <span className="text-cyan">SNR: {snr} dB</span>
          </div>
          <span className="text-lime font-bold">MCS {mcsIndex} ({rateMbps} Mbps)</span>
        </div>
      </div>
    </Panel>
  );
};

