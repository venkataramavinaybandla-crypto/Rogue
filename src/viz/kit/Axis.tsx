import React from 'react';
import type { ScaleLinear } from 'd3-scale';

interface AxisProps {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xTicks?: number;
  yTicks?: number;
  xLabel?: string;
  yLabel?: string;
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const Axis: React.FC<AxisProps> = ({
  xScale,
  yScale,
  xTicks = 5,
  yTicks = 4,
  xLabel,
  yLabel,
  width,
  height,
  margin = { top: 16, right: 16, bottom: 24, left: 36 },
}) => {
  const xTickValues = xScale.ticks(xTicks);
  const yTickValues = yScale.ticks(yTicks);

  return (
    <g className="select-none font-mono text-[9px] text-muted fill-muted pointer-events-none">
      {/* Grid lines */}
      {yTickValues.map((t) => (
        <line
          key={`y-grid-${t}`}
          x1={margin.left}
          y1={yScale(t)}
          x2={width - margin.right}
          y2={yScale(t)}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="2 3"
        />
      ))}
      {xTickValues.map((t) => (
        <line
          key={`x-grid-${t}`}
          x1={xScale(t)}
          y1={margin.top}
          x2={xScale(t)}
          y2={height - margin.bottom}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="2 3"
        />
      ))}

      {/* Axis Lines */}
      <line
        x1={margin.left}
        y1={height - margin.bottom}
        x2={width - margin.right}
        y2={height - margin.bottom}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={height - margin.bottom}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />

      {/* Y Ticks & Labels */}
      {yTickValues.map((t) => (
        <g key={`y-tick-${t}`} transform={`translate(${margin.left - 4}, ${yScale(t)})`}>
          <line x1={0} y1={0} x2={4} y2={0} stroke="rgba(255,255,255,0.3)" />
          <text textAnchor="end" dominantBaseline="middle" fill="#8a8a8f">
            {t}
          </text>
        </g>
      ))}

      {/* X Ticks & Labels */}
      {xTickValues.map((t) => (
        <g
          key={`x-tick-${t}`}
          transform={`translate(${xScale(t)}, ${height - margin.bottom + 4})`}
        >
          <line x1={0} y1={0} x2={0} y2={-4} stroke="rgba(255,255,255,0.3)" />
          <text textAnchor="middle" dominantBaseline="hanging" fill="#8a8a8f">
            {t}
          </text>
        </g>
      ))}

      {/* Axis Titles */}
      {yLabel && (
        <text
          x={margin.left}
          y={margin.top - 6}
          textAnchor="start"
          fill="#5ce1e6"
          className="text-[8px] uppercase tracking-wider"
        >
          {yLabel}
        </text>
      )}
      {xLabel && (
        <text
          x={width - margin.right}
          y={height - margin.bottom - 6}
          textAnchor="end"
          fill="#c6ff3d"
          className="text-[8px] uppercase tracking-wider"
        >
          {xLabel}
        </text>
      )}
    </g>
  );
};

