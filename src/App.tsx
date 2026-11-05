import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { CoPage } from './pages/CoPage';
import { ConceptPage } from './pages/ConceptPage';
import { DebugPage } from './pages/DebugPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-lime selection:text-black">
        <Header />
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/co/:co" element={<CoPage />} />
            <Route path="/concept/:id" element={<ConceptPage />} />
            <Route path="/debug" element={<DebugPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-border/40 py-4 px-6 text-center text-[10px] font-mono text-muted/60 select-none">
          ROGUE // COMMAND LEARNING DASHBOARD &bull; ZERO BACKEND &bull; STATIC TELEMETRY READY
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;

