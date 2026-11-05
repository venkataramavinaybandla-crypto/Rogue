const fs = require('fs');
const path = require('path');

const sampleDir = path.join(__dirname, '..', 'content', '_samples');
if (!fs.existsSync(sampleDir)) {
  fs.mkdirSync(sampleDir, { recursive: true });
}

const types = [
  {
    type: 'queue_curve',
    title: 'Queue Curve M/M/1 Test',
    params: [{ name: 'utilization', label: 'Utilization', min: 10, max: 98, step: 1, default: 50, unit: '%' }],
    compute: { delay: '1 / (100 - utilization) * 1000' },
    outcomes: [
      { when: 'utilization >= 80', title: 'Severe Queueing Delay', explain: 'Utilization past knee point.', severity: 'fail' },
      { when: 'utilization >= 60 && utilization < 80', title: 'Approaching Knee', explain: 'Buffer occupancy is rising.', severity: 'warn' },
      { when: 'utilization < 60', title: 'Linear Operation', explain: 'Queue is operating smoothly.', severity: 'info' }
    ],
    combos: [
      { set: { utilization: 95 }, lesson: 'Inspect severe delay explosion past knee.' },
      { set: { utilization: 40 }, lesson: 'Observe low linear delay.' }
    ]
  },
  {
    type: 'packet_flow',
    title: 'Multi-Hop Packet Flow Test',
    params: [
      { name: 'layers', label: 'Protocol Layers', min: 1, max: 5, step: 1, default: 3, unit: 'layers' },
      { name: 'hops', label: 'Network Hops', min: 2, max: 4, step: 1, default: 3, unit: 'hops' }
    ],
    compute: { total_headers: 'layers * 20' },
    outcomes: [
      { when: 'layers >= 4', title: 'Heavy Header Overhead', explain: 'Headers exceed payload efficiency.', severity: 'warn' },
      { when: 'layers < 4', title: 'Optimal Framing', explain: 'Good payload-to-header ratio.', severity: 'info' }
    ],
    combos: [{ set: { layers: 5, hops: 4 }, lesson: 'Maximum encapsulation with 4 hops.' }]
  },
  {
    type: 'timeline',
    title: 'Sequence Diagram Timeline Test',
    params: [{ name: 'step', label: 'Exchange Step', min: 1, max: 5, step: 1, default: 2, unit: 'step' }],
    compute: { rtt_elapsed: 'step * 25' },
    outcomes: [
      { when: 'step >= 3', title: 'Connection Active', explain: 'Three-way handshake completed.', severity: 'info' },
      { when: 'step < 3', title: 'Handshake In Progress', explain: 'Awaiting ACK completion.', severity: 'warn' }
    ],
    combos: [{ set: { step: 5 }, lesson: 'Full HTTP request and response delivered.' }]
  },
  {
    type: 'cwnd_graph',
    title: 'TCP Congestion Window Test',
    params: [{ name: 'cwnd', label: 'Congestion Window', min: 2, max: 64, step: 2, default: 16, unit: 'MSS' }],
    compute: { flight_bytes: 'cwnd * 1460' },
    outcomes: [
      { when: 'cwnd >= 32', title: 'High In-flight Pipe Fill', explain: 'Operating at high link bandwidth.', severity: 'info' },
      { when: 'cwnd < 8', title: 'Window Collapsed', explain: 'Packet loss forced window backoff.', severity: 'fail' }
    ],
    combos: [{ set: { cwnd: 48 }, lesson: 'High throughput pipeline fill.' }]
  },
  {
    type: 'subnet_tree',
    title: 'Prefix Decomposition Tree Test',
    params: [{ name: 'cidr', label: 'Subnet Prefix Mask', min: 24, max: 26, step: 1, default: 25, unit: 'bits' }],
    compute: { total_subnets: 'pow(2, cidr - 24)' },
    outcomes: [
      { when: 'cidr == 26', title: '4 Small Subnets Allocated', explain: 'Split into four /26 blocks.', severity: 'info' },
      { when: 'cidr == 24', title: 'Single Flat /24 Network', explain: 'No VLSM division active.', severity: 'warn' }
    ],
    combos: [{ set: { cidr: 26 }, lesson: 'Decompose /24 into four /26 blocks.' }]
  },
  {
    type: 'topology_graph',
    title: '3D/2D Mesh Topology Test',
    params: [{ name: 'nodes', label: 'Active Mesh Nodes', min: 3, max: 5, step: 1, default: 5, unit: 'nodes' }],
    compute: { mesh_links: 'nodes * (nodes - 1) / 2' },
    outcomes: [
      { when: 'nodes == 5', title: 'Full Redundant Mesh', explain: 'All backbone links operational.', severity: 'info' },
      { when: 'nodes < 4', title: 'Redundancy Degraded', explain: 'Critical path single-point of failure.', severity: 'warn' }
    ],
    combos: [{ set: { nodes: 3 }, lesson: 'Degraded topology minimum graph.' }]
  },
  {
    type: 'state_machine',
    title: 'Protocol Finite State Machine Test',
    params: [{ name: 'state', label: 'State Index', min: 0, max: 4, step: 1, default: 3, unit: 'idx' }],
    compute: { is_connected: 'state == 3 ? 1 : 0' },
    outcomes: [
      { when: 'state == 3', title: 'ESTABLISHED Connection', explain: 'Bidirectional streaming active.', severity: 'info' },
      { when: 'state == 0', title: 'CLOSED State', explain: 'Socket has terminated.', severity: 'warn' }
    ],
    combos: [{ set: { state: 3 }, lesson: 'Jump directly to ESTABLISHED.' }]
  },
  {
    type: 'bit_grid',
    title: 'Bit Matrix Frame & CRC Test',
    params: [{ name: 'errors', label: 'Bit Inversion Errors', min: 0, max: 8, step: 1, default: 2, unit: 'bits' }],
    compute: { crc_fail: 'errors > 0 ? 1 : 0' },
    outcomes: [
      { when: 'errors > 0', title: 'CRC Checksum Mismatch', explain: 'Corrupted bits detected in frame.', severity: 'fail' },
      { when: 'errors == 0', title: 'Frame Integrity Verified', explain: 'Checksum matches transmitted payload.', severity: 'info' }
    ],
    combos: [{ set: { errors: 0 }, lesson: 'Clean frame with zero bit errors.' }]
  },
  {
    type: 'bar_compare',
    title: 'I/O Architecture Comparison Test',
    params: [{ name: 'mode', label: 'Selected I/O Engine', min: 0, max: 3, step: 1, default: 2, unit: 'mode' }],
    compute: { performance_score: '(mode + 1) * 25' },
    outcomes: [
      { when: 'mode >= 2', title: 'High-Concurrency Event Loop', explain: 'Scales efficiently under load.', severity: 'info' },
      { when: 'mode < 2', title: 'Thread/Process Bottleneck', explain: 'High context switch overhead.', severity: 'warn' }
    ],
    combos: [{ set: { mode: 3 }, lesson: 'Select asynchronous completion I/O.' }]
  },
  {
    type: 'token_bucket',
    title: 'Token Bucket Rate Shaper Test',
    params: [
      { name: 'capacity', label: 'Burst Capacity', min: 5, max: 20, step: 1, default: 10, unit: 'tokens' },
      { name: 'rate', label: 'Fill Rate', min: 1, max: 5, step: 1, default: 2, unit: 'tps' }
    ],
    compute: { max_burst_kb: 'capacity * 1.5' },
    outcomes: [
      { when: 'capacity >= 15', title: 'Large Allowed Burst', explain: 'Can cause downstream buffer bloat.', severity: 'warn' },
      { when: 'capacity < 15', title: 'Smooth Traffic Shape', explain: 'Maintains bounded queue occupancy.', severity: 'info' }
    ],
    combos: [{ set: { capacity: 20, rate: 5 }, lesson: 'High burst allowance setting.' }]
  },
  {
    type: 'wireless_map',
    title: 'Wireless RF Propagation Test',
    params: [{ name: 'distance', label: 'Client Distance', min: 10, max: 120, step: 5, default: 50, unit: 'm' }],
    compute: { path_loss_db: '20 * log(distance + 1)' },
    outcomes: [
      { when: 'distance >= 90', title: 'Edge of Cell Coverage', explain: 'SNR drops below QAM threshold.', severity: 'fail' },
      { when: 'distance >= 50 && distance < 90', title: 'MCS Rate Downshifted', explain: 'Adaptive modulation reduces rate.', severity: 'warn' },
      { when: 'distance < 50', title: 'Maximum MCS Throughput', explain: 'High SNR enables 64-QAM / 256-QAM.', severity: 'info' }
    ],
    combos: [{ set: { distance: 20 }, lesson: 'Client close to AP with max MCS.' }]
  },
  {
    type: 'custom',
    title: 'Universal Multi-Output Fallback Test',
    params: [{ name: 'factor', label: 'Input Signal Factor', min: 1, max: 100, step: 1, default: 25, unit: 'unit' }],
    compute: { output_linear: 'factor * 2', output_sqrt: 'sqrt(factor) * 10' },
    outcomes: [
      { when: 'factor >= 75', title: 'High Range Signal', explain: 'Signal amplitude at upper threshold.', severity: 'warn' },
      { when: 'factor < 75', title: 'Nominal Operating Range', explain: 'Within standard test envelope.', severity: 'info' }
    ],
    combos: [{ set: { factor: 85 }, lesson: 'High amplitude test combo.' }]
  }
];

