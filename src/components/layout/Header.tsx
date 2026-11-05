import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { contentStore } from '../../content/loader';
import { SearchPalette } from '../common/SearchPalette';
import { Search, Bug, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const allCos = ['CO-1', 'CO-2', 'CO-3', 'CO-4', 'CO-5', 'CO-6'];
  const activeCosSet = new Set(contentStore.availableCos);

  const errorCount = contentStore.errors.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-border text-foreground font-mono">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-5 h-5 bg-lime text-black font-bold flex items-center justify-center rounded-xs text-[11px] tracking-tight group-hover:bg-lime/90 transition-colors">
                R
              </div>
              <span className="font-sans font-bold tracking-tight text-sm text-foreground group-hover:text-lime transition-colors">
                ROGUE
              </span>
              <span className="text-[10px] text-muted tracking-wider hidden sm:inline">
                // TELEMETRY
              </span>
            </Link>
          </div>

          {/* CO Navigation Bar */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {allCos.map((co) => {
              const isActive = activeCosSet.has(co);
              const isCurrent =
                location.pathname.startsWith(`/co/${co.toLowerCase()}`) ||
                location.pathname.startsWith(`/co/${co}`);

              if (!isActive) {
                return (
                  <span
                    key={co}
                    className="px-2 py-0.5 text-[11px] text-muted/40 border border-transparent rounded-xs cursor-not-allowed select-none"
                    title={`${co} (Offline)`}
                  >
                    {co}
                  </span>
                );
              }

              return (
                <Link
                  key={co}
                  to={`/co/${co.toLowerCase()}`}
                  className={`px-2 py-0.5 text-[11px] rounded-xs border transition-colors ${
                    isCurrent
                      ? 'border-lime bg-lime/10 text-lime font-semibold'
                      : 'border-border text-foreground/80 hover:border-border-active hover:text-foreground'
                  }`}
                >
                  {co}
                </Link>
              );
            })}
          </nav>

          {/* Quick Search & Debug */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-xs border border-border bg-surface-panel text-muted hover:border-lime/60 hover:text-foreground transition-colors"
              title="Search telemetry concepts (Cmd/Ctrl + K)"
            >
              <Search className="w-3 h-3 text-lime" />
              <span className="hidden sm:inline">SEARCH</span>
              <span className="text-[9px] px-1 bg-border/40 rounded-xs text-muted">
                ⌘K
              </span>
            </button>

            <Link
              to="/debug"
              className={`flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-xs border transition-colors ${
                errorCount > 0
                  ? 'border-red-500/50 bg-red-950/30 text-red-400 hover:bg-red-950/50'
                  : 'border-border bg-surface-panel text-muted hover:text-foreground hover:border-border-active'
              }`}
              title="Inspect system QA telemetry"
            >
              {errorCount > 0 ? (
                <>
                  <Bug className="w-3 h-3 text-red-400" />
                  <span>ERR: {errorCount}</span>
                </>
              ) : (
                <>
                  <Activity className="w-3 h-3 text-cyan" />
                  <span className="hidden sm:inline">QA</span>
                </>
              )}
            </Link>
          </div>
        </div>
      </header>

      <SearchPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
