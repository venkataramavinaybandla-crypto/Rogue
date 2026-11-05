import React, { useState, useRef } from 'react';
import { Panel, Pulse, getTopSeverity, type VizProps } from './kit';

interface Msg {
  t: number;
  from: 'client' | 'server';
  text: string;
  detail: string;
}

const MESSAGES: Msg[] = [
  { t: 0.1, from: 'client', text: 'SYN (seq=0)', detail: 'Initiate 3-way handshake' },
  { t: 0.3, from: 'server', text: 'SYN-ACK (seq=0, ack=1)', detail: 'Server grants connection' },
  { t: 0.5, from: 'client', text: 'ACK (seq=1, ack=1)', detail: 'Handshake complete' },
  { t: 0.7, from: 'client', text: 'HTTP GET /index.html', detail: 'Application request' },
  { t: 0.9, from: 'server', text: 'HTTP 200 OK (data)', detail: 'Response streamed' },
];

export const TimelineViz: React.FC<VizProps> = ({
  params,
  values,
  outcomes,
  onParamChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const timeParam = params.find((p) => /time|step|rtt|progress/i.test(p.name)) || params[0];
  const pName = timeParam?.name || 'step';
  const curStep = values[pName] ?? timeParam?.default ?? 1;
  const maxStep = timeParam?.max ?? 5;
  const scrubRatio = Math.min(1, Math.max(0, curStep / maxStep));

  const isDragging = useRef(false);
  const clientX = 80;
  const serverX = 280;
  const topY = 24;
  const bottomY = 135;

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, (clientY - topY) / (bottomY - topY)));
    const newVal = Math.round(ratio * (maxStep - 1)) + 1;
    onParamChange(pName, newVal);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const topSev = getTopSeverity(outcomes);
  const currentScrubY = topY + scrubRatio * (bottomY - topY);

  return (
    <Panel
      title="Sequence Diagram Scrubbing"
      figId="FIG 0.3 / PROTOCOL EXCHANGE"
      outcomes={outcomes}
      controls={{
        isPlaying,
        onTogglePlay: () => setIsPlaying((p) => !p),
        onStep: () => onParamChange(pName, (curStep % maxStep) + 1),
        onReset: () => onParamChange(pName, 1),
      }}
    >
      <div className="relative w-full bg-background/80 rounded-sm border border-border/40 bg-dotted-grid p-2 select-none">
        <svg
          viewBox="0 0 360 155"
          className="w-full h-36 cursor-ns-resize touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Lane Headers */}
          <rect x={50} y={4} width={60} height={16} fill="#0f0f11" stroke="#5ce1e6" rx={2} />
          <text x={80} y={15} fill="#5ce1e6" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
            CLIENT
          </text>

          <rect x={250} y={4} width={60} height={16} fill="#0f0f11" stroke="#c6ff3d" rx={2} />
          <text x={280} y={15} fill="#c6ff3d" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
            SERVER
          </text>

          {/* Vertical Lifelines */}
          <line x1={clientX} y1={topY} x2={clientX} y2={bottomY} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
          <line x1={serverX} y1={topY} x2={serverX} y2={bottomY} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />

          {/* Scrub line indicator */}
          <line x1={20} y1={currentScrubY} x2={340} y2={currentScrubY} stroke="#c6ff3d" strokeWidth={1} strokeDasharray="2 2" />
          <circle cx={clientX} cy={currentScrubY} r={4} fill="#c6ff3d" />
          <circle cx={serverX} cy={currentScrubY} r={4} fill="#c6ff3d" />

          {/* Message arrows */}
          {MESSAGES.map((msg, i) => {
            const msgY = topY + (i + 1) * 20;
            const isPassed = currentScrubY >= msgY;
            const x1 = msg.from === 'client' ? clientX : serverX;
            const x2 = msg.from === 'client' ? serverX : clientX;

            return (
              <g key={i} opacity={isPassed ? 1 : 0.25} className="transition-opacity">
                <line
                  x1={x1}
                  y1={msgY - 6}
                  x2={x2}
                  y2={msgY}
                  stroke={msg.from === 'client' ? '#5ce1e6' : '#c6ff3d'}
                  strokeWidth={1.5}
                />
                <polygon
                  points={`${x2},${msgY} ${x2 - (msg.from === 'client' ? 5 : -5)},${msgY - 3} ${x2 - (msg.from === 'client' ? 5 : -5)},${msgY + 3}`}
                  fill={msg.from === 'client' ? '#5ce1e6' : '#c6ff3d'}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={msgY - 7}
                  fill="#ededed"
                  fontSize="7"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {msg.text}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Current status bar */}
        <div className="flex items-center justify-between border-t border-border/40 pt-1.5 text-[9px]">
          <span className="text-muted">SCRUB T: STEP {curStep} / {maxStep}</span>
          <span className="text-lime">{MESSAGES[Math.min(MESSAGES.length - 1, curStep - 1)]?.detail}</span>
        </div>
      </div>
    </Panel>
  );
};

