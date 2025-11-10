import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import StadiumBackground from '@/components/StadiumBackground';
import Header from '@/components/Header';
import MatchPredictionCard from '@/components/MatchPredictionCard';
import BetSubmitPanel from '@/components/BetSubmitPanel';
import { useLeagueData } from '@/hooks/useMatchDay';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trophy, Users, Clock, Coins } from 'lucide-react';

const LeagueDetail = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const { league, matchCount, isLoading } = useLeagueData(leagueId || '');

  const [winnerPicks, setWinnerPicks] = useState<number[]>([]);
  const [goalsPicks, setGoalsPicks] = useState<number[]>([]);
  const [penaltyPicks, setPenaltyPicks] = useState<number[]>([]);

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StadiumBackground />
        <div className="glass-strong rounded-2xl p-8">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading league data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!league || !league.exists) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StadiumBackground />
        <div className="glass-strong rounded-2xl p-8 text-center">
          <p className="text-destructive text-lg mb-4">League not found</p>
          <Button onClick={() => navigate('/')}>
            Back to Leagues
          </Button>
        </div>
      </div>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const isLocked = now >= Number(league.lockTime);
  const timeLeft = Number(league.lockTime) - now;

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);

  const handlePredictionChange = (
    matchIndex: number,
    type: 'winner' | 'goals' | 'penalty',
    value: number
  ) => {
    const updatePicks = (picks: number[], newValue: number) => {
      const newPicks = [...picks];
      newPicks[matchIndex] = newValue;
      return newPicks;
    };

    if (type === 'winner') {
      setWinnerPicks(updatePicks(winnerPicks, value));
    } else if (type === 'goals') {
      setGoalsPicks(updatePicks(goalsPicks, value));
    } else {
      setPenaltyPicks(updatePicks(penaltyPicks, value));
    }
  };

  const allPredictionsComplete =
    winnerPicks.length === matchCount &&
    goalsPicks.length === matchCount &&
    penaltyPicks.length === matchCount &&
    winnerPicks.every(p => p === 0 || p === 1) &&
    goalsPicks.every(p => p === 0 || p === 1) &&
    penaltyPicks.every(p => p === 0 || p === 1);

  return (
    <div className="min-h-screen relative">
      <StadiumBackground />
      <Header />

      <main className="pt-24 pb-12">
        {/* Back Button */}
        <div className="container mx-auto px-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="hover:bg-primary/10"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Leagues
          </Button>
        </div>

        {/* League Header */}
        <section className="container mx-auto px-4 mb-8">
          <div className="glass-strong rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-oswald font-bold neon-text mb-2">
                  {leagueId?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h1>
                <p className="text-muted-foreground">
                  Predict all {matchCount} matches to enter
                </p>
              </div>

              {isLocked ? (
                <span className="glass rounded-full px-4 py-2 text-sm font-medium text-destructive">
                  Locked
                </span>
              ) : (
                <span className="glass rounded-full px-4 py-2 text-sm font-medium text-accent">
                  Open
                </span>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Coins className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Entry Fee</span>
                </div>
                <p className="text-2xl font-bold text-accent">
                  {(Number(league.entryFee) / 1e18).toFixed(4)} ETH
                </p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Prize Pool</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {(Number(league.prizePool) / 1e18).toFixed(4)} ETH
                </p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">Matches</span>
                </div>
                <p className="text-2xl font-bold text-secondary">
                  {matchCount}
                </p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-foreground" />
                  <span className="text-sm text-muted-foreground">Time Left</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {isLocked ? 'Locked' : `${days}d ${hours}h`}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Predictions Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-oswald font-bold mb-2">Match Predictions</h2>
                <p className="text-muted-foreground">
                  Select your predictions for each match
                </p>
              </div>

              {Array.from({ length: matchCount }).map((_, index) => (
                <MatchPredictionCard
                  key={index}
                  matchIndex={index}
                  leagueId={leagueId || ''}
                  winnerPick={winnerPicks[index]}
                  goalsPick={goalsPicks[index]}
                  penaltyPick={penaltyPicks[index]}
                  goalsThreshold={league.goalsThreshold}
                  onPredictionChange={handlePredictionChange}
                  disabled={isLocked}
                />
              ))}
            </div>

            {/* Bet Submit Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BetSubmitPanel
                  leagueId={leagueId || ''}
                  entryFee={league.entryFee}
                  winnerPicks={winnerPicks}
                  goalsPicks={goalsPicks}
                  penaltyPicks={penaltyPicks}
                  isComplete={allPredictionsComplete}
                  isLocked={isLocked}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeagueDetail;
