import type React from 'react';
import { AlertCircle, Coins, Target, TrendingUp, Trophy } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import Header from '@/components/Header';
import StadiumBackground from '@/components/StadiumBackground';
import UserEntryCard from '@/components/UserEntryCard';
import { Button } from '@/components/ui/button';
import { useUserEntries } from '@/hooks/useMatchDay';

const Statistics = () => {
  const { address, isConnected } = useAccount();
  const { entries, isLoading } = useUserEntries();
  const activeEntries = entries?.filter((e) => e.exists) || [];
  const totalEntries = activeEntries.length;

  if (!isConnected) {
    return (
      <div className="min-h-screen relative">
        <StadiumBackground />
        <Header />

        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto glass-strong rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-primary" />
              </div>

              <h2 className="text-3xl font-oswald font-bold mb-4">Connect Your Wallet</h2>

              <p className="text-muted-foreground mb-8">
                Connect your wallet to view your betting history and statistics
              </p>

              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <StadiumBackground />
      <Header />

      <main className="pt-24 pb-12">
        {/* Page Header */}
        <section className="container mx-auto px-4 mb-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-8 h-8 text-secondary animate-glow-pulse" />
              <h1 className="text-5xl font-oswald font-bold neon-text">My Statistics</h1>
            </div>
            <p className="text-xl text-muted-foreground">Track your betting history and performance</p>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="container mx-auto px-4 mb-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard icon={<Target className="w-6 h-6 text-primary" />} title="Total Entries" value={totalEntries} />
              <StatCard icon={<Trophy className="w-6 h-6 text-accent" />} title="Active Bets" value={totalEntries} />
              <StatCard icon={<Coins className="w-6 h-6 text-secondary" />} title="Winnings" value="-" />
              <StatCard icon={<TrendingUp className="w-6 h-6 text-primary" />} title="Win Rate" value="-" />
            </div>
          </div>
        </section>

        {/* Betting History */}
        <section className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-oswald font-bold mb-2">Betting History</h2>
              <p className="text-muted-foreground">Your encrypted predictions across all leagues</p>
            </div>

            {isLoading ? (
              <div className="glass-strong rounded-2xl p-12 text-center text-muted-foreground">Loading your statistics...</div>
            ) : totalEntries === 0 ? (
              <div className="glass-strong rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Bets Yet</h3>
                <p className="text-muted-foreground mb-6">Start betting on leagues to see your history here</p>
                <Button onClick={() => (window.location.href = "/leagues")}>Browse Leagues</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeEntries.map((entry) => (
                  <UserEntryCard key={entry.leagueId} leagueId={entry.leagueId} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Privacy Notice */}
        <section className="container mx-auto px-4 mt-12">
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-xl p-6 border-l-4 border-primary">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Privacy Protection</h4>
                  <p className="text-sm text-muted-foreground">
                    All your predictions and confidence weights are encrypted using Fully Homomorphic Encryption (FHE).
                    Only you can decrypt them after league settlement using your wallet signature.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) {
  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
