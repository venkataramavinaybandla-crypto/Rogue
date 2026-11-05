import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { getAllConcepts } from '../../content/loader';
import type { Concept } from '../../types';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchPalette: React.FC<SearchPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const concepts = useMemo(() => getAllConcepts(), []);

  const fuse = useMemo(() => {
    return new Fuse(concepts, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'code', weight: 0.3 },
        { name: 'exam_tags', weight: 0.15 },
        { name: 'key_points', weight: 0.1 },
        { name: 'eli5', weight: 0.05 },
      ],
      threshold: 0.35,
    });
  }, [concepts]);

  const results = useMemo(() => {
    if (!query.trim()) return concepts.slice(0, 8);
    return fuse.search(query).slice(0, 8).map((r) => r.item);
  }, [query, fuse, concepts]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const handleSelect = (concept: Concept) => {
    navigate(`/concept/${concept.id}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface border border-border-active rounded-sm shadow-2xl overflow-hidden font-mono text-xs flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/80 bg-background/60">
          <Search className="w-4 h-4 text-lime flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search concepts, codes, exam tags, principles..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted/60 text-xs"
          />
          <button onClick={onClose} className="p-1 hover:text-foreground text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {results.length === 0 ? (
            <div className="p-6 text-center text-muted/60 text-xs">
              NO CONCEPTS MATCHING TELEMETRY QUERY
            </div>
          ) : (
            results.map((c, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-xs border cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-lime/10 border-lime text-lime'
                      : 'bg-background/40 border-border/40 text-foreground/80 hover:bg-surface-raised'
                  }`}
                >
                  <div className="flex flex-col gap-1 truncate pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1 py-0.2 bg-surface border border-border rounded-xs font-bold text-cyan">
                        {c.code}
                      </span>
                      <span className="font-sans font-semibold text-xs truncate">
                        {c.title}
                      </span>
                    </div>
                    {c.exam_tags && c.exam_tags.length > 0 && (
                      <div className="flex gap-1 text-[8px] text-muted uppercase">
                        {c.exam_tags.map((t) => (
                          <span key={t}>#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted text-[10px] flex-shrink-0">
                    <CornerDownLeft className="w-3 h-3" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 border-t border-border/50 bg-background/80 flex items-center justify-between text-[9px] text-muted">
          <span>&uarr; &darr; TO NAVIGATE &bull; [ENTER] TO SELECT</span>
          <span>[ESC] TO EXIT</span>
        </div>
      </div>
    </div>
  );
};

