import React, { useState, useMemo, useRef } from 'react';
import { scaleLinear } from 'd3-scale';
import { Panel, Axis, Pulse, getTopSeverity, type VizProps } from './kit';
import { Zap } from 'lucide-react';

export const CwndGraphViz: React.FC<VizProps> = ({
  params,
  values,
  outcomes,
  onParamChange,
}) => {
  const cwndParam = params.find((p) => /cwnd|window|ssthresh/i.test(p.name)) || params[0];
  const pName = cwndParam?.name || 'cwnd';
  const curCwnd = values[pName] ?? cwndParam?.default ?? 16;
  const maxCwnd = cwndParam?.max ?? 64;
  const [lossEvent, setLossEvent] = useState(false);
  const isDragging = useRef(false);

  const width = 360;
  const height = 150;
  const margin = { top: 16, right: 16, bottom: 24, left: 36 };

  const xScale = useMemo(() => scaleLinear().domain([0, 20]).range([margin.left, width - margin.right]), []);
  const yScale = useMemo(() => scaleLinear().domain([0, maxCwnd]).range([height - margin.bottom, margin.top]), [maxCwnd]);

  // Construct sawtooth trace based on current cwnd and ssthresh
  const { pathSegments, ssthresh } = useMemo(() => {
    const ssthreshVal = Math.round(curCwnd * 0.6);
    const pts: { rtt: number; cwnd: number; phase: 'ss' | 'aimd' | 'fr' }[] = [];
    let w = 1;

    for (let rtt = 0; rtt <= 20; rtt++) {
      if (rtt < 5) {
        w = Math.min(ssthreshVal, Math.pow(2, rtt));
        pts.push({ rtt, cwnd: w, phase: 'ss' });
      } else if (rtt === 10) {
        w = Math.max(2, Math.floor(w / 2));
        pts.push({ rtt, cwnd: w, phase: 'fr' });
      } else if (rtt > 10 && rtt <= 17) {
        w += 1;
        pts.push({ rtt, cwnd: w, phase: 'aimd' });
      } else {
        w = Math.min(curCwnd, w + 1);
        pts.push({ rtt, cwnd: w, phase: 'aimd' });
      }
    }

    let d = '';
    pts.forEach((p, i) => {
      const px = xScale(p.rtt);
      const py = yScale(p.cwnd);
      d += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
    });

    return { pathSegments: d, ssthresh: ssthreshVal };
  }, [curCwnd, xScale, yScale]);

  const handleInjectLoss = () => {
    setLossEvent(true);
    setTimeout(() => setLossEvent(false), 800);
    const halved = Math.max(cwndParam?.min ?? 1, Math.floor(curCwnd / 2));
    onParamChange(pName, halved);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientY = e.clientY - rect.top;
    const svgY = (clientY / rect.height) * height;
    const newVal = Math.min(maxCwnd, Math.max(cwndParam?.min ?? 1, Math.round(yScale.invert(svgY))));
    onParamChange(pName, newVal);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const topSev = getTopSeverity(outcomes);
  const curY = yScale(curCwnd);

  return (
    <Panel
      title="TCP Congestion Window Dynamics"
      figId="FIG 0.4 / AIMD SAWTOOTH TRACE"
      outcomes={outcomes}
    >
      <div className="relative w-full bg-background/80 rounded-sm border border-border/40 bg-dotted-grid flex flex-col">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full select-none cursor-ns-resize touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <Axis xScale={xScale} yScale={yScale} xLabel="RTT" yLabel="CWND (MSS)" width={width} height={height} margin={margin} />

          {/* Slow-start threshold guideline */}
          <line
            x1={margin.left}
            y1={yScale(ssthresh)}
            x2={width - margin.right}
            y2={yScale(ssthresh)}
            stroke="#ffb638"
            strokeDasharray="3 3"
          />
          <text x={width - margin.right} y={yScale(ssthresh) - 3} fill="#ffb638" fontSize="7" textAnchor="end" fontFamily="JetBrains Mono">
            ssthresh={ssthresh}
          </text>

          {/* Sawtooth path */}
          <path d={pathSegments} fill="none" stroke="#5ce1e6" strokeWidth={2} />

          {/* Draggable Current CWND Horizontal Bar */}
          <line
            x1={margin.left}
            y1={curY}
            x2={width - margin.right}
            y2={curY}
            stroke="#c6ff3d"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
          <circle cx={width - margin.right - 10} cy={curY} r={5} fill="#c6ff3d" />
          {lossEvent && <Pulse x={width - margin.right - 10} y={curY} r={8} severity="fail" />}
        </svg>

        {/* Toolbar with Inject Loss */}
        <div className="px-3 py-1.5 border-t border-border/40 flex items-center justify-between text-[10px]">
          <div className="flex gap-2">
            <span className="text-cyan">SS: 1 &rarr; {ssthresh}</span>
            <span className="text-lime">AIMD: +1 MSS/RTT</span>
          </div>
          <button
            onClick={handleInjectLoss}
            className="flex items-center gap-1 px-2 py-0.5 bg-red-950/40 border border-red-500/50 text-red-300 rounded-xs hover:bg-red-900/60 transition-colors"
          >
            <Zap className="w-2.5 h-2.5 text-red-400" />
            <span>INJECT 3x DUP-ACK</span>
          </button>
        </div>
      </div>
    </Panel>
  );
};

