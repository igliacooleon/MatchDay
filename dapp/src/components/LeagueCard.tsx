import { Trophy, Clock, Users, Coins } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatEther } from 'viem';
import { useNavigate } from 'react-router-dom';

interface LeagueCardProps {
  leagueId: string;
  entryFee: bigint;
  lockTime: bigint;
  prizePool: bigint;
  matchCount: number;
  settled: boolean;
  cancelled: boolean;
}

const LeagueCard = ({
  leagueId,
  entryFee,
  lockTime,
  prizePool,
  matchCount,
  settled,
  cancelled,
}: LeagueCardProps) => {
  const navigate = useNavigate();
  const now = Math.floor(Date.now() / 1000);
  const lockTimeNumber = Number(lockTime);
  const isLocked = now >= lockTimeNumber;
  const timeRemaining = lockTimeNumber - now;

  // Format league display name
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

  return (
    <div className="glass-strong rounded-2xl p-6 hover-lift group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-bold text-foreground truncate">{displayName}</h3>
        </div>

        {cancelled && (
          <Badge className="bg-destructive/20 text-destructive border-destructive/50">
            Cancelled
          </Badge>
        )}

        {settled && !cancelled && (
          <Badge className="bg-secondary/20 text-secondary border-secondary/50">
            Settled
          </Badge>
        )}

        {!settled && !cancelled && !isLocked && (
          <Badge className="bg-primary/20 text-primary border-primary/50 live-pulse">
            <Clock className="w-3 h-3 mr-1" />
            Open
          </Badge>
        )}

        {!settled && !cancelled && isLocked && (
          <Badge className="bg-muted text-muted-foreground">
            Locked
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
            <Coins className="w-4 h-4" />
            <span>Entry Fee</span>
          </div>
          <p className="text-xl font-bold text-accent">
            {formatEther(entryFee)} ETH
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
            <Trophy className="w-4 h-4" />
            <span>Prize Pool</span>
          </div>
          <p className="text-xl font-bold text-primary">
            {formatEther(prizePool)} ETH
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
            <Users className="w-4 h-4" />
            <span>Matches</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {matchCount}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>Time Left</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {formatTimeRemaining(timeRemaining)}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <Button
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg neon-border"
        onClick={() => navigate(`/league/${leagueId}`)}
        disabled={cancelled}
      >
        {cancelled ? 'Cancelled' : settled ? 'View Results' : isLocked ? 'View Details' : 'Enter League'}
      </Button>
    </div>
  );
};

export default LeagueCard;
