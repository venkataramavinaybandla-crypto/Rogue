import yaml from 'js-yaml';
import { ContentFileSchema } from './schema';
import type { Concept, ContentFile, ParseError, Part } from '../types';

export function normalizeCoId(co: string): string {
  const digits = co.replace(/[^0-9]/g, '');
  return digits ? `CO-${digits}` : co.toUpperCase();
}

export function coNumber(co: string): number {
  const digits = co.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

interface LoadedStore {
  files: ContentFile[];
  errors: ParseError[];
  conceptsById: Map<string, { concept: Concept; part: Part; filePath: string }>;
  partsByCo: Map<string, Part[]>;
  availableCos: string[];
}

function loadContentFiles(): LoadedStore {
  const rawModules = import.meta.glob('/content/**/*.yaml', {
    query: '?raw',
    eager: true,
  }) as Record<string, { default: string } | string>;

  const files: ContentFile[] = [];
  const errors: ParseError[] = [];
  const conceptsById = new Map<string, { concept: Concept; part: Part; filePath: string }>();
  const partsByCo = new Map<string, Part[]>();

  for (const [filePath, mod] of Object.entries(rawModules)) {
    const rawYaml = typeof mod === 'string' ? mod : mod?.default;
    if (!rawYaml || typeof rawYaml !== 'string') {
      errors.push({
        filePath,
        error: 'Empty or unreadable module content',
      });
      continue;
    }

    try {
      const parsedData = yaml.load(rawYaml);
      const validationResult = ContentFileSchema.safeParse(parsedData);

      if (!validationResult.success) {
        errors.push({
          filePath,
          error: 'Zod schema validation failed',
          details: validationResult.error.issues,
        });
        continue;
      }

      const validDoc = validationResult.data as ContentFile;
      const normalizedDoc: ContentFile = {
        filePath,
        part: {
          ...validDoc.part,
          co: normalizeCoId(validDoc.part.co),
        },
        concepts: validDoc.concepts,
      };

      files.push(normalizedDoc);

      const coKey = normalizedDoc.part.co;
      const existingParts = partsByCo.get(coKey) || [];
      existingParts.push(normalizedDoc.part);
      existingParts.sort((a, b) => (a.order || 0) - (b.order || 0));
      partsByCo.set(coKey, existingParts);

      for (const concept of normalizedDoc.concepts) {
        conceptsById.set(concept.id, {
          concept,
          part: normalizedDoc.part,
          filePath,
        });
      }
    } catch (err: any) {
      errors.push({
        filePath,
        error: `YAML parse error: ${err.message || String(err)}`,
        details: err,
      });
    }
  }

  // Determine available COs (CO-1 through CO-6)
  const coSet = new Set<string>();
  for (const co of partsByCo.keys()) {
    coSet.add(co);
  }
  const availableCos = Array.from(coSet).sort((a, b) => coNumber(a) - coNumber(b));

  return {
    files,
    errors,
    conceptsById,
    partsByCo,
    availableCos,
  };
}

// Singleton load cache
export const contentStore = loadContentFiles();

export function getConceptById(id: string) {
  return contentStore.conceptsById.get(id);
}

export function getPartsForCo(coParam: string): Part[] {
  const normalized = normalizeCoId(coParam);
  return contentStore.partsByCo.get(normalized) || [];
}

export function getConceptsForPart(part: Part): Concept[] {
  const concepts: Concept[] = [];
  for (const cid of part.concept_ids) {
    const entry = contentStore.conceptsById.get(cid);
    if (entry) {
      concepts.push(entry.concept);
    }
  }
  return concepts;
}

export function getAllConcepts(): Concept[] {
  return Array.from(contentStore.conceptsById.values()).map(v => v.concept);
}

