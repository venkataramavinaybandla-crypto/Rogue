import React from 'react';
import { Link } from 'react-router-dom';
import { contentStore, normalizeCoId, getConceptById } from '../content/loader';
import { useProgressStore } from '../store/progress';
import { CornerBrackets } from '../components/common/CornerBrackets';
import {
  Terminal,
  ArrowUpRight,
  Cpu,
  Layers,
  ShieldCheck,
  Database,
  Network,
  Activity,
  PlayCircle,
  Award,
} from 'lucide-react';

interface CoMeta {
  code: string;
  title: string;
  description: string;
  icon: any;
}

const CO_METADATA: CoMeta[] = [
  {
    code: 'CO-1',
    title: 'Foundations & Layering',
    description: 'Protocol architectures, OSI & TCP/IP models, framing, delay components, Little\'s Law, and queuing.',
    icon: Network,
  },
  {
    code: 'CO-2',
    title: 'Transport & Socket Layer',
    description: 'Socket programming, application framing, TCP state machines, congestion control, and TLS protocols.',
    icon: Cpu,
  },
  {
    code: 'CO-3',
    title: 'Network & Routing Plane',
    description: 'IPv4/IPv6 prefix routing, VLSM, DHCP, distance-vector, OSPF link-state, convergence, and BGP.',
    icon: Database,
  },
  {
    code: 'CO-4',
    title: 'Data Link & Physical Layer',
    description: 'Ethernet MAC, CRC error detection, VLAN, STP loop prevention, Shannon-Nyquist capacity, and RF link budgets.',
    icon: Layers,
  },
  {
    code: 'CO-5',
    title: 'Security & Network Automation',
    description: 'Stateful firewalls, ACL rule matrices, MTU optimization, token bucket policing, and Ansible IaC.',
    icon: ShieldCheck,
  },
  {
    code: 'CO-6',
    title: 'Realtime QoS & Media Budgets',
    description: 'Latency budgets, jitter playout buffers, queue disciplines (WFQ/RED), DiffServ, and multicast IGMP.',
    icon: Activity,
  },
];

