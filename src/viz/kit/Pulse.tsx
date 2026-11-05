import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { getSeverityColor, type OutcomeSeverity } from './types';

interface PulseProps {
  x: number;
  y: number;
  r?: number;
  severity?: OutcomeSeverity | null;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({
  x,
  y,
  r = 8,
  severity = 'info',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const color = getSeverityColor(severity);

  if (shouldReduceMotion) {
    return (
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={2}
        className={className}
      />
    );
  }

  return (
    <g className={className}>
      <motion.circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        initial={{ r, opacity: 0.8 }}
        animate={{ r: r + 8, opacity: 0 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      <circle cx={x} cy={y} r={r} fill={color} />
    </g>
  );
};

