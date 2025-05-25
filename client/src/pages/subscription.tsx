import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Subscription as SubscriptionType } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/ui/Sidebar";
import PlanCard from "@/components/subscription/PlanCard";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Check, 
  ShieldCheck, 
  BadgeCheck, 
  Users, 
  MessageSquare, 
  FileText,
  Folder
} from "lucide-react";

const SubscriptionPage = () => {
  const { toast } = useToast();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch current subscription
  const { data: subscription, isLoading, refetch } = useQuery<SubscriptionType>({
    queryKey: ["/api/subscriptions/current"],
  });

  // Handle plan selection
  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    setIsUpgradeDialogOpen(true);
  };

  // Handle plan confirmation
  const handleConfirmPlan = async () => {
    if (!selectedPlan) return;
    
    try {
      setIsProcessing(true);
      
      // Call the API to upgrade subscription
      await apiRequest("POST", "/api/subscriptions/subscribe", {
        plan: selectedPlan,
        interval: billingInterval
      });
      
      await refetch();
      
      setIsUpgradeDialogOpen(false);
      
      toast({
        title: "Subscription Updated",
        description: `Your subscription has been updated to the ${selectedPlan} plan.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate savings for annual billing
  const calculateSavings = (monthlyPrice: number) => {
    const annualPrice = monthlyPrice * 10; // 2 months free
    return (monthlyPrice * 12) - annualPrice;
  };

  // Features for Basic plan
  const basicFeatures = [
    { name: "5 Cases per Month", included: true, description: "Includes basic case management" },
    { name: "Standard Matching", included: true, description: "Regular investigator matching" },
    { name: "Basic Case Management", included: true, description: "Essential reporting features" },
    { name: "Standard Support", included: true, description: "Email support" },
    { name: "Secure Communication", included: true, description: "End-to-end encrypted messaging" },
    { name: "Priority Matching", included: false },
    { name: "Advanced Reporting", included: false },
    { name: "Document Storage", included: false },
  ];

  // Features for Pro plan
  const proFeatures = [
    { name: "20 Cases per Month", included: true, description: "Includes full case management" },
    { name: "Priority Matching", included: true, description: "Match with top-rated investigators first" },
    { name: "Advanced Case Management", included: true, description: "Full reporting and document storage" },
    { name: "Dedicated Support", included: true, description: "Priority email and phone support" },
    { name: "Secure Communication", included: true, description: "End-to-end encrypted messaging" },
    { name: "Custom Case Templates", included: true, description: "Create and save case templates" },
    { name: "Case Analytics", included: true, description: "Basic analytics and insights" },
    { name: "Team Access", included: false, description: "Multiple user accounts" },
  ];

  // Features for Enterprise plan
  const enterpriseFeatures = [
    { name: "Unlimited Cases", included: true, description: "No restrictions on case volume" },
    { name: "Priority Matching", included: true, description: "Match with top-rated investigators first" },
    { name: "Enterprise Case Management", included: true, description: "Custom reporting and unlimited storage" },
    { name: "24/7 Support", included: true, description: "24/7 phone, chat, and email support" },
    { name: "Secure Communication", included: true, description: "End-to-end encrypted messaging" },
    { name: "Custom Case Templates", included: true, description: "Create and save case templates" },
    { name: "Advanced Analytics", included: true, description: "Detailed analytics and custom reports" },
    { name: "Team Access", included: true, description: "Multiple user accounts with role-based permissions" },
    { name: "API Access", included: true, description: "Integration with your existing systems" },
    { name: "Dedicated Account Manager", included: true, description: "Personalized service and support" },
  ];

  // Get the current plan features
  const getCurrentPlanFeatures = () => {
    switch (subscription?.plan) {
      case "Basic":
        return basicFeatures;
      case "Pro":
        return proFeatures;
      case "Enterprise":
        return enterpriseFeatures;
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-1">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Subscription Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">Subscription Plans</h1>
            <p className="text-secondary mt-1">Choose the right plan for your investigation needs</p>
          </div>
          
          {/* Current Subscription Info */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : subscription ? (
            <Card className="mb-10 bg-white shadow-card">
              <CardHeader>
                <CardTitle>Your Current Subscription</CardTitle>
                <CardDescription>
                  You are currently on the {subscription.plan} plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center">
                      <h3 className="text-xl font-semibold text-primary">{subscription.plan} Plan</h3>
                      <span className="ml-2 px-2 py-1 bg-accent bg-opacity-10 text-accent text-xs font-medium rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-secondary mt-1">
                      Billed {subscription.billingCycle} - Next payment on {
                        new Date(subscription.nextBillingDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      ${subscription.amount}
                      <span className="text-sm font-medium text-secondary">/{subscription.billingCycle === "monthly" ? "month" : "year"}</span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCurrentPlanFeatures().filter(f => f.included).slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="rounded-full p-1 bg-success/20 text-success mr-2 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">{feature.name}</span>
                        {feature.description && (
                          <p className="text-xs text-secondary mt-0.5">{feature.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
          
          {/* Billing Interval Toggle */}
          <div className="flex justify-center mb-10">
            <Tabs 
              defaultValue="month" 
              value={billingInterval}
              onValueChange={(value) => setBillingInterval(value as "month" | "year")}
              className="w-full max-w-md"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="month">Monthly Billing</TabsTrigger>
                <TabsTrigger value="year">
                  Yearly Billing
                  <span className="ml-2 px-2 py-0.5 bg-success/20 text-success text-xs font-medium rounded-full">
                    Save 16%
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <PlanCard
              name="Basic"
              price={billingInterval === "month" ? 49 : 490}
              interval={billingInterval}
              description="For individuals with occasional investigation needs"
              features={basicFeatures}
              isCurrentPlan={subscription?.plan === "Basic"}
              onSubscribe={() => handleSelectPlan("Basic")}
            />
            
            <PlanCard
              name="Pro"
              price={billingInterval === "month" ? 149 : 1490}
              interval={billingInterval}
              description="For professionals with regular investigation requirements"
              features={proFeatures}
              isPopular={true}
              isCurrentPlan={subscription?.plan === "Pro"}
              onSubscribe={() => handleSelectPlan("Pro")}
            />
            
            <PlanCard
              name="Enterprise"
              price={billingInterval === "month" ? 499 : 4990}
              interval={billingInterval}
              description="For organizations with high-volume investigation needs"
              features={enterpriseFeatures}
              isCurrentPlan={subscription?.plan === "Enterprise"}
              buttonText="Contact Sales"
              onSubscribe={() => handleSelectPlan("Enterprise")}
            />
          </div>
          
          {/* Features Comparison */}
          <Card className="mb-10 shadow-card">
            <CardHeader>
              <CardTitle>Compare Plan Features</CardTitle>
              <CardDescription>
                Detailed breakdown of what's included in each plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-4 font-medium text-primary">Feature</th>
                      <th className="text-center py-4 px-4 font-medium text-primary">Basic</th>
                      <th className="text-center py-4 px-4 font-medium text-primary">Pro</th>
                      <th className="text-center py-4 px-4 font-medium text-primary">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Folder className="h-5 w-5 text-secondary mr-2" />
                          <span>Monthly Cases</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">5 Cases</td>
                      <td className="text-center py-4 px-4">20 Cases</td>
                      <td className="text-center py-4 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-secondary mr-2" />
                          <span>Investigator Matching</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">Standard</td>
                      <td className="text-center py-4 px-4">Priority</td>
                      <td className="text-center py-4 px-4">Priority</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-secondary mr-2" />
                          <span>Case Management</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">Basic</td>
                      <td className="text-center py-4 px-4">Advanced</td>
                      <td className="text-center py-4 px-4">Enterprise</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <MessageSquare className="h-5 w-5 text-secondary mr-2" />
                          <span>Support</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">Email</td>
                      <td className="text-center py-4 px-4">Priority</td>
                      <td className="text-center py-4 px-4">24/7</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <ShieldCheck className="h-5 w-5 text-secondary mr-2" />
                          <span>Secure Communication</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <Check className="h-5 w-5 text-success mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <Check className="h-5 w-5 text-success mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <Check className="h-5 w-5 text-success mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <BadgeCheck className="h-5 w-5 text-secondary mr-2" />
                          <span>Team Access</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">
                        <Check className="h-5 w-5 text-success mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-secondary mr-2" />
                          <span>Price</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4 font-semibold">
                        ${billingInterval === "month" ? "49" : "490"}/{billingInterval}
                      </td>
                      <td className="text-center py-4 px-4 font-semibold">
                        ${billingInterval === "month" ? "149" : "1490"}/{billingInterval}
                      </td>
                      <td className="text-center py-4 px-4 font-semibold">
                        ${billingInterval === "month" ? "499" : "4990"}/{billingInterval}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* FAQ Section */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Can I change plans later?</h3>
                  <p className="text-secondary">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">What happens if I exceed my case limit?</h3>
                  <p className="text-secondary">
                    You'll need to upgrade to a higher plan or wait until your next billing cycle for your case allotment to reset.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Are there any long-term contracts?</h3>
                  <p className="text-secondary">
                    No, all plans are billed either monthly or annually with no long-term commitment required.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">How do I cancel my subscription?</h3>
                  <p className="text-secondary">
                    You can cancel your subscription at any time from your account settings. Your plan will remain active until the end of your current billing period.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Upgrade Confirmation Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subscription Change</DialogTitle>
            <DialogDescription>
              You are about to {subscription ? 'change' : 'subscribe to'} the {selectedPlan} plan with {billingInterval}ly billing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div>
                <h3 className="font-semibold">{selectedPlan} Plan</h3>
                <p className="text-sm text-secondary">Billed {billingInterval}ly</p>
              </div>
              <div className="font-bold">
                ${selectedPlan === "Basic" ? (billingInterval === "month" ? "49" : "490") : 
                  selectedPlan === "Pro" ? (billingInterval === "month" ? "149" : "1490") : 
                  (billingInterval === "month" ? "499" : "4990")}
                <span className="text-sm font-normal text-secondary">/{billingInterval}</span>
              </div>
            </div>
            
            <p className="text-sm text-secondary mb-4">
              Your subscription will {subscription ? 'update' : 'begin'} immediately. {billingInterval === "month" ? 'Monthly' : 'Annual'} billing will commence today.
            </p>
            
            {billingInterval === "year" && (
              <div className="bg-success/10 p-3 rounded text-sm mb-4">
                <span className="font-medium text-success">
                  You'll save ${selectedPlan === "Basic" ? "98" : selectedPlan === "Pro" ? "298" : "998"} with annual billing!
                </span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUpgradeDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              className="bg-accent hover:bg-accent-dark text-white"
              onClick={handleConfirmPlan}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                subscription ? 'Update Subscription' : 'Confirm Subscription'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPage;
