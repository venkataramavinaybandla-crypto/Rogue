import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { contentStore } from '../content/loader';
import { runContentQAReport } from '../content/qa';
import { CornerBrackets } from '../components/common/CornerBrackets';
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, RefreshCw } from 'lucide-react';

export const DebugPage: React.FC = () => {
  const [qaTick, setQaTick] = useState(0);
  const report = useMemo(() => runContentQAReport(), [qaTick]);

  const { files, errors } = contentStore;

  const totalWarnings =
    report.brokenPrereqs.length +
    report.unmatchedParams.length +
    report.combosWithZeroOutcomes.length +
    report.uncoveredParamRanges.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6 font-mono text-xs">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between text-muted border-b border-border/50 pb-3">
        <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          RETURN TO COMMAND GRID
        </Link>
        <button
          onClick={() => setQaTick((t) => t + 1)}
          className="flex items-center gap-1.5 px-2 py-0.5 border border-border rounded-xs hover:border-lime hover:text-lime"
        >
          <RefreshCw className="w-3 h-3" />
          RE-RUN QA SUITE
        </button>
      </div>

      {/* Header Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="relative bg-surface border border-border p-4 rounded-sm">
          <CornerBrackets />
          <div className="text-[10px] text-muted uppercase">LOADED UNITS</div>
          <div className="text-2xl font-bold text-lime mt-1">{files.length} FILES</div>
          <div className="text-[10px] text-muted mt-1">{contentStore.conceptsById.size} concepts total</div>
        </div>

        <div className="relative bg-surface border border-border p-4 rounded-sm">
          <CornerBrackets />
          <div className="text-[10px] text-muted uppercase">PARSE/ZOD ERRORS</div>
          <div className={`text-2xl font-bold mt-1 ${errors.length > 0 ? 'text-red-400' : 'text-cyan'}`}>
            {errors.length} HARD ERRORS
          </div>
          <div className="text-[10px] text-muted mt-1">
            {errors.length === 0 ? 'Clean schema validation' : 'Skipped corrupt files'}
          </div>
        </div>

        <div className="relative bg-surface border border-border p-4 rounded-sm">
          <CornerBrackets />
          <div className="text-[10px] text-muted uppercase">BROKEN PREREQS</div>
          <div className={`text-2xl font-bold mt-1 ${report.brokenPrereqs.length > 0 ? 'text-amber-400' : 'text-lime'}`}>
            {report.brokenPrereqs.length} MISMATCHES
          </div>
          <div className="text-[10px] text-muted mt-1">Non-blocking cross-links</div>
        </div>

        <div className="relative bg-surface border border-border p-4 rounded-sm">
          <CornerBrackets />
          <div className="text-[10px] text-muted uppercase">QA DIAGNOSTICS</div>
          <div className={`text-2xl font-bold mt-1 ${totalWarnings > 0 ? 'text-amber-400' : 'text-lime'}`}>
            {totalWarnings} WARNINGS
          </div>
          <div className="text-[10px] text-muted mt-1">Zero block policy</div>
        </div>
      </div>

      {/* CO Breakdown Table */}
      <div className="relative bg-surface border border-border p-4 rounded-sm">
        <CornerBrackets />
        <div className="text-xs uppercase font-bold text-foreground mb-3 flex items-center gap-1.5 pb-2 border-b border-border/50">
          <Cpu className="w-3.5 h-3.5 text-lime" />
          <span>COURSE OUTCOME SYLLABUS DISTRIBUTION</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {Object.entries(report.countsPerCo).map(([co, data]) => (
            <div key={co} className="p-2.5 bg-background/50 border border-border/40 rounded-xs flex flex-col gap-1">
              <span className="text-lime font-bold">{co}</span>
              <span className="text-[11px] text-foreground">{data.parts} parts</span>
              <span className="text-[10px] text-muted">{data.concepts} concepts</span>
            </div>
          ))}
        </div>
      </div>

      {/* QA Warning Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Broken Prereqs */}
        <div className="relative bg-surface border border-border p-4 rounded-sm">
          <CornerBrackets />
          <div className="text-xs font-bold text-foreground mb-2 flex items-center justify-between pb-2 border-b border-border/50">
            <span>BROKEN PREREQUISITE IDS ({report.brokenPrereqs.length})</span>
            <span className="text-[9px] text-muted">REPORT ONLY</span>
          </div>
          {report.brokenPrereqs.length === 0 ? (
            <div className="text-lime p-2 text-[11px]">All concept prerequisites reference valid concepts.</div>
          ) : (
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5">
              {report.brokenPrereqs.map((item, i) => (
                <div key={i} className="p-2 bg-background/60 border border-border/40 rounded-xs text-[10px] flex justify-between">
                  <span className="text-foreground">{item.conceptId}</span>
                  <span className="text-amber-400">&rarr; missing "{item.prereq}"</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unmatched params */}
        <div className="relative bg-surface border border-border p-4 rounded-sm">
          <CornerBrackets />
          <div className="text-xs font-bold text-foreground mb-2 flex items-center justify-between pb-2 border-b border-border/50">
            <span>PARAMS NOT IN COMPUTE/OUTCOMES ({report.unmatchedParams.length})</span>
            <span className="text-[9px] text-muted">AUDIT</span>
          </div>
          {report.unmatchedParams.length === 0 ? (
            <div className="text-lime p-2 text-[11px]">All visualizer parameters are bound to expressions.</div>
          ) : (
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5">
              {report.unmatchedParams.map((item, i) => (
                <div key={i} className="p-2 bg-background/60 border border-border/40 rounded-xs text-[10px] flex justify-between">
                  <span className="text-foreground">{item.conceptId}</span>
                  <span className="text-muted font-bold">{item.paramName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Combos that trigger 0 outcomes */}
        <div className="relative bg-surface border border-border p-4 rounded-sm">
          <CornerBrackets />
          <div className="text-xs font-bold text-foreground mb-2 flex items-center justify-between pb-2 border-b border-border/50">
            <span>COMBOS TRIGGERING ZERO OUTCOMES ({report.combosWithZeroOutcomes.length})</span>
            <span className="text-[9px] text-muted">AUDIT</span>
          </div>
          {report.combosWithZeroOutcomes.length === 0 ? (
            <div className="text-lime p-2 text-[11px]">All preset combos trigger at least one active outcome.</div>
          ) : (
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5">
              {report.combosWithZeroOutcomes.map((item, i) => (
                <div key={i} className="p-2 bg-background/60 border border-border/40 rounded-xs text-[10px] flex justify-between">
                  <span className="text-foreground">{item.conceptId} (Combo #{item.comboIdx + 1})</span>
                  <span className="text-muted truncate max-w-[150px]">{JSON.stringify(item.set)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Param range coverage (200 sample points) */}
        <div className="relative bg-surface border border-border p-4 rounded-sm">
          <CornerBrackets />
          <div className="text-xs font-bold text-foreground mb-2 flex items-center justify-between pb-2 border-b border-border/50">
            <span>UNCOVERED PARAM RANGES [200 PTS SAMPLE] ({report.uncoveredParamRanges.length})</span>
            <span className="text-[9px] text-muted">SIMULATION</span>
          </div>
          {report.uncoveredParamRanges.length === 0 ? (
            <div className="text-lime p-2 text-[11px]">100% parameter outcome coverage verified.</div>
          ) : (
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5">
              {report.uncoveredParamRanges.map((item, i) => (
                <div key={i} className="p-2 bg-background/60 border border-border/40 rounded-xs text-[10px] flex justify-between">
                  <span className="text-foreground">{item.conceptId} ({item.paramName})</span>
                  <span className="text-amber-400">{item.uncoveredCount}/200 points without outcome</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
