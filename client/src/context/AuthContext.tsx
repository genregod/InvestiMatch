import React, { createContext, useState, useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);

  // Fetch the current user from the API
  const { data: user, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    onSettled: () => setLoading(false),
    onError: () => setLoading(false),
  });

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await apiRequest("POST", "/api/auth/login", { email, password });
      await refetch();
      setLocation("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: Partial<User> & { password: string }): Promise<void> => {
    try {
      setLoading(true);
      await apiRequest("POST", "/api/auth/register", userData);
      await refetch();
      setLocation("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await apiRequest("POST", "/api/auth/logout", {});
      await refetch();
      setLocation("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      await apiRequest("PATCH", "/api/auth/me", userData);
      await refetch();
    } catch (error) {
      console.error("Update user failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
