import { z } from 'zod';

export const FormulaSchema = z.object({
  id: z.string(),
  latex: z.string(),
  vars: z.union([z.record(z.any()), z.string(), z.array(z.any())]).optional(),
  example: z.union([z.string(), z.null(), z.number()]).optional(),
});

export const VizParamSchema = z.object({
  name: z.string(),
  label: z.string(),
  min: z.number(),
  max: z.number(),
  step: z.number().optional().default(1),
  default: z.number().optional().default(0),
  unit: z.string().optional().default(''),
});

export const VizOutcomeSchema = z.object({
  when: z.string(),
  title: z.string(),
  explain: z.string(),
  severity: z.string(),
});

export const VizComboSchema = z.object({
  set: z.record(z.any()),
  lesson: z.string().optional(),
});

export const VizSchema = z.object({
  type: z.string(),
  description: z.string().optional().default(''),
  params: z.array(VizParamSchema).optional().default([]),
  compute: z.record(z.union([z.string(), z.number()])).optional().default({}),
  outcomes: z.array(VizOutcomeSchema).optional().default([]),
  combos_to_try: z.array(VizComboSchema).optional().default([]),
});

export const QuizSchema = z.object({
  q: z.string(),
  options: z.array(z.union([z.string(), z.number()])),
  answer: z.union([z.number(), z.string()]),
  why: z.string().optional().default(''),
});

export const ConceptSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  session: z.union([z.number(), z.string()]).optional().nullable(),
  skilling_exp: z.union([z.number(), z.string(), z.null()]).optional(),
  btl: z.union([z.number(), z.string()]).optional().nullable(),
  difficulty: z.union([z.number(), z.string()]).optional().nullable(),
  prereqs: z.array(z.string()).optional().default([]),
  eli5: z.string().optional().default(''),
  key_points: z.array(z.string()).optional().default([]),
  deep_dive: z.string().optional().default(''),
  formulas: z.array(FormulaSchema).optional().default([]),
  viz: VizSchema.optional().nullable(),
  common_mistakes: z.array(z.string()).optional().default([]),
  quiz: z.array(QuizSchema).optional().default([]),
  exam_tags: z.array(z.string()).optional().default([]),
  mini_task: z.union([z.string(), z.record(z.any()), z.null()]).optional(),
});

export const PartSchema = z.object({
  id: z.string(),
  co: z.string(),
  title: z.string(),
  order: z.number().optional().default(1),
  concept_ids: z.array(z.string()).optional().default([]),
});

export const ContentFileSchema = z.object({
  part: PartSchema,
  concepts: z.array(ConceptSchema),
});

