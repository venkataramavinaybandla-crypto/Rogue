import React from 'react';
import { Panel, Pulse, getTopSeverity, type VizProps } from './kit';

interface TreeNode {
  id: string;
  prefix: string;
  cidr: number;
  hosts: number;
  x: number;
  y: number;
  left?: string;
  right?: string;
}

export const SubnetTreeViz: React.FC<VizProps> = ({
  params,
  values,
  outcomes,
  onParamChange,
}) => {
  const prefixParam = params.find((p) => /prefix|mask|cidr|subnets/i.test(p.name)) || params[0];
  const pName = prefixParam?.name || 'cidr';
  const curCidr = Math.min(27, Math.max(24, Math.round(values[pName] ?? 25)));

  // Root /24
  const nodes: TreeNode[] = [
    { id: 'root', prefix: '192.168.1.0/24', cidr: 24, hosts: 254, x: 180, y: 22 },
    // Level 1: /25
    { id: 'sub0', prefix: '.0/25', cidr: 25, hosts: 126, x: 95, y: 64 },
    { id: 'sub1', prefix: '.128/25', cidr: 25, hosts: 126, x: 265, y: 64 },
    // Level 2: /26
    { id: 'sub00', prefix: '.0/26', cidr: 26, hosts: 62, x: 50, y: 108 },
    { id: 'sub01', prefix: '.64/26', cidr: 26, hosts: 62, x: 140, y: 108 },
    { id: 'sub10', prefix: '.128/26', cidr: 26, hosts: 62, x: 220, y: 108 },
    { id: 'sub11', prefix: '.192/26', cidr: 26, hosts: 62, x: 310, y: 108 },
  ];

  const handleToggleNode = (targetCidr: number) => {
    onParamChange(pName, targetCidr === curCidr ? Math.max(24, targetCidr - 1) : targetCidr);
  };

  const topSev = getTopSeverity(outcomes);

  return (
    <Panel
      title="VLSM Binary Prefix Decomposition"
      figId="FIG 0.5 / PREFIX HIERARCHY"
      outcomes={outcomes}
      controls={{
        isPlaying: false,
        onTogglePlay: () => {},
        onReset: () => onParamChange(pName, prefixParam?.default ?? 24),
      }}
    >
      <div className="relative w-full bg-background/80 rounded-sm border border-border/40 bg-dotted-grid p-2 flex flex-col justify-between">
        <svg viewBox="0 0 360 135" className="w-full h-32 select-none">
          {/* Edges from root to /25 */}
          {curCidr >= 25 && (
            <>
              <line x1={180} y1={30} x2={95} y2={60} stroke="#5ce1e6" strokeWidth={1} />
              <line x1={180} y1={30} x2={265} y2={60} stroke="#5ce1e6" strokeWidth={1} />
            </>
          )}

          {/* Edges from /25 to /26 */}
          {curCidr >= 26 && (
            <>
              <line x1={95} y1={72} x2={50} y2={104} stroke="#c6ff3d" strokeWidth={1} />
              <line x1={95} y1={72} x2={140} y2={104} stroke="#c6ff3d" strokeWidth={1} />
              <line x1={265} y1={72} x2={220} y2={104} stroke="#c6ff3d" strokeWidth={1} />
              <line x1={265} y1={72} x2={310} y2={104} stroke="#c6ff3d" strokeWidth={1} />
            </>
          )}

          {/* Node Boxes */}
          {nodes.map((node) => {
            const isVisible = node.cidr <= curCidr;
            const isCurrentTier = node.cidr === curCidr;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x - 36}, ${node.y - 12})`}
                opacity={isVisible ? 1 : 0.25}
                className="cursor-pointer transition-opacity"
                onClick={() => handleToggleNode(node.cidr)}
              >
                {isCurrentTier && isVisible && (
                  <rect
                    width={72}
                    height={24}
                    rx={2}
                    fill="none"
                    stroke="#c6ff3d"
                    strokeWidth={1.5}
                    className="animate-pulse"
                  />
                )}
                <rect
                  width={72}
                  height={24}
                  rx={2}
                  fill="#0f0f11"
                  stroke={isCurrentTier ? '#c6ff3d' : '#8a8a8f'}
                  strokeWidth={1}
                />
                <text
                  x={36}
                  y={10}
                  fill={isCurrentTier ? '#c6ff3d' : '#ededed'}
                  fontSize="7.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {node.prefix}
                </text>
                <text
                  x={36}
                  y={19}
                  fill="#8a8a8f"
                  fontSize="6.5"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {node.hosts} usable hosts
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tree telemetry footer */}
        <div className="flex items-center justify-between border-t border-border/40 pt-1.5 text-[9px]">
          <span className="text-muted">ALLOCATION TIER: /{curCidr}</span>
          <span className="text-lime">
            {curCidr === 24 ? '1 Subnet' : curCidr === 25 ? '2 Subnets' : '4 Subnets'} (Click node to split/merge)
          </span>
        </div>
      </div>
    </Panel>
  );
};

