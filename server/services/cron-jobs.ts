import { sportsApiService } from './sports-api';
import { storage } from '../storage';

class CronJobsService {
  private fixtureUpdateInterval: NodeJS.Timeout | null = null;
  private oddsUpdateInterval: NodeJS.Timeout | null = null;

  start() {
    console.log('Starting cron jobs...');

    // Update fixtures every 30 minutes (to conserve API calls)
    this.fixtureUpdateInterval = setInterval(async () => {
      try {
        console.log('Updating fixtures...');
        await sportsApiService.fetchTodaysFixtures();
      } catch (error) {
        console.error('Error updating fixtures:', error);
      }
    }, 30 * 60 * 1000);

    // Update live match minutes every 60 seconds
    this.oddsUpdateInterval = setInterval(async () => {
      try {
        console.log('Updating live match minutes...');
        
        // Update minutes for live matches
        await storage.updateLiveMatchMinutes();
        
        // Check for finished matches and settle bets
        await this.settleBets();
      } catch (error) {
        console.error('Error updating live matches:', error);
      }
    }, 60 * 1000);

    // Initial data fetch
    this.initialDataFetch();
  }

  stop() {
    if (this.fixtureUpdateInterval) {
      clearInterval(this.fixtureUpdateInterval);
      this.fixtureUpdateInterval = null;
    }

    if (this.oddsUpdateInterval) {
      clearInterval(this.oddsUpdateInterval);
      this.oddsUpdateInterval = null;
    }

    console.log('Cron jobs stopped');
  }

  private async initialDataFetch() {
    try {
      console.log('Performing initial data fetch...');
      await sportsApiService.fetchTodaysFixtures();
      await sportsApiService.fetchOdds();
    } catch (error) {
      console.error('Error in initial data fetch:', error);
    }
  }

  private async settleBets() {
    try {
      // Get all pending bets
      const allBets = await storage.getAllBets();
      const pendingBets = allBets.filter(bet => bet.status === 'pending');

      for (const bet of pendingBets) {
        const fixture = bet.fixture;
        
        // Only settle bets for finished matches
        if (fixture.status === 'finished' && 
            fixture.homeScore !== null && 
            fixture.awayScore !== null) {
          
          let betResult = 'lost';
          
          // Determine bet result based on market
          switch (bet.market) {
            case 'home':
              if (fixture.homeScore > fixture.awayScore) {
                betResult = 'won';
              }
              break;
            case 'draw':
              if (fixture.homeScore === fixture.awayScore) {
                betResult = 'won';
              }
              break;
            case 'away':
              if (fixture.awayScore > fixture.homeScore) {
                betResult = 'won';
              }
              break;
            case 'over':
              const totalGoals = fixture.homeScore + fixture.awayScore;
              if (totalGoals > 2.5) { // Assuming over 2.5 goals
                betResult = 'won';
              }
              break;
            case 'under':
              const totalGoalsUnder = fixture.homeScore + fixture.awayScore;
              if (totalGoalsUnder < 2.5) { // Assuming under 2.5 goals
                betResult = 'won';
              }
              break;
          }

          // Update bet status
          await storage.updateBetStatus(bet.id, betResult);

          // If bet won, add winnings to user balance
          if (betResult === 'won') {
            const user = await storage.getUser(bet.userId);
            if (user) {
              const newBalance = (parseFloat(user.balance) + parseFloat(bet.potentialWin)).toFixed(2);
              await storage.updateUserBalance(bet.userId, newBalance);
              
              console.log(`Settled winning bet ${bet.id} for user ${bet.userId}, added ฿${bet.potentialWin}`);
            }
          } else {
            console.log(`Settled losing bet ${bet.id} for user ${bet.userId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error settling bets:', error);
    }
  }
}

export const cronJobsService = new CronJobsService();
