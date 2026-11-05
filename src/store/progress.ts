import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuizProgress {
  answered: number;
  correct: number;
  total: number;
  choices: Record<number, number>;
}

interface ProgressState {
  viewedConcepts: string[];
  quizScores: Record<string, QuizProgress>;
  combosTried: Record<string, number[]>;
  lastConceptId: string | null;

  markConceptViewed: (id: string) => void;
  recordQuizAnswer: (
    conceptId: string,
    qIdx: number,
    selectedOpt: number,
    isCorrect: boolean,
    totalQuestions: number
  ) => void;
  recordComboTried: (conceptId: string, comboIdx: number) => void;
  isConceptViewed: (id: string) => boolean;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      viewedConcepts: [],
      quizScores: {},
      combosTried: {},
      lastConceptId: null,

      markConceptViewed: (id: string) => {
        set((state) => {
          const viewed = state.viewedConcepts.includes(id)
            ? state.viewedConcepts
            : [...state.viewedConcepts, id];
          return {
            viewedConcepts: viewed,
            lastConceptId: id,
          };
        });
      },

      recordQuizAnswer: (conceptId, qIdx, selectedOpt, isCorrect, totalQuestions) => {
        set((state) => {
          const prev = state.quizScores[conceptId] || {
            answered: 0,
            correct: 0,
            total: totalQuestions,
            choices: {},
          };

          const wasAnswered = prev.choices[qIdx] !== undefined;
          const choices = { ...prev.choices, [qIdx]: selectedOpt };

          // recalculate
          const answered = Object.keys(choices).length;
          const correct = isCorrect
            ? wasAnswered
              ? prev.correct
              : prev.correct + 1
            : wasAnswered
            ? Math.max(0, prev.correct - 1)
            : prev.correct;

          return {
            quizScores: {
              ...state.quizScores,
              [conceptId]: {
                answered,
                correct,
                total: totalQuestions,
                choices,
              },
            },
          };
        });
      },

      recordComboTried: (conceptId, comboIdx) => {
        set((state) => {
          const prevCombos = state.combosTried[conceptId] || [];
          if (prevCombos.includes(comboIdx)) return state;
          return {
            combosTried: {
              ...state.combosTried,
              [conceptId]: [...prevCombos, comboIdx],
            },
          };
        });
      },

      isConceptViewed: (id: string) => {
        return get().viewedConcepts.includes(id);
      },
    }),
    {
      name: 'rogue-progress-store',
    }
  )
);

