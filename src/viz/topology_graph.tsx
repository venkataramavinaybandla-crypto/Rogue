import React, { Suspense, useState } from 'react';
import { Panel, getTopSeverity, type VizProps } from './kit';
import { Topology2D } from './topology/Topology2D';
import { Power } from 'lucide-react';

const Topology3DLazy = React.lazy(() => import('./topology/Topology3D'));

class TopologyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export const TopologyGraphViz: React.FC<VizProps> = ({
  params,
  values,
  outcomes,
  onParamChange,
}) => {
  const [use3D, setUse3D] = useState(true);
  const nodeParam = params.find((p) => /node|layer|count|host/i.test(p.name)) || params[0];
  const pName = nodeParam?.name || 'nodes';
  const nodeCount = Math.max(3, Math.min(5, Math.round(values[pName] ?? 5)));

  const topSev = getTopSeverity(outcomes);

  return (
    <Panel
      title="Topology Graph Simulation"
      figId="FIG 0.6 / TOPOLOGY ORTHOGONAL"
      outcomes={outcomes}
      controls={{
        isPlaying: false,
        onTogglePlay: () => {},
        onReset: () => onParamChange(pName, nodeParam?.default ?? 5),
      }}
    >
      <div className="relative w-full rounded-sm border border-border/40 bg-dotted-grid overflow-hidden flex flex-col">
        {use3D ? (
          <TopologyErrorBoundary
            fallback={
              <Topology2D
                nodeCount={nodeCount}
                topSev={topSev}
                onKillToggle={() => {}}
              />
            }
          >
            <Suspense
              fallback={
                <div className="w-full h-36 flex items-center justify-center text-xs text-muted font-mono">
                  INITIALIZING 3D ENGINE...
                </div>
              }
            >
              <Topology3DLazy />
            </Suspense>
          </TopologyErrorBoundary>
        ) : (
          <Topology2D
            nodeCount={nodeCount}
            topSev={topSev}
            onKillToggle={() => {}}
          />
        )}

        {/* Toolbar */}
        <div className="px-3 py-1.5 border-t border-border/40 flex items-center justify-between text-[10px]">
          <span className="text-muted">ACTIVE NODES: {nodeCount}</span>
          <button
            onClick={() => setUse3D((prev) => !prev)}
            className="flex items-center gap-1 px-1.5 py-0.5 border border-border/60 rounded-xs hover:border-lime/60 text-muted hover:text-foreground transition-colors"
          >
            <Power className="w-2.5 h-2.5 text-lime" />
            <span>SWITCH TO {use3D ? '2D SVG' : '3D R3F'}</span>
          </button>
        </div>
      </div>
    </Panel>
  );
};
