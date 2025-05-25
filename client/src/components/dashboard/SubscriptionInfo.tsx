import { useState } from "react";
import { Link } from "wouter";
import { Subscription } from "@shared/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionInfoProps {
  subscription: Subscription;
  onUpgrade?: () => void;
}

const SubscriptionInfo = ({ subscription, onUpgrade }: SubscriptionInfoProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Format the next payment date
  const formatNextPaymentDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle upgrade button click
  const handleUpgrade = async () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }

    try {
      setIsLoading(true);
      await apiRequest("POST", "/api/subscriptions/upgrade", { 
        currentPlan: subscription.plan 
      });
      toast({
        title: "Upgrade requested",
        description: "You'll be redirected to complete your upgrade.",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process upgrade request. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine remaining cases message
  const getRemainingCasesMessage = () => {
    if (subscription.plan === "Basic") {
      return `${subscription.casesUsed} of 5 used`;
    } else if (subscription.plan === "Pro") {
      return `${subscription.casesUsed} of 20 used`;
    } else {
      return "Unlimited cases";
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-card">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-primary">{subscription.plan} Plan</h3>
              <span className="ml-2 px-2 py-1 bg-accent bg-opacity-10 text-accent text-xs font-medium rounded">
                Active
              </span>
            </div>
            <p className="text-sm text-secondary mt-1">
              Billed {subscription.billingCycle} - Next payment on {formatNextPaymentDate(subscription.nextBillingDate)}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="text-2xl font-bold text-primary">
              ${subscription.amount}
              <span className="text-sm font-medium text-secondary">/{subscription.billingCycle === "monthly" ? "month" : "year"}</span>
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-primary mb-4">Plan Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-success mr-2 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-primary">
                  {subscription.plan === "Basic" ? "5 Cases per Month" : 
                   subscription.plan === "Pro" ? "20 Cases per Month" : 
                   "Unlimited Cases"}
                </h5>
                <p className="text-xs text-secondary">{getRemainingCasesMessage()}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Check className="h-5 w-5 text-success mr-2 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-primary">
                  {subscription.plan !== "Basic" ? "Priority Matching" : "Standard Matching"}
                </h5>
                <p className="text-xs text-secondary">
                  {subscription.plan !== "Basic" 
                    ? "Match with top-rated investigators first" 
                    : "Regular investigator matching"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Check className="h-5 w-5 text-success mr-2 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-primary">
                  {subscription.plan === "Enterprise" 
                    ? "Enterprise Case Management" 
                    : subscription.plan === "Pro" 
                      ? "Advanced Case Management" 
                      : "Basic Case Management"}
                </h5>
                <p className="text-xs text-secondary">
                  {subscription.plan === "Enterprise" 
                    ? "Custom reporting and unlimited storage" 
                    : subscription.plan === "Pro" 
                      ? "Full reporting and document storage" 
                      : "Essential reporting features"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Check className="h-5 w-5 text-success mr-2 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-primary">
                  {subscription.plan === "Enterprise" 
                    ? "24/7 Support" 
                    : subscription.plan === "Pro" 
                      ? "Dedicated Support" 
                      : "Standard Support"}
                </h5>
                <p className="text-xs text-secondary">
                  {subscription.plan === "Enterprise" 
                    ? "24/7 phone, chat, and email support" 
                    : subscription.plan === "Pro" 
                      ? "Priority email and phone support" 
                      : "Email support"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {subscription.plan !== "Enterprise" && (
          <div className="border-t border-gray-200 mt-6 pt-6 flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-sm font-semibold text-primary">Need more cases?</h4>
              <p className="text-xs text-secondary mt-1">
                {subscription.plan === "Basic" 
                  ? "Upgrade to Pro for 20 cases per month" 
                  : "Upgrade to Enterprise for unlimited cases"}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/subscription">
                <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                  Learn More
                </Button>
              </Link>
              <Button 
                onClick={handleUpgrade}
                disabled={isLoading}
                className="bg-accent text-white hover:bg-accent-dark"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Upgrade"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionInfo;
