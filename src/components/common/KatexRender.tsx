import React, { useMemo } from 'react';
import katex from 'katex';

interface KatexRenderProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const KatexRender: React.FC<KatexRenderProps> = ({
  latex,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    if (!latex) return '';
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch (e) {
      return latex;
    }
  }, [latex, displayMode]);

  return (
    <span
      className={`katex-render font-mono ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

