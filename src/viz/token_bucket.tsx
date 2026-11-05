import React, { useState, useEffect } from 'react';
import { Panel, getTopSeverity, type VizProps } from './kit';
import { Flame } from 'lucide-react';

export const TokenBucketViz: React.FC<VizProps> = ({
  params,
  values,
  outcomes,
  onParamChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const capacityParam = params.find((p) => /capacity|burst|depth/i.test(p.name)) || params[0];
  const rateParam = params.find((p) => /rate|fill|token/i.test(p.name)) || params[1] || params[0];

  const capName = capacityParam?.name || 'capacity';
  const capacity = Math.max(5, Math.min(20, Math.round(values[capName] ?? 10)));
  const fillRate = Math.max(1, Math.min(5, Math.round(values[rateParam?.name || ''] ?? 2)));

  const [tokens, setTokens] = useState<number>(5);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTokens((prev) => Math.min(capacity, prev + 1));
    }, Math.max(200, 1000 / fillRate));
    return () => clearInterval(interval);
  }, [isPlaying, capacity, fillRate]);

  const handleConsume = (amount: number) => {
    setTokens((prev) => Math.max(0, prev - amount));
  };

  const topSev = getTopSeverity(outcomes);
  const fillPct = Math.round((tokens / capacity) * 100);

  return (
    <Panel
      title="Traffic Policing: Token Bucket Shaper"
      figId="FIG 0.10 / RATE POLICING RESERVOIR"
      outcomes={outcomes}
      controls={{
        isPlaying,
        onTogglePlay: () => setIsPlaying((p) => !p),
        onReset: () => setTokens(capacity),
      }}
    >
      <div className="relative w-full bg-background/80 rounded-sm border border-border/40 bg-dotted-grid p-3 flex flex-col gap-3">
        {/* Bucket Reservoir Graphic */}
        <div className="flex items-center justify-center gap-6 py-2">
          {/* SVG Bucket Vessel */}
          <div className="relative w-32 h-28 border-x-2 border-b-2 border-muted/60 rounded-b-md overflow-hidden bg-surface/80 flex flex-col justify-end p-1">
            <div
              className="w-full bg-cyan/20 border-t border-cyan transition-all duration-300 rounded-b-sm flex items-center justify-center text-[10px] font-mono text-cyan font-bold"
              style={{ height: `${fillPct}%` }}
            >
              {fillPct > 20 && `${tokens} TOKENS`}
            </div>
          </div>

          {/* Controls to drain */}
          <div className="flex flex-col gap-2 font-mono text-xs">
            <button
              onClick={() => handleConsume(1)}
              disabled={tokens < 1}
              className="px-3 py-1 bg-surface border border-border rounded-xs text-foreground hover:border-lime hover:text-lime transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              SEND 1 PACKET (-1)
            </button>
            <button
              onClick={() => handleConsume(4)}
              disabled={tokens < 4}
              className="px-3 py-1 bg-surface border border-border rounded-xs text-foreground hover:border-amber-400 hover:text-amber-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>BURST DRAIN (-4)</span>
            </button>
          </div>
        </div>

        {/* Telemetry status footer */}
        <div className="flex items-center justify-between border-t border-border/40 pt-1.5 text-[9px] font-mono text-muted">
          <span>FILL RATE: {fillRate} TOKENS/SEC</span>
          <span className="text-cyan">RESERVOIR: {tokens} / {capacity} TOKENS ({fillPct}%)</span>
        </div>
      </div>
    </Panel>
  );
};

