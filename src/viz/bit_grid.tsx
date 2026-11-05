import React, { useState, useMemo } from 'react';
import { Panel, getTopSeverity, type VizProps } from './kit';

export const BitGridViz: React.FC<VizProps> = ({
  params,
  values,
  outcomes,
  onParamChange,
}) => {
  const bitParam = params.find((p) => /bit|layer|error|crc|payload/i.test(p.name)) || params[0];
  const pName = bitParam?.name || 'param';
  const curVal = Math.round(values[pName] ?? 3);

  // 16-bit word
  const [bits, setBits] = useState<number[]>([
    1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1,
  ]);

  const toggleBit = (idx: number) => {
    setBits((prev) => {
      const next = [...prev];
      next[idx] = next[idx] === 1 ? 0 : 1;
      const flippedCount = next.filter((b, i) => b !== (i % 2 === 0 ? 1 : 0)).length;
      onParamChange(pName, Math.min(bitParam?.max ?? 16, Math.max(bitParam?.min ?? 0, flippedCount)));
      return next;
    });
  };

  // Live Simple CRC/Parity calculation
  const parity = useMemo(() => {
    return bits.reduce((acc, b) => acc ^ b, 0);
  }, [bits]);

  const hexVal = useMemo(() => {
    let num = 0;
    bits.forEach((b, i) => {
      if (b) num |= 1 << (15 - i);
    });
    return '0x' + num.toString(16).padStart(4, '0').toUpperCase();
  }, [bits]);

  return (
    <Panel
      title="Bitwise Frame Inspection & Checksum"
      figId="FIG 0.8 / FRAME BIT MATRIX"
      outcomes={outcomes}
      controls={{
        isPlaying: false,
        onTogglePlay: () => {},
        onReset: () => setBits([1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1]),
      }}
    >
      <div className="relative w-full bg-background/80 rounded-sm border border-border/40 bg-dotted-grid p-3 flex flex-col gap-3">
        {/* Bit Grid */}
        <div className="grid grid-cols-8 gap-1.5">
          {bits.map((bit, idx) => (
            <button
              key={idx}
              onClick={() => toggleBit(idx)}
              className={`h-9 rounded-xs border text-xs font-mono font-bold flex flex-col items-center justify-center transition-all ${
                bit === 1
                  ? 'bg-lime/10 border-lime text-lime hover:bg-lime/20'
                  : 'bg-surface border-border text-muted hover:border-border-active hover:text-foreground'
              }`}
            >
              <span>{bit}</span>
              <span className="text-[7px] text-muted/60 font-normal">b{15 - idx}</span>
            </button>
          ))}
        </div>

        {/* Checksum and Hex Word Readout */}
        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px] font-mono">
          <div className="flex items-center gap-3">
            <span className="text-muted">HEX: <span className="text-cyan font-bold">{hexVal}</span></span>
            <span className="text-muted">PARITY: <span className="text-lime font-bold">{parity}</span></span>
          </div>
          <span className="text-[9px] text-muted/80">TAP ANY CELL TO INVERT BIT</span>
        </div>
      </div>
    </Panel>
  );
};

