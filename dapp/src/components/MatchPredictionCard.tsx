import { useReadContract } from 'wagmi';
import { MATCHDAY_ADDRESS, MATCHDAY_ABI } from '@/constants/contracts';
import { Button } from './ui/button';
import { Trophy, TrendingUp, AlertCircle } from 'lucide-react';

interface MatchPredictionCardProps {
  matchIndex: number;
  leagueId: string;
  winnerPick?: number;
  goalsPick?: number;
  penaltyPick?: number;
  goalsThreshold: number;
  onPredictionChange: (matchIndex: number, type: 'winner' | 'goals' | 'penalty', value: number) => void;
  disabled?: boolean;
}

const MatchPredictionCard = ({
  matchIndex,
  leagueId,
  winnerPick,
  goalsPick,
  penaltyPick,
  goalsThreshold,
  onPredictionChange,
  disabled = false,
}: MatchPredictionCardProps) => {
  const { data: matchesData } = useReadContract({
    address: MATCHDAY_ADDRESS,
    abi: MATCHDAY_ABI,
    functionName: 'getMatches',
    args: [leagueId],
  });

  if (!matchesData || !matchesData[matchIndex]) {
    return (
      <div className="glass rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-primary/20 rounded mb-4 w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-primary/20 rounded w-full"></div>
          <div className="h-4 bg-primary/20 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const match = matchesData[matchIndex];
  const isPredictionComplete =
    (winnerPick === 0 || winnerPick === 1) &&
    (goalsPick === 0 || goalsPick === 1) &&
    (penaltyPick === 0 || penaltyPick === 1);

  return (
    <div className={`glass-strong rounded-2xl p-6 transition-all ${
      isPredictionComplete ? 'border-2 border-accent' : ''
    }`}>
      {/* Match Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">{match.label}</h3>
          <p className="text-sm text-muted-foreground">Match {matchIndex + 1}</p>
        </div>
        {isPredictionComplete && (
          <div className="glass rounded-full px-3 py-1 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-xs font-medium text-accent">Complete</span>
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Home</p>
          <p className="font-bold text-foreground">{match.homeTeam}</p>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-2xl font-bold text-muted-foreground">VS</span>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Away</p>
          <p className="font-bold text-foreground">{match.awayTeam}</p>
        </div>
      </div>

      {/* Prediction: Winner */}
      <div className="space-y-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Winner Prediction</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={winnerPick === 0 ? 'default' : 'outline'}
              onClick={() => onPredictionChange(matchIndex, 'winner', 0)}
              disabled={disabled}
              className="w-full"
            >
              {match.homeTeam}
            </Button>
            <Button
              variant={winnerPick === 1 ? 'default' : 'outline'}
              onClick={() => onPredictionChange(matchIndex, 'winner', 1)}
              disabled={disabled}
              className="w-full"
            >
              {match.awayTeam}
            </Button>
          </div>
        </div>

        {/* Prediction: Goals */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground">Total Goals</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={goalsPick === 0 ? 'default' : 'outline'}
              onClick={() => onPredictionChange(matchIndex, 'goals', 0)}
              disabled={disabled}
              className="w-full"
            >
              Under {goalsThreshold}
            </Button>
            <Button
              variant={goalsPick === 1 ? 'default' : 'outline'}
              onClick={() => onPredictionChange(matchIndex, 'goals', 1)}
              disabled={disabled}
              className="w-full"
            >
              Over {goalsThreshold}
            </Button>
          </div>
        </div>

        {/* Prediction: Penalty */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Penalty Shootout</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={penaltyPick === 0 ? 'default' : 'outline'}
              onClick={() => onPredictionChange(matchIndex, 'penalty', 0)}
              disabled={disabled}
              className="w-full"
            >
              No
            </Button>
            <Button
              variant={penaltyPick === 1 ? 'default' : 'outline'}
              onClick={() => onPredictionChange(matchIndex, 'penalty', 1)}
              disabled={disabled}
              className="w-full"
            >
              Yes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchPredictionCard;
