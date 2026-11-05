import React from 'react';
import type { VizConfig } from '../../types';
import { GenericViz } from './GenericViz';

export type VizComponent = React.FC<{
  viz: VizConfig;
  params: Record<string, number>;
  computed: Record<string, number>;
}>;

export const visualizerRegistry: Record<string, VizComponent> = {
  topology_graph: GenericViz,
  custom: GenericViz,
  bit_grid: GenericViz,
  packet_flow: GenericViz,
  bar_compare: GenericViz,
  timeline: GenericViz,
  queue_curve: GenericViz,
  state_machine: GenericViz,
  cwnd_graph: GenericViz,
  subnet_tree: GenericViz,
  wireless_map: GenericViz,
  token_bucket: GenericViz,
};

export function getVisualizerComponent(type: string): VizComponent {
  return visualizerRegistry[type] || GenericViz;
}

