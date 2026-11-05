import React, { useState } from 'react';
import { Panel, Pulse, getTopSeverity, type VizProps } from './kit';

interface StateNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Transition {
  from: string;
  to: string;
  event: string;
}

const STATES: StateNode[] = [
  { id: 'CLOSED', label: 'CLOSED', x: 50, y: 70 },
  { id: 'SYN_SENT', label: 'SYN_SENT', x: 130, y: 30 },
  { id: 'SYN_RCVD', label: 'SYN_RCVD', x: 130, y: 110 },
  { id: 'ESTABLISHED', label: 'ESTABLISHED', x: 230, y: 70 },
  { id: 'FIN_WAIT', label: 'FIN_WAIT', x: 310, y: 70 },
];

const VALID_TRANSITIONS: Transition[] = [
  { from: 'CLOSED', to: 'SYN_SENT', event: 'ACTIVE_OPEN' },
  { from: 'CLOSED', to: 'SYN_RCVD', event: 'PASSIVE_OPEN' },
  { from: 'SYN_SENT', to: 'ESTABLISHED', event: 'RECV_SYN_ACK' },
  { from: 'SYN_RCVD', to: 'ESTABLISHED', event: 'RECV_ACK' },
  { from: 'ESTABLISHED', to: 'FIN_WAIT', event: 'CLOSE' },
  { from: 'FIN_WAIT', to: 'CLOSED', event: 'TIMEOUT' },
];

export const StateMachineViz: React.FC<VizProps> = ({
  params,
  values,
  outcomes,
  onParamChange,
}) => {
  const stateParam = params.find((p) => /state|step|phase/i.test(p.name)) || params[0];
  const pName = stateParam?.name || 'state';
  const curIdx = Math.min(STATES.length - 1, Math.max(0, Math.round(values[pName] ?? 0)));
  const currentState = STATES[curIdx] || STATES[0];

  const [illegalFlash, setIllegalFlash] = useState(false);

  const handleStateClick = (targetId: string, targetIdx: number) => {
    if (targetId === currentState.id) return;
    const isValid = VALID_TRANSITIONS.some(
      (t) => t.from === currentState.id && t.to === targetId
    );

    if (isValid) {
      onParamChange(pName, targetIdx);
    } else {
      setIllegalFlash(true);
      setTimeout(() => setIllegalFlash(false), 600);
    }
  };

  const topSev = getTopSeverity(outcomes);

  return (
    <Panel
      title="TCP Protocol Finite State Machine"
      figId="FIG 0.7 / TCP STATE TRANSITIONS"
      outcomes={outcomes}
      controls={{
        isPlaying: false,
        onTogglePlay: () => {},
        onReset: () => onParamChange(pName, 0),
      }}
    >
      <div className="relative w-full bg-background/80 rounded-sm border border-border/40 bg-dotted-grid p-2 flex flex-col justify-between">
        <svg viewBox="0 0 360 140" className="w-full h-36 select-none">
          {/* Transition Links */}
          {VALID_TRANSITIONS.map((tr, i) => {
            const u = STATES.find((s) => s.id === tr.from)!;
            const v = STATES.find((s) => s.id === tr.to)!;
            const isCurrent = currentState.id === tr.from;

            return (
              <g key={i}>
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={isCurrent ? '#c6ff3d' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={isCurrent ? 1.5 : 1}
                  strokeDasharray={isCurrent ? undefined : '2 2'}
                />
              </g>
            );
          })}

          {/* State Nodes */}
          {STATES.map((s, idx) => {
            const isCurrent = s.id === currentState.id;

            return (
              <g
                key={s.id}
                transform={`translate(${s.x}, ${s.y})`}
                onClick={() => handleStateClick(s.id, idx)}
                className="cursor-pointer"
              >
                {isCurrent && <Pulse x={0} y={0} r={16} severity={illegalFlash ? 'fail' : topSev} />}
                <circle
                  cx={0}
                  cy={0}
                  r={15}
                  fill="#0f0f11"
                  stroke={illegalFlash && isCurrent ? '#ff4d4d' : isCurrent ? '#c6ff3d' : '#8a8a8f'}
                  strokeWidth={isCurrent ? 2 : 1}
                />
                <text
                  x={0}
                  y={3}
                  fill={isCurrent ? '#c6ff3d' : '#ededed'}
                  fontSize="6.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {s.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex items-center justify-between border-t border-border/40 pt-1.5 text-[9px]">
          <span className="text-muted">STATE: <span className="text-lime">{currentState.label}</span></span>
          <span className={illegalFlash ? 'text-red-400 font-bold' : 'text-muted'}>
            {illegalFlash ? 'ILLEGAL TRANSITION BLOCKED' : 'CLICK ADJACENT NODE TO TRANSITION'}
          </span>
        </div>
      </div>
    </Panel>
  );
};

