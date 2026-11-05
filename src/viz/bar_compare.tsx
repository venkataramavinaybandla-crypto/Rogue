import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Panel, getTopSeverity, type VizProps } from './kit';

export const BarCompareViz: React.FC<VizProps> = ({
  params,
  values,
  outcomes,
  onParamChange,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const activeParam = params.find((p) => /model|concurrency|threads|mode/i.test(p.name)) || params[0];
  const pName = activeParam?.name || 'param';
  const curVal = values[pName] ?? activeParam?.default ?? 2;

  const options = [
    { label: 'Blocking I/O', overhead: 95, throughput: 20 },
    { label: 'Non-Blocking Poll', overhead: 60, throughput: 55 },
    { label: 'I/O Multiplexing (epoll)', overhead: 25, throughput: 90 },
    { label: 'Async AIO / Completion', overhead: 15, throughput: 98 },
  ];

  const topSev = getTopSeverity(outcomes);

  return (
    <Panel
      title="I/O Model Architectural Benchmark"
      figId="FIG 0.9 / ARCHITECTURE METRICS"
      outcomes={outcomes}
      controls={{
        isPlaying: false,
        onTogglePlay: () => {},
        onReset: () => onParamChange(pName, activeParam?.default ?? 0),
      }}
    >
      <div className="relative w-full bg-background/80 rounded-sm border border-border/40 bg-dotted-grid p-3 flex flex-col gap-2.5">
        {options.map((opt, idx) => {
          const isSelected = Math.round(curVal) === idx;

          return (
            <div
              key={idx}
              onClick={() => onParamChange(pName, idx)}
              className={`p-2 rounded-xs border cursor-pointer transition-all ${
                isSelected
                  ? 'border-lime bg-lime/5'
                  : 'border-border/60 bg-surface/50 hover:border-border-active'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className={isSelected ? 'text-lime font-bold' : 'text-foreground'}>
                  {opt.label}
                </span>
                <span className="text-muted text-[9px]">
                  OVERHEAD: {opt.overhead}% &bull; OPS: {opt.throughput}k
                </span>
              </div>

              {/* Stacked comparison bars */}
              <div className="flex gap-2 h-2.5 bg-background rounded-xs overflow-hidden border border-border/40">
                <motion.div
                  className="bg-cyan h-full rounded-xs"
                  initial={false}
                  animate={{ width: `${opt.throughput}%` }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                />
                <motion.div
                  className="bg-red-400/80 h-full rounded-xs"
                  initial={false}
                  animate={{ width: `${opt.overhead}%` }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                />
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between border-t border-border/40 pt-1.5 text-[9px] font-mono text-muted">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-cyan inline-block rounded-xs" /> Throughput</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 inline-block rounded-xs" /> Syscall Overhead</span>
          </div>
          <span className="text-lime">SELECT TO TEST CONCURRENCY</span>
        </div>
      </div>
    </Panel>
  );
};

