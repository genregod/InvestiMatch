import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS } from "@shared/schema";
import { Check, X, Loader, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format, addMonths } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Subscription = () => {
  const { toast } = useToast();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Fetch subscription data
  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ['/api/subscription'],
    refetchOnWindowFocus: false,
  });

  // Update subscription plan mutation
  const updateSubscription = useMutation({
    mutationFn: async (plan: string) => {
      await apiRequest("POST", "/api/subscription/change", { plan });
    },
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: `Your subscription has been updated to the ${selectedPlan} plan.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      setPaymentOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Helper functions to get plan-specific information
  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case SUBSCRIPTION_PLANS.BASIC:
        return "$49";
      case SUBSCRIPTION_PLANS.PRO:
        return "$149";
      case SUBSCRIPTION_PLANS.ENTERPRISE:
        return "Custom";
      default:
        return "";
    }
  };

  const getPlanCases = (plan: string) => {
    switch (plan) {
      case SUBSCRIPTION_PLANS.BASIC:
        return 5;
      case SUBSCRIPTION_PLANS.PRO:
        return 20;
      case SUBSCRIPTION_PLANS.ENTERPRISE:
        return 999; // Effectively unlimited
      default:
        return 0;
    }
  };

  // Handle subscription change
  const handleChangePlan = (plan: string) => {
    if (plan === subscriptionData?.profile?.subscriptionPlan) {
      return;
    }
    
    setSelectedPlan(plan);
    setPaymentOpen(true);
  };

  // Process payment and update subscription
  const processPayment = () => {
    if (selectedPlan) {
      updateSubscription.mutate(selectedPlan);
    }
  };

  // Calculate usage percentage
  const calculateUsage = () => {
    if (!subscriptionData?.profile) return 0;
    
    const totalCases = getPlanCases(subscriptionData.profile.subscriptionPlan);
    const usedCases = totalCases - subscriptionData.profile.casesRemaining;
    return (usedCases / totalCases) * 100;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 flex justify-center items-center h-96">
        <Loader className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const currentPlan = subscriptionData?.profile?.subscriptionPlan || SUBSCRIPTION_PLANS.BASIC;
  const renewalDate = subscriptionData?.subscription?.endDate 
    ? new Date(subscriptionData.subscription.endDate)
    : addMonths(new Date(), 1);
  const usagePercentage = calculateUsage();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">Subscription Management</h1>
      </div>

      {/* Current Subscription Card */}
      <Card className="bg-white rounded-lg card-shadow mb-8">
        <CardHeader>
          <CardTitle>Your Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <Badge className="bg-accent bg-opacity-10 text-accent">
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
              </Badge>
              <h3 className="text-xl font-bold text-primary mt-2">
                {getPlanPrice(currentPlan)}<span className="text-sm font-normal text-secondary">/month</span>
              </h3>
              <p className="text-sm text-secondary mt-1">
                Renews on {format(renewalDate, "MMMM d, yyyy")}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex items-center mb-2">
                <Check className="text-success mr-2 h-4 w-4" />
                <p className="text-sm text-secondary">
                  {getPlanCases(currentPlan)} cases per month
                </p>
              </div>
              <div className="flex items-center mb-2">
                <Check className="text-success mr-2 h-4 w-4" />
                <p className="text-sm text-secondary">
                  {currentPlan === SUBSCRIPTION_PLANS.BASIC ? "Email support" : 
                   currentPlan === SUBSCRIPTION_PLANS.PRO ? "Priority support" :
                   "24/7 priority support"}
                </p>
              </div>
              <div className="flex items-center">
                <Check className="text-success mr-2 h-4 w-4" />
                <p className="text-sm text-secondary">
                  {currentPlan === SUBSCRIPTION_PLANS.BASIC ? "Basic reporting" : 
                   currentPlan === SUBSCRIPTION_PLANS.PRO ? "Advanced reporting" :
                   "Custom reporting"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="w-full md:w-2/3">
                <p className="text-sm font-medium text-secondary mb-2">Case Usage</p>
                <Progress value={usagePercentage} className="h-2.5" />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-secondary">
                    {getPlanCases(currentPlan) - (subscriptionData?.profile?.casesRemaining || 0)}/{getPlanCases(currentPlan)} used
                  </span>
                  <span className="text-xs text-secondary">
                    {subscriptionData?.profile?.casesRemaining || 0} remaining
                  </span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 text-right">
                <Button
                  variant="outline"
                  className="text-accent border-accent hover:bg-accent hover:text-white"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Payment Method
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-primary">Available Plans</h2>
          <p className="text-sm text-secondary mt-1">Choose the plan that works best for your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Basic Plan */}
          <Card className={`bg-white rounded-lg card-shadow ${currentPlan === SUBSCRIPTION_PLANS.BASIC ? "border-2 border-accent" : "border border-gray-200"} relative`}>
            {currentPlan === SUBSCRIPTION_PLANS.BASIC && (
              <div className="absolute top-0 right-0 bg-accent text-white text-xs font-medium px-3 py-1 rounded-bl">
                Current Plan
              </div>
            )}
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-primary">Basic</h3>
              <p className="text-3xl font-bold text-primary mt-2">
                $49<span className="text-sm font-normal text-secondary">/month</span>
              </p>
              <p className="text-sm text-secondary mt-2 mb-6">
                Ideal for small businesses with occasional investigation needs.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">5 cases per month</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">Access to verified investigators</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">Basic reporting</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">Email support</p>
                </div>
                <div className="flex items-start">
                  <X className="text-gray-400 mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-gray-400">Advanced reporting</p>
                </div>
                <div className="flex items-start">
                  <X className="text-gray-400 mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-gray-400">Priority matching</p>
                </div>
              </div>
              
              <Button 
                variant="secondary"
                className="w-full bg-gray-100 text-secondary hover:bg-gray-200"
                disabled={currentPlan === SUBSCRIPTION_PLANS.BASIC || updateSubscription.isPending}
                onClick={() => handleChangePlan(SUBSCRIPTION_PLANS.BASIC)}
              >
                {currentPlan === SUBSCRIPTION_PLANS.BASIC ? "Current Plan" : "Downgrade"}
              </Button>
            </CardContent>
          </Card>
          
          {/* Pro Plan */}
          <Card className={`bg-white rounded-lg card-shadow ${currentPlan === SUBSCRIPTION_PLANS.PRO ? "border-2 border-accent" : "border border-gray-200"} relative transform md:scale-105 z-10`}>
            {currentPlan === SUBSCRIPTION_PLANS.PRO && (
              <div className="absolute top-0 right-0 bg-accent text-white text-xs font-medium px-3 py-1 rounded-bl">
                Current Plan
              </div>
            )}
            <div className="bg-accent text-white text-xs font-semibold uppercase py-1 text-center">
              Most Popular
            </div>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-primary">Pro</h3>
              <p className="text-3xl font-bold text-primary mt-2">
                $149<span className="text-sm font-normal text-secondary">/month</span>
              </p>
              <p className="text-sm text-secondary mt-2 mb-6">
                Perfect for growing businesses with regular investigation needs.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">20 cases per month</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">Access to verified investigators</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">Advanced reporting</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">Priority support</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">Priority matching</p>
                </div>
                <div className="flex items-start">
                  <X className="text-gray-400 mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-gray-400">Dedicated account manager</p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-accent hover:bg-opacity-90 text-white"
                disabled={currentPlan === SUBSCRIPTION_PLANS.PRO || updateSubscription.isPending}
                onClick={() => handleChangePlan(SUBSCRIPTION_PLANS.PRO)}
              >
                {currentPlan === SUBSCRIPTION_PLANS.PRO ? "Current Plan" : 
                 currentPlan === SUBSCRIPTION_PLANS.ENTERPRISE ? "Downgrade to Pro" : "Upgrade to Pro"}
              </Button>
            </CardContent>
          </Card>
          
          {/* Enterprise Plan */}
          <Card className={`bg-white rounded-lg card-shadow ${currentPlan === SUBSCRIPTION_PLANS.ENTERPRISE ? "border-2 border-accent" : "border border-gray-200"} relative`}>
            {currentPlan === SUBSCRIPTION_PLANS.ENTERPRISE && (
              <div className="absolute top-0 right-0 bg-accent text-white text-xs font-medium px-3 py-1 rounded-bl">
                Current Plan
              </div>
            )}
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-primary">Enterprise</h3>
              <p className="text-3xl font-bold text-primary mt-2">
                Custom<span className="text-sm font-normal text-secondary"> pricing</span>
              </p>
              <p className="text-sm text-secondary mt-2 mb-6">
                Tailored solutions for businesses with extensive investigation needs.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">Unlimited cases</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">Access to elite investigators</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">Custom reporting</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">24/7 priority support</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">VIP matching</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-success mt-1 mr-3 h-4 w-4" />
                  <p className="text-sm text-secondary">Dedicated account manager</p>
                </div>
              </div>
              
              <Button 
                variant="default" 
                className="w-full bg-primary hover:bg-opacity-90 text-white"
                disabled={currentPlan === SUBSCRIPTION_PLANS.ENTERPRISE || updateSubscription.isPending}
                onClick={() => handleChangePlan(SUBSCRIPTION_PLANS.ENTERPRISE)}
              >
                {currentPlan === SUBSCRIPTION_PLANS.ENTERPRISE ? "Current Plan" : "Contact Sales"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Subscription</DialogTitle>
            <DialogDescription>
              {selectedPlan === SUBSCRIPTION_PLANS.BASIC && "Downgrade to Basic Plan ($49/month)"}
              {selectedPlan === SUBSCRIPTION_PLANS.PRO && "Upgrade to Pro Plan ($149/month)"}
              {selectedPlan === SUBSCRIPTION_PLANS.ENTERPRISE && "Upgrade to Enterprise Plan (Custom pricing)"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input id="card-number" placeholder="4242 4242 4242 4242" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name on Card</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={processPayment}
              disabled={updateSubscription.isPending}
              className="bg-accent text-white"
            >
              {updateSubscription.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscription;
