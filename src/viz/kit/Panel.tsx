import React from 'react';
import { CornerBrackets } from '../../components/common/CornerBrackets';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { getSeverityColor, getTopSeverity, type VizProps } from './types';

interface PanelProps {
  title: string;
  figId?: string;
  outcomes?: VizProps['outcomes'];
  controls?: {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onStep?: () => void;
    onReset?: () => void;
  };
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  figId = 'FIG 0.1 / UNIFIED VIEW',
  outcomes = [],
  controls,
  children,
}) => {
  const topSev = getTopSeverity(outcomes);
  const sevColor = getSeverityColor(topSev);

  return (
    <div className="relative w-full bg-surface border border-border p-3 rounded-sm font-mono overflow-hidden">
      <CornerBrackets />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 text-[10px] tracking-wider text-muted select-none">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full inline-block transition-colors"
            style={{
              backgroundColor: topSev ? sevColor : '#5ce1e6',
              boxShadow: topSev ? `0 0 6px ${sevColor}` : undefined,
            }}
          />
          <span className="uppercase text-foreground font-semibold">
            {figId}
          </span>
          <span className="text-[9px] text-muted hidden sm:inline">&bull; {title}</span>
        </div>

        {controls && (
          <div className="flex items-center gap-1.5 bg-background/80 px-1.5 py-0.5 rounded-xs border border-border/50">
            <button
              onClick={controls.onTogglePlay}
              className="p-1 hover:text-lime transition-colors"
              title={controls.isPlaying ? 'Pause' : 'Play'}
            >
              {controls.isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
            </button>
            {controls.onStep && (
              <button
                onClick={controls.onStep}
                className="p-1 hover:text-cyan transition-colors"
                title="Step frame"
              >
                <SkipForward className="w-2.5 h-2.5" />
              </button>
            )}
            {controls.onReset && (
              <button
                onClick={controls.onReset}
                className="p-1 hover:text-foreground transition-colors"
                title="Reset simulation"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

