import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { USER_ROLES } from "@shared/schema";
import RoleSwitcher from "@/components/ui/RoleSwitcher";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ActiveCases from "@/components/dashboard/ActiveCases";
import FindInvestigators from "@/components/dashboard/FindInvestigators";
import SubscriptionInfo from "@/components/dashboard/SubscriptionInfo";
import SubscriptionPlans from "@/components/dashboard/SubscriptionPlans";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Loader } from "lucide-react";

type ActiveRole = "subscriber" | "investigator" | "admin";

const DashboardContainer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeRole, setActiveRole] = useState<ActiveRole>(user?.role as ActiveRole || "subscriber");

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    refetchOnWindowFocus: false,
  });

  // Update user's role when role switcher is clicked
  const handleRoleSwitch = async (role: ActiveRole) => {
    if (role === activeRole) return;
    
    try {
      await apiRequest("PATCH", "/api/user/role", { role });
      setActiveRole(role);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Role switched",
        description: `You are now viewing the ${role} dashboard`,
      });
    } catch (error) {
      toast({
        title: "Error switching role",
        description: "An error occurred while switching roles. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set the active role based on user's current role
  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role as ActiveRole);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Role Switcher */}
      <RoleSwitcher 
        activeRole={activeRole} 
        onRoleSwitch={handleRoleSwitch} 
      />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">
          {activeRole === "subscriber" && "Subscriber Dashboard"}
          {activeRole === "investigator" && "Investigator Dashboard"}
          {activeRole === "admin" && "Admin Dashboard"}
        </h1>
        
        {activeRole === "subscriber" && (
          <Button className="bg-accent hover:bg-opacity-90 text-white px-6 py-2 rounded-md font-medium flex items-center">
            <svg
              className="mr-2"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Case
          </Button>
        )}
      </div>

      {/* Dashboard Stats */}
      <DashboardStats stats={dashboardData} userRole={activeRole} />

      {/* Active Cases */}
      {(activeRole === "subscriber" || activeRole === "investigator") && (
        <ActiveCases 
          cases={dashboardData?.cases || []} 
          userRole={activeRole}
        />
      )}

      {/* Find Investigators (Subscriber View) */}
      {activeRole === "subscriber" && (
        <FindInvestigators />
      )}

      {/* Subscription Info (Subscriber View) */}
      {activeRole === "subscriber" && (
        <SubscriptionInfo subscription={dashboardData?.subscription} profile={dashboardData?.profile} />
      )}

      {/* Subscription Plans (Subscriber View) */}
      {activeRole === "subscriber" && (
        <SubscriptionPlans currentPlan={dashboardData?.subscription?.plan || "basic"} />
      )}
    </div>
  );
};

export default DashboardContainer;
