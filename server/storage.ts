import { db } from "./db";
import { eq, desc, and, or, like, not, gte, lte } from "drizzle-orm";
import { 
  users,
  cases,
  investigators,
  messages,
  subscriptions,
  reviews,
  type User,
  type InsertUser,
  type Case,
  type InsertCase,
  type Message,
  type InsertMessage,
  type Subscription,
  type InsertSubscription,
  type Investigator,
  type InvestigatorFilters
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Case operations
  getCasesByUserId(userId: string): Promise<Case[]>;
  getActiveCasesByUserId(userId: string): Promise<Case[]>;
  getCaseById(id: string): Promise<Case | undefined>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: string, updates: Partial<Case>): Promise<Case>;
  deleteCase(id: string): Promise<void>;
  getCaseCountByUserId(userId: string): Promise<number>;
  getAllCases(): Promise<Case[]>;
  
  // Investigator operations
  getInvestigators(filters?: InvestigatorFilters): Promise<Investigator[]>;
  getTopInvestigators(): Promise<Investigator[]>;
  getInvestigatorById(id: string): Promise<Investigator | undefined>;
  
  // Message operations
  getMessagesByCaseId(caseId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Subscription operations
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription>;
  getAllSubscriptions(): Promise<Subscription[]>;
  
  // Admin operations
  getAdminStats(): Promise<{
    totalUsers: number;
    totalCases: number;
    totalInvestigators: number;
    totalSubscriptions: number;
    revenueByPlan: { plan: string; count: number; revenue: number }[];
    casesByStatus: { status: string; count: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // Case operations
  async getCasesByUserId(userId: string): Promise<Case[]> {
    const userCases = await db
      .select()
      .from(cases)
      .where(or(eq(cases.userId, userId), eq(cases.investigatorId, userId)))
      .orderBy(desc(cases.lastActivity));
      
    // For each case, fetch the investigator details
    const casesWithInvestigators = await Promise.all(
      userCases.map(async (caseItem) => {
        if (caseItem.investigatorId) {
          const investigator = await this.getInvestigatorById(caseItem.investigatorId);
          return {
            ...caseItem,
            investigator: investigator
          };
        }
        return caseItem;
      })
    );
    
    return casesWithInvestigators;
  }
  
  async getActiveCasesByUserId(userId: string): Promise<Case[]> {
    const activeCases = await db
      .select()
      .from(cases)
      .where(
        and(
          or(eq(cases.userId, userId), eq(cases.investigatorId, userId)),
          not(or(eq(cases.status, "Completed"), eq(cases.status, "Cancelled")))
        )
      )
      .orderBy(desc(cases.lastActivity));
      
    // For each case, fetch the investigator details
    const casesWithInvestigators = await Promise.all(
      activeCases.map(async (caseItem) => {
        if (caseItem.investigatorId) {
          const investigator = await this.getInvestigatorById(caseItem.investigatorId);
          return {
            ...caseItem,
            investigator: investigator
          };
        }
        return caseItem;
      })
    );
    
    return casesWithInvestigators;
  }
  
  async getCaseById(id: string): Promise<Case | undefined> {
    const [caseData] = await db.select().from(cases).where(eq(cases.id, id));
    
    if (!caseData) {
      return undefined;
    }
    
    // Fetch investigator if assigned
    if (caseData.investigatorId) {
      const investigator = await this.getInvestigatorById(caseData.investigatorId);
      return {
        ...caseData,
        investigator
      };
    }
    
    return caseData;
  }
  
  async createCase(caseData: InsertCase): Promise<Case> {
    const [newCase] = await db.insert(cases).values(caseData).returning();
    
    // Fetch investigator if assigned
    if (newCase.investigatorId) {
      const investigator = await this.getInvestigatorById(newCase.investigatorId);
      return {
        ...newCase,
        investigator
      };
    }
    
    return newCase;
  }
  
  async updateCase(id: string, updates: Partial<Case>): Promise<Case> {
    const [updatedCase] = await db
      .update(cases)
      .set(updates)
      .where(eq(cases.id, id))
      .returning();
      
    // Fetch investigator if assigned
    if (updatedCase.investigatorId) {
      const investigator = await this.getInvestigatorById(updatedCase.investigatorId);
      return {
        ...updatedCase,
        investigator
      };
    }
    
    return updatedCase;
  }
  
  async deleteCase(id: string): Promise<void> {
    await db.delete(cases).where(eq(cases.id, id));
  }
  
  async getCaseCountByUserId(userId: string): Promise<number> {
    const result = await db
      .select({ count: db.fn.count() })
      .from(cases)
      .where(eq(cases.userId, userId));
    
    return Number(result[0].count) || 0;
  }
  
  async getAllCases(): Promise<Case[]> {
    const allCases = await db.select().from(cases);
    
    // For each case, fetch the investigator details
    const casesWithInvestigators = await Promise.all(
      allCases.map(async (caseItem) => {
        if (caseItem.investigatorId) {
          const investigator = await this.getInvestigatorById(caseItem.investigatorId);
          return {
            ...caseItem,
            investigator: investigator
          };
        }
        return caseItem;
      })
    );
    
    return casesWithInvestigators;
  }
  
  // Investigator operations
  async getInvestigators(filters?: InvestigatorFilters): Promise<Investigator[]> {
    let query = db.select().from(investigators);
    
    if (filters) {
      if (filters.search) {
        query = query.where(
          or(
            like(investigators.firstName, `%${filters.search}%`),
            like(investigators.lastName, `%${filters.search}%`),
            like(investigators.specialization, `%${filters.search}%`)
          )
        );
      }
      
      if (filters.specialization) {
        query = query.where(like(investigators.specialization, `%${filters.specialization}%`));
      }
      
      if (filters.available === 'available') {
        query = query.where(eq(investigators.available, true));
      } else if (filters.available === 'unavailable') {
        query = query.where(eq(investigators.available, false));
      }
      
      if (filters.rating) {
        query = query.where(gte(investigators.rating, parseFloat(filters.rating)));
      }
      
      // Skill filtering would require a more complex query with JSON operators or a skills table
      // This is a simplified implementation
    }
    
    // Get investigators with reviews
    const investigatorsData = await query;
    
    return investigatorsData;
  }
  
  async getTopInvestigators(): Promise<Investigator[]> {
    return await db
      .select()
      .from(investigators)
      .orderBy(desc(investigators.rating))
      .limit(3);
  }
  
  async getInvestigatorById(id: string): Promise<Investigator | undefined> {
    const [investigator] = await db
      .select()
      .from(investigators)
      .where(eq(investigators.id, id));
      
    if (!investigator) {
      return undefined;
    }
    
    // Fetch reviews for this investigator
    const investigatorReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.investigatorId, id))
      .orderBy(desc(reviews.date));
      
    return {
      ...investigator,
      reviews: investigatorReviews
    };
  }
  
  // Message operations
  async getMessagesByCaseId(caseId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.caseId, caseId))
      .orderBy(messages.timestamp);
  }
  
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    
    return message;
  }
  
  // Subscription operations
  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active")
        )
      );
    
    return subscription;
  }
  
  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(subscriptionData)
      .returning();
    
    return subscription;
  }
  
  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set(updates)
      .where(eq(subscriptions.id, id))
      .returning();
    
    return updatedSubscription;
  }
  
  async getAllSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions);
  }
  
  // Admin operations
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalCases: number;
    totalInvestigators: number;
    totalSubscriptions: number;
    revenueByPlan: { plan: string; count: number; revenue: number }[];
    casesByStatus: { status: string; count: number }[];
  }> {
    // Get total counts
    const [userCount] = await db
      .select({ count: db.fn.count() })
      .from(users);
      
    const [caseCount] = await db
      .select({ count: db.fn.count() })
      .from(cases);
      
    const [investigatorCount] = await db
      .select({ count: db.fn.count() })
      .from(investigators);
      
    const [subscriptionCount] = await db
      .select({ count: db.fn.count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));
    
    // Get revenue by plan
    const activeSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));
      
    const revenueByPlan = [
      {
        plan: "Basic",
        count: activeSubscriptions.filter(s => s.plan === "Basic").length,
        revenue: activeSubscriptions
          .filter(s => s.plan === "Basic")
          .reduce((sum, s) => sum + s.amount, 0)
      },
      {
        plan: "Pro",
        count: activeSubscriptions.filter(s => s.plan === "Pro").length,
        revenue: activeSubscriptions
          .filter(s => s.plan === "Pro")
          .reduce((sum, s) => sum + s.amount, 0)
      },
      {
        plan: "Enterprise",
        count: activeSubscriptions.filter(s => s.plan === "Enterprise").length,
        revenue: activeSubscriptions
          .filter(s => s.plan === "Enterprise")
          .reduce((sum, s) => sum + s.amount, 0)
      }
    ];
    
    // Get cases by status
    const allCases = await db.select().from(cases);
    const statusCounts: Record<string, number> = {};
    
    allCases.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });
    
    const casesByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
    
    return {
      totalUsers: Number(userCount.count) || 0,
      totalCases: Number(caseCount.count) || 0,
      totalInvestigators: Number(investigatorCount.count) || 0,
      totalSubscriptions: Number(subscriptionCount.count) || 0,
      revenueByPlan,
      casesByStatus
    };
  }
}

export const storage = new DatabaseStorage();
