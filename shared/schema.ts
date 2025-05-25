import { 
  pgTable, 
  text, 
  serial, 
  varchar, 
  timestamp, 
  jsonb, 
  boolean, 
  integer, 
  real, 
  uuid,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").default("subscriber").notNull(), // subscriber, investigator, admin
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  company: varchar("company"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investigators table
export const investigators = pgTable("investigators", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  specialization: varchar("specialization").notNull(),
  bio: text("bio").notNull(),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  available: boolean("available").default(true),
  nextAvailability: varchar("next_availability"),
  skills: text("skills").array().notNull(), // Array of skills
  location: varchar("location"),
  yearsOfExperience: integer("years_of_experience"),
  licensedStates: text("licensed_states").array(), // Array of states
  experience: text("experience"),
  education: text("education"),
  specializedTools: text("specialized_tools").array(), // Array of tools
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  investigatorId: uuid("investigator_id").references(() => investigators.id),
  clientId: uuid("client_id").references(() => users.id),
  clientName: varchar("client_name").notNull(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  date: timestamp("date").defaultNow(),
  caseType: varchar("case_type"),
});

// Cases table
export const cases = pgTable("cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  investigatorId: uuid("investigator_id").references(() => investigators.id),
  status: varchar("status").notNull(), // Pending, In Progress, Awaiting Info, Review Needed, Completed, Cancelled
  type: varchar("type").notNull(), // background-check, asset-search, fraud-investigation, etc.
  priority: varchar("priority").notNull(), // low, medium, high
  location: varchar("location"),
  budget: varchar("budget"),
  timeframe: varchar("timeframe"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
  updates: jsonb("updates").default([]),
});

// Messages table
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id").references(() => cases.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  senderName: varchar("sender_name").notNull(),
  senderAvatar: varchar("sender_avatar"),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  plan: varchar("plan").notNull(), // Basic, Pro, Enterprise
  amount: integer("amount").notNull(),
  billingCycle: varchar("billing_cycle").notNull(), // monthly, annually
  status: varchar("status").notNull(), // active, cancelled, expired
  startDate: timestamp("start_date").notNull(),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  cancelledAt: timestamp("cancelled_at"),
});

// Schema definitions with Zod
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["subscriber", "investigator", "admin"]).default("subscriber"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const loginUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createCaseSchema = createInsertSchema(cases, {
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description must be less than 1000 characters"),
  type: z.string().min(1, "Please select a case type"),
  priority: z.string().min(1, "Please select a priority level"),
}).omit({ id: true, userId: true, status: true, createdAt: true, lastActivity: true });

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

export const subscriptionPlanSchema = z.object({
  plan: z.enum(["Basic", "Pro", "Enterprise"]),
  interval: z.enum(["month", "year"]),
});

export const investigatorFilterSchema = z.object({
  search: z.string().optional(),
  specialization: z.string().optional(),
  available: z.enum(["available", "unavailable", ""]).optional(),
  rating: z.string().optional(),
  skills: z.array(z.string()).optional(),
}).partial();

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Case = typeof cases.$inferSelect & {
  investigator?: Investigator;
};
export type InsertCase = typeof cases.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect & {
  casesUsed?: number;
  remainingCases?: number;
};
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export type Investigator = typeof investigators.$inferSelect & {
  reviews?: Review[];
};
export type InsertInvestigator = typeof investigators.$inferInsert;

export type InvestigatorFilters = z.infer<typeof investigatorFilterSchema>;
