import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table for transactions
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'receita' or 'despesa'
  icon: varchar("icon", { length: 50 }).default("fas fa-circle"),
  color: varchar("color", { length: 7 }).default("#6B7280"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'receita' or 'despesa'
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Budgets table
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  budgetedAmount: decimal("budgeted_amount", { precision: 15, scale: 2 }).notNull(),
  period: varchar("period", { length: 10 }).notNull(), // 'mensal' or 'anual'
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI interactions table
export const aiInteractions = pgTable("ai_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
  aiInteractions: many(aiInteractions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  category: one(categories, { fields: [budgets.categoryId], references: [categories.id] }),
}));

export const aiInteractionsRelations = relations(aiInteractions, ({ one }) => ({
  user: one(users, { fields: [aiInteractions.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export const insertAiInteractionSchema = createInsertSchema(aiInteractions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;
export type AiInteraction = typeof aiInteractions.$inferSelect;

// Extended types with relations
export type TransactionWithCategory = Transaction & {
  category?: Category;
};

export type BudgetWithCategory = Budget & {
  category?: Category;
};
