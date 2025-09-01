import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Clock } from "lucide-react";
import { useBetting } from "@/hooks/use-betting";
import { useWebSocket } from "@/hooks/use-websocket";
import { getLanguage } from "@/lib/i18n";
import MatchModal from "@/components/MatchModal";

export default function SportsGrid() {
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [showLive, setShowLive] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);
  const { addToBettingSlip } = useBetting();
  const language = getLanguage();

  // Use WebSocket for live updates
  useWebSocket();

  const { data: fixtures, isLoading } = useQuery({
    queryKey: ["/api/fixtures", selectedSport],
    queryFn: async () => {
      let sport = selectedSport;
      if (selectedSport === 'thai-football') {
        sport = 'football';
      }
      const response = await fetch(`/api/fixtures?sport=${sport}&league=${selectedSport === 'thai-football' ? 'thai' : ''}`);
      return response.json();
    },
  });

  const { data: liveFixtures } = useQuery({
    queryKey: ["/api/fixtures/live", selectedSport],
    queryFn: async () => {
      let sport = selectedSport;
      if (selectedSport === 'thai-football') {
        sport = 'football';
      }
      const response = await fetch(`/api/fixtures/live?sport=${sport}`);
      return response.json();
    },
    enabled: showLive,
  });

  const displayFixtures = showLive ? liveFixtures : fixtures;

  const sportCategories = [
    { 
      id: "all", 
      label: language === 'th' ? "ทั้งหมด" : "All", 
      icon: "🎯" 
    },
    { 
      id: "football", 
      label: language === 'th' ? "ฟุตบอล" : "Football", 
      icon: "⚽" 
    },
    { 
      id: "thai-football", 
      label: language === 'th' ? "ไทยลีก" : "Thai Football", 
      icon: "🇹🇭" 
    },
    { 
      id: "basketball", 
      label: language === 'th' ? "บาสเกตบอล" : "Basketball", 
      icon: "🏀" 
    },
    { 
      id: "tennis", 
      label: language === 'th' ? "เทนนิส" : "Tennis", 
      icon: "🎾" 
    },
  ];

  const handleBetClick = (fixture: any, market: string, odds: string) => {
    const betSelection = {
      fixtureId: fixture.id,
      match: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      market,
      odds: parseFloat(odds),
      league: fixture.league,
    };
    
    addToBettingSlip(betSelection);
  };

  const handleMatchClick = (fixture: any) => {
    setSelectedMatch(fixture);
    setIsMatchModalOpen(true);
  };

  const getMatchStatus = (fixture: any) => {
    if (fixture.isLive) {
      return <Badge className="bg-red-500 text-white" data-testid={`status-live-${fixture.id}`}>LIVE</Badge>;
    } else if (new Date(fixture.startTime) > new Date()) {
      const time = new Date(fixture.startTime).toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return <Badge variant="outline" data-testid={`status-time-${fixture.id}`}>{time}</Badge>;
    } else {
      return <Badge variant="outline" data-testid={`status-finished-${fixture.id}`}>{language === 'th' ? 'จบแล้ว' : 'Finished'}</Badge>;
    }
  };

  const renderOddsButtons = (fixture: any) => {
    if (fixture.sport === 'basketball') {
      return (
        <div className="col-span-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'over', fixture.homeOdds || '1.90');
            }}
            data-testid={`bet-over-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Over 220.5</div>
            <div className="font-semibold">{fixture.homeOdds || '1.90'}</div>
          </Button>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'under', fixture.awayOdds || '1.95');
            }}
            data-testid={`bet-under-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Under 220.5</div>
            <div className="font-semibold">{fixture.awayOdds || '1.95'}</div>
          </Button>
        </div>
      );
    }

    // Default 1X2 betting for football and other sports
    return (
      <div className="col-span-4 grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce glow-green"
          onClick={(e) => {
            e.stopPropagation();
            handleBetClick(fixture, 'home', fixture.homeOdds || '2.00');
          }}
          disabled={!fixture.homeOdds}
          data-testid={`bet-home-${fixture.id}`}
        >
          <div className="text-xs text-muted-foreground">1</div>
          <div className="font-semibold">{fixture.homeOdds || 'N/A'}</div>
        </Button>
        <Button
          variant="outline"
          className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
          onClick={(e) => {
            e.stopPropagation();
            handleBetClick(fixture, 'draw', fixture.drawOdds || '3.00');
          }}
          disabled={!fixture.drawOdds}
          data-testid={`bet-draw-${fixture.id}`}
        >
          <div className="text-xs text-muted-foreground">X</div>
          <div className="font-semibold">{fixture.drawOdds || 'N/A'}</div>
        </Button>
        <Button
          variant="outline"
          className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce glow-green"
          onClick={(e) => {
            e.stopPropagation();
            handleBetClick(fixture, 'away', fixture.awayOdds || '3.50');
          }}
          disabled={!fixture.awayOdds}
          data-testid={`bet-away-${fixture.id}`}
        >
          <div className="text-xs text-muted-foreground">2</div>
          <div className="font-semibold">{fixture.awayOdds || 'N/A'}</div>
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6 emoji-background relative">
      {/* Фоновые плавающие эмодзи для матчей */}
      <div className="floating-emojis">
        <div className="floating-emoji">⚽</div>
        <div className="floating-emoji">🏀</div>
        <div className="floating-emoji">🎾</div>
        <div className="floating-emoji">🏆</div>
        <div className="floating-emoji">🎯</div>
        <div className="floating-emoji">🔥</div>
      </div>
      {/* Sports Categories */}
      <Card className="relative z-10 border-transparent mb-2">
        <CardContent className="p-3">
          <div className="relative">
            <Tabs value={selectedSport} onValueChange={setSelectedSport} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-2">
                {sportCategories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    data-testid={`sport-${category.id}`}
                  >
                    <span className="text-base">{category.icon}</span>
                    <span className="hidden sm:inline">{category.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Live Section Toggle */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold" data-testid="matches-title">
              {showLive ? (language === 'th' ? "แมตช์สด" : "Live Matches") : (language === 'th' ? "แมตช์วันนี้" : "Today's Matches")}
            </h3>
            <Button
              variant={showLive ? "default" : "outline"}
              className={showLive ? "bg-accent text-accent-foreground" : ""}
              onClick={() => setShowLive(!showLive)}
              data-testid="toggle-live"
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${showLive ? "bg-accent-foreground animate-live-pulse" : "bg-muted-foreground"}`}></div>
              {language === 'th' ? 'สด' : 'LIVE'}
            </Button>
          </div>

          {/* Matches List */}
          <div className="space-y-1">
            {isLoading ? (
              <div className="text-center py-8" data-testid="loading-matches">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">{language === 'th' ? 'กำลังโหลดแมตช์...' : 'Loading matches...'}</p>
              </div>
            ) : displayFixtures && displayFixtures.length > 0 ? (
              displayFixtures.map((fixture: any, index: number) => (
                <div key={fixture.id}>
                  <div
                    className="bg-muted rounded-lg p-4 card-hover smooth-transition cursor-pointer fade-in"
                    onClick={() => handleMatchClick(fixture)}
                    data-testid={`match-${fixture.id}`}
                  >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getMatchStatus(fixture)}
                      <span className="text-sm text-muted-foreground" data-testid={`league-${fixture.id}`}>
                        {fixture.league}
                      </span>
                      {fixture.isLive && fixture.homeScore !== null && fixture.awayScore !== null && (
                        <span className="text-sm text-accent font-medium" data-testid={`live-time-${fixture.id}`}>
                          {fixture.currentMinute || 0}'
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-secondary" data-testid={`favorite-${fixture.id}`}>
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2 items-center">
                    <div className="col-span-2 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium" data-testid={`home-team-${fixture.id}`}>
                          {fixture.homeTeam}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium" data-testid={`away-team-${fixture.id}`}>
                          {fixture.awayTeam}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-1 text-center">
                      {fixture.homeScore !== null && fixture.awayScore !== null ? (
                        <div className="text-lg font-bold" data-testid={`score-${fixture.id}`}>
                          {fixture.homeScore}-{fixture.awayScore}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground" data-testid={`vs-${fixture.id}`}>vs</div>
                      )}
                    </div>
                    
                    {renderOddsButtons(fixture)}
                  </div>
                  </div>
                  
                  {/* Декоративные элементы между матчами */}
                  {index < displayFixtures.length - 1 && (
                    <div className="relative flex justify-center items-center py-1 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex space-x-3">
                          <span className="text-sm match-separator-emoji" style={{animationDelay: '0s'}}>⚽</span>
                          <span className="text-sm match-separator-emoji" style={{animationDelay: '0.3s'}}>🏀</span>
                          <span className="text-sm match-separator-emoji" style={{animationDelay: '0.6s'}}>🎾</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground" data-testid="no-matches">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{language === 'th' ? 'ไม่มีแมตช์ในขณะนี้' : 'No matches available'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Match Modal */}
      <MatchModal 
        open={isMatchModalOpen}
        onOpenChange={setIsMatchModalOpen}
        fixture={selectedMatch}
      />
    </div>
  );
}
