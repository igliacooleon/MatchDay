import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useEnterLeague } from '@/hooks/useMatchDay';
import { Lock, Loader2, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BetSubmitPanelProps {
  leagueId: string;
  entryFee: bigint;
  winnerPicks: number[];
  goalsPicks: number[];
  penaltyPicks: number[];
  isComplete: boolean;
  isLocked: boolean;
}

const BetSubmitPanel = ({
  leagueId,
  entryFee,
  winnerPicks,
  goalsPicks,
  penaltyPicks,
  isComplete,
  isLocked,
}: BetSubmitPanelProps) => {
  const { address, isConnected } = useAccount();
  const { enterLeague, isEntering, isEncrypting, isSuccess } = useEnterLeague();
  const [weight, setWeight] = useState<string>('50');

  const handleSubmit = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to enter the league',
        variant: 'destructive',
      });
      return;
    }

    if (!isComplete) {
      toast({
        title: 'Incomplete predictions',
        description: 'Please complete all match predictions',
        variant: 'destructive',
      });
      return;
    }

    const weightValue = BigInt(Math.floor(Number(weight)));
    if (weightValue <= 0 || weightValue > 100) {
      toast({
        title: 'Invalid weight',
        description: 'Weight must be between 1 and 100',
        variant: 'destructive',
      });
      return;
    }

    try {
      await enterLeague({
        leagueId,
        winnerPicks,
        goalsPicks,
        penaltyPicks,
        weight: weightValue,
        entryFee,
      });

      toast({
        title: 'Entry submitted!',
        description: 'Your predictions have been encrypted and submitted',
      });
    } catch (error) {
      // Error already handled by useEnterLeague hook
    }
  };

  if (isSuccess) {
    return (
      <div className="glass-strong rounded-2xl p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-accent mb-2">Entry Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Your encrypted predictions have been recorded on-chain.
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-left">
            <p className="text-xs text-muted-foreground mb-2">Your picks are now:</p>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Encrypted & Private</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-oswald font-bold mb-2">Submit Entry</h3>
        <p className="text-sm text-muted-foreground">
          Enter your confidence weight and submit predictions
        </p>
      </div>

      {/* Entry Fee */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Entry Fee</span>
          <span className="text-lg font-bold text-accent">
            {(Number(entryFee) / 1e18).toFixed(4)} ETH
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Sent to prize pool automatically
        </p>
      </div>

      {/* Confidence Weight */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Confidence Weight (1-100)
        </label>
        <div className="relative">
          <Input
            type="number"
            min="1"
            max="100"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={isLocked || isEntering}
            className="pr-12"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Zap className="w-4 h-4 text-accent" />
          </div>
        </div>
        <div className="glass rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your weight is encrypted using FHE. Only you can decrypt it after settlement.
            </p>
          </div>
        </div>
      </div>

      {/* Prediction Summary */}
      <div className="glass rounded-xl p-4">
        <p className="text-sm font-medium mb-3">Prediction Summary</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Matches predicted</span>
            <span className="font-medium">
              {isComplete ? winnerPicks.length : 0} / {winnerPicks.length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-medium ${isComplete ? 'text-accent' : 'text-destructive'}`}>
              {isComplete ? 'Ready' : 'Incomplete'}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {isLocked ? (
        <Button disabled className="w-full" size="lg">
          <Lock className="w-4 h-4 mr-2" />
          League Locked
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || isEntering || !isConnected}
          className="w-full"
          size="lg"
        >
          {isEncrypting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Encrypting...
            </>
          ) : isEntering ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Submit Encrypted Entry
            </>
          )}
        </Button>
      )}

      {/* Privacy Notice */}
      <div className="border-t border-primary/20 pt-4">
        <div className="flex items-start space-x-2">
          <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            All predictions are encrypted end-to-end using Zama's Fully Homomorphic Encryption.
            Your choices remain private until you choose to decrypt them.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BetSubmitPanel;
