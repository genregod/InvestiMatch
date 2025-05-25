import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS } from "@shared/schema";
import { Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

type SubscriptionPlansProps = {
  currentPlan: string;
};

const SubscriptionPlans = ({ currentPlan }: SubscriptionPlansProps) => {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (plan: string) => {
    if (plan === currentPlan) return;
    
    setIsUpgrading(true);
    try {
      await apiRequest("POST", "/api/subscription/change", { plan });
      toast({
        title: "Subscription Updated",
        description: `Your subscription has been updated to the ${plan} plan.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
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
              disabled={currentPlan === SUBSCRIPTION_PLANS.BASIC || isUpgrading}
              onClick={() => handleUpgrade(SUBSCRIPTION_PLANS.BASIC)}
            >
              {currentPlan === SUBSCRIPTION_PLANS.BASIC ? "Current Plan" : "Downgrade"}
            </Button>
          </CardContent>
        </Card>
        
        {/* Pro Plan */}
        <Card className={`bg-white rounded-lg card-shadow ${currentPlan === SUBSCRIPTION_PLANS.PRO ? "border-2 border-accent" : "border border-gray-200"} relative`}>
          {currentPlan === SUBSCRIPTION_PLANS.PRO && (
            <div className="absolute top-0 right-0 bg-accent text-white text-xs font-medium px-3 py-1 rounded-bl">
              Current Plan
            </div>
          )}
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
              disabled={currentPlan === SUBSCRIPTION_PLANS.PRO || isUpgrading}
              onClick={() => handleUpgrade(SUBSCRIPTION_PLANS.PRO)}
            >
              {currentPlan === SUBSCRIPTION_PLANS.PRO ? "Current Plan" : currentPlan === SUBSCRIPTION_PLANS.ENTERPRISE ? "Downgrade to Pro" : "Upgrade to Pro"}
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
              disabled={currentPlan === SUBSCRIPTION_PLANS.ENTERPRISE || isUpgrading}
              onClick={() => handleUpgrade(SUBSCRIPTION_PLANS.ENTERPRISE)}
            >
              {currentPlan === SUBSCRIPTION_PLANS.ENTERPRISE ? "Current Plan" : "Contact Sales"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
