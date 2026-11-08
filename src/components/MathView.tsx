import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      // Clean up common input variations
      let formatted = math
        .replace(/\\\[/g, '')
        .replace(/\\\]/g, '')
        .replace(/\\\(/g, '')
        .replace(/\\\)/g, '');

      return katex.renderToString(formatted, {
        displayMode: block,
        throwOnError: false,
        output: 'html',
      });
    } catch (err) {
      return null;
    }
  }, [math, block]);

  if (!html) {
    return <span className={`font-mono text-cyan-400 ${className}`}>{math}</span>;
  }

  return (
    <span
      className={`math-expression-display inline-block ${block ? 'block text-center py-1' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
