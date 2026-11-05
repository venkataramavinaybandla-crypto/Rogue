import React from 'react';
import { CustomViz } from '../../viz/custom';
import type { VizProps } from '../../viz/kit/types';

interface VizErrorBoundaryProps extends VizProps {
  children: React.ReactNode;
}

interface VizErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class VizErrorBoundary extends React.Component<
  VizErrorBoundaryProps,
  VizErrorBoundaryState
> {
  state: VizErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Visualizer error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const { children, ...vizProps } = this.props;
      return (
        <div className="flex flex-col gap-2">
          <div className="p-2 bg-red-950/20 border border-red-500/40 rounded-xs text-[10px] font-mono text-red-300 flex items-center justify-between">
            <span>VISUALIZER RECOVERY MODE ACTIVE: RENDERED UNIVERSAL TELEMETRY</span>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-[9px] underline uppercase hover:text-white"
            >
              RETRY
            </button>
          </div>
          <CustomViz {...vizProps} />
        </div>
      );
    }

    return this.props.children;
  }
}

