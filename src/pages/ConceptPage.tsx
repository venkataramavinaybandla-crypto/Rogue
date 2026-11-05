import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { getConceptById, getAllConcepts } from '../content/loader';
import { useProgressStore } from '../store/progress';
import { useViz } from '../engine/useViz';
import { VizStage } from '../components/visualizer/VizStage';
import { QuizComponent } from '../components/concept/QuizComponent';
import { KatexRender } from '../components/common/KatexRender';
import { CornerBrackets } from '../components/common/CornerBrackets';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  FileCode,
  Layers,
  Sparkles,
  BookOpen,
  Lock,
  Unlock,
  CheckCircle2,
} from 'lucide-react';

export const ConceptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { markConceptViewed, isConceptViewed } = useProgressStore();

  const conceptEntry = id ? getConceptById(id) : null;
  const allConcepts = useMemo(() => getAllConcepts(), []);

  const curIndex = allConcepts.findIndex((c) => c.id === id);
  const prevConcept = curIndex > 0 ? allConcepts[curIndex - 1] : null;
  const nextConcept = curIndex >= 0 && curIndex < allConcepts.length - 1 ? allConcepts[curIndex + 1] : null;

  const concept = conceptEntry?.concept;
  const part = conceptEntry?.part;

  const vizHook = useViz(concept);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);

  // Mark viewed on visit
  useEffect(() => {
    if (concept?.id) {
      markConceptViewed(concept.id);
    }
  }, [concept?.id, markConceptViewed]);

  // Keyboard shortcuts: J, K, [, ], R
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'j' && nextConcept) {
        navigate(`/concept/${nextConcept.id}`);
      } else if (key === 'k' && prevConcept) {
        navigate(`/concept/${prevConcept.id}`);
      } else if (key === 'r') {
        vizHook.resetParams();
      } else if (key === '[' && concept?.viz?.params[0]) {
        const p = concept.viz.params[0];
        const cur = vizHook.params[p.name] ?? p.default;
        const step = p.step || 1;
        vizHook.setParam(p.name, Math.max(p.min, cur - step));
      } else if (key === ']' && concept?.viz?.params[0]) {
        const p = concept.viz.params[0];
        const cur = vizHook.params[p.name] ?? p.default;
        const step = p.step || 1;
        vizHook.setParam(p.name, Math.min(p.max, cur + step));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextConcept, prevConcept, vizHook, concept, navigate]);

  if (!id) return <Navigate to="/" replace />;

  if (!conceptEntry || !concept || !part) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono">
        <div className="p-8 bg-surface border border-border rounded-sm max-w-md mx-auto">
          <div className="text-red-400 font-bold mb-2">ERROR 404 // CONCEPT NOT LOCATED</div>
          <p className="text-xs text-muted mb-4">
            Concept identifier <span className="text-lime">{id}</span> does not exist in the loaded syllabus.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-surface-raised rounded-xs text-xs text-foreground hover:border-lime hover:text-lime"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            RETURN TO GRID
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-mono text-xs">
      {/* Navigation Breadcrumb Bar & Prev/Next */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-border/50">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            GRID
          </Link>
          <span className="text-muted/40">/</span>
          <Link to={`/co/${part.co.toLowerCase()}`} className="text-muted hover:text-foreground transition-colors">
            {part.co}
          </Link>
          <span className="text-muted/40">/</span>
          <span className="text-muted/80 truncate max-w-[200px]" title={part.title}>
            {part.title}
          </span>
          <span className="text-muted/40">/</span>
          <span className="text-lime font-bold">{concept.code}</span>
        </div>

        {/* Prev & Next Fast Jumps */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {prevConcept ? (
            <Link
              to={`/concept/${prevConcept.id}`}
              className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border hover:border-lime/60 rounded-xs text-muted hover:text-foreground transition-colors"
              title={`Previous: ${prevConcept.title} [K]`}
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden sm:inline truncate max-w-[100px]">{prevConcept.code}</span>
              <kbd className="text-[9px] text-muted/60 ml-0.5">K</kbd>
            </Link>
          ) : (
            <span className="px-2 py-1 text-muted/30 border border-transparent select-none text-[10px]">
              FIRST
            </span>
          )}

          {nextConcept ? (
            <Link
              to={`/concept/${nextConcept.id}`}
              className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border hover:border-lime/60 rounded-xs text-muted hover:text-foreground transition-colors"
              title={`Next: ${nextConcept.title} [J]`}
            >
              <span className="hidden sm:inline truncate max-w-[100px]">{nextConcept.code}</span>
              <kbd className="text-[9px] text-muted/60 mr-0.5">J</kbd>
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <span className="px-2 py-1 text-muted/30 border border-transparent select-none text-[10px]">
              LAST
            </span>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout (Mobile responsive: VizStage order-first on mobile, lg:order-none) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* RIGHT COLUMN: Mobile order-first so simulation is immediately visible, desktop sticky right */}
        <div className="order-first lg:order-2 lg:col-span-5 lg:sticky lg:top-16">
          <VizStage
            concept={concept}
            params={vizHook.params}
            computed={vizHook.computed}
            activeOutcomes={vizHook.activeOutcomes}
            moveLog={vizHook.moveLog}
            setParam={vizHook.setParam}
            setParams={vizHook.setParams}
            resetParams={vizHook.resetParams}
            clearMoveLog={vizHook.clearMoveLog}
          />

          {/* Keyboard shortcut guide */}
          <div className="mt-3 p-2 bg-surface/50 border border-border/40 rounded-xs text-[9px] text-muted/70 flex items-center justify-between select-none">
            <span>SHORTCUTS: [J/K] NEXT/PREV &bull; [ [ / ] ] STEP &bull; [R] RESET</span>
          </div>
        </div>

        {/* LEFT COLUMN: Educational & Theoretical Content */}
        <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col gap-6">
          {/* Header Block */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-lime/10 border border-lime/30 text-lime font-bold text-xs rounded-xs">
                {concept.code}
              </span>
              {concept.exam_tags && concept.exam_tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {concept.exam_tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] uppercase px-1.5 py-0.5 bg-surface border border-border rounded-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-foreground mt-1">
              {concept.title}
            </h1>

            {/* Prerequisite Chips (Clickable with locked/unlocked visual state) */}
            {concept.prereqs && concept.prereqs.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted mt-1">
                <span className="text-muted/60 uppercase">Prerequisites:</span>
                {concept.prereqs.map((pr) => {
                  const prViewed = isConceptViewed(pr);
                  const prEntry = getConceptById(pr);
                  const targetUrl = prEntry ? `/concept/${pr}` : '#';

                  return (
                    <Link
                      key={pr}
                      to={targetUrl}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border transition-colors ${
                        prViewed
                          ? 'bg-lime/10 border-lime/40 text-lime'
                          : 'bg-background/80 border-border/60 text-muted hover:border-amber-400 hover:text-amber-400'
                      }`}
                      title={prViewed ? 'Prerequisite completed' : 'Prerequisite unviewed (non-blocking)'}
                    >
                      {prViewed ? (
                        <CheckCircle2 className="w-2.5 h-2.5 text-lime" />
                      ) : (
                        <Lock className="w-2.5 h-2.5 text-amber-400/80" />
                      )}
                      <span>{prEntry ? prEntry.concept.code : pr}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ELI5 Pale Card */}
          {concept.eli5 && (
            <div className="relative bg-pale text-pale-foreground p-4 rounded-sm border border-black/10 select-none">
              <CornerBrackets className="border-black/30" />
              <div className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-bold text-black/70 mb-1.5">
                <Sparkles className="w-3 h-3 text-black" />
                <span>INTUITIVE MENTAL MODEL // ELI5</span>
              </div>
              <p className="text-xs sm:text-sm font-sans leading-relaxed text-black/95">
                {concept.eli5}
              </p>
            </div>
          )}

          {/* Key Points */}
          {concept.key_points && concept.key_points.length > 0 && (
            <div className="relative bg-surface border border-border p-4 rounded-sm">
              <CornerBrackets />
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold pb-2 mb-3 border-b border-border/50 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-lime" />
                <span className="text-foreground">KEY PRINCIPLES & SPECIFICATIONS</span>
              </div>
              <ul className="flex flex-col gap-2 font-sans text-xs text-foreground/90">
                {concept.key_points.map((kp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-lime font-mono text-[10px] mt-0.5 select-none">&bull;</span>
                    <span className="leading-relaxed">{kp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mathematical Formulas */}
          {concept.formulas && concept.formulas.length > 0 && (
            <div className="relative bg-surface border border-border p-4 rounded-sm">
              <CornerBrackets />
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold pb-2 mb-3 border-b border-border/50 flex items-center gap-1.5">
                <FileCode className="w-3 h-3 text-cyan" />
                <span className="text-foreground">FORMAL MATHEMATICAL MODELS</span>
              </div>

              <div className="flex flex-col gap-4">
                {concept.formulas.map((formula) => {
                  const varsEntries =
                    formula.vars && typeof formula.vars === 'object' && !Array.isArray(formula.vars)
                      ? Object.entries(formula.vars)
                      : null;

                  return (
                    <div
                      key={formula.id}
                      className="p-3.5 bg-background/60 border border-border/40 rounded-xs flex flex-col gap-2.5"
                    >
                      <div className="py-2 px-3 bg-surface border border-border/60 rounded-xs flex items-center justify-center overflow-x-auto text-base">
                        <KatexRender latex={formula.latex} displayMode={true} />
                      </div>

                      {varsEntries && varsEntries.length > 0 && (
                        <div className="mt-1">
                          <div className="text-[9px] uppercase tracking-wider text-muted mb-1.5 font-bold">
                            SYMBOL DEFINITIONS
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                            {varsEntries.map(([vKey, vDesc]) => (
                              <div
                                key={vKey}
                                className="flex items-baseline gap-1.5 p-1 bg-surface/50 border border-border/30 rounded-xs"
                              >
                                <span className="text-lime font-mono font-semibold">
                                  {vKey.replace(/\{/g, '')}:
                                </span>
                                <span className="text-muted text-[10px] font-sans truncate">
                                  {String(vDesc)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {formula.example && (
                        <div className="p-2.5 bg-surface/80 border border-border/40 rounded-xs text-[11px]">
                          <span className="text-cyan font-bold uppercase text-[9px] block mb-0.5">
                            WORKED NUMERICAL EXAMPLE:
                          </span>
                          <span className="text-foreground/90 font-sans leading-relaxed">
                            {String(formula.example)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collapsible Deep Dive */}
          {concept.deep_dive && (
            <div className="relative bg-surface border border-border rounded-sm overflow-hidden">
              <CornerBrackets />
              <button
                onClick={() => setDeepDiveOpen((prev) => !prev)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-raised transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-lime" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-foreground">
                    TECHNICAL DEEP DIVE
                  </span>
                  <span className="text-[10px] text-muted">
                    ({concept.deep_dive.split(' ').length} WORDS)
                  </span>
                </div>
                {deepDiveOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted" />
                )}
              </button>

              {deepDiveOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-border/50 text-xs font-sans text-foreground/90 leading-relaxed">
                  <p className="whitespace-pre-line">{concept.deep_dive}</p>
                </div>
              )}
            </div>
          )}

          {/* Common Mistakes */}
          {concept.common_mistakes && concept.common_mistakes.length > 0 && (
            <div className="relative bg-surface border border-border p-4 rounded-sm">
              <CornerBrackets />
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold pb-2 mb-3 border-b border-border/50 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span className="text-foreground">FAILURE MODES & COMMON MISCONCEPTIONS</span>
              </div>
              <div className="flex flex-col gap-2">
                {concept.common_mistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-amber-950/10 border border-amber-500/20 rounded-xs text-xs font-sans text-amber-200/90 leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-amber-400 font-mono text-[11px]">&times;</span>
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini Task */}
          {concept.mini_task && (
            <div className="relative bg-surface border border-border p-4 rounded-sm">
              <CornerBrackets />
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold pb-2 mb-2 border-b border-border/50 flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3 text-lime" />
                <span className="text-foreground">VERIFICATION TASK / EXPERIMENT PROTOCOL</span>
              </div>
              <div className="p-3 bg-background/50 border border-border/30 rounded-xs text-xs font-sans text-foreground/90 leading-relaxed">
                {typeof concept.mini_task === 'string'
                  ? concept.mini_task
                  : JSON.stringify(concept.mini_task, null, 2)}
              </div>
            </div>
          )}

          {/* Persistent Interactive Quiz */}
          {concept.quiz && concept.quiz.length > 0 && (
            <QuizComponent conceptId={concept.id} questions={concept.quiz} />
          )}
        </div>
      </div>
    </div>
  );
};
