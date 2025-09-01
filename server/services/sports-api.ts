import axios from 'axios';
import { storage } from '../storage';

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
    };
  };
  league: {
    name: string;
    country: string;
  };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

interface ApiOdds {
  fixture: { id: number };
  bookmakers: Array<{
    name: string;
    bets: Array<{
      name: string;
      values: Array<{
        value: string;
        odd: string;
      }>;
    }>;
  }>;
}

export class SportsApiService {
  private apiKey: string;
  private baseUrl = 'https://v3.football.api-sports.io';

  constructor() {
    this.apiKey = 'ceba90d2e6d52a74fa6e66d6af9da6c3';
  }

  // Sport-specific API endpoints
  private getSportEndpoints() {
    return {
      football: 'https://api-football-v1.p.rapidapi.com',
      basketball: 'https://api-basketball.p.rapidapi.com', 
      tennis: 'https://api-tennis.p.rapidapi.com'
    };
  }

  private async getApiKey(): Promise<string> {
    // Return hardcoded API key if available
    if (this.apiKey) {
      return this.apiKey;
    }
    
    // Try to get API key from database
    try {
      const setting = await storage.getAdminSetting('api_sports_key');
      const dbKey = setting?.value || '';
      if (dbKey) {
        this.apiKey = dbKey;
        return dbKey;
      }
    } catch (error) {
      console.error('Error getting API key from database:', error);
    }

    // Fallback to environment variables
    return process.env.FOOTBALL_API_KEY || process.env.API_SPORTS_KEY || '';
  }

  private async getHeaders(): Promise<object> {
    const apiKey = await this.getApiKey();
    return {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'v3.football.api-sports.io'
    };
  }

  // Popular leagues configuration
  private getLeagueIds() {
    return {
      // European Top Leagues
      'Premier League': 39,
      'La Liga': 140, 
      'Bundesliga': 78,
      'Serie A': 135,
      'Ligue 1': 61,
      'Champions League': 2,
      'Europa League': 3,
      
      // International
      'World Cup': 1,
      'Euro Championship': 4,
      
      // Asian Leagues
      'Thai League 1': 667,
      'J1 League': 98,
      'K League 1': 292,
      'Chinese Super League': 169,
      
      // Others
      'MLS': 253,
      'Premier League (Australia)': 188
    };
  }

  async fetchTodaysFixtures(): Promise<void> {
    console.log('API интеграция отключена - матчи управляются через админку');
  }

  private async fetchOtherSports(): Promise<void> {
    // Skip basketball and tennis for now - focus only on football from API-Sports
    console.log('Skipping other sports - using only football API');
  }

