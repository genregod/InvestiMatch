import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  integer,
  boolean,
  real,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User roles
export const USER_ROLES = {
  SUBSCRIBER: "subscriber",
  INVESTIGATOR: "investigator",
  ADMIN: "admin",
} as const;

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  BASIC: "basic",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

// Case statuses
export const CASE_STATUS = {
  NEW: "new",
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

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

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default(USER_ROLES.SUBSCRIBER),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  subscriberProfile: one(subscriberProfiles, {
    fields: [users.id],
    references: [subscriberProfiles.userId],
  }),
  investigatorProfile: one(investigatorProfiles, {
    fields: [users.id],
    references: [investigatorProfiles.userId],
  }),
  cases: many(cases),
  messages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
}));

// Subscriber profiles
export const subscriberProfiles = pgTable("subscriber_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  company: varchar("company"),
  subscriptionPlan: text("subscription_plan").notNull().default(SUBSCRIPTION_PLANS.BASIC),
  subscriptionRenewalDate: timestamp("subscription_renewal_date"),
  paymentMethod: varchar("payment_method"),
  casesRemaining: integer("cases_remaining").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriber profile relations
export const subscriberProfilesRelations = relations(subscriberProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriberProfiles.userId],
    references: [users.id],
  }),
  cases: many(cases),
}));

// Investigator profiles
export const investigatorProfiles = pgTable("investigator_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  title: varchar("title"),
  bio: text("bio"),
  yearsOfExperience: integer("years_of_experience"),
  location: varchar("location"),
  isAvailable: boolean("is_available").notNull().default(true),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").notNull().default(0),
  specializations: text("specializations").array(),
  skills: text("skills").array(),
  hourlyRate: real("hourly_rate"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investigator profile relations
export const investigatorProfilesRelations = relations(investigatorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [investigatorProfiles.userId],
    references: [users.id],
  }),
  assignedCases: many(cases),
  reviews: many(reviews),
}));

// Cases table
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default(CASE_STATUS.NEW),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  investigatorId: varchar("investigator_id").references(() => users.id),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  location: varchar("location"),
  caseType: varchar("case_type").notNull(),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cases relations
export const casesRelations = relations(cases, ({ one, many }) => ({
  client: one(users, {
    fields: [cases.clientId],
    references: [users.id],
  }),
  investigator: one(users, {
    fields: [cases.investigatorId],
    references: [users.id],
  }),
  messages: many(messages),
  payments: many(payments),
}));

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  investigatorId: varchar("investigator_id").references(() => users.id).notNull(),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  caseId: integer("case_id").references(() => cases.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  investigator: one(users, {
    fields: [reviews.investigatorId],
    references: [users.id],
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.id],
  }),
  case: one(cases, {
    fields: [reviews.caseId],
    references: [cases.id],
  }),
}));

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  caseId: integer("case_id").references(() => cases.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages relations
export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    relationName: "sender",
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    relationName: "receiver",
    fields: [messages.receiverId],
    references: [users.id],
  }),
  case: one(cases, {
    fields: [messages.caseId],
    references: [cases.id],
  }),
}));

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id).notNull(),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  investigatorId: varchar("investigator_id").references(() => users.id).notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull().default(PAYMENT_STATUS.PENDING),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  case: one(cases, {
    fields: [payments.caseId],
    references: [cases.id],
  }),
  client: one(users, {
    fields: [payments.clientId],
    references: [users.id],
  }),
  investigator: one(users, {
    fields: [payments.investigatorId],
    references: [users.id],
  }),
}));

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  plan: text("plan").notNull().default(SUBSCRIPTION_PLANS.BASIC),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  autoRenew: boolean("auto_renew").notNull().default(true),
  paymentId: varchar("payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriptions relations
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  link: varchar("link"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insertion schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertSubscriberProfileSchema = createInsertSchema(subscriberProfiles).pick({
  userId: true,
  company: true,
  subscriptionPlan: true,
  paymentMethod: true,
});

export const insertInvestigatorProfileSchema = createInsertSchema(investigatorProfiles).pick({
  userId: true,
  title: true,
  bio: true,
  yearsOfExperience: true,
  location: true,
  specializations: true,
  skills: true,
  hourlyRate: true,
});

export const insertCaseSchema = createInsertSchema(cases).pick({
  title: true,
  description: true,
  clientId: true,
  investigatorId: true,
  location: true,
  caseType: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  investigatorId: true,
  clientId: true,
  caseId: true,
  rating: true,
  comment: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  caseId: true,
  content: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  caseId: true,
  clientId: true,
  investigatorId: true,
  amount: true,
  status: true,
  transactionId: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  plan: true,
  startDate: true,
  endDate: true,
  autoRenew: true,
  paymentId: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  content: true,
  link: true,
});

// Type definitions
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type SubscriberProfile = typeof subscriberProfiles.$inferSelect;
export type InsertSubscriberProfile = z.infer<typeof insertSubscriberProfileSchema>;
export type InvestigatorProfile = typeof investigatorProfiles.$inferSelect;
export type InsertInvestigatorProfile = z.infer<typeof insertInvestigatorProfileSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
