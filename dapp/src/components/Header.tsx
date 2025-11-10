import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Trophy, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b-2 border-primary/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/leagues" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Trophy className="w-8 h-8 text-primary animate-glow-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-oswald font-bold neon-text tracking-tight">
                MatchDay
              </h1>
              <p className="text-xs text-muted-foreground font-inter">
                FHE Predictions
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/leagues"
              className={`font-medium transition-colors ${
                isActive('/leagues') || location.pathname.startsWith('/league/')
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Active Leagues
            </Link>
            <Link
              to="/upcoming"
              className={`font-medium transition-colors ${
                isActive('/upcoming')
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Upcoming
            </Link>
            <Link
              to="/statistics"
              className={`font-medium transition-colors flex items-center space-x-1 ${
                isActive('/statistics')
                  ? 'text-secondary'
                  : 'text-foreground hover:text-secondary'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Statistics</span>
            </Link>
          </nav>

          {/* Wallet Connect */}
          <div className="flex items-center space-x-4">
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