types.forEach((t, i) => {
  const yamlContent =
`part:
  id: sample-part-${String(i + 1).padStart(2, '0')}
  co: CO-1
  title: Sample ${t.title}
  order: ${100 + i}
  concept_ids:
    - ${t.type}-sample-test
concepts:
  - id: ${t.type}-sample-test
    code: "TEST-${t.type.toUpperCase()}"
    title: "${t.title}"
    session: 1
    skilling_exp: 1
    btl: 3
    difficulty: 2
    prereqs: []
    eli5: "Interactive verification suite for ${t.type} visualizer in Rogue telemetry system."
    key_points:
      - "Driven strictly by params, values, outputs, outcomes contract."
      - "Features live bidirectional interaction and animation."
    deep_dive: "Detailed operational verification of ${t.type} component under Rogue dashboard engine."
    formulas: []
    viz:
      type: "${t.type}"
      description: "Sample test suite for ${t.type}"
      params: ${JSON.stringify(t.params)}
      compute: ${JSON.stringify(t.compute)}
      outcomes: ${JSON.stringify(t.outcomes)}
      combos_to_try: ${JSON.stringify(t.combos)}
    common_mistakes: []
    quiz: []
    exam_tags: ["diagnostic", "sample"]
`;

  fs.writeFileSync(path.join(sampleDir, `sample_${t.type}.yaml`), yamlContent, 'utf8');
});

console.log('Successfully created all 12 sample YAML files in content/_samples');

