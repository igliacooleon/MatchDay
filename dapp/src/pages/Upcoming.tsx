import StadiumBackground from '@/components/StadiumBackground';
import Header from '@/components/Header';
import { Calendar, Clock, Trophy, Zap, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Upcoming = () => {
  const upcomingFeatures = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-time Odds',
      description: 'Live odds calculation based on encrypted betting pool dynamics',
      status: 'In Development',
      eta: 'Q1 2025',
      color: 'text-accent',
      bgColor: 'bg-accent/20',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Oracle Integration',
      description: 'Decentralized oracle network for automatic match result settlement',
      status: 'Planning',
      eta: 'Q2 2025',
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Social Features',
      description: 'Friend leaderboards, betting groups, and encrypted chat',
      status: 'Concept',
      eta: 'Q2 2025',
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Tournament Mode',
      description: 'Multi-stage tournaments with bracket predictions and prize pools',
      status: 'Concept',
      eta: 'Q3 2025',
      color: 'text-accent',
      bgColor: 'bg-accent/20',
    },
  ];

  const upcomingLeagues = [
    {
      name: 'UEFA Champions League',
      sport: 'Football',
      startDate: 'TBD',
      prizePool: 'TBD',
    },
    {
      name: 'NBA Playoffs',
      sport: 'Basketball',
      startDate: 'TBD',
      prizePool: 'TBD',
    },
    {
      name: 'Cricket World Cup',
      sport: 'Cricket',
      startDate: 'TBD',
      prizePool: 'TBD',
    },
    {
      name: 'NFL Super Bowl',
      sport: 'American Football',
      startDate: 'TBD',
      prizePool: 'TBD',
    },
  ];

  return (
    <div className="min-h-screen relative">
      <StadiumBackground />
      <Header />

      <main className="pt-24 pb-12">
        {/* Page Header */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 glass rounded-full px-4 py-2 mb-6">
              <Calendar className="w-4 h-4 text-accent animate-glow-pulse" />
              <span className="text-sm font-medium text-foreground">Coming Soon</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-oswald font-bold mb-6 leading-tight">
              <span className="neon-text">Upcoming</span>
              <br />
              <span className="text-foreground">Features & Leagues</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're constantly building new features and expanding to new sports.
              Here's what's in the pipeline.
            </p>
          </div>
        </section>

        {/* Upcoming Features */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-4xl font-oswald font-bold neon-text mb-2">
                New Features
              </h2>
              <p className="text-muted-foreground">
                Planned enhancements to the platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="glass-strong rounded-2xl p-6 hover-lift group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 rounded-xl ${feature.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <span className={feature.color}>
                        {feature.icon}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-foreground">
                          {feature.title}
                        </h3>
                        <span className="glass rounded-full px-3 py-1 text-xs font-medium text-accent">
                          {feature.status}
                        </span>
                      </div>

                      <p className="text-muted-foreground mb-4">
                        {feature.description}
                      </p>

                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">ETA: {feature.eta}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Leagues */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-4xl font-oswald font-bold neon-text mb-2">
                Future Leagues
              </h2>
              <p className="text-muted-foreground">
                Sports and competitions coming to the platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingLeagues.map((league, index) => (
                <div
                  key={index}
                  className="glass-strong rounded-2xl p-6 hover-lift"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Trophy className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold text-foreground">
                      {league.name}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sport</span>
                      <span className="text-sm font-medium text-foreground">
                        {league.sport}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Start Date</span>
                      <span className="text-sm font-medium text-foreground">
                        {league.startDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Prize Pool</span>
                      <span className="text-sm font-medium text-accent">
                        {league.prizePool}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-strong rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-primary animate-glow-pulse" />
              </div>

              <h2 className="text-3xl font-oswald font-bold mb-4">
                Stay Updated
              </h2>

              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Be the first to know when new features launch and new leagues open.
                Follow us on social media for the latest updates.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 neon-border"
                  onClick={() => window.open('https://twitter.com', '_blank')}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                  Follow on Twitter
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open('https://discord.com', '_blank')}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                  </svg>
                  Join Discord
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Back to Leagues */}
        <section className="container mx-auto px-4 mt-12">
          <div className="max-w-4xl mx-auto text-center">
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = '/leagues'}
            >
              ← Back to Active Leagues
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Upcoming;
