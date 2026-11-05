import React from 'react';

interface CornerBracketsProps {
  className?: string;
}

export const CornerBrackets: React.FC<CornerBracketsProps> = ({ className = '' }) => {
  return (
    <>
      {/* Top-left */}
      <span className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 pointer-events-none ${className}`} />
      {/* Top-right */}
      <span className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30 pointer-events-none ${className}`} />
      {/* Bottom-left */}
      <span className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30 pointer-events-none ${className}`} />
      {/* Bottom-right */}
      <span className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 pointer-events-none ${className}`} />
    </>
  );
};

