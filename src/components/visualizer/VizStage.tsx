import React, { useState, useEffect, useRef } from 'react';
import type { Concept, MoveLogEntry, VizOutcome } from '../../types';
import { getVizComponent } from '../../viz/registry';
import { CornerBrackets } from '../common/CornerBrackets';
import { Sliders, Activity, RotateCcw, Zap, Terminal, Sparkles, PlayCircle, StopCircle } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

import { VizErrorBoundary } from './VizErrorBoundary';

interface VizStageProps {
  concept: Concept;
  params: Record<string, number>;
  computed: Record<string, number>;
  activeOutcomes: VizOutcome[];
  moveLog: MoveLogEntry[];
  setParam: (name: string, value: number) => void;
  setParams: (newParams: Record<string, number>) => void;
  resetParams: () => void;
  clearMoveLog: () => void;
}

export const VizStage: React.FC<VizStageProps> = ({
  concept,
  params,
  computed,
  activeOutcomes,
  moveLog,
  setParam,
  setParams,
  resetParams,
  clearMoveLog,
}) => {
  const viz = concept.viz;
  const shouldReduceMotion = useReducedMotion();
  const [isPlayingAllCombos, setIsPlayingAllCombos] = useState(false);
  const comboTimerRef = useRef<any>(null);

  // Stop combo sequencer on unmount
  useEffect(() => {
    return () => {
      if (comboTimerRef.current) clearInterval(comboTimerRef.current);
    };
  }, []);

  if (!viz) {
    return (
      <div className="p-6 bg-surface border border-border rounded-sm text-center font-mono text-muted text-xs">
        NO VISUALIZER CONFIGURED FOR THIS NODE
      </div>
    );
  }

  const VizComponent = getVizComponent(viz.type);
  const computeEntries = Object.entries(computed);
  const latestMove = moveLog[0];

  // Plain words translation of latest move
  const explainLatestMove = () => {
    if (!latestMove) return 'No parameter actions recorded yet. Drag a slider or interact with the diagram.';
    const verb = latestMove.newValue > latestMove.oldValue ? 'raised' : 'reduced';
    const outDesc = computeEntries.length > 0
      ? computeEntries.map(([k, v]) => `${k.replace(/_/g, ' ')} = ${typeof v === 'number' ? v.toFixed(1) : v}`).join(', ')
      : '';
    const trigDesc = latestMove.triggeredOutcomes.length > 0
      ? latestMove.triggeredOutcomes.map((o) => `"${o.title}"`).join(', ')
      : activeOutcomes.length > 0
      ? `"${activeOutcomes[0].title}"`
      : 'steady equilibrium';

    return `You ${verb} ${latestMove.paramName} from ${latestMove.oldValue} to ${latestMove.newValue} ${outDesc ? `\u2192 ${outDesc}` : ''} \u2192 ${trigDesc}`;
  };

  // Play every combo sequentially
  const handleTogglePlayAllCombos = () => {
    if (isPlayingAllCombos) {
      if (comboTimerRef.current) clearInterval(comboTimerRef.current);
      setIsPlayingAllCombos(false);
      return;
    }

    if (!viz.combos_to_try || viz.combos_to_try.length === 0) return;

    setIsPlayingAllCombos(true);
    let idx = 0;
    setParams(viz.combos_to_try[0].set);

    const stepInterval = shouldReduceMotion ? 1200 : 2000;
    comboTimerRef.current = setInterval(() => {
      idx = (idx + 1) % viz.combos_to_try.length;
      setParams(viz.combos_to_try[idx].set);
    }, stepInterval);
  };

  return (
    <div className="flex flex-col gap-4 font-mono text-xs select-none">
      {/* Visualizer Display wrapped in safe Error Boundary */}
      <VizErrorBoundary
        params={viz.params}
        values={params}
        outputs={computed}
        outcomes={activeOutcomes}
        onParamChange={setParam}
      >
        <VizComponent
          params={viz.params}
          values={params}
          outputs={computed}
          outcomes={activeOutcomes}
          onParamChange={setParam}
        />
      </VizErrorBoundary>

      {/* "Explain this move" Cross-cutting Bar */}
      <div className="relative bg-surface border border-lime/30 p-3 rounded-sm text-[11px] leading-relaxed">
        <CornerBrackets className="border-lime/40" />
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-lime font-bold mb-1">
          <Sparkles className="w-3 h-3 text-lime" />
          <span>EXPLAIN THIS MOVE</span>
        </div>
        <p className="font-sans text-foreground/95">
          {explainLatestMove()}
        </p>
      </div>

      {/* Parameter Control Sliders */}
      <div className="relative bg-surface border border-border p-3.5 rounded-sm">
        <CornerBrackets />
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50 text-[10px] text-muted tracking-wider">
          <div className="flex items-center gap-1.5 uppercase font-semibold text-foreground">
            <Sliders className="w-3 h-3 text-lime" />
            <span>FIG 0.2 / PARAMETER TELEMETRY</span>
          </div>
          <button
            onClick={resetParams}
            className="flex items-center gap-1 text-[9px] uppercase px-1.5 py-0.5 border border-border rounded-xs hover:border-lime/60 hover:text-lime transition-colors"
            title="Reset parameters to defaults"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>RESET</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {viz.params.map((p) => {
            const currentVal = params[p.name] ?? p.default ?? p.min;
            return (
              <div key={p.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted tracking-tight truncate max-w-[200px]">
                    {p.label || p.name}
                  </span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-lime font-semibold">{currentVal}</span>
                    {p.unit && <span className="text-[10px] text-muted">{p.unit}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted/60 w-6 text-left">{p.min}</span>
                  <input
                    type="range"
                    min={p.min}
                    max={p.max}
                    step={p.step || 1}
                    value={currentVal}
                    onChange={(e) => setParam(p.name, parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[9px] text-muted/60 w-6 text-right">{p.max}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Computed Readouts */}
      {computeEntries.length > 0 && (
        <div className="relative bg-surface border border-border p-3.5 rounded-sm">
          <CornerBrackets />
          <div className="flex items-center gap-1.5 pb-2 mb-2.5 border-b border-border/50 text-[10px] text-muted tracking-wider uppercase font-semibold">
            <Activity className="w-3 h-3 text-cyan" />
            <span className="text-foreground">COMPUTED RESPONSE METRICS</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {computeEntries.map(([key, val]) => (
              <div
                key={key}
                className="p-2 bg-background/60 border border-border/40 rounded-xs flex flex-col justify-between"
              >
                <span className="text-[9px] text-muted uppercase tracking-wider truncate">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-cyan text-sm font-semibold mt-1">
                  {typeof val === 'number'
                    ? Number.isInteger(val)
                      ? val
                      : val.toFixed(3)
                    : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outcome Panel */}
      <div className="relative bg-surface border border-border p-3.5 rounded-sm">
        <CornerBrackets />
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border/50 text-[10px] text-muted tracking-wider">
          <div className="flex items-center gap-1.5 uppercase font-semibold text-foreground">
            <Zap className="w-3 h-3 text-lime" />
            <span>WHAT YOUR MOVE CAUSED</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.2 bg-background border border-border rounded-xs text-muted">
            {activeOutcomes.length} ACTIVE
          </span>
        </div>

        {activeOutcomes.length === 0 ? (
          <div className="p-3 bg-background/40 border border-border/40 rounded-xs text-muted/80 text-[11px] italic">
            Equilibrium state. Adjust parameters or select a test combo.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {activeOutcomes.map((out, idx) => {
              const sev = (out.severity || 'info').toLowerCase();
              let borderClass = 'border-cyan/40 bg-cyan/5 text-cyan';
              let badgeBg = 'bg-cyan/20 text-cyan';

              if (sev === 'fail' || sev === 'error') {
                borderClass = 'border-red-500/50 bg-red-950/20 text-red-300';
                badgeBg = 'bg-red-500/20 text-red-400';
              } else if (sev === 'warn' || sev === 'warning') {
                borderClass = 'border-amber-500/50 bg-amber-950/20 text-amber-300';
                badgeBg = 'bg-amber-500/20 text-amber-400';
              }

              return (
                <div
                  key={idx}
                  className={`p-2.5 border rounded-xs ${borderClass} transition-all`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-[11px] tracking-tight text-foreground">
                      {out.title}
                    </span>
                    <span className={`text-[8px] uppercase px-1 py-0.5 rounded-xs font-bold ${badgeBg}`}>
                      {sev}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90 text-foreground/90 font-sans">
                    {out.explain}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Combos To Try + "Try Every Combo" Automator */}
      {viz.combos_to_try && viz.combos_to_try.length > 0 && (
        <div className="relative bg-surface border border-border p-3.5 rounded-sm">
          <CornerBrackets />
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50 text-[10px] text-muted tracking-wider">
            <span className="uppercase font-semibold">EXPERIMENT PRESETS (COMBOS)</span>
            <button
              onClick={handleTogglePlayAllCombos}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-xs border text-[9px] uppercase transition-colors ${
                isPlayingAllCombos
                  ? 'border-red-500/50 bg-red-950/30 text-red-300'
                  : 'border-lime/40 bg-lime/10 text-lime hover:bg-lime/20'
              }`}
            >
              {isPlayingAllCombos ? (
                <>
                  <StopCircle className="w-2.5 h-2.5 text-red-400" />
                  <span>STOP AUTO</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-2.5 h-2.5 text-lime" />
                  <span>TRY EVERY COMBO</span>
                </>
              )}
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {viz.combos_to_try.map((combo, idx) => {
              const paramSummary = Object.entries(combo.set)
                .map(([k, v]) => `${k}=${v}`)
                .join(', ');

              return (
                <button
                  key={idx}
                  onClick={() => setParams(combo.set)}
                  className="w-full text-left p-2 rounded-xs border border-border bg-background/50 hover:bg-surface-raised hover:border-lime/40 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] uppercase px-1.5 py-0.5 bg-border/40 text-foreground font-semibold rounded-xs group-hover:bg-lime/20 group-hover:text-lime transition-colors">
                      SET {paramSummary}
                    </span>
                  </div>
                  {combo.lesson && (
                    <div className="text-[10px] text-muted group-hover:text-foreground font-sans line-clamp-2">
                      {combo.lesson}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Move Log */}
      <div className="relative bg-surface border border-border p-3.5 rounded-sm">
        <CornerBrackets />
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50 text-[10px] text-muted tracking-wider">
          <div className="flex items-center gap-1.5 uppercase font-semibold text-foreground">
            <Terminal className="w-3 h-3 text-cyan" />
            <span>TELEMETRY MOVE LOG</span>
          </div>
          {moveLog.length > 0 && (
            <button
              onClick={clearMoveLog}
              className="text-[9px] uppercase text-muted hover:text-foreground underline decoration-dotted"
            >
              CLEAR
            </button>
          )}
        </div>

        {moveLog.length === 0 ? (
          <div className="text-[10px] text-muted/60 italic p-2">
            No moves recorded yet in this session.
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {moveLog.map((entry) => (
              <div
                key={entry.id}
                className="p-1.5 bg-background/60 border border-border/30 rounded-xs text-[10px] flex flex-col gap-0.5"
              >
                <div className="flex items-center justify-between text-muted text-[9px]">
                  <span>{entry.timestamp}</span>
                  <span className="text-lime">{entry.paramName}</span>
                </div>
                <div className="text-foreground/90">
                  {entry.oldValue} &rarr;{' '}
                  <span className="font-semibold text-cyan">{entry.newValue}</span>
                </div>
                {entry.triggeredOutcomes.length > 0 && (
                  <div className="text-[9px] text-lime">
                    + Triggered: {entry.triggeredOutcomes.map((o) => o.title).join('; ')}
                  </div>
                )}
                {entry.clearedOutcomes.length > 0 && (
                  <div className="text-[9px] text-muted/70 line-through">
                    - Cleared: {entry.clearedOutcomes.map((o) => o.title).join('; ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
