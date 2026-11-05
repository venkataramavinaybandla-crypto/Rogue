import { contentStore } from './loader';
import { safeEvaluate } from '../engine/evaluator';
import type { Concept } from '../types';

export interface QAReport {
  countsPerCo: Record<string, { parts: number; concepts: number }>;
  duplicateIds: string[];
  brokenPrereqs: { conceptId: string; prereq: string }[];
  unmatchedParams: { conceptId: string; paramName: string }[];
  combosWithZeroOutcomes: { conceptId: string; comboIdx: number; set: Record<string, number> }[];
  uncoveredParamRanges: { conceptId: string; paramName: string; uncoveredCount: number }[];
}

export function runContentQAReport(): QAReport {
  const allConcepts = Array.from(contentStore.conceptsById.values());
  const allIds = new Set<string>();
  const duplicateIds: string[] = [];

  // 1. Duplicate IDs
  for (const item of allConcepts) {
    if (allIds.has(item.concept.id)) {
      duplicateIds.push(item.concept.id);
    }
    allIds.add(item.concept.id);
  }

  // 2. Counts per CO
  const countsPerCo: Record<string, { parts: number; concepts: number }> = {};
  for (const co of contentStore.availableCos) {
    const parts = contentStore.partsByCo.get(co) || [];
    const conceptsCount = parts.reduce((acc, p) => acc + (p.concept_ids?.length || 0), 0);
    countsPerCo[co] = { parts: parts.length, concepts: conceptsCount };
  }

  // 3. Broken Prereqs
  const brokenPrereqs: { conceptId: string; prereq: string }[] = [];
  for (const item of allConcepts) {
    for (const pr of item.concept.prereqs || []) {
      if (!allIds.has(pr)) {
        brokenPrereqs.push({ conceptId: item.concept.id, prereq: pr });
      }
    }
  }

  // 4. Params without matching compute vars
  const unmatchedParams: { conceptId: string; paramName: string }[] = [];
  for (const item of allConcepts) {
    const viz = item.concept.viz;
    if (!viz || !viz.params) continue;

    const allCode = [
      ...Object.values(viz.compute || {}).map(String),
      ...viz.outcomes.map((o) => o.when),
    ].join(' ');

    for (const p of viz.params) {
      const regex = new RegExp(`\\b${p.name}\\b`);
      if (!regex.test(allCode)) {
        unmatchedParams.push({ conceptId: item.concept.id, paramName: p.name });
      }
    }
  }

  // 5. Combos that trigger zero outcomes
  const combosWithZeroOutcomes: { conceptId: string; comboIdx: number; set: Record<string, number> }[] = [];
  for (const item of allConcepts) {
    const viz = item.concept.viz;
    if (!viz || !viz.combos_to_try || !viz.outcomes || viz.outcomes.length === 0) continue;

    viz.combos_to_try.forEach((combo, idx) => {
      const scope: Record<string, any> = { ...combo.set };
      if (viz.compute) {
        for (const [k, expr] of Object.entries(viz.compute)) {
          scope[k] = safeEvaluate(expr, scope);
        }
      }
      const triggered = viz.outcomes.some((o) => {
        const res = safeEvaluate(o.when, scope);
        return res === true || (typeof res === 'number' && res !== 0);
      });
      if (!triggered) {
        combosWithZeroOutcomes.push({ conceptId: item.concept.id, comboIdx: idx, set: combo.set });
      }
    });
  }

  // 6. Outcome Coverage across primary param range (200 sample points)
  const uncoveredParamRanges: { conceptId: string; paramName: string; uncoveredCount: number }[] = [];
  for (const item of allConcepts) {
    const viz = item.concept.viz;
    if (!viz || !viz.params || viz.params.length === 0 || !viz.outcomes || viz.outcomes.length === 0) continue;

    const p0 = viz.params[0];
    const range = Math.max(0.0001, p0.max - p0.min);
    let uncovered = 0;
    const sampleSize = 200;

    for (let i = 0; i < sampleSize; i++) {
      const testVal = p0.min + (range * i) / (sampleSize - 1);
      const scope: Record<string, any> = { [p0.name]: testVal };
      for (let j = 1; j < viz.params.length; j++) {
        scope[viz.params[j].name] = viz.params[j].default;
      }
      if (viz.compute) {
        for (const [k, expr] of Object.entries(viz.compute)) {
          scope[k] = safeEvaluate(expr, scope);
        }
      }
      const anyHit = viz.outcomes.some((o) => {
        const res = safeEvaluate(o.when, scope);
        return res === true || (typeof res === 'number' && res !== 0);
      });
      if (!anyHit) uncovered++;
    }

    if (uncovered > 0) {
      uncoveredParamRanges.push({
        conceptId: item.concept.id,
        paramName: p0.name,
        uncoveredCount: uncovered,
      });
    }
  }

  return {
    countsPerCo,
    duplicateIds,
    brokenPrereqs,
    unmatchedParams,
    combosWithZeroOutcomes,
    uncoveredParamRanges,
  };
}

