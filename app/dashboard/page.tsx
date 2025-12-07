'use client';

import { useCallback, useEffect, useState } from 'react';
import URLManager from '@/components/URLManager';
import ResultsTable from '@/components/ResultsTable';
import ScraperControls from '@/components/ScraperControls';
import ProgressBar from '@/components/ProgressBar';
import ThemeToggle from '@/components/ThemeToggle';
import PriceComparison from '@/components/PriceComparison';
import Logo from '@/components/Logo';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserMenu from '@/components/UserMenu';
import OnboardingGuide from '@/components/OnboardingGuide';
import { ProgressTotals } from '@/types';
import { HelpCircle } from 'lucide-react';

const emptyTotals: ProgressTotals = { pending: 0, processing: 0, done: 0, error: 0 };

function DashboardContent() {
  const [totals, setTotals] = useState<ProgressTotals>(emptyTotals);
  const [showGuide, setShowGuide] = useState(false);

  const refreshProgress = useCallback(async () => {
    const res = await fetch('/api/urls?limit=1');
    const data = await res.json();
    setTotals(data.totals || emptyTotals);
  }, []);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  return (
    <main className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 p-6">
      <OnboardingGuide />

      {showGuide && (
        <div className="fixed inset-0 z-50">
          <OnboardingGuide />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">Scraper Berco</p>
          </div>
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title="Ver guía de uso"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">¿Cómo funciona?</span>
          </button>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
              <ThemeToggle />
            </div>
            <p className="text-white/70 text-lg">
              Monitorea precios de productos automáticamente
            </p>
          </div>
          <div className="flex items-center gap-4">
            <UserMenu />
            <ScraperControls onRefresh={refreshProgress} totals={totals} />
          </div>
        </div>
      </div>

      <ProgressBar totals={totals} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <URLManager onChange={refreshProgress} />
        <ResultsTable onRefresh={refreshProgress} />
      </div>

      {/* Price Comparison Section */}
      <PriceComparison />
    </main>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