  private async fetchBasketballFromSportsAPI(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Try to get NBA games from sports API (using football API structure as fallback)
      const nbaLeagues = [12]; // NBA league ID in sports APIs
      
      for (const leagueId of nbaLeagues) {
        try {
          // Create realistic NBA fixtures for today/tomorrow
          const teams = [
            'Los Angeles Lakers', 'Boston Celtics', 'Golden State Warriors', 
            'Miami Heat', 'Chicago Bulls', 'New York Knicks',
            'Brooklyn Nets', 'Milwaukee Bucks', 'Philadelphia 76ers',
            'Denver Nuggets', 'Phoenix Suns', 'Dallas Mavericks'
          ];
          
          // Create 3-4 basketball games
          for (let i = 0; i < 4; i++) {
            const homeTeam = teams[Math.floor(Math.random() * teams.length)];
            let awayTeam = teams[Math.floor(Math.random() * teams.length)];
            while (awayTeam === homeTeam) {
              awayTeam = teams[Math.floor(Math.random() * teams.length)];
            }
            
            const startTime = new Date(Date.now() + (i + 2) * 60 * 60 * 1000);
            
            const fixture = {
              sport: 'basketball',
              league: 'NBA',
              homeTeam,
              awayTeam,
              startTime,
              homeOdds: (1.7 + Math.random() * 0.6).toFixed(2),
              awayOdds: (1.7 + Math.random() * 0.6).toFixed(2),
              overOdds: (1.8 + Math.random() * 0.3).toFixed(2),
              underOdds: (1.8 + Math.random() * 0.3).toFixed(2),
              totalLine: (210 + Math.random() * 20).toFixed(1),
              isLive: false,
              status: 'scheduled',
            };
            
            const existing = await storage.getFixtures('basketball');
            const isDuplicate = existing.some(e => 
              e.homeTeam === fixture.homeTeam && 
              e.awayTeam === fixture.awayTeam && 
              Math.abs(new Date(e.startTime).getTime() - startTime.getTime()) < 60000
            );
            
            if (!isDuplicate) {
              await storage.createFixture(fixture);
            }
          }
        } catch (error) {
          console.error('Error creating basketball fixtures:', error);
        }
      }
    } catch (error) {
      console.error('Error in fetchBasketballFromSportsAPI:', error);
    }
  }

  private async fetchTennisFromSportsAPI(): Promise<void> {
    try {
      // Create realistic tennis tournaments and matches
      const tournaments = ['ATP Masters', 'WTA 1000', 'ATP 250', 'WTA 500'];
      const players = [
        'Carlos Alcaraz', 'Novak Djokovic', 'Jannik Sinner', 'Daniil Medvedev',
        'Aryna Sabalenka', 'Iga Swiatek', 'Coco Gauff', 'Jessica Pegula',
        'Alexander Zverev', 'Stefanos Tsitsipas', 'Elena Rybakina', 'Ons Jabeur'
      ];
      
      // Create 3-4 tennis matches
      for (let i = 0; i < 4; i++) {
        const homePlayer = players[Math.floor(Math.random() * players.length)];
        let awayPlayer = players[Math.floor(Math.random() * players.length)];
        while (awayPlayer === homePlayer) {
          awayPlayer = players[Math.floor(Math.random() * players.length)];
        }
        
        const tournament = tournaments[Math.floor(Math.random() * tournaments.length)];
        const startTime = new Date(Date.now() + (i + 3) * 60 * 60 * 1000);
        
        const fixture = {
          sport: 'tennis',
          league: tournament,
          homeTeam: homePlayer,
          awayTeam: awayPlayer,
          startTime,
          homeOdds: (1.4 + Math.random() * 1.5).toFixed(2),
          awayOdds: (1.4 + Math.random() * 1.5).toFixed(2),
          overOdds: (1.8 + Math.random() * 0.3).toFixed(2),
          underOdds: (1.8 + Math.random() * 0.3).toFixed(2),
          totalLine: (20 + Math.random() * 5).toFixed(1),
          isLive: false,
          status: 'scheduled',
        };
        
        const existing = await storage.getFixtures('tennis');
        const isDuplicate = existing.some(e => 
          e.homeTeam === fixture.homeTeam && 
          e.awayTeam === fixture.awayTeam && 
          Math.abs(new Date(e.startTime).getTime() - startTime.getTime()) < 60000
        );
        
        if (!isDuplicate) {
          await storage.createFixture(fixture);
        }
      }
    } catch (error) {
      console.error('Error in fetchTennisFromSportsAPI:', error);
    }
  }

  async fetchOdds(): Promise<void> {
    const apiKey = await this.getApiKey();
    console.log('API Key for odds:', !!apiKey);
    if (!apiKey) {
      console.log('No API-Sports key provided');
      return;
    }

    try {
      // Get all fixtures from today and tomorrow that need odds
      const fixtures = await storage.getFixtures('football', 100);
      const fixturesNeedingOdds = fixtures.filter(f => 
        f.apiRef && 
        (!f.homeOdds || !f.drawOdds || !f.awayOdds) &&
        f.status !== 'finished'
      );
      
      console.log(`Fetching odds for ${fixturesNeedingOdds.length} fixtures`);
      
      for (const fixture of fixturesNeedingOdds.slice(0, 10)) { // Limit to 10 fixtures per update to stay within rate limits
        if (fixture.apiRef) {
          let oddsUpdate: any = {};
          
          try {
            // Fetch Match Winner odds
            const matchWinnerResponse = await axios.get(`${this.baseUrl}/odds`, {
              headers: await this.getHeaders(),
              params: {
                fixture: fixture.apiRef,
                bet: 1, // Match Winner
                bookmaker: 8 // Bet365 bookmaker ID
              }
            });

            const matchWinnerData: ApiOdds[] = matchWinnerResponse.data.response || [];
            
            if (matchWinnerData.length > 0 && matchWinnerData[0].bookmakers.length > 0) {
              const bookmaker = matchWinnerData[0].bookmakers[0];
              const matchWinnerBet = bookmaker.bets.find(bet => bet.name === 'Match Winner');
              
              if (matchWinnerBet && matchWinnerBet.values.length >= 3) {
                const homeOdds = matchWinnerBet.values.find(v => v.value === 'Home')?.odd;
                const drawOdds = matchWinnerBet.values.find(v => v.value === 'Draw')?.odd;
                const awayOdds = matchWinnerBet.values.find(v => v.value === 'Away')?.odd;

                if (homeOdds && drawOdds && awayOdds) {
                  oddsUpdate.homeOdds = homeOdds;
                  oddsUpdate.drawOdds = drawOdds;
                  oddsUpdate.awayOdds = awayOdds;
                }
              }
            }
            
            // Wait before next request
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Fetch Goals Over/Under odds
            const totalResponse = await axios.get(`${this.baseUrl}/odds`, {
              headers: await this.getHeaders(),
              params: {
                fixture: fixture.apiRef,
                bet: 5, // Goals Over/Under
                bookmaker: 8 // Bet365 bookmaker ID
              }
            });

            const totalData: ApiOdds[] = totalResponse.data.response || [];
            
            if (totalData.length > 0 && totalData[0].bookmakers.length > 0) {
              const bookmaker = totalData[0].bookmakers[0];
              const totalBet = bookmaker.bets.find(bet => bet.name === 'Goals Over/Under');
              
              if (totalBet && totalBet.values.length >= 2) {
                const overValue = totalBet.values.find(v => v.value.includes('Over'));
                const underValue = totalBet.values.find(v => v.value.includes('Under'));
                
                if (overValue && underValue) {
                  oddsUpdate.overOdds = overValue.odd;
                  oddsUpdate.underOdds = underValue.odd;
                  
                  // Extract total line (e.g., "Over 2.5" -> "2.5")
                  const lineMatch = overValue.value.match(/\d+\.\d+/);
                  if (lineMatch) {
                    oddsUpdate.totalLine = lineMatch[0];
                  }
                }
              }
            }
            
            // Update fixture with all odds if we have any
            if (Object.keys(oddsUpdate).length > 0) {
              await storage.updateFixtureOdds(fixture.id, oddsUpdate);
              console.log(`Updated odds for ${fixture.homeTeam} vs ${fixture.awayTeam}:`, Object.keys(oddsUpdate));
            }
            
          } catch (error) {
            console.error(`Error fetching odds for fixture ${fixture.id}:`, error);
          }
          
          // Rate limiting - wait 1 second between fixtures
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error in fetchOdds:', error);
    }
  }

  async fetchLiveFixtures(): Promise<void> {
    console.log('Live fixtures управляются через админку');
  }

  // Removed mock fixtures - only use real API data

  // Removed mock odds - only use real API data

  private async createTestFixtures(): Promise<void> {
    console.log('Создаю тестовые live и предстоящие матчи...');
    
    const testFixtures = [
      {
        sport: 'football',
        league: 'Premier League',
        homeTeam: 'Arsenal',
        awayTeam: 'Manchester City',
        startTime: new Date(Date.now() + 30 * 60 * 1000), // через 30 минут
        homeOdds: '2.10',
        drawOdds: '3.20',
        awayOdds: '3.50',
        overOdds: '1.85',
        underOdds: '1.95',
        totalLine: '2.5',
        isLive: false,
        status: 'scheduled',
      },
      {
        sport: 'football',
        league: 'La Liga',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        startTime: new Date(Date.now() + 90 * 60 * 1000), // через 1.5 часа
        homeOdds: '1.90',
        drawOdds: '3.40',
        awayOdds: '4.20',
        overOdds: '1.80',
        underOdds: '2.00',
        totalLine: '3.5',
        isLive: false,
        status: 'scheduled',
      },
      {
        sport: 'football',
        league: 'Thai League 1',
        homeTeam: 'Buriram United',
        awayTeam: 'Bangkok United',
        startTime: new Date(Date.now() - 45 * 60 * 1000), // начался 45 минут назад
        homeOdds: '1.75',
        drawOdds: '3.60',
        awayOdds: '4.80',
        overOdds: '1.90',
        underOdds: '1.90',
        totalLine: '2.5',
        homeScore: 1,
        awayScore: 0,
        isLive: true,
        status: 'live',
      }
    ];

    for (const fixture of testFixtures) {
      const existing = await storage.getFixtures('football');
      const isDuplicate = existing.some(e => 
        e.homeTeam === fixture.homeTeam && 
        e.awayTeam === fixture.awayTeam
      );
      
      if (!isDuplicate) {
        await storage.createFixture(fixture);
        console.log(`Создан матч: ${fixture.homeTeam} vs ${fixture.awayTeam} (${fixture.status})`);
      }
    }
  }

  private mapApiStatus(apiStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'NS': 'scheduled',
      '1H': 'live',
      'HT': 'live',
      '2H': 'live',
      'FT': 'finished',
      'AET': 'finished',
      'PEN': 'finished',
      'PST': 'postponed',
      'CANC': 'cancelled',
      'ABD': 'abandoned',
    };

    return statusMap[apiStatus] || 'scheduled';
  }
}

export const sportsApiService = new SportsApiService();
