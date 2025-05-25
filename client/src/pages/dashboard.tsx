import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Case, Investigator, Subscription } from "@shared/types";
import Sidebar from "@/components/ui/Sidebar";
import StatCard from "@/components/dashboard/StatCard";
import ActiveCasesList from "@/components/dashboard/ActiveCasesList";
import InvestigatorCard from "@/components/dashboard/InvestigatorCard";
import SubscriptionInfo from "@/components/dashboard/SubscriptionInfo";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Folder, Users, MessageSquare, CreditCard, ChevronRight } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch active cases
  const { data: cases, isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases/active"],
  });

  // Fetch top investigators
  const { data: investigators, isLoading: investigatorsLoading } = useQuery<Investigator[]>({
    queryKey: ["/api/investigators/top"],
  });

  // Fetch subscription info
  const { data: subscription, isLoading: subscriptionLoading } = useQuery<Subscription>({
    queryKey: ["/api/subscriptions/current"],
  });

  if (!user) return null;

  return (
    <div className="flex flex-1">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">Welcome back, {user.firstName}</h1>
            <p className="text-secondary mt-1">Here's an overview of your investigation activities</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Active Cases"
              value={cases?.length || 0}
              icon={<Folder className="h-6 w-6" />}
              changeValue={cases?.length ? "+2 cases" : "No cases"}
              changeText={cases?.length ? "from last month" : ""}
              changeDirection={cases?.length ? "up" : "neutral"}
              iconBgColor="bg-accent bg-opacity-10"
              iconColor="text-accent"
            />
            
            <StatCard 
              title="Available Cases"
              value={subscription?.remainingCases || 0}
              icon={<Folder className="h-6 w-6" />}
              changeText={subscription ? `${subscription.plan} Plan` : "No subscription"}
              iconBgColor="bg-primary bg-opacity-10"
              iconColor="text-primary"
            />
            
            <StatCard 
              title="Messages"
              value={7}
              icon={<MessageSquare className="h-6 w-6" />}
              changeValue="3 unread"
              changeText="across 2 cases"
              changeDirection="up"
              iconBgColor="bg-secondary bg-opacity-10"
              iconColor="text-secondary"
            />
            
            <StatCard 
              title="Subscription"
              value={subscription?.plan || "None"}
              icon={<CreditCard className="h-6 w-6" />}
              changeText={subscription ? `Renews on ${new Date(subscription.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ""}
              iconBgColor="bg-success bg-opacity-10"
              iconColor="text-success"
            />
          </div>

          {/* Active Cases */}
          <div className="mb-10">
            <ActiveCasesList cases={cases || []} loading={casesLoading} />
          </div>
          
          {/* Top Investigators */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">Top-Rated Investigators</h2>
              <Link href="/marketplace">
                <Button variant="ghost" className="text-accent hover:text-accent-dark font-medium text-sm flex items-center">
                  View all investigators
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            {investigatorsLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : investigators && investigators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investigators.slice(0, 3).map((investigator) => (
                  <InvestigatorCard key={investigator.id} investigator={investigator} />
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-white rounded-lg shadow-card">
                <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-primary mb-2">No Investigators Found</h3>
                <p className="text-secondary mb-4">
                  We couldn't find any investigators at the moment. Please check back later.
                </p>
                <Link href="/marketplace">
                  <Button className="bg-accent hover:bg-accent-dark text-white">
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Subscription Info */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">Your Subscription</h2>
              <Link href="/subscription">
                <Button variant="ghost" className="text-accent hover:text-accent-dark font-medium text-sm flex items-center">
                  Upgrade plan
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            {subscriptionLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : subscription ? (
              <SubscriptionInfo subscription={subscription} />
            ) : (
              <div className="text-center p-12 bg-white rounded-lg shadow-card">
                <CreditCard className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-primary mb-2">No Active Subscription</h3>
                <p className="text-secondary mb-4">
                  You don't have an active subscription. Subscribe to start using our services.
                </p>
                <Link href="/subscription">
                  <Button className="bg-accent hover:bg-accent-dark text-white">
                    View Subscription Plans
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
