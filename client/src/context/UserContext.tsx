import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@shared/schema";

interface UserContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSubscriber: boolean;
  isInvestigator: boolean;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  const isSubscriber = user?.role === USER_ROLES.SUBSCRIBER;
  const isInvestigator = user?.role === USER_ROLES.INVESTIGATOR;
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isSubscriber,
        isInvestigator,
        isAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
