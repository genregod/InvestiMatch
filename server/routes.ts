import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { USER_ROLES, SUBSCRIPTION_PLANS } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Role-specific profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role === USER_ROLES.SUBSCRIBER) {
        const profile = await storage.getSubscriberProfile(userId);
        if (!profile) {
          // Create profile if it doesn't exist
          const newProfile = await storage.createSubscriberProfile({
            userId,
            subscriptionPlan: SUBSCRIPTION_PLANS.BASIC,
            casesRemaining: 5
          });
          return res.json({ user, profile: newProfile });
        }
        return res.json({ user, profile });
      } else if (user.role === USER_ROLES.INVESTIGATOR) {
        const profile = await storage.getInvestigatorProfile(userId);
        return res.json({ user, profile });
      }
      
      return res.json({ user });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  
  // Update user role
  app.patch('/api/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!Object.values(USER_ROLES).includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.upsertUser({
        id: userId,
        role
      });
      
      // Create profile based on role if it doesn't exist
      if (role === USER_ROLES.SUBSCRIBER) {
        const existingProfile = await storage.getSubscriberProfile(userId);
        if (!existingProfile) {
          await storage.createSubscriberProfile({
            userId,
            subscriptionPlan: SUBSCRIPTION_PLANS.BASIC,
            casesRemaining: 5
          });
        }
      } else if (role === USER_ROLES.INVESTIGATOR) {
        const existingProfile = await storage.getInvestigatorProfile(userId);
        if (!existingProfile) {
          await storage.createInvestigatorProfile({
            userId,
            title: "Professional Investigator",
            location: "Remote",
            isAvailable: true,
            specializations: [],
            skills: []
          });
        }
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Investigator listing and search
  app.get('/api/investigators', isAuthenticated, async (req, res) => {
    try {
      const { search, specialization, location, available } = req.query;
      const isAvailable = available === 'true' ? true : undefined;
      
      const investigators = await storage.listInvestigators(
        search as string,
        specialization as string,
        location as string,
        isAvailable
      );
      
      res.json(investigators);
    } catch (error) {
      console.error("Error fetching investigators:", error);
      res.status(500).json({ message: "Failed to fetch investigators" });
    }
  });

  // Get investigator profile
  app.get('/api/investigators/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const investigator = await storage.getInvestigatorProfile(id);
      
      if (!investigator) {
        return res.status(404).json({ message: "Investigator not found" });
      }
      
      const user = await storage.getUser(id);
      const reviews = await storage.getReviewsByInvestigator(id);
      
      res.json({ profile: investigator, user, reviews });
    } catch (error) {
      console.error("Error fetching investigator:", error);
      res.status(500).json({ message: "Failed to fetch investigator" });
    }
  });

  // Update investigator profile
  app.patch('/api/investigators/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== USER_ROLES.INVESTIGATOR) {
        return res.status(403).json({ message: "Unauthorized: Not an investigator" });
      }
      
      const profileData = req.body;
      const updatedProfile = await storage.updateInvestigatorProfile(userId, profileData);
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating investigator profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Case routes
  app.post('/api/cases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== USER_ROLES.SUBSCRIBER) {
        return res.status(403).json({ message: "Unauthorized: Only subscribers can create cases" });
      }
      
      const subscriberProfile = await storage.getSubscriberProfile(userId);
      
      if (!subscriberProfile || subscriberProfile.casesRemaining <= 0) {
        return res.status(400).json({ message: "No cases remaining in your subscription" });
      }
      
      const caseData = { ...req.body, clientId: userId };
      const newCase = await storage.createCase(caseData);
      
      // Decrement available cases
      await storage.updateSubscriberProfile(userId, {
        casesRemaining: subscriberProfile.casesRemaining - 1
      });
      
      // Create notification for the client
      await storage.createNotification({
        userId,
        title: "Case Created",
        content: `Your case "${newCase.title}" has been created successfully.`,
        link: `/cases/${newCase.id}`
      });
      
      res.json(newCase);
    } catch (error) {
      console.error("Error creating case:", error);
      res.status(500).json({ message: "Failed to create case" });
    }
  });

  // Get cases for current user
  app.get('/api/cases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let cases;
      if (user.role === USER_ROLES.SUBSCRIBER) {
        cases = await storage.listCasesByClient(userId);
      } else if (user.role === USER_ROLES.INVESTIGATOR) {
        cases = await storage.listCasesByInvestigator(userId);
      } else {
        // Admin can see all cases
        cases = [];
      }
      
      res.json(cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  // Get specific case
  app.get('/api/cases/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const caseItem = await storage.getCase(parseInt(id));
      
      if (!caseItem) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Check permissions
      const user = await storage.getUser(userId);
      if (
        user?.role !== USER_ROLES.ADMIN && 
        caseItem.clientId !== userId && 
        caseItem.investigatorId !== userId
      ) {
        return res.status(403).json({ message: "Unauthorized: Not your case" });
      }
      
      const messages = await storage.getMessagesByCase(parseInt(id));
      
      res.json({ case: caseItem, messages });
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  // Update case status
  app.patch('/api/cases/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const caseItem = await storage.getCase(parseInt(id));
      
      if (!caseItem) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Check permissions
      const user = await storage.getUser(userId);
      if (
        user?.role !== USER_ROLES.ADMIN && 
        caseItem.clientId !== userId && 
        caseItem.investigatorId !== userId
      ) {
        return res.status(403).json({ message: "Unauthorized: Not your case" });
      }
      
      const updatedCase = await storage.updateCase(parseInt(id), req.body);
      
      // Create notification for the other party
      const notifyUserId = caseItem.clientId === userId ? caseItem.investigatorId : caseItem.clientId;
      if (notifyUserId) {
        await storage.createNotification({
          userId: notifyUserId,
          title: "Case Updated",
          content: `Case "${caseItem.title}" has been updated.`,
          link: `/cases/${id}`
        });
      }
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating case:", error);
      res.status(500).json({ message: "Failed to update case" });
    }
  });

  // Assign investigator to case
  app.post('/api/cases/:id/assign', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { investigatorId } = req.body;
      const userId = req.user.claims.sub;
      const caseItem = await storage.getCase(parseInt(id));
      
      if (!caseItem) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Check permissions
      if (caseItem.clientId !== userId) {
        return res.status(403).json({ message: "Unauthorized: Not your case" });
      }
      
      const updatedCase = await storage.updateCase(parseInt(id), { 
        investigatorId,
        status: 'active'
      });
      
      // Create notification for the investigator
      await storage.createNotification({
        userId: investigatorId,
        title: "New Case Assignment",
        content: `You have been assigned to case "${caseItem.title}".`,
        link: `/cases/${id}`
      });
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error assigning investigator:", error);
      res.status(500).json({ message: "Failed to assign investigator" });
    }
  });

  // Send message in a case
  app.post('/api/cases/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const senderId = req.user.claims.sub;
      const caseItem = await storage.getCase(parseInt(id));
      
      if (!caseItem) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Check permissions
      if (caseItem.clientId !== senderId && caseItem.investigatorId !== senderId) {
        return res.status(403).json({ message: "Unauthorized: Not your case" });
      }
      
      // Determine recipient
      const receiverId = caseItem.clientId === senderId ? caseItem.investigatorId : caseItem.clientId;
      
      if (!receiverId) {
        return res.status(400).json({ message: "No recipient available" });
      }
      
      const message = await storage.createMessage({
        senderId,
        receiverId,
        caseId: parseInt(id),
        content
      });
      
      // Create notification for the recipient
      await storage.createNotification({
        userId: receiverId,
        title: "New Message",
        content: `You have a new message in case "${caseItem.title}".`,
        link: `/cases/${id}`
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Submit review for investigator
  app.post('/api/cases/:id/review', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const clientId = req.user.claims.sub;
      const caseItem = await storage.getCase(parseInt(id));
      
      if (!caseItem) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Check permissions
      if (caseItem.clientId !== clientId) {
        return res.status(403).json({ message: "Unauthorized: Not your case" });
      }
      
      if (!caseItem.investigatorId) {
        return res.status(400).json({ message: "No investigator assigned to this case" });
      }
      
      const review = await storage.createReview({
        investigatorId: caseItem.investigatorId,
        clientId,
        caseId: parseInt(id),
        rating,
        comment
      });
      
      // Create notification for the investigator
      await storage.createNotification({
        userId: caseItem.investigatorId,
        title: "New Review",
        content: `You have received a ${rating}-star review for case "${caseItem.title}".`,
        link: `/cases/${id}`
      });
      
      res.json(review);
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // Subscription routes
  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getSubscription(userId);
      const subscriberProfile = await storage.getSubscriberProfile(userId);
      
      res.json({ subscription, profile: subscriberProfile });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Change subscription plan
  app.post('/api/subscription/change', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan } = req.body;
      
      if (!Object.values(SUBSCRIPTION_PLANS).includes(plan)) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== USER_ROLES.SUBSCRIBER) {
        return res.status(403).json({ message: "Unauthorized: Not a subscriber" });
      }
      
      // Set cases based on plan
      let casesRemaining = 5; // Basic
      if (plan === SUBSCRIPTION_PLANS.PRO) {
        casesRemaining = 20;
      } else if (plan === SUBSCRIPTION_PLANS.ENTERPRISE) {
        casesRemaining = 999; // "Unlimited"
      }
      
      // Update subscriber profile
      const updatedProfile = await storage.updateSubscriberProfile(userId, {
        subscriptionPlan: plan,
        casesRemaining,
        subscriptionRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
      
      // Create or update subscription record
      const existingSubscription = await storage.getSubscription(userId);
      let subscription;
      
      if (existingSubscription) {
        subscription = await storage.updateSubscription(userId, {
          plan,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });
      } else {
        subscription = await storage.createSubscription({
          userId,
          plan,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          autoRenew: true
        });
      }
      
      res.json({ subscription, profile: updatedProfile });
    } catch (error) {
      console.error("Error changing subscription:", error);
      res.status(500).json({ message: "Failed to change subscription" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(parseInt(id));
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
