import React from 'react';
import type { VizProps } from './kit/types';
import { QueueCurveViz } from './queue_curve';
import { PacketFlowViz } from './packet_flow';
import { TimelineViz } from './timeline';
import { CwndGraphViz } from './cwnd_graph';
import { SubnetTreeViz } from './subnet_tree';
import { TopologyGraphViz } from './topology_graph';
import { StateMachineViz } from './state_machine';
import { BitGridViz } from './bit_grid';
import { BarCompareViz } from './bar_compare';
import { TokenBucketViz } from './token_bucket';
import { WirelessMapViz } from './wireless_map';
import { CustomViz } from './custom';

export const vizRegistry: Record<string, React.FC<VizProps>> = {
  queue_curve: QueueCurveViz,
  packet_flow: PacketFlowViz,
  timeline: TimelineViz,
  cwnd_graph: CwndGraphViz,
  subnet_tree: SubnetTreeViz,
  topology_graph: TopologyGraphViz,
  state_machine: StateMachineViz,
  bit_grid: BitGridViz,
  bar_compare: BarCompareViz,
  token_bucket: TokenBucketViz,
  wireless_map: WirelessMapViz,
  custom: CustomViz,
};

export function getVizComponent(type: string): React.FC<VizProps> {
  return vizRegistry[type] || CustomViz;
}

