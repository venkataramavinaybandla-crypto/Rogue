export interface Formula {
  id: string;
  latex: string;
  vars?: Record<string, string> | string | any[];
  example?: string | null | number;
}

export interface VizParam {
  name: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
  unit?: string;
}

export type OutcomeSeverity = 'info' | 'warn' | 'fail';

export interface VizOutcome {
  when: string;
  title: string;
  explain: string;
  severity: OutcomeSeverity | string;
}

export interface VizCombo {
  set: Record<string, number>;
  lesson?: string;
}

export interface VizConfig {
  type: string;
  description?: string;
  params: VizParam[];
  compute: Record<string, string | number>;
  outcomes: VizOutcome[];
  combos_to_try: VizCombo[];
}

export interface QuizQuestion {
  q: string;
  options: (string | number)[];
  answer: number | string;
  why?: string;
}

export interface Concept {
  id: string;
  code: string;
  title: string;
  session?: number | string | null;
  skilling_exp?: number | string | null;
  btl?: number | string | null;
  difficulty?: number | string | null;
  prereqs: string[];
  eli5: string;
  key_points: string[];
  deep_dive: string;
  formulas: Formula[];
  viz?: VizConfig | null;
  common_mistakes: string[];
  quiz: QuizQuestion[];
  exam_tags: string[];
  mini_task?: string | Record<string, any> | null;
}

export interface Part {
  id: string;
  co: string;
  title: string;
  order: number;
  concept_ids: string[];
}

export interface ContentFile {
  filePath: string;
  part: Part;
  concepts: Concept[];
}

export interface ParseError {
  filePath: string;
  error: string;
  details?: any;
}

export interface MoveLogEntry {
  id: string;
  timestamp: string;
  paramName: string;
  oldValue: number;
  newValue: number;
  triggeredOutcomes: VizOutcome[];
  clearedOutcomes: VizOutcome[];
}

