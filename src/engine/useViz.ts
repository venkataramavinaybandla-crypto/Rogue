import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Concept, MoveLogEntry, VizOutcome } from '../types';
import { safeEvaluate } from './evaluator';

const SEVERITY_WEIGHT: Record<string, number> = {
  fail: 3,
  error: 3,
  danger: 3,
  warn: 2,
  warning: 2,
  info: 1,
};

function getSeverityWeight(severity: string): number {
  return SEVERITY_WEIGHT[severity.toLowerCase()] || 0;
}

export interface UseVizReturn {
  params: Record<string, number>;
  computed: Record<string, number>;
  activeOutcomes: VizOutcome[];
  moveLog: MoveLogEntry[];
  setParam: (name: string, value: number) => void;
  setParams: (newParams: Record<string, number>) => void;
  resetParams: () => void;
  clearMoveLog: () => void;
}

export function useViz(concept: Concept | null | undefined): UseVizReturn {
  const viz = concept?.viz;

  // Initialize initial parameters
  const initialParams = useMemo(() => {
    const map: Record<string, number> = {};
    if (!viz || !viz.params) return map;
    for (const p of viz.params) {
      map[p.name] = p.default ?? p.min ?? 0;
    }
    return map;
  }, [concept?.id]);

  const [params, setParamsState] = useState<Record<string, number>>(initialParams);
  const [moveLog, setMoveLog] = useState<MoveLogEntry[]>([]);
  const prevConceptIdRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Sync state if concept changes
  useEffect(() => {
    if (concept?.id !== prevConceptIdRef.current) {
      prevConceptIdRef.current = concept?.id || null;
      setParamsState(initialParams);
      setMoveLog([]);
    }
  }, [concept?.id, initialParams]);

  // Compute outputs in exact defined order
  const computed = useMemo(() => {
    const result: Record<string, number> = {};
    if (!viz || !viz.compute) return result;

    const scope: Record<string, any> = { ...params };
    for (const [key, expr] of Object.entries(viz.compute)) {
      const val = safeEvaluate(expr, scope);
      const numVal = typeof val === 'number' ? val : (val ? 1 : 0);
      result[key] = numVal;
      scope[key] = numVal;
    }
    return result;
  }, [viz, params]);

  // Calculate active outcomes sorted by severity
  const activeOutcomes = useMemo(() => {
    if (!viz || !viz.outcomes) return [];

    const scope = { ...params, ...computed };
    const matched: VizOutcome[] = [];

    for (const outcome of viz.outcomes) {
      const matches = safeEvaluate(outcome.when, scope);
      if (matches === true || (typeof matches === 'number' && matches !== 0)) {
        matched.push(outcome);
      }
    }

    // Sort matching outcomes by severity: fail > warn > info
    return matched.sort(
      (a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity)
    );
  }, [viz, params, computed]);

  // Helper to compute outcomes for a given hypothetical param state
  const evaluateOutcomesForParams = useCallback(
    (targetParams: Record<string, number>): VizOutcome[] => {
      if (!viz || !viz.outcomes) return [];

      const tempComputed: Record<string, number> = {};
      const scope: Record<string, any> = { ...targetParams };
      if (viz.compute) {
        for (const [key, expr] of Object.entries(viz.compute)) {
          const val = safeEvaluate(expr, scope);
          const numVal = typeof val === 'number' ? val : (val ? 1 : 0);
          tempComputed[key] = numVal;
          scope[key] = numVal;
        }
      }

      const matchScope = { ...targetParams, ...tempComputed };
      const matched: VizOutcome[] = [];
      for (const outcome of viz.outcomes) {
        const matches = safeEvaluate(outcome.when, matchScope);
        if (matches === true || (typeof matches === 'number' && matches !== 0)) {
          matched.push(outcome);
        }
      }

      return matched.sort(
        (a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity)
      );
    },
    [viz]
  );

  // Set single parameter and log movement (throttled to 1 per rAF)
  const setParam = useCallback(
    (name: string, value: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setParamsState((prev) => {
          const oldValue = prev[name] ?? 0;
          if (oldValue === value) return prev;

          const nextParams = { ...prev, [name]: value };

          // Determine outcome diff
          const oldOutcomes = evaluateOutcomesForParams(prev);
          const newOutcomes = evaluateOutcomesForParams(nextParams);

          const oldTitles = new Set(oldOutcomes.map((o) => o.title));
          const newTitles = new Set(newOutcomes.map((o) => o.title));

          const triggered = newOutcomes.filter((o) => !oldTitles.has(o.title));
          const cleared = oldOutcomes.filter((o) => !newTitles.has(o.title));

          const now = new Date();
          const timeStr = now.toLocaleTimeString([], {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          const logItem: MoveLogEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: timeStr,
            paramName: name,
            oldValue,
            newValue: value,
            triggeredOutcomes: triggered,
            clearedOutcomes: cleared,
          };

          setMoveLog((curr) => [logItem, ...curr].slice(0, 50));
          return nextParams;
        });
      });
    },
    [evaluateOutcomesForParams]
  );

  // Set multiple parameters (e.g. combo chip click)
  const setParams = useCallback(
    (newParams: Record<string, number>) => {
      setParamsState((prev) => {
        const nextParams = { ...prev, ...newParams };

        const oldOutcomes = evaluateOutcomesForParams(prev);
        const newOutcomes = evaluateOutcomesForParams(nextParams);

        const oldTitles = new Set(oldOutcomes.map((o) => o.title));
        const newTitles = new Set(newOutcomes.map((o) => o.title));

        const triggered = newOutcomes.filter((o) => !oldTitles.has(o.title));
        const cleared = oldOutcomes.filter((o) => !newTitles.has(o.title));

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const paramNames = Object.keys(newParams).join(', ');
        const logItem: MoveLogEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: timeStr,
          paramName: `COMBO [${paramNames}]`,
          oldValue: 0,
          newValue: 1,
          triggeredOutcomes: triggered,
          clearedOutcomes: cleared,
        };

        setMoveLog((curr) => [logItem, ...curr].slice(0, 50));
        return nextParams;
      });
    },
    [evaluateOutcomesForParams]
  );

  const resetParams = useCallback(() => {
    setParamsState(initialParams);
    setMoveLog([]);
  }, [initialParams]);

  const clearMoveLog = useCallback(() => {
    setMoveLog([]);
  }, []);

  return {
    params,
    computed,
    activeOutcomes,
    moveLog,
    setParam,
    setParams,
    resetParams,
    clearMoveLog,
  };
}

