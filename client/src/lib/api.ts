import { apiRequest } from "./queryClient";
import type { 
  User, 
  Case, 
  Message, 
  Subscription, 
  Investigator,
  AdminStats 
} from "@shared/types";

// Auth API
export const auth = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    return await response.json();
  },
  
  register: async (userData: Partial<User> & { password: string }): Promise<User> => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return await response.json();
  },
  
  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout", {});
  },
  
  getMe: async (): Promise<User> => {
    const response = await apiRequest("GET", "/api/auth/me", undefined);
    return await response.json();
  },
  
  updateMe: async (userData: Partial<User>): Promise<User> => {
    const response = await apiRequest("PATCH", "/api/auth/me", userData);
    return await response.json();
  },
  
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiRequest("POST", "/api/auth/password", { currentPassword, newPassword });
  }
};

// Cases API
export const caseApi = {
  getCases: async (): Promise<Case[]> => {
    const response = await apiRequest("GET", "/api/cases", undefined);
    return await response.json();
  },
  
  getActiveCases: async (): Promise<Case[]> => {
    const response = await apiRequest("GET", "/api/cases/active", undefined);
    return await response.json();
  },
  
  getCase: async (id: string): Promise<Case> => {
    const response = await apiRequest("GET", `/api/cases/${id}`, undefined);
    return await response.json();
  },
  
  createCase: async (caseData: Partial<Case>): Promise<Case> => {
    const response = await apiRequest("POST", "/api/cases", caseData);
    return await response.json();
  },
  
  updateCase: async (id: string, caseData: Partial<Case>): Promise<Case> => {
    const response = await apiRequest("PATCH", `/api/cases/${id}`, caseData);
    return await response.json();
  },
  
  deleteCase: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/cases/${id}`, undefined);
  }
};

// Investigators API
export const investigatorApi = {
  getInvestigators: async (filters?: Record<string, any>): Promise<Investigator[]> => {
    const queryParams = filters ? new URLSearchParams(filters).toString() : "";
    const response = await apiRequest("GET", `/api/investigators${queryParams ? `?${queryParams}` : ""}`, undefined);
    return await response.json();
  },
  
  getTopInvestigators: async (): Promise<Investigator[]> => {
    const response = await apiRequest("GET", "/api/investigators/top", undefined);
    return await response.json();
  },
  
  getInvestigator: async (id: string): Promise<Investigator> => {
    const response = await apiRequest("GET", `/api/investigators/${id}`, undefined);
    return await response.json();
  },
  
  contactInvestigator: async (investigatorId: string, data: { caseTitle: string, message: string }): Promise<{ caseId: string }> => {
    const response = await apiRequest("POST", `/api/messages/contact/${investigatorId}`, data);
    return await response.json();
  }
};

// Messages API
export const messageApi = {
  getMessages: async (caseId: string): Promise<Message[]> => {
    const response = await apiRequest("GET", `/api/messages/${caseId}`, undefined);
    return await response.json();
  },
  
  sendMessage: async (caseId: string, content: string): Promise<Message> => {
    const response = await apiRequest("POST", `/api/messages/${caseId}`, { content });
    return await response.json();
  }
};

// Subscription API
export const subscriptionApi = {
  getCurrentSubscription: async (): Promise<Subscription> => {
    const response = await apiRequest("GET", "/api/subscriptions/current", undefined);
    return await response.json();
  },
  
  subscribe: async (plan: string, interval: "month" | "year"): Promise<Subscription> => {
    const response = await apiRequest("POST", "/api/subscriptions/subscribe", { plan, interval });
    return await response.json();
  },
  
  upgrade: async (currentPlan: string): Promise<Subscription> => {
    const response = await apiRequest("POST", "/api/subscriptions/upgrade", { currentPlan });
    return await response.json();
  }
};

// Admin API
export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await apiRequest("GET", "/api/admin/stats", undefined);
    return await response.json();
  },
  
  getUsers: async (): Promise<User[]> => {
    const response = await apiRequest("GET", "/api/admin/users", undefined);
    return await response.json();
  },
  
  getCases: async (): Promise<Case[]> => {
    const response = await apiRequest("GET", "/api/admin/cases", undefined);
    return await response.json();
  },
  
  getSubscriptions: async (): Promise<Subscription[]> => {
    const response = await apiRequest("GET", "/api/admin/subscriptions", undefined);
    return await response.json();
  }
};
