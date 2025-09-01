import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id", { length: 20 }).notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  bonusBalance: decimal("bonus_balance", { precision: 10, scale: 2 }).default("0.00"),
  hasClaimedWelcomeBonus: boolean("has_claimed_welcome_bonus").default(false),
  totalBonusReceived: decimal("total_bonus_received", { precision: 10, scale: 2 }).default("0.00"),
  language: varchar("language", { length: 2 }).default("th"),
  isAdmin: boolean("is_admin").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  // Admin editable stats
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0.00"),
  totalBetsPlaced: integer("total_bets_placed").default(0),
  totalWinsCount: integer("total_wins_count").default(0),
  totalLossesCount: integer("total_losses_count").default(0),
  totalProfit: decimal("total_profit", { precision: 10, scale: 2 }).default("0.00"),
  adminNotes: text("admin_notes"),
  vipLevel: integer("vip_level").default(0),
});

export const fixtures = pgTable("fixtures", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sport: varchar("sport", { length: 50 }).notNull(),
  league: text("league").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  startTime: timestamp("start_time").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, live, finished, postponed
  homeOdds: decimal("home_odds", { precision: 5, scale: 2 }),
  drawOdds: decimal("draw_odds", { precision: 5, scale: 2 }),
  awayOdds: decimal("away_odds", { precision: 5, scale: 2 }),
  overOdds: decimal("over_odds", { precision: 5, scale: 2 }),
  underOdds: decimal("under_odds", { precision: 5, scale: 2 }),
  totalLine: decimal("total_line", { precision: 6, scale: 1 }), // e.g., 2.5, 220.5
  currentMinute: integer("current_minute").default(0), // текущая минута матча
  apiRef: text("api_ref"),
  isLive: boolean("is_live").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bets = pgTable("bets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  fixtureId: uuid("fixture_id").references(() => fixtures.id), // Сделаем необязательным для ручных ставок
  market: varchar("market", { length: 50 }).notNull(), // home, draw, away, over, under
  odds: decimal("odds", { precision: 5, scale: 2 }).notNull(),
  stake: decimal("stake", { precision: 10, scale: 2 }).notNull(),
  potentialWin: decimal("potential_win", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, won, lost, void
  placedAt: timestamp("placed_at").defaultNow(),
  // Дополнительные поля для ручного ввода информации о матче
  customHomeTeam: text("custom_home_team"),
  customAwayTeam: text("custom_away_team"),
  customLeague: text("custom_league"),
  customHomeScore: integer("custom_home_score"),
  customAwayScore: integer("custom_away_score"),
  customMatchDate: text("custom_match_date"),
  adminNotes: text("admin_notes"), // Заметки администратора к ставке
});

export const deposits = pgTable("deposits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  method: varchar("method", { length: 50 }).notNull(), // usdt-trc20, usdt-bep20, sol, thai-card
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  txId: text("tx_id"),
  walletAddress: text("wallet_address"),
  cardNumber: varchar("card_number", { length: 19 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending, confirmed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  method: varchar("method", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  address: text("address").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, processed, rejected
  adminNote: text("admin_note"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactionsAdmin = pgTable("transactions_admin", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 20 }).notNull(), // deposit, withdraw, balance_update
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  note: text("note"),
  adminId: uuid("admin_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bets: many(bets),
  deposits: many(deposits),
  withdrawals: many(withdrawals),
  adminTransactions: many(transactionsAdmin),
}));

export const fixturesRelations = relations(fixtures, ({ many }) => ({
  bets: many(bets),
}));

export const betsRelations = relations(bets, ({ one }) => ({
  user: one(users, { fields: [bets.userId], references: [users.id] }),
  fixture: one(fixtures, { fields: [bets.fixtureId], references: [fixtures.id] }),
}));

export const depositsRelations = relations(deposits, ({ one }) => ({
  user: one(users, { fields: [deposits.userId], references: [users.id] }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, { fields: [withdrawals.userId], references: [users.id] }),
}));

export const transactionsAdminRelations = relations(transactionsAdmin, ({ one }) => ({
  user: one(users, { fields: [transactionsAdmin.userId], references: [users.id] }),
  admin: one(users, { fields: [transactionsAdmin.adminId], references: [users.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  accountId: true,
  balance: true,
  isAdmin: true,
  isActive: true,
  createdAt: true,
});

export const insertFixtureSchema = createInsertSchema(fixtures).omit({
  id: true,
  createdAt: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  status: true,
  placedAt: true,
}).extend({
  // Make fixtureId optional for custom bets
  fixtureId: z.string().uuid().optional(),
  // Allow string inputs that will be converted to numbers
  odds: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  stake: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  potentialWin: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
});

// Admin version that allows setting status
export const insertAdminBetSchema = createInsertSchema(bets).omit({
  id: true,
  placedAt: true,
}).extend({
  // Make fixtureId optional for custom bets
  fixtureId: z.string().uuid().optional(),
  // Allow string inputs that will be converted to numbers
  odds: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  stake: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  potentialWin: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  // Admin can set status
  status: z.enum(['pending', 'won', 'lost', 'void']).default('pending'),
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  status: true,
  processedAt: true,
  createdAt: true,
  adminNote: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Fixture = typeof fixtures.$inferSelect;
export type InsertFixture = z.infer<typeof insertFixtureSchema>;
export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type InsertAdminBet = z.infer<typeof insertAdminBetSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type TransactionAdmin = typeof transactionsAdmin.$inferSelect;
