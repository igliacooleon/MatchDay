import { useNavigate } from 'react-router-dom';
import { useLeagueData } from '@/hooks/useMatchDay';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trophy, Clock, Shield, CheckCircle2, Lock } from 'lucide-react';
import { formatEther } from 'viem';

interface UserEntryCardProps {
  leagueId: string;
  entry: {
    exists: boolean;
    claimed: boolean;
    winnerPicks: number[];
    goalsPicks: number[];
    penaltyPicks: number[];
    handle: string;
    decryptable: boolean;
  };
}

const UserEntryCard = ({ leagueId, entry }: UserEntryCardProps) => {
  const navigate = useNavigate();
  const { league, matchCount } = useLeagueData(leagueId);

  if (!league || !league.exists) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const lockTimeNumber = Number(league.lockTime);
  const isLocked = now >= lockTimeNumber;
  const timeRemaining = lockTimeNumber - now;

  const displayName = leagueId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Locked';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalPredictions = entry.winnerPicks.length;

  return (
    <div className="glass-strong rounded-2xl p-6 hover-lift">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: League Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-bold text-foreground">{displayName}</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Entry Fee</p>
              <p className="text-sm font-bold text-accent">
                {formatEther(league.entryFee)} ETH
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Predictions</p>
              <p className="text-sm font-bold text-foreground">
                {totalPredictions} / {matchCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Time Left</p>
              <p className="text-sm font-bold text-foreground">
                {formatTimeRemaining(timeRemaining)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <div className="flex items-center space-x-2">
                {league.settled ? (
                  <Badge className="bg-secondary/20 text-secondary border-secondary/50">
                    Settled
                  </Badge>
                ) : league.cancelled ? (
                  <Badge className="bg-destructive/20 text-destructive border-destructive/50">
                    Cancelled
                  </Badge>
                ) : isLocked ? (
                  <Badge className="bg-muted text-muted-foreground">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                ) : (
                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    <Clock className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col space-y-3 md:w-64">
          {/* Encryption Status */}
          <div className="glass rounded-xl p-3">
            <div className="flex items-center space-x-2">
              {entry.decryptable ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-sm text-accent font-medium">Decryptable</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-primary font-medium">Encrypted</span>
                </>
              )}
            </div>
          </div>

          {/* Claim Status */}
          {entry.claimed && (
            <div className="glass rounded-xl p-3 border-l-2 border-accent">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-sm text-accent font-medium">Prize Claimed</span>
              </div>
            </div>
          )}

          {/* View Details Button */}
          <Button
            variant="outline"
            onClick={() => navigate(`/league/${leagueId}`)}
            className="w-full"
          >
            View Details
          </Button>

          {/* Claim Prize Button (if settled and not claimed) */}
          {league.settled && !entry.claimed && !league.cancelled && (
            <Button
              onClick={() => navigate(`/league/${leagueId}`)}
              className="w-full bg-accent hover:bg-accent/90"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Check Results
            </Button>
          )}

          {/* Refund Button (if cancelled and not claimed) */}
          {league.cancelled && !entry.claimed && (
            <Button
              onClick={() => navigate(`/league/${leagueId}`)}
              className="w-full"
              variant="secondary"
            >
              Claim Refund
            </Button>
          )}
        </div>
      </div>

      {/* Prediction Preview (collapsed) */}
      <div className="mt-4 pt-4 border-t border-primary/20">
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-between">
            <span>Show Predictions</span>
            <span className="group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-4 space-y-2">
            {entry.winnerPicks.map((_, index) => (
              <div key={index} className="glass rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Match {index + 1}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-foreground">
                      Winner: <span className="font-bold">{entry.winnerPicks[index] === 0 ? 'Home' : 'Away'}</span>
                    </span>
                    <span className="text-foreground">
                      Goals: <span className="font-bold">{entry.goalsPicks[index] === 0 ? 'Under' : 'Over'}</span>
                    </span>
                    <span className="text-foreground">
                      Penalty: <span className="font-bold">{entry.penaltyPicks[index] === 0 ? 'No' : 'Yes'}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default UserEntryCard;
