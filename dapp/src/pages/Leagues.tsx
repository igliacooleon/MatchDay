import StadiumBackground from '@/components/StadiumBackground';
import Header from '@/components/Header';
import LeagueCard from '@/components/LeagueCard';
import { useLeagueData } from '@/hooks/useMatchDay';
import { Flame } from 'lucide-react';

const LEAGUE_IDS = [
  'premier-league-weekend-001',
  'champions-league-night-001',
  'la-liga-showdown-001',
  'bundesliga-battles-001',
  'serie-a-classic-001',
];

const Leagues = () => {
  return (
    <div className="min-h-screen relative">
      <StadiumBackground />
      <Header />

      <main className="pt-24 pb-12">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 glass rounded-full px-4 py-2 mb-6">
              <Flame className="w-4 h-4 text-accent animate-glow-pulse" />
              <span className="text-sm font-medium text-foreground">Live Leagues Available</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-oswald font-bold mb-6 leading-tight">
              <span className="neon-text">Football</span>
              <br />
              <span className="text-foreground">Prediction Leagues</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Predict match outcomes with encrypted confidence weights. Privacy-preserving predictions
              powered by Fully Homomorphic Encryption on Zama fhEVM.
            </p>
          </div>
        </section>

        {/* Leagues Grid */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-4xl font-oswald font-bold neon-text mb-2">
              Active Leagues
            </h2>
            <p className="text-muted-foreground">
              Choose a league and submit your encrypted predictions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEAGUE_IDS.map((leagueId) => (
              <LeagueCardWrapper key={leagueId} leagueId={leagueId} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-oswald font-bold text-center mb-12">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-strong rounded-2xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Choose League</h3>
                <p className="text-muted-foreground">
                  Select a league with matches you want to predict
                </p>
              </div>

              <div className="glass-strong rounded-2xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-secondary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Submit Predictions</h3>
                <p className="text-muted-foreground">
                  Predict winner, goals, and penalties with encrypted confidence weight
                </p>
              </div>

              <div className="glass-strong rounded-2xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-accent">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Win Prizes</h3>
                <p className="text-muted-foreground">
                  Claim your share of the prize pool based on prediction accuracy
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 mt-12 border-t border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 MatchDay. Privacy-preserving football predictions.
            </p>

            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Responsible Gaming
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

// Wrapper component to fetch league data
const LeagueCardWrapper = ({ leagueId }: { leagueId: string }) => {
  const { league, matchCount } = useLeagueData(leagueId);

  if (!league || !league.exists) {
    return null;
  }

  return (
    <LeagueCard
      leagueId={leagueId}
      entryFee={league.entryFee}
      lockTime={league.lockTime}
      prizePool={league.prizePool}
      matchCount={matchCount}
      settled={league.settled}
      cancelled={league.cancelled}
    />
  );
};

export default Leagues;
