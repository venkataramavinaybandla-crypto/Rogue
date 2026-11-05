import React, { useMemo } from 'react';
import type { VizConfig } from '../../types';
import { safeEvaluate } from '../../engine/evaluator';
import { CornerBrackets } from '../common/CornerBrackets';

interface GenericVizProps {
  viz: VizConfig;
  params: Record<string, number>;
  computed: Record<string, number>;
}

export const GenericViz: React.FC<GenericVizProps> = ({ viz, params, computed }) => {
  const firstParam = viz.params[0];
  const computeKeys = Object.keys(viz.compute || {});
  const firstComputeKey = computeKeys[0];
  const firstComputeExpr = firstComputeKey ? viz.compute[firstComputeKey] : null;

  // Generate 25 points along first param min..max
  const { points, minVal, maxVal, currentPoint } = useMemo(() => {
    if (!firstParam || !firstComputeExpr) {
      return { points: [], minVal: 0, maxVal: 1, currentPoint: null };
    }

    const minP = firstParam.min;
    const maxP = firstParam.max;
    const rangeP = Math.max(0.0001, maxP - minP);
    const stepCount = 28;

    const pts: { x: number; y: number; paramVal: number; outVal: number }[] = [];
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i <= stepCount; i++) {
      const pVal = minP + (rangeP * i) / stepCount;
      const testScope = { ...params, [firstParam.name]: pVal };
      const out = safeEvaluate(firstComputeExpr, testScope);
      const numY = typeof out === 'number' ? out : (out ? 1 : 0);

      if (numY < minY) minY = numY;
      if (numY > maxY) maxY = numY;

      pts.push({ x: 0, y: 0, paramVal: pVal, outVal: numY });
    }

    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }
    const rangeY = Math.max(0.0001, maxY - minY);

    // Map to SVG coordinates: viewBox 0 0 360 160, inner graph margin 35 left, 15 right, 15 top, 25 bottom
    const gx = 36;
    const gy = 16;
    const gw = 310;
    const gh = 120;

    const mappedPts = pts.map((pt) => {
      const nx = (pt.paramVal - minP) / rangeP;
      const ny = (pt.outVal - minY) / rangeY;
      return {
        ...pt,
        x: gx + nx * gw,
        y: gy + gh - ny * gh,
      };
    });

    // Current point
    const curPVal = params[firstParam.name] ?? firstParam.default;
    const curOutVal = computed[firstComputeKey] ?? 0;
    const curNx = Math.min(1, Math.max(0, (curPVal - minP) / rangeP));
    const curNy = Math.min(1, Math.max(0, (curOutVal - minY) / rangeY));
    const curMapped = {
      x: gx + curNx * gw,
      y: gy + gh - curNy * gh,
      paramVal: curPVal,
      outVal: curOutVal,
    };

    return { points: mappedPts, minVal: minY, maxVal: maxY, currentPoint: curMapped };
  }, [firstParam, firstComputeExpr, firstComputeKey, params, computed]);

  const svgPath = useMemo(() => {
    if (points.length < 2) return '';
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, '');
  }, [points]);

  return (
    <div className="relative w-full bg-surface border border-border p-3 rounded-sm font-mono overflow-hidden">
      <CornerBrackets />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 text-[10px] tracking-wider text-muted">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan inline-block animate-pulse" />
          <span className="uppercase text-foreground font-semibold">
            FIG 0.1 / {viz.type.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="text-[9px] uppercase tracking-widest text-muted/80">
          OUTPUT: <span className="text-cyan">{firstComputeKey || 'SIGNAL'}</span>
        </div>
      </div>

      {/* SVG Canvas with faint dotted grid */}
      <div className="relative w-full h-44 bg-background/80 rounded-sm border border-border/40 bg-dotted-grid flex items-center justify-center">
        {points.length > 0 ? (
          <svg
            viewBox="0 0 360 160"
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid axis lines */}
            <line x1="36" y1="16" x2="36" y2="136" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="36" y1="136" x2="346" y2="136" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="36" y1="76" x2="346" y2="76" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3" />
            <line x1="191" y1="16" x2="191" y2="136" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3" />

            {/* Y axis tick labels */}
            <text x="32" y="22" fill="#8a8a8f" fontSize="8" textAnchor="end" fontFamily="JetBrains Mono">
              {maxVal.toFixed(1)}
            </text>
            <text x="32" y="136" fill="#8a8a8f" fontSize="8" textAnchor="end" fontFamily="JetBrains Mono">
              {minVal.toFixed(1)}
            </text>

            {/* X axis tick labels */}
            {firstParam && (
              <>
                <text x="36" y="148" fill="#8a8a8f" fontSize="8" textAnchor="start" fontFamily="JetBrains Mono">
                  {firstParam.min}
                </text>
                <text x="346" y="148" fill="#8a8a8f" fontSize="8" textAnchor="end" fontFamily="JetBrains Mono">
                  {firstParam.max} {firstParam.unit || ''}
                </text>
              </>
            )}

            {/* Main response curve */}
            <path
              d={svgPath}
              fill="none"
              stroke="#5ce1e6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Current point tracking crosshair and dot */}
            {currentPoint && (
              <>
                {/* Vertical drop line */}
                <line
                  x1={currentPoint.x}
                  y1="16"
                  x2={currentPoint.x}
                  y2="136"
                  stroke="#c6ff3d"
                  strokeOpacity="0.4"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Horizontal guide line */}
                <line
                  x1="36"
                  y1={currentPoint.y}
                  x2="346"
                  y2={currentPoint.y}
                  stroke="#c6ff3d"
                  strokeOpacity="0.4"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Active marker circle */}
                <circle
                  cx={currentPoint.x}
                  cy={currentPoint.y}
                  r="4"
                  fill="#c6ff3d"
                  stroke="#0a0a0b"
                  strokeWidth="1.5"
                />
              </>
            )}
          </svg>
        ) : (
          <div className="text-[11px] text-muted">Awaiting signal response...</div>
        )}
      </div>

      {/* Axis and live readout tags */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[10px]">
        <div className="text-muted">
          DOMAIN: <span className="text-foreground">{firstParam?.label || 'PARAM'}</span>
        </div>
        <div className="text-lime font-mono">
          f({params[firstParam?.name || ''] ?? 0}) = {(computed[firstComputeKey] ?? 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