export const HomePage: React.FC = () => {
  const activeCos = new Set(contentStore.availableCos);
  const { viewedConcepts, lastConceptId, quizScores } = useProgressStore();

  const totalParts = contentStore.files.length;
  const totalConcepts = contentStore.conceptsById.size;

  const lastConceptEntry = lastConceptId ? getConceptById(lastConceptId) : null;

  // Calculate CO progress percentages
  const getCoPercentage = (coCode: string): { pct: number; viewed: number; total: number } => {
    const normalized = normalizeCoId(coCode);
    const parts = contentStore.partsByCo.get(normalized) || [];
    let total = 0;
    let viewed = 0;
    for (const p of parts) {
      for (const cid of p.concept_ids || []) {
        total++;
        if (viewedConcepts.includes(cid)) viewed++;
      }
    }
    const pct = total > 0 ? Math.round((viewed / total) * 100) : 0;
    return { pct, viewed, total };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8 font-mono">
      {/* Hero / Terminal Banner */}
      <div className="relative bg-surface border border-border p-6 rounded-sm bg-dotted-grid overflow-hidden">
        <CornerBrackets />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-muted tracking-wider">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse inline-block" />
              <span>ROGUE COMMAND INTERFACE // SYSTEM ACTIVE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-foreground">
              Computer Networks & Protocols
            </h1>
            <p className="text-muted text-sm mt-1 max-w-2xl font-sans">
              Interactive mathematical exploration, parameter simulation, and systematic protocol analysis across all 6 Course Outcomes.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="p-3 bg-background/80 border border-border rounded-sm min-w-[110px]">
              <div className="text-[10px] text-muted uppercase">LOADED UNITS</div>
              <div className="text-xl font-bold text-cyan mt-0.5">{totalParts}</div>
            </div>
            <div className="p-3 bg-background/80 border border-border rounded-sm min-w-[110px]">
              <div className="text-[10px] text-muted uppercase">PROGRESS</div>
              <div className="text-xl font-bold text-lime mt-0.5">
                {viewedConcepts.length} / {totalConcepts}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Continue Where You Left Off" Card */}
      {lastConceptEntry && (
        <div className="relative bg-surface border border-lime/40 p-4 rounded-sm bg-dotted-grid flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CornerBrackets className="border-lime/60" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs bg-lime/10 border border-lime/30 flex items-center justify-center text-lime">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-lime uppercase font-semibold">
                CONTINUE WHERE YOU LEFT OFF
              </div>
              <div className="font-sans font-bold text-foreground text-sm">
                {lastConceptEntry.concept.code}: {lastConceptEntry.concept.title}
              </div>
              <div className="text-[10px] text-muted">
                {lastConceptEntry.part.co} &bull; {lastConceptEntry.part.title}
              </div>
            </div>
          </div>

          <Link
            to={`/concept/${lastConceptEntry.concept.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime text-black font-semibold text-xs rounded-xs hover:bg-lime/90 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <span>RESUME SIMULATION</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* CO Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-lime" />
            <span className="uppercase tracking-wider font-semibold text-foreground">
              COURSE OUTCOMES TELEMETRY [CO1 - CO6]
            </span>
          </div>
          <span className="text-[10px]">SELECT ACTIVE MODULE TO COMMENCE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CO_METADATA.map((meta) => {
            const normalized = normalizeCoId(meta.code);
            const isActive = activeCos.has(normalized);
            const parts = contentStore.partsByCo.get(normalized) || [];
            const Icon = meta.icon;
            const { pct, viewed, total } = getCoPercentage(meta.code);

            if (!isActive) {
              return (
                <div
                  key={meta.code}
                  className="relative bg-surface/40 border border-border/40 p-5 rounded-sm opacity-50 cursor-not-allowed select-none"
                >
                  <div className="flex items-center justify-between text-muted text-xs mb-3">
                    <span className="px-1.5 py-0.5 bg-background border border-border/60 rounded-xs">
                      {meta.code}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted/60">OFFLINE</span>
                  </div>
                  <h3 className="text-base font-sans font-semibold text-muted mb-1">
                    {meta.title}
                  </h3>
                  <p className="text-xs text-muted/70 font-sans line-clamp-2">
                    {meta.description}
                  </p>
                </div>
              );
            }

            // SVG Progress Ring calculations
            const r = 16;
            const circ = 2 * Math.PI * r;
            const strokeOffset = circ - (pct / 100) * circ;

            return (
              <Link
                key={meta.code}
                to={`/co/${meta.code.toLowerCase()}`}
                className="group relative bg-surface border border-border hover:border-lime/60 p-5 rounded-sm transition-all hover:bg-surface-raised flex flex-col justify-between"
              >
                <CornerBrackets className="group-hover:border-lime/60 transition-colors" />

                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-lime" />
                      <span className="px-1.5 py-0.5 bg-background border border-border rounded-xs font-semibold text-lime">
                        {meta.code}
                      </span>
                    </div>

                    {/* % Progress Ring */}
                    <div className="flex items-center gap-2">
                      <div className="relative w-9 h-9 flex items-center justify-center">
                        <svg className="w-9 h-9 transform -rotate-90">
                          <circle
                            cx="18"
                            cy="18"
                            r={r}
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="3"
                            fill="none"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r={r}
                            stroke="#c6ff3d"
                            strokeWidth="3"
                            strokeDasharray={circ}
                            strokeDashoffset={strokeOffset}
                            strokeLinecap="round"
                            fill="none"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <span className="absolute text-[8px] font-bold text-foreground">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-sans font-semibold text-foreground tracking-tight group-hover:text-lime transition-colors mb-2">
                    {meta.title}
                  </h3>

                  <p className="text-xs text-muted font-sans line-clamp-3 leading-relaxed">
                    {meta.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted">
                  <span className="text-cyan">{viewed}/{total} CONCEPTS VIEWED</span>
                  <span className="text-lime group-hover:underline">ENTER &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
