import { 
  users, 
  fixtures, 
  bets, 
  deposits, 
  withdrawals, 
  adminSettings,
  transactionsAdmin,
  type User, 
  type InsertUser,
  type Fixture,
  type InsertFixture,
  type Bet,
  type InsertBet,
  type Deposit,
  type InsertDeposit,
  type Withdrawal,
  type InsertWithdrawal,
  type AdminSetting,
  type TransactionAdmin
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, gte, lte, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: any;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByAccountId(accountId: string): Promise<User | undefined>;
  createUser(user: InsertUser & { accountId: string }): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  updateUserBalance(userId: string, newBalance: string): Promise<void>;
  updateUserStats(userId: string, stats: { winRate?: string, totalBetsPlaced?: number, totalWinsCount?: number, totalLossesCount?: number, adminNotes?: string, vipLevel?: number }): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Fixture operations
  getFixtures(sport?: string, limit?: number): Promise<Fixture[]>;
  getAllFixtures(limit?: number): Promise<Fixture[]>;
  getLiveFixtures(sport?: string): Promise<Fixture[]>;
  getFixture(id: string): Promise<Fixture | undefined>;
  getFixtureByApiRef(apiRef: string): Promise<Fixture | undefined>;
  createFixture(fixture: InsertFixture): Promise<Fixture>;
  updateFixture(id: string, updates: Partial<Fixture>): Promise<void>;
  updateFixtureOdds(id: string, odds: { homeOdds?: string, drawOdds?: string, awayOdds?: string }): Promise<void>;
  
  // Bet operations
  createBet(bet: InsertBet): Promise<Bet>;
  getUserBets(userId: string, limit?: number): Promise<(Bet & { fixture: Fixture | null })[]>;
  updateBetStatus(betId: string, status: string): Promise<void>;
  updateBet(betId: string, updates: Partial<Bet>): Promise<void>;
  getAllBets(): Promise<(Bet & { user: User, fixture: Fixture | null })[]>;
  
  // Deposit operations
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  createUserDeposit(deposit: { userId: string, amount: string, method: string, createdAt: string, status: string }): Promise<Deposit>;
  getUserDeposits(userId: string): Promise<Deposit[]>;
  getAllDeposits(): Promise<(Deposit & { user: User })[]>;
  updateDepositStatus(depositId: string, status: string): Promise<void>;
  
  // Withdrawal operations
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  createUserWithdrawal(withdrawal: { userId: string, amount: string, method: string, address: string, createdAt: string, status: string }): Promise<Withdrawal>;
  getUserWithdrawals(userId: string): Promise<Withdrawal[]>;
  getAllWithdrawals(): Promise<(Withdrawal & { user: User })[]>;
  updateWithdrawalStatus(withdrawalId: string, status: string, adminNote?: string): Promise<void>;
  
  // Admin operations
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  setAdminSetting(key: string, value: string): Promise<void>;
  createAdminTransaction(transaction: Omit<TransactionAdmin, 'id' | 'createdAt'>): Promise<TransactionAdmin>;
  
  // Statistics
  getUserStats(userId: string): Promise<{ totalBets: number, winRate: number, totalProfit: string }>;
  getUserWithdrawalStats(userId: string): Promise<{ withdrawals: (Withdrawal & { user: User })[], totalAmount: string, count: number }>;
  getSystemStats(): Promise<{ totalUsers: number, totalBets: number, totalDeposits: string, totalWithdrawals: string }>;
  updateSystemStats(stats: { totalDeposits?: string, totalWithdrawals?: string }): Promise<void>;
  getAllBetsWithDetails(): Promise<(Bet & { user: User, fixture: Fixture })[]>;
  getUserFullStats(userId: string): Promise<{ 
    user: User, 
    totalBets: number, 
    winRate: number, 
    totalProfit: string,
    deposits: (Deposit & { user: User })[],
    withdrawals: (Withdrawal & { user: User })[],
    bets: (Bet & { fixture: Fixture })[]
  }>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool: pool as any,
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByAccountId(accountId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.accountId, accountId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { accountId: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId));
  }

  async updateUserBalance(userId: string, newBalance: string): Promise<void> {
    await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId));
  }

  async updateUserStats(userId: string, stats: { winRate?: string, totalBetsPlaced?: number, totalWinsCount?: number, totalLossesCount?: number, totalProfit?: string, adminNotes?: string, vipLevel?: number }): Promise<void> {
    await db
      .update(users)
      .set(stats)
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getFixtures(sport?: string, limit: number = 50): Promise<Fixture[]> {
    let query = db.select().from(fixtures);
    
    if (sport && sport !== 'all') {
      // Show only scheduled and live matches - NO finished matches
      query = query.where(
        and(
          eq(fixtures.sport, sport),
          or(
            eq(fixtures.status, 'scheduled'),
            eq(fixtures.status, 'live')
          )
        )
      ) as any;
    } else if (sport === 'all' || !sport) {
      // For "all" category, show only scheduled and live matches
      query = query.where(
        or(
          eq(fixtures.status, 'scheduled'),
          eq(fixtures.status, 'live')
        )
      ) as any;
    }
    
    return await query.orderBy(fixtures.startTime).limit(limit);
  }

  async getAllFixtures(limit: number = 100): Promise<Fixture[]> {
    // For admin - show ALL fixtures including finished
    return await db.select().from(fixtures).orderBy(desc(fixtures.createdAt)).limit(limit);
  }

  async getLiveFixtures(sport?: string): Promise<Fixture[]> {
    if (sport && sport !== 'all') {
      return await db.select()
        .from(fixtures)
        .where(and(eq(fixtures.isLive, true), eq(fixtures.sport, sport)))
        .orderBy(fixtures.startTime);
    }
    
    return await db.select()
      .from(fixtures)
      .where(eq(fixtures.isLive, true))
      .orderBy(fixtures.startTime);
  }

  async getFixture(id: string): Promise<Fixture | undefined> {
    const [fixture] = await db.select().from(fixtures).where(eq(fixtures.id, id));
    return fixture || undefined;
  }

  async getFixtureByApiRef(apiRef: string): Promise<Fixture | undefined> {
    const [fixture] = await db.select().from(fixtures).where(eq(fixtures.apiRef, apiRef));
    return fixture || undefined;
  }

  async createFixture(fixture: InsertFixture): Promise<Fixture> {
    const [newFixture] = await db
      .insert(fixtures)
      .values(fixture)
      .returning();
    return newFixture;
  }

  async updateFixture(id: string, updates: Partial<Fixture>): Promise<void> {
    await db
      .update(fixtures)
      .set(updates)
      .where(eq(fixtures.id, id));
  }

  async updateLiveMatchMinutes(): Promise<void> {
    // Get all live matches
    const liveMatches = await db.select().from(fixtures).where(eq(fixtures.isLive, true));
    
    for (const match of liveMatches) {
      const maxMinutes = match.sport === 'football' ? 90 : match.sport === 'basketball' ? 48 : 180; // tennis can be longer
      
      if ((match.currentMinute || 0) < maxMinutes) {
        await db.update(fixtures)
          .set({ currentMinute: (match.currentMinute || 0) + 1 })
          .where(eq(fixtures.id, match.id));
      }
    }
  }

  async deleteFixture(id: string): Promise<void> {
    await db.delete(fixtures).where(eq(fixtures.id, id));
  }

  async updateFixtureOdds(id: string, odds: { 
    homeOdds?: string, 
    drawOdds?: string, 
    awayOdds?: string,
    overOdds?: string,
    underOdds?: string,
    totalLine?: string 
  }): Promise<void> {
    await db
      .update(fixtures)
      .set(odds)
      .where(eq(fixtures.id, id));
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    const [newBet] = await db
      .insert(bets)
      .values(bet as any)
      .returning();
    return newBet;
  }

  async getUserBets(userId: string, limit: number = 20): Promise<(Bet & { fixture: Fixture | null })[]> {
    const result = await db
      .select()
      .from(bets)
      .leftJoin(fixtures, eq(bets.fixtureId, fixtures.id))
      .where(eq(bets.userId, userId))
      .orderBy(desc(bets.placedAt))
      .limit(limit);
    
    return result.map((row: any) => ({
      bets: {
        id: row.bets.id,
        userId: row.bets.userId,
        fixtureId: row.bets.fixtureId,
        market: row.bets.market,
        odds: row.bets.odds,
        stake: row.bets.stake,
        potentialWin: row.bets.potentialWin,
        status: row.bets.status,
        placedAt: row.bets.placedAt,
        createdAt: row.bets.createdAt,
        customHomeTeam: row.bets.customHomeTeam,
        customAwayTeam: row.bets.customAwayTeam,
        customLeague: row.bets.customLeague,
        customHomeScore: row.bets.customHomeScore,
        customAwayScore: row.bets.customAwayScore,
        customMatchDate: row.bets.customMatchDate
      },
      fixture: row.fixtures
    })) as any;
  }

  async updateBetStatus(betId: string, status: string): Promise<void> {
    await db
      .update(bets)
      .set({ status })
      .where(eq(bets.id, betId));
  }

  async updateBet(betId: string, updates: Partial<Bet>): Promise<void> {
    await db
      .update(bets)
      .set(updates)
      .where(eq(bets.id, betId));
  }

  async getAllBets(): Promise<(Bet & { user: User, fixture: Fixture | null })[]> {
    return await db
      .select()
      .from(bets)
      .innerJoin(users, eq(bets.userId, users.id))
      .leftJoin(fixtures, eq(bets.fixtureId, fixtures.id))
      .orderBy(desc(bets.placedAt)) as any;
  }

  async createDeposit(deposit: InsertDeposit): Promise<Deposit> {
    const [newDeposit] = await db
      .insert(deposits)
      .values(deposit)
      .returning();
    return newDeposit;
  }

  async createUserDeposit(deposit: { userId: string, amount: string, method: string, createdAt: string, status: string }): Promise<Deposit> {
    const [newDeposit] = await db
      .insert(deposits)
      .values({
        userId: deposit.userId,
        amount: deposit.amount,
        method: deposit.method,
        status: deposit.status,
        createdAt: new Date(deposit.createdAt)
      })
      .returning();
    return newDeposit;
  }

  async getUserDeposits(userId: string): Promise<Deposit[]> {
    return await db
      .select()
      .from(deposits)
      .where(eq(deposits.userId, userId))
      .orderBy(desc(deposits.createdAt));
  }

  async getAllDeposits(): Promise<(Deposit & { user: User })[]> {
    return await db
      .select()
      .from(deposits)
      .innerJoin(users, eq(deposits.userId, users.id))
      .orderBy(desc(deposits.createdAt)) as any;
  }

  async updateDepositStatus(depositId: string, status: string): Promise<void> {
    await db
      .update(deposits)
      .set({ status })
      .where(eq(deposits.id, depositId));
  }

  async updateDeposit(depositId: string, updates: { amount?: string; method?: string; status?: string; txId?: string }): Promise<void> {
    await db
      .update(deposits)
      .set(updates)
      .where(eq(deposits.id, depositId));
  }

  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [newWithdrawal] = await db
      .insert(withdrawals)
      .values(withdrawal)
      .returning();
    return newWithdrawal;
  }

  async createUserWithdrawal(withdrawal: { userId: string, amount: string, method: string, address: string, createdAt: string, status: string }): Promise<Withdrawal> {
    const [newWithdrawal] = await db
      .insert(withdrawals)
      .values({
        userId: withdrawal.userId,
        amount: withdrawal.amount,
        method: withdrawal.method,
        address: withdrawal.address,
        status: withdrawal.status,
        createdAt: new Date(withdrawal.createdAt)
      })
      .returning();
    return newWithdrawal;
  }

  async getUserWithdrawals(userId: string): Promise<Withdrawal[]> {
    return await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.createdAt));
  }

  async getAllWithdrawals(): Promise<(Withdrawal & { user: User })[]> {
    return await db
      .select()
      .from(withdrawals)
      .innerJoin(users, eq(withdrawals.userId, users.id))
      .orderBy(desc(withdrawals.createdAt)) as any;
  }

  async updateWithdrawalStatus(withdrawalId: string, status: string, adminNote?: string): Promise<void> {
    const updates: any = { status };
    if (adminNote) updates.adminNote = adminNote;
    if (status === 'processed') updates.processedAt = new Date();
    
    await db
      .update(withdrawals)
      .set(updates)
      .where(eq(withdrawals.id, withdrawalId));
  }

  async updateWithdrawal(withdrawalId: string, updates: { amount?: string; method?: string; status?: string; address?: string }): Promise<void> {
    await db
      .update(withdrawals)
      .set(updates)
      .where(eq(withdrawals.id, withdrawalId));
  }

  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    const [setting] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    return setting || undefined;
  }

  async setAdminSetting(key: string, value: string): Promise<void> {
    await db
      .insert(adminSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: adminSettings.key,
        set: { value, updatedAt: new Date() }
      });
  }

  async createAdminTransaction(transaction: Omit<TransactionAdmin, 'id' | 'createdAt'>): Promise<TransactionAdmin> {
    const [newTransaction] = await db
      .insert(transactionsAdmin)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserStats(userId: string): Promise<{ totalBets: number, winRate: number, totalProfit: string }> {
    const userBets = await db.select().from(bets).where(eq(bets.userId, userId));
    const totalBets = userBets.length;
    const wonBets = userBets.filter(bet => bet.status === 'won').length;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    
    const totalProfit = userBets.reduce((sum, bet) => {
      if (bet.status === 'won') {
        return sum + (parseFloat(bet.potentialWin) - parseFloat(bet.stake));
      } else if (bet.status === 'lost') {
        return sum - parseFloat(bet.stake);
      }
      return sum;
    }, 0);

    return {
      totalBets,
      winRate: Math.round(winRate),
      totalProfit: totalProfit.toFixed(2)
    };
  }

  async getUserWithdrawalStats(userId: string): Promise<{ withdrawals: (Withdrawal & { user: User })[], totalAmount: string, count: number }> {
    const userWithdrawals = await db
      .select()
      .from(withdrawals)
      .innerJoin(users, eq(withdrawals.userId, users.id))
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.createdAt)) as any;

    const totalAmount = userWithdrawals.reduce((sum: number, w: any) => {
      return sum + parseFloat(w.amount || '0');
    }, 0);

    return {
      withdrawals: userWithdrawals,
      totalAmount: totalAmount.toFixed(2),
      count: userWithdrawals.length
    };
  }

  async getSystemStats(): Promise<{ totalUsers: number, totalBets: number, totalDeposits: string, totalWithdrawals: string }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [betCount] = await db.select({ count: sql<number>`count(*)` }).from(bets);
    
    // Check for custom stats first, fallback to calculated stats
    const customDepositsStr = await this.getAdminSetting('totalDeposits');
    const customWithdrawalsStr = await this.getAdminSetting('totalWithdrawals');
    
    let totalDeposits = '0';
    let totalWithdrawals = '0';
    
    if (customDepositsStr?.value) {
      totalDeposits = customDepositsStr.value;
    } else {
      const [depositSum] = await db.select({ 
        sum: sql<string>`coalesce(sum(amount), '0')` 
      }).from(deposits).where(eq(deposits.status, 'confirmed'));
      totalDeposits = depositSum.sum;
    }
    
    if (customWithdrawalsStr?.value) {
      totalWithdrawals = customWithdrawalsStr.value;
    } else {
      const [withdrawalSum] = await db.select({ 
        sum: sql<string>`coalesce(sum(amount), '0')` 
      }).from(withdrawals).where(eq(withdrawals.status, 'processed'));
      totalWithdrawals = withdrawalSum.sum;
    }

    return {
      totalUsers: userCount.count,
      totalBets: betCount.count,
      totalDeposits,
      totalWithdrawals
    };
  }

  async updateSystemStats(stats: { totalDeposits?: string, totalWithdrawals?: string }): Promise<void> {
    if (stats.totalDeposits !== undefined) {
      await this.setAdminSetting('totalDeposits', stats.totalDeposits);
    }
    
    if (stats.totalWithdrawals !== undefined) {
      await this.setAdminSetting('totalWithdrawals', stats.totalWithdrawals);
    }
  }

  async getAllBetsWithDetails(): Promise<(Bet & { user: User, fixture: Fixture })[]> {
    return await db.select({
      id: bets.id,
      userId: bets.userId,
      fixtureId: bets.fixtureId,
      market: bets.market,
      odds: bets.odds,
      stake: bets.stake,
      potentialWin: bets.potentialWin,
      status: bets.status,
      placedAt: bets.placedAt,
      user: {
        id: users.id,
        email: users.email,
        accountId: users.accountId,
        balance: users.balance,
        isAdmin: users.isAdmin,
        isActive: users.isActive,
        createdAt: users.createdAt
      },
      fixture: {
        id: fixtures.id,
        homeTeam: fixtures.homeTeam,
        awayTeam: fixtures.awayTeam,
        league: fixtures.league,
        sport: fixtures.sport,
        homeScore: fixtures.homeScore,
        awayScore: fixtures.awayScore,
        status: fixtures.status,
        isLive: fixtures.isLive,
        startTime: fixtures.startTime,
        homeOdds: fixtures.homeOdds,
        drawOdds: fixtures.drawOdds,
        awayOdds: fixtures.awayOdds,
        currentMinute: fixtures.currentMinute,
        createdAt: fixtures.createdAt
      }
    })
    .from(bets)
    .leftJoin(users, eq(bets.userId, users.id))
    .leftJoin(fixtures, eq(bets.fixtureId, fixtures.id))
    .orderBy(desc(bets.placedAt)) as any;
  }

  async getUserFullStats(userId: string): Promise<{ 
    user: User, 
    totalBets: number, 
    winRate: number, 
    totalProfit: string,
    deposits: (Deposit & { user: User })[],
    withdrawals: (Withdrawal & { user: User })[],
    bets: (Bet & { fixture: Fixture })[]
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error('User not found');

    const userStats = await this.getUserStats(userId);
    const userWithdrawals = await this.getUserWithdrawalStats(userId);
    
    const userDeposits = await db.select({
      id: deposits.id,
      userId: deposits.userId,
      amount: deposits.amount,
      method: deposits.method,
      txId: deposits.txId,
      status: deposits.status,
      createdAt: deposits.createdAt,
      user: {
        id: users.id,
        email: users.email,
        accountId: users.accountId,
        balance: users.balance,
        isAdmin: users.isAdmin,
        isActive: users.isActive,
        createdAt: users.createdAt
      }
    })
    .from(deposits)
    .leftJoin(users, eq(deposits.userId, users.id))
    .where(eq(deposits.userId, userId))
    .orderBy(desc(deposits.createdAt)) as any;

    const userBets = await db.select({
      id: bets.id,
      userId: bets.userId,
      fixtureId: bets.fixtureId,
      market: bets.market,
      odds: bets.odds,
      stake: bets.stake,
      potentialWin: bets.potentialWin,
      status: bets.status,
      placedAt: bets.placedAt,
      fixture: {
        id: fixtures.id,
        homeTeam: fixtures.homeTeam,
        awayTeam: fixtures.awayTeam,
        league: fixtures.league,
        sport: fixtures.sport,
        homeScore: fixtures.homeScore,
        awayScore: fixtures.awayScore,
        status: fixtures.status,
        isLive: fixtures.isLive,
        startTime: fixtures.startTime,
        homeOdds: fixtures.homeOdds,
        drawOdds: fixtures.drawOdds,
        awayOdds: fixtures.awayOdds,
        currentMinute: fixtures.currentMinute,
        createdAt: fixtures.createdAt
      }
    })
    .from(bets)
    .leftJoin(fixtures, eq(bets.fixtureId, fixtures.id))
    .where(eq(bets.userId, userId))
    .orderBy(desc(bets.placedAt)) as any;

    return {
      user,
      totalBets: userStats.totalBets,
      winRate: userStats.winRate,
      totalProfit: userStats.totalProfit,
      deposits: userDeposits,
      withdrawals: userWithdrawals.withdrawals,
      bets: userBets
    };
  }
}

export const storage = new DatabaseStorage();
