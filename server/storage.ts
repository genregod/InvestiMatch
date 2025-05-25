import { 
  users, cases, subscriberProfiles, investigatorProfiles, 
  reviews, messages, payments, subscriptions, notifications,
  type User, type UpsertUser, type Case, type InsertCase,
  type SubscriberProfile, type InsertSubscriberProfile,
  type InvestigatorProfile, type InsertInvestigatorProfile,
  type Review, type InsertReview, type Message, type InsertMessage,
  type Payment, type InsertPayment, type Subscription, type InsertSubscription,
  type Notification, type InsertNotification,
  USER_ROLES, SUBSCRIPTION_PLANS
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, desc, or, isNull, isNotNull } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Subscriber profile operations
  getSubscriberProfile(userId: string): Promise<SubscriberProfile | undefined>;
  createSubscriberProfile(profile: InsertSubscriberProfile): Promise<SubscriberProfile>;
  updateSubscriberProfile(userId: string, profile: Partial<InsertSubscriberProfile>): Promise<SubscriberProfile | undefined>;
  
  // Investigator profile operations
  getInvestigatorProfile(userId: string): Promise<InvestigatorProfile | undefined>;
  createInvestigatorProfile(profile: InsertInvestigatorProfile): Promise<InvestigatorProfile>;
  updateInvestigatorProfile(userId: string, profile: Partial<InsertInvestigatorProfile>): Promise<InvestigatorProfile | undefined>;
  listInvestigators(search?: string, specialization?: string, location?: string, isAvailable?: boolean): Promise<(InvestigatorProfile & { user: User })[]>;
  
  // Case operations
  getCase(id: number): Promise<Case | undefined>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: number, caseData: Partial<InsertCase>): Promise<Case | undefined>;
  listCasesByClient(clientId: string): Promise<Case[]>;
  listCasesByInvestigator(investigatorId: string): Promise<Case[]>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByInvestigator(investigatorId: string): Promise<Review[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByCase(caseId: number): Promise<Message[]>;
  getUnreadMessageCount(userId: string): Promise<number>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  
  // Subscription operations
  getSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(userId: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  
  // Dashboard operations
  getDashboardStats(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Subscriber profile operations
  async getSubscriberProfile(userId: string): Promise<SubscriberProfile | undefined> {
    const [profile] = await db
      .select()
      .from(subscriberProfiles)
      .where(eq(subscriberProfiles.userId, userId));
    return profile;
  }

  async createSubscriberProfile(profile: InsertSubscriberProfile): Promise<SubscriberProfile> {
    const [subscriberProfile] = await db
      .insert(subscriberProfiles)
      .values(profile)
      .returning();
    return subscriberProfile;
  }

  async updateSubscriberProfile(
    userId: string,
    profile: Partial<InsertSubscriberProfile>
  ): Promise<SubscriberProfile | undefined> {
    const [updatedProfile] = await db
      .update(subscriberProfiles)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(subscriberProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Investigator profile operations
  async getInvestigatorProfile(userId: string): Promise<InvestigatorProfile | undefined> {
    const [profile] = await db
      .select()
      .from(investigatorProfiles)
      .where(eq(investigatorProfiles.userId, userId));
    return profile;
  }

  async createInvestigatorProfile(profile: InsertInvestigatorProfile): Promise<InvestigatorProfile> {
    const [investigatorProfile] = await db
      .insert(investigatorProfiles)
      .values(profile)
      .returning();
    return investigatorProfile;
  }

  async updateInvestigatorProfile(
    userId: string,
    profile: Partial<InsertInvestigatorProfile>
  ): Promise<InvestigatorProfile | undefined> {
    const [updatedProfile] = await db
      .update(investigatorProfiles)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(investigatorProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async listInvestigators(
    search?: string,
    specialization?: string,
    location?: string,
    isAvailable?: boolean
  ): Promise<(InvestigatorProfile & { user: User })[]> {
    let query = db
      .select({
        profile: investigatorProfiles,
        user: users,
      })
      .from(investigatorProfiles)
      .innerJoin(users, eq(investigatorProfiles.userId, users.id));

    // Apply filters if provided
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(investigatorProfiles.title, `%${search}%`),
          like(investigatorProfiles.bio, `%${search}%`)
        )
      );
    }

    if (specialization) {
      // Note: This is a simplification. In a real DB you'd need a more sophisticated approach for array contains
      conditions.push(like(investigatorProfiles.specializations.toString(), `%${specialization}%`));
    }

    if (location) {
      conditions.push(like(investigatorProfiles.location, `%${location}%`));
    }

    if (isAvailable !== undefined) {
      conditions.push(eq(investigatorProfiles.isAvailable, isAvailable));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(investigatorProfiles.averageRating));

    return results.map(({ profile, user }) => ({
      ...profile,
      user,
    }));
  }

  // Case operations
  async getCase(id: number): Promise<Case | undefined> {
    const [caseItem] = await db.select().from(cases).where(eq(cases.id, id));
    return caseItem;
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const [newCase] = await db.insert(cases).values(caseData).returning();
    return newCase;
  }

  async updateCase(id: number, caseData: Partial<InsertCase>): Promise<Case | undefined> {
    const [updatedCase] = await db
      .update(cases)
      .set({
        ...caseData,
        updatedAt: new Date(),
      })
      .where(eq(cases.id, id))
      .returning();
    return updatedCase;
  }

  async listCasesByClient(clientId: string): Promise<Case[]> {
    return db.select().from(cases).where(eq(cases.clientId, clientId));
  }

  async listCasesByInvestigator(investigatorId: string): Promise<Case[]> {
    return db.select().from(cases).where(eq(cases.investigatorId, investigatorId));
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update investigator's average rating
    const investigatorReviews = await this.getReviewsByInvestigator(review.investigatorId);
    const averageRating = investigatorReviews.reduce((sum, review) => sum + review.rating, 0) / investigatorReviews.length;
    
    await db
      .update(investigatorProfiles)
      .set({ 
        averageRating, 
        reviewCount: investigatorReviews.length,
        updatedAt: new Date() 
      })
      .where(eq(investigatorProfiles.userId, review.investigatorId));
    
    return newReview;
  }

  async getReviewsByInvestigator(investigatorId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.investigatorId, investigatorId));
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessagesByCase(caseId: number): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.caseId, caseId)).orderBy(messages.createdAt);
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));
    return result.length;
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  // Subscription operations
  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.isActive, true)))
      .orderBy(desc(subscriptions.createdAt));
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(
    userId: string,
    subscription: Partial<InsertSubscription>
  ): Promise<Subscription | undefined> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        ...subscription,
        updatedAt: new Date(),
      })
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.isActive, true)))
      .returning();
    return updatedSubscription;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({
        isRead: true,
      })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.length;
  }

  // Dashboard operations
  async getDashboardStats(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.role === USER_ROLES.SUBSCRIBER) {
      const subscriberProfile = await this.getSubscriberProfile(userId);
      const activeCases = await db
        .select()
        .from(cases)
        .where(and(eq(cases.clientId, userId), or(eq(cases.status, 'active'), eq(cases.status, 'new'))))
        .orderBy(desc(cases.createdAt));
      
      const unreadMessages = await this.getUnreadMessageCount(userId);
      const activeInvestigators = await db
        .select()
        .from(cases)
        .where(and(
          eq(cases.clientId, userId),
          or(eq(cases.status, 'active'), eq(cases.status, 'new')),
          isNotNull(cases.investigatorId)
        ))
        .groupBy(cases.investigatorId);
      
      const subscription = await this.getSubscription(userId);
      
      return {
        activeCasesCount: activeCases.length,
        casesRemaining: subscriberProfile?.casesRemaining || 0,
        unreadMessagesCount: unreadMessages,
        activeInvestigatorsCount: activeInvestigators.length,
        subscription,
        cases: activeCases
      };
    } else if (user.role === USER_ROLES.INVESTIGATOR) {
      const investigatorProfile = await this.getInvestigatorProfile(userId);
      const activeCases = await db
        .select()
        .from(cases)
        .where(and(eq(cases.investigatorId, userId), or(eq(cases.status, 'active'), eq(cases.status, 'new'))))
        .orderBy(desc(cases.createdAt));
      
      const unreadMessages = await this.getUnreadMessageCount(userId);
      const pendingPayments = await db
        .select()
        .from(payments)
        .where(and(eq(payments.investigatorId, userId), eq(payments.status, 'pending')));
      
      return {
        activeCasesCount: activeCases.length,
        unreadMessagesCount: unreadMessages,
        pendingPaymentsCount: pendingPayments.length,
        investigatorProfile,
        cases: activeCases
      };
    } else if (user.role === USER_ROLES.ADMIN) {
      const totalUsers = await db.select().from(users).groupBy(users.role);
      const totalCases = await db.select().from(cases).groupBy(cases.status);
      const totalPayments = await db.select().from(payments).groupBy(payments.status);
      
      return {
        userStats: totalUsers,
        caseStats: totalCases,
        paymentStats: totalPayments
      };
    }
    
    return {};
  }
}

export const storage = new DatabaseStorage();
