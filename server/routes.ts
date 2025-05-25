import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hash, compare } from "bcrypt";
import { z } from "zod";
import { 
  createCaseSchema, 
  insertUserSchema, 
  loginUserSchema,
  subscriptionPlanSchema,
  messageSchema,
  investigatorFilterSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Create session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      
      // Get user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Compare passwords
      const passwordMatch = await compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get('/api/auth/me', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.patch('/api/auth/me', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const updates = req.body;
      const updatedUser = await storage.updateUser(req.session.userId, updates);
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.post('/api/auth/password', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      // Get user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const passwordMatch = await compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hash(newPassword, 10);
      
      // Update password
      await storage.updateUser(req.session.userId, { password: hashedPassword });
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  
  // Cases routes
  app.get('/api/cases', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userCases = await storage.getCasesByUserId(req.session.userId);
      res.status(200).json(userCases);
    } catch (error) {
      console.error("Get cases error:", error);
      res.status(500).json({ message: "Failed to get cases" });
    }
  });
  
  app.get('/api/cases/active', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const activeCases = await storage.getActiveCasesByUserId(req.session.userId);
      res.status(200).json(activeCases);
    } catch (error) {
      console.error("Get active cases error:", error);
      res.status(500).json({ message: "Failed to get active cases" });
    }
  });
  
  app.get('/api/cases/:id', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const caseId = req.params.id;
      const caseData = await storage.getCaseById(caseId);
      
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Check if user is authorized to view this case
      if (caseData.userId !== req.session.userId && caseData.investigatorId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to view this case" });
      }
      
      res.status(200).json(caseData);
    } catch (error) {
      console.error("Get case error:", error);
      res.status(500).json({ message: "Failed to get case" });
    }
  });
  
  app.post('/api/cases', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const caseData = createCaseSchema.parse(req.body);
      
      // Check subscription and case limits
      const subscription = await storage.getSubscriptionByUserId(req.session.userId);
      if (!subscription) {
        return res.status(403).json({ message: "No active subscription found" });
      }
      
      const caseCount = await storage.getCaseCountByUserId(req.session.userId);
      
      if (subscription.plan === "Basic" && caseCount >= 5) {
        return res.status(403).json({ message: "Case limit reached for Basic plan" });
      }
      
      if (subscription.plan === "Pro" && caseCount >= 20) {
        return res.status(403).json({ message: "Case limit reached for Pro plan" });
      }
      
      // Create case
      const newCase = await storage.createCase({
        ...caseData,
        userId: req.session.userId,
        status: "Pending",
        createdAt: new Date(),
        lastActivity: new Date()
      });
      
      res.status(201).json(newCase);
    } catch (error) {
      console.error("Create case error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create case" });
    }
  });
  
  app.patch('/api/cases/:id', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const caseId = req.params.id;
      const updates = req.body;
      
      // Check if case exists and user is authorized
      const caseData = await storage.getCaseById(caseId);
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      if (caseData.userId !== req.session.userId && caseData.investigatorId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this case" });
      }
      
      // Update case
      const updatedCase = await storage.updateCase(caseId, {
        ...updates,
        lastActivity: new Date()
      });
      
      res.status(200).json(updatedCase);
    } catch (error) {
      console.error("Update case error:", error);
      res.status(500).json({ message: "Failed to update case" });
    }
  });
  
  app.delete('/api/cases/:id', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const caseId = req.params.id;
      
      // Check if case exists and user is authorized
      const caseData = await storage.getCaseById(caseId);
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      if (caseData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this case" });
      }
      
      // Delete case
      await storage.deleteCase(caseId);
      
      res.status(200).json({ message: "Case deleted successfully" });
    } catch (error) {
      console.error("Delete case error:", error);
      res.status(500).json({ message: "Failed to delete case" });
    }
  });
  
  // Investigators routes
  app.get('/api/investigators', async (req, res) => {
    try {
      const filters = investigatorFilterSchema.parse(req.query);
      const investigators = await storage.getInvestigators(filters);
      res.status(200).json(investigators);
    } catch (error) {
      console.error("Get investigators error:", error);
      res.status(500).json({ message: "Failed to get investigators" });
    }
  });
  
  app.get('/api/investigators/top', async (req, res) => {
    try {
      const topInvestigators = await storage.getTopInvestigators();
      res.status(200).json(topInvestigators);
    } catch (error) {
      console.error("Get top investigators error:", error);
      res.status(500).json({ message: "Failed to get top investigators" });
    }
  });
  
  app.get('/api/investigators/:id', async (req, res) => {
    try {
      const investigatorId = req.params.id;
      const investigator = await storage.getInvestigatorById(investigatorId);
      
      if (!investigator) {
        return res.status(404).json({ message: "Investigator not found" });
      }
      
      res.status(200).json(investigator);
    } catch (error) {
      console.error("Get investigator error:", error);
      res.status(500).json({ message: "Failed to get investigator" });
    }
  });
  
  // Messages routes
  app.get('/api/messages/:caseId', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const caseId = req.params.caseId;
      
      // Check if case exists and user is authorized
      const caseData = await storage.getCaseById(caseId);
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      if (caseData.userId !== req.session.userId && caseData.investigatorId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to view these messages" });
      }
      
      const messages = await storage.getMessagesByCaseId(caseId);
      res.status(200).json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });
  
  app.post('/api/messages/:caseId', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const caseId = req.params.caseId;
      const messageData = messageSchema.parse(req.body);
      
      // Check if case exists and user is authorized
      const caseData = await storage.getCaseById(caseId);
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      if (caseData.userId !== req.session.userId && caseData.investigatorId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to send messages in this case" });
      }
      
      // Get sender info
      const sender = await storage.getUser(req.session.userId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
      
      // Create message
      const newMessage = await storage.createMessage({
        caseId,
        senderId: req.session.userId,
        senderName: `${sender.firstName} ${sender.lastName}`,
        senderAvatar: sender.profileImageUrl,
        content: messageData.content,
        timestamp: new Date()
      });
      
      // Update case last activity
      await storage.updateCase(caseId, { lastActivity: new Date() });
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Create message error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  
  app.post('/api/messages/contact/:investigatorId', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const investigatorId = req.params.investigatorId;
      const { caseTitle, message } = req.body;
      
      // Check if investigator exists
      const investigator = await storage.getInvestigatorById(investigatorId);
      if (!investigator) {
        return res.status(404).json({ message: "Investigator not found" });
      }
      
      // Create case
      const newCase = await storage.createCase({
        title: caseTitle,
        description: message,
        userId: req.session.userId,
        investigatorId,
        status: "Pending",
        type: "other",
        priority: "medium",
        createdAt: new Date(),
        lastActivity: new Date()
      });
      
      // Get sender info
      const sender = await storage.getUser(req.session.userId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
      
      // Create initial message
      await storage.createMessage({
        caseId: newCase.id,
        senderId: req.session.userId,
        senderName: `${sender.firstName} ${sender.lastName}`,
        senderAvatar: sender.profileImageUrl,
        content: message,
        timestamp: new Date()
      });
      
      res.status(201).json({ message: "Contact message sent successfully", caseId: newCase.id });
    } catch (error) {
      console.error("Contact investigator error:", error);
      res.status(500).json({ message: "Failed to contact investigator" });
    }
  });
  
  // Subscription routes
  app.get('/api/subscriptions/current', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const subscription = await storage.getSubscriptionByUserId(req.session.userId);
      
      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }
      
      // Get case count for remaining cases calculation
      const caseCount = await storage.getCaseCountByUserId(req.session.userId);
      
      // Calculate remaining cases based on plan
      let remainingCases = 0;
      if (subscription.plan === "Basic") {
        remainingCases = Math.max(0, 5 - caseCount);
      } else if (subscription.plan === "Pro") {
        remainingCases = Math.max(0, 20 - caseCount);
      } else if (subscription.plan === "Enterprise") {
        remainingCases = 999; // Unlimited
      }
      
      res.status(200).json({
        ...subscription,
        casesUsed: caseCount,
        remainingCases
      });
    } catch (error) {
      console.error("Get subscription error:", error);
      res.status(500).json({ message: "Failed to get subscription" });
    }
  });
  
  app.post('/api/subscriptions/subscribe', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { plan, interval } = subscriptionPlanSchema.parse(req.body);
      
      // Calculate amount based on plan and interval
      let amount = 0;
      if (plan === "Basic") {
        amount = interval === "month" ? 49 : 490;
      } else if (plan === "Pro") {
        amount = interval === "month" ? 149 : 1490;
      } else if (plan === "Enterprise") {
        amount = interval === "month" ? 499 : 4990;
      }
      
      // Check if user already has a subscription
      const existingSubscription = await storage.getSubscriptionByUserId(req.session.userId);
      
      let subscription;
      if (existingSubscription) {
        // Update existing subscription
        subscription = await storage.updateSubscription(existingSubscription.id, {
          plan,
          amount,
          billingCycle: interval === "month" ? "monthly" : "annually",
          nextBillingDate: new Date(Date.now() + (interval === "month" ? 30 : 365) * 24 * 60 * 60 * 1000)
        });
      } else {
        // Create new subscription
        subscription = await storage.createSubscription({
          userId: req.session.userId,
          plan,
          amount,
          billingCycle: interval === "month" ? "monthly" : "annually",
          status: "active",
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + (interval === "month" ? 30 : 365) * 24 * 60 * 60 * 1000)
        });
      }
      
      res.status(200).json(subscription);
    } catch (error) {
      console.error("Subscription error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to process subscription" });
    }
  });
  
  app.post('/api/subscriptions/upgrade', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { currentPlan } = req.body;
      
      // Determine next plan
      let nextPlan;
      if (currentPlan === "Basic") {
        nextPlan = "Pro";
      } else if (currentPlan === "Pro") {
        nextPlan = "Enterprise";
      } else {
        return res.status(400).json({ message: "Invalid current plan" });
      }
      
      // Check if user has a subscription
      const existingSubscription = await storage.getSubscriptionByUserId(req.session.userId);
      
      if (!existingSubscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }
      
      // Calculate new amount
      let amount = 0;
      if (nextPlan === "Pro") {
        amount = existingSubscription.billingCycle === "monthly" ? 149 : 1490;
      } else if (nextPlan === "Enterprise") {
        amount = existingSubscription.billingCycle === "monthly" ? 499 : 4990;
      }
      
      // Update subscription
      const subscription = await storage.updateSubscription(existingSubscription.id, {
        plan: nextPlan,
        amount
      });
      
      res.status(200).json(subscription);
    } catch (error) {
      console.error("Upgrade subscription error:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });
  
  // Admin routes
  app.get('/api/admin/stats', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if user is admin
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const stats = await storage.getAdminStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Failed to get admin stats" });
    }
  });
  
  app.get('/api/admin/users', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if user is admin
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const users = await storage.getAllUsers();
      
      // Remove passwords
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.status(200).json(safeUsers);
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });
  
  app.get('/api/admin/cases', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if user is admin
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const cases = await storage.getAllCases();
      res.status(200).json(cases);
    } catch (error) {
      console.error("Admin cases error:", error);
      res.status(500).json({ message: "Failed to get cases" });
    }
  });
  
  app.get('/api/admin/subscriptions', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if user is admin
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const subscriptions = await storage.getAllSubscriptions();
      res.status(200).json(subscriptions);
    } catch (error) {
      console.error("Admin subscriptions error:", error);
      res.status(500).json({ message: "Failed to get subscriptions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
