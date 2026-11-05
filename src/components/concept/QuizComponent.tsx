import React from 'react';
import type { QuizQuestion } from '../../types';
import { useProgressStore } from '../../store/progress';
import { CornerBrackets } from '../common/CornerBrackets';
import { HelpCircle, CheckCircle2, XCircle, Award } from 'lucide-react';

interface QuizComponentProps {
  conceptId: string;
  questions: QuizQuestion[];
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ conceptId, questions }) => {
  const { quizScores, recordQuizAnswer } = useProgressStore();
  const savedProgress = quizScores[conceptId] || {
    answered: 0,
    correct: 0,
    total: questions.length,
    choices: {},
  };

  if (!questions || questions.length === 0) return null;

  const handleSelectOption = (qIdx: number, optIdx: number, correctIdx: number) => {
    const isCorrect = optIdx === correctIdx;
    recordQuizAnswer(conceptId, qIdx, optIdx, isCorrect, questions.length);
  };

  const isCompleted = savedProgress.answered === questions.length;
  const pct = questions.length > 0 ? Math.round((savedProgress.correct / questions.length) * 100) : 0;

  return (
    <div className="relative bg-surface border border-border p-4 rounded-sm font-mono">
      <CornerBrackets />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50 text-[10px] text-muted">
        <div className="flex items-center gap-1.5 uppercase font-semibold text-foreground">
          <HelpCircle className="w-3.5 h-3.5 text-cyan" />
          <span>KNOWLEDGE VERIFICATION CHECK</span>
        </div>

        <div className="flex items-center gap-2">
          {savedProgress.answered > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-lime">
              <Award className="w-3 h-3 text-lime" />
              <span>SCORE: {savedProgress.correct} / {questions.length} ({pct}%)</span>
            </span>
          )}
          <span className="text-[9px] px-1.5 py-0.2 bg-background border border-border rounded-xs text-muted">
            {savedProgress.answered} / {questions.length} ANSWERED
          </span>
        </div>
      </div>

      {/* Questions list */}
      <div className="flex flex-col gap-4">
        {questions.map((q, qIdx) => {
          const selectedOpt = savedProgress.choices[qIdx];
          const hasAnswered = selectedOpt !== undefined;
          const correctOpt = Number(q.answer);
          const isCorrect = hasAnswered && selectedOpt === correctOpt;

          return (
            <div
              key={qIdx}
              className="p-3.5 bg-background/50 border border-border/40 rounded-xs flex flex-col gap-2.5"
            >
              <div className="text-xs font-sans font-medium text-foreground">
                <span className="text-muted font-mono mr-1.5">Q{qIdx + 1}.</span>
                {q.q}
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                {q.options.map((opt, optIdx) => {
                  const isOptionSelected = selectedOpt === optIdx;
                  let btnStyle =
                    'border-border bg-surface text-foreground/90 hover:border-border-active';

                  if (hasAnswered) {
                    if (optIdx === correctOpt) {
                      btnStyle = 'border-lime bg-lime/10 text-lime font-semibold';
                    } else if (isOptionSelected) {
                      btnStyle = 'border-red-500 bg-red-950/30 text-red-300';
                    } else {
                      btnStyle = 'border-border/40 bg-surface/40 text-muted/60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(qIdx, optIdx, correctOpt)}
                      className={`w-full text-left p-2 rounded-xs border text-xs font-sans transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{String(opt)}</span>
                      {hasAnswered && optIdx === correctOpt && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-lime ml-2 flex-shrink-0" />
                      )}
                      {hasAnswered && isOptionSelected && optIdx !== correctOpt && (
                        <XCircle className="w-3.5 h-3.5 text-red-400 ml-2 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && q.why && (
                <div
                  className={`p-2 rounded-xs text-[11px] font-sans ${
                    isCorrect
                      ? 'bg-lime/5 text-lime border border-lime/20'
                      : 'bg-surface border border-border text-muted'
                  }`}
                >
                  <span className="font-bold mr-1">RATIONALE:</span>
                  {q.why}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

