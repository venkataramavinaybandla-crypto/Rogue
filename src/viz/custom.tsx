import React, { useMemo, useRef } from 'react';
import { scaleLinear } from 'd3-scale';
import { Panel, Axis, getTopSeverity, type VizProps } from './kit';

export const CustomViz: React.FC<VizProps> = ({
  params,
  values,
  outputs,
  outcomes,
  onParamChange,
}) => {
  const firstParam = params[0];
  const pName = firstParam?.name || 'param';
  const curPVal = values[pName] ?? firstParam?.default ?? 0;
  const minP = firstParam?.min ?? 0;
  const maxP = firstParam?.max ?? 100;
  const isDragging = useRef(false);

  const width = 360;
  const height = 150;
  const margin = { top: 16, right: 16, bottom: 24, left: 36 };

  const xScale = useMemo(
    () => scaleLinear().domain([minP, maxP]).range([margin.left, width - margin.right]),
    [minP, maxP]
  );

  const outputEntries = Object.entries(outputs);
  const outVals = outputEntries.map(([, v]) => (typeof v === 'number' ? v : 0));
  const maxOut = Math.max(10, ...outVals, 100);

  const yScale = useMemo(
    () => scaleLinear().domain([0, maxOut * 1.2]).range([height - margin.bottom, margin.top]),
    [maxOut]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * width;
    const val = Math.min(maxP, Math.max(minP, xScale.invert(cx)));
    const step = firstParam?.step || 1;
    onParamChange(pName, Math.round(val / step) * step);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const curX = xScale(curPVal);

  return (
    <Panel
      title="Universal Telemetry & Computed Output Plot"
      figId="FIG 0.12 / MULTI-OUTPUT TELEMETRY"
      outcomes={outcomes}
      controls={{
        isPlaying: false,
        onTogglePlay: () => {},
        onReset: () => onParamChange(pName, firstParam?.default ?? minP),
      }}
    >
      <div className="relative w-full bg-background/80 rounded-sm border border-border/40 bg-dotted-grid flex flex-col">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full select-none cursor-ew-resize touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <Axis
            xScale={xScale}
            yScale={yScale}
            xLabel={firstParam?.label || pName}
            yLabel="Computed Output"
            width={width}
            height={height}
            margin={margin}
          />

          {/* Current Parameter vertical marker */}
          <line
            x1={curX}
            y1={margin.top}
            x2={curX}
            y2={height - margin.bottom}
            stroke="#c6ff3d"
            strokeWidth={1.5}
            strokeDasharray="2 2"
          />

          {/* Output Dots plotted at current X */}
          {outputEntries.map(([k, val], idx) => {
            const numY = typeof val === 'number' ? val : 0;
            const cy = yScale(Math.min(maxOut * 1.2, numY));
            const colors = ['#5ce1e6', '#c6ff3d', '#ffb638', '#ff4d4d'];
            const color = colors[idx % colors.length];

            return (
              <g key={k}>
                <circle cx={curX} cy={cy} r={5} fill={color} stroke="#0a0a0b" strokeWidth={1} />
                <text
                  x={curX + 6}
                  y={cy + 3}
                  fill={color}
                  fontSize="7"
                  fontFamily="JetBrains Mono"
                >
                  {k}={numY.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Telemetry pill row */}
        <div className="px-3 py-1.5 border-t border-border/40 flex items-center justify-between text-[10px] font-mono">
          <span className="text-muted">{pName}={curPVal}</span>
          <div className="flex gap-2">
            {outputEntries.map(([k, v]) => (
              <span key={k} className="text-cyan">
                {k}: {typeof v === 'number' ? v.toFixed(2) : String(v)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
};

