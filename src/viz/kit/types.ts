import type { VizParam, VizOutcome } from '../../types';

export interface VizProps {
  params: VizParam[];
  values: Record<string, number>;
  outputs: Record<string, number>;
  outcomes: VizOutcome[];
  onParamChange: (name: string, value: number) => void;
}

export type OutcomeSeverity = 'info' | 'warn' | 'fail';

export function getTopSeverity(outcomes: VizOutcome[]): OutcomeSeverity | null {
  if (!outcomes || outcomes.length === 0) return null;
  const sevs = outcomes.map((o) => (o.severity || 'info').toLowerCase());
  if (sevs.some((s) => s === 'fail' || s === 'error' || s === 'danger')) return 'fail';
  if (sevs.some((s) => s === 'warn' || s === 'warning')) return 'warn';
  return 'info';
}

export function getSeverityColor(sev: OutcomeSeverity | null): string {
  if (sev === 'fail') return '#ff4d4d';
  if (sev === 'warn') return '#ffb638';
  if (sev === 'info') return '#5ce1e6';
  return '#c6ff3d';
}

