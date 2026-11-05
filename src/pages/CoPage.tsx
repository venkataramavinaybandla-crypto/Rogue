import React, { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { contentStore, normalizeCoId, getConceptsForPart } from '../content/loader';
import { useProgressStore } from '../store/progress';
import { KatexRender } from '../components/common/KatexRender';
import { CornerBrackets } from '../components/common/CornerBrackets';
import {
  ArrowLeft,
  Sliders,
  AlertCircle,
  Filter,
  BookCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const CoPage: React.FC = () => {
  const { co } = useParams<{ co: string }>();
  const { viewedConcepts } = useProgressStore();

  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [selectedBtl, setSelectedBtl] = useState<number | null>(null);
  const [selectedExamTag, setSelectedExamTag] = useState<string | null>(null);
  const [revisionMode, setRevisionMode] = useState(false);

  if (!co) {
    return <Navigate to="/" replace />;
  }

  const normalizedCo = normalizeCoId(co);
  const parts = contentStore.partsByCo.get(normalizedCo) || [];

  if (parts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono">
        <div className="p-8 bg-surface border border-border rounded-sm max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground">NO DATA FOUND FOR {normalizedCo}</h2>
          <p className="text-xs text-muted mt-2">
            No YAML syllabus modules are currently loaded under this Course Outcome.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 border border-border bg-surface-raised rounded-xs text-xs text-foreground hover:border-lime hover:text-lime transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            RETURN TO COMMAND GRID
          </Link>
        </div>
      </div>
    );
  }

  const examTagOptions = ['mid-term', 'end-sem', 'skill-exam', 'project'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6 font-mono text-xs">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-muted border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            GRID
          </Link>
          <span className="text-muted/40">/</span>
          <span className="text-lime font-bold">{normalizedCo}</span>
        </div>
      </div>

      {/* Header Info */}
      <div className="relative bg-surface border border-border p-5 rounded-sm bg-dotted-grid">
        <CornerBrackets />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-muted uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan inline-block animate-pulse" />
              <span>COURSE OUTCOME MODULE REGISTRY</span>
            </div>
            <h1 className="text-2xl font-sans font-bold tracking-tight text-foreground">
              {normalizedCo} Curriculum Modules
            </h1>
          </div>

          {/* Revision Mode Switch */}
          <button
            onClick={() => setRevisionMode((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xs border transition-colors ${
              revisionMode
                ? 'bg-lime text-black border-lime font-bold'
                : 'bg-surface border-border hover:border-lime/60 text-muted hover:text-foreground'
            }`}
          >
            <BookCheck className="w-3.5 h-3.5" />
            <span>{revisionMode ? 'REVISION MODE ACTIVE' : 'SWITCH TO REVISION MODE'}</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1 text-muted">
            <Filter className="w-3 h-3 text-cyan" />
            <span>FILTERS:</span>
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1">
            <span className="text-muted/60">DIFF:</span>
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                className={`px-1.5 py-0.2 rounded-xs border ${
                  selectedDifficulty === d
                    ? 'border-lime bg-lime/10 text-lime font-bold'
                    : 'border-border/60 bg-background/50 text-muted hover:text-foreground'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* BTL filter */}
          <div className="flex items-center gap-1">
            <span className="text-muted/60">BTL:</span>
            {[1, 2, 3, 4, 5, 6].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBtl(selectedBtl === b ? null : b)}
                className={`px-1.5 py-0.2 rounded-xs border ${
                  selectedBtl === b
                    ? 'border-cyan bg-cyan/10 text-cyan font-bold'
                    : 'border-border/60 bg-background/50 text-muted hover:text-foreground'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Exam Tag filter */}
          <div className="flex items-center gap-1">
            <span className="text-muted/60">TAG:</span>
            {examTagOptions.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedExamTag(selectedExamTag === t ? null : t)}
                className={`px-1.5 py-0.2 rounded-xs border uppercase ${
                  selectedExamTag === t
                    ? 'border-lime bg-lime/10 text-lime font-bold'
                    : 'border-border/60 bg-background/50 text-muted hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {(selectedDifficulty || selectedBtl || selectedExamTag) && (
            <button
              onClick={() => {
                setSelectedDifficulty(null);
                setSelectedBtl(null);
                setSelectedExamTag(null);
              }}
              className="text-muted hover:text-foreground underline ml-2"
            >
              CLEAR FILTERS
            </button>
          )}
        </div>
      </div>

      {/* Parts List */}
      <div className="flex flex-col gap-6">
        {parts.map((part) => {
          let concepts = getConceptsForPart(part);

          // Apply filters
          if (selectedDifficulty) {
            concepts = concepts.filter((c) => Number(c.difficulty) === selectedDifficulty);
          }
          if (selectedBtl) {
            concepts = concepts.filter((c) => Number(c.btl) === selectedBtl);
          }
          if (selectedExamTag) {
            concepts = concepts.filter((c) =>
              c.exam_tags?.map((t) => t.toLowerCase()).includes(selectedExamTag)
            );
          }

          if (concepts.length === 0) return null;

          return (
            <div key={part.id} className="relative bg-surface border border-border rounded-sm p-5">
              <CornerBrackets />

              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 bg-background border border-border text-cyan text-[11px] font-bold rounded-xs">
                    PART {part.order.toString().padStart(2, '0')}
                  </span>
                  <h2 className="text-base font-sans font-semibold text-foreground tracking-tight">
                    {part.title}
                  </h2>
                </div>
                <div className="text-[10px] text-muted tracking-wider uppercase">
                  {concepts.length} CONCEPTS
                </div>
              </div>

              {revisionMode ? (
                /* Revision Mode Cards: key_points + formulas + quiz summary */
                <div className="flex flex-col gap-4">
                  {concepts.map((concept) => (
                    <div
                      key={concept.id}
                      className="p-4 bg-background/60 border border-border/60 rounded-xs flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lime font-bold">{concept.code}</span>
                          <span className="font-sans font-semibold text-foreground">
                            {concept.title}
                          </span>
                        </div>
                        <Link
                          to={`/concept/${concept.id}`}
                          className="text-cyan hover:underline text-[10px]"
                        >
                          LAUNCH VIZ &rarr;
                        </Link>
                      </div>

                      {/* Key Points */}
                      {concept.key_points && concept.key_points.length > 0 && (
                        <div>
                          <div className="text-[9px] text-muted uppercase font-bold mb-1">
                            CORE PRINCIPLES
                          </div>
                          <ul className="list-disc list-inside font-sans text-foreground/90 space-y-1">
                            {concept.key_points.map((kp, i) => (
                              <li key={i}>{kp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Formulas */}
                      {concept.formulas && concept.formulas.length > 0 && (
                        <div className="p-2 bg-surface/80 rounded-xs flex flex-wrap gap-4 items-center">
                          {concept.formulas.map((f) => (
                            <div key={f.id} className="text-xs">
                              <KatexRender latex={f.latex} displayMode={false} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Standard Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {concepts.map((concept) => {
                    const isViewed = viewedConcepts.includes(concept.id);

                    return (
                      <Link
                        key={concept.id}
                        to={`/concept/${concept.id}`}
                        className="group relative p-3.5 bg-background/50 border border-border/60 hover:border-lime/50 rounded-xs hover:bg-surface-raised transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-2 text-muted">
                            <div className="flex items-center gap-1.5">
                              <span className="text-lime font-semibold px-1 py-0.2 bg-lime/10 border border-lime/20 rounded-xs">
                                {concept.code}
                              </span>
                              {isViewed && (
                                <span className="flex items-center gap-0.5 text-lime text-[9px]">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  VIEWED
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {concept.btl && <span className="text-muted/80">BTL-{concept.btl}</span>}
                              {concept.difficulty && (
                                <span className="text-muted/60">DIFF {concept.difficulty}/5</span>
                              )}
                            </div>
                          </div>

                          <h3 className="text-sm font-sans font-medium text-foreground group-hover:text-lime transition-colors mb-2">
                            {concept.title}
                          </h3>

                          {concept.eli5 && (
                            <p className="text-[11px] font-sans text-muted/80 line-clamp-2 leading-relaxed mb-3">
                              {concept.eli5}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[10px] text-muted">
                          <span className="flex items-center gap-1 text-cyan/90 uppercase">
                            <Sliders className="w-2.5 h-2.5" />
                            {concept.viz?.type || 'generic'}
                          </span>
                          <span className="text-lime opacity-80 group-hover:opacity-100 transition-opacity">
                            SIMULATE &rarr;
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
