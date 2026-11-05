import React, { useState, useEffect, useRef, useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { Panel, Axis, Pulse, getTopSeverity, type VizProps } from './kit';

export const QueueCurveViz: React.FC<VizProps> = ({
  params,
  values,
  outputs,
  outcomes,
  onParamChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [packets, setPackets] = useState<number[]>([1, 2, 3]);
  const isDragging = useRef(false);

  // Locate relevant param: rate, arrival_rate, utilization, or first param
  const activeParam =
    params.find((p) => /util|rate|arrival|load/i.test(p.name)) || params[0];
  const pName = activeParam?.name || 'param';
  const curVal = values[pName] ?? activeParam?.default ?? 50;
  const minVal = activeParam?.min ?? 0;
  const maxVal = activeParam?.max ?? 100;

  // Locate delay output or compute knee
  const delayOutputKey = Object.keys(outputs)[0] || 'delay';
  const curDelay = outputs[delayOutputKey] ?? curVal / Math.max(1, 100 - curVal);

  const width = 360;
  const height = 150;
  const margin = { top: 16, right: 16, bottom: 24, left: 36 };

  const xScale = useMemo(
    () => scaleLinear().domain([minVal, maxVal]).range([margin.left, width - margin.right]),
    [minVal, maxVal, width, margin]
  );

  const maxDelayEst = Math.max(10, curDelay * 1.5, 50);
  const yScale = useMemo(
    () => scaleLinear().domain([0, maxDelayEst]).range([height - margin.bottom, margin.top]),
    [maxDelayEst, height, margin]
  );

  // Curve points: M/M/1 asymptotic curve
  const curvePath = useMemo(() => {
    let d = '';
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const v = minVal + ((maxVal - minVal) * i) / steps;
      const normalized = (v - minVal) / Math.max(1, maxVal - minVal);
      const estDelay = Math.min(maxDelayEst, 1 / Math.max(0.04, 1.02 - normalized * 0.96));
      const px = xScale(v);
      const py = yScale(estDelay);
      d += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
    }
    return d;
  }, [minVal, maxVal, xScale, yScale, maxDelayEst]);

  // Knee x coordinate (~75% of range)
  const kneeVal = minVal + (maxVal - minVal) * 0.75;
  const kneeX = xScale(kneeVal);

  // Animated packets filling buffer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPackets((prev) => {
        const capacity = Math.min(12, Math.max(2, Math.round((curVal / maxVal) * 12)));
        const next = [...prev];
        if (next.length < capacity) next.push(Date.now());
        else if (next.length > capacity) next.shift();
        return next;
      });
    }, Math.max(120, 600 - (curVal / maxVal) * 450));
    return () => clearInterval(interval);
  }, [isPlaying, curVal, maxVal]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;
    const newVal = Math.min(maxVal, Math.max(minVal, xScale.invert(svgX)));
    const step = activeParam?.step || 1;
    onParamChange(pName, Math.round(newVal / step) * step);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const topSev = getTopSeverity(outcomes);
  const curX = xScale(curVal);
  const curY = yScale(Math.min(maxDelayEst, curDelay));

  return (
    <Panel
      title="Queue Delay vs Utilization"
      figId="FIG 0.1 / M/M/1 KNEE PROFILE"
      outcomes={outcomes}
      controls={{
        isPlaying,
        onTogglePlay: () => setIsPlaying((p) => !p),
        onStep: () => setPackets((p) => [...p.slice(-8), Date.now()]),
        onReset: () => onParamChange(pName, activeParam?.default ?? minVal),
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
            xLabel={activeParam?.label || 'Utilization'}
            yLabel={delayOutputKey}
            width={width}
            height={height}
            margin={margin}
          />

          {/* Knee vertical threshold marker */}
          <line
            x1={kneeX}
            y1={margin.top}
            x2={kneeX}
            y2={height - margin.bottom}
            stroke="#ffb638"
            strokeDasharray="3 3"
            strokeOpacity={0.6}
          />
          <text
            x={kneeX + 4}
            y={margin.top + 8}
            fill="#ffb638"
            fontSize="8"
            fontFamily="JetBrains Mono"
          >
            KNEE REGION
          </text>

          {/* Response Curve */}
          <path d={curvePath} fill="none" stroke="#5ce1e6" strokeWidth={2} />

          {/* Draggable Operating Point with Pulse */}
          <Pulse x={curX} y={curY} r={5} severity={topSev} />
          <circle
            cx={curX}
            cy={curY}
            r={6}
            fill="#c6ff3d"
            stroke="#0a0a0b"
            strokeWidth={1.5}
            className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
          />
        </svg>

        {/* Buffer Queue Packets Animation */}
        <div className="px-3 pb-2 pt-1 border-t border-border/40 flex items-center justify-between text-[10px]">
          <span className="text-muted text-[9px] uppercase tracking-wider">
            QUEUE OCCUPANCY: {packets.length} / 12 PKTS
          </span>
          <div className="flex gap-1 h-3 items-center">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-2.5 rounded-xs transition-colors duration-150 ${
                  i < packets.length
                    ? i > 9
                      ? 'bg-red-400'
                      : i > 6
                      ? 'bg-amber-400'
                      : 'bg-lime'
                    : 'bg-border/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
};

