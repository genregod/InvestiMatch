import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS } from "@shared/schema";
import { format } from "date-fns";
import { Check } from "lucide-react";

type SubscriptionInfoProps = {
  subscription?: {
    plan: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    autoRenew: boolean;
  };
  profile?: {
    casesRemaining: number;
  };
};

const SubscriptionInfo = ({ subscription, profile }: SubscriptionInfoProps) => {
  if (!subscription) return null;

  const renewalDate = subscription.endDate ? new Date(subscription.endDate) : new Date();
  const planLabel = subscription.plan === SUBSCRIPTION_PLANS.BASIC
    ? "Basic Plan"
    : subscription.plan === SUBSCRIPTION_PLANS.PRO
      ? "Pro Plan"
      : "Enterprise Plan";

  const maxCases = subscription.plan === SUBSCRIPTION_PLANS.BASIC
    ? 5
    : subscription.plan === SUBSCRIPTION_PLANS.PRO
      ? 20
      : 999;

  const usedCases = maxCases - (profile?.casesRemaining || 0);
  const percentUsed = (usedCases / maxCases) * 100;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary">Your Subscription</h2>
        <Link href="/subscription" className="text-accent hover:underline text-sm font-medium">
          Manage Subscription
        </Link>
      </div>

      <Card className="bg-white rounded-lg card-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <span className="bg-accent bg-opacity-10 text-accent text-xs font-medium px-2.5 py-1 rounded-full">
                {planLabel}
              </span>
              <h3 className="text-xl font-bold text-primary mt-2">
                {subscription.plan === SUBSCRIPTION_PLANS.BASIC && "$49"}
                {subscription.plan === SUBSCRIPTION_PLANS.PRO && "$149"}
                {subscription.plan === SUBSCRIPTION_PLANS.ENTERPRISE && "Custom"}
                <span className="text-sm font-normal text-secondary">/month</span>
              </h3>
              <p className="text-sm text-secondary mt-1">
                Renews on {format(renewalDate, "MMMM d, yyyy")}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex items-center mb-2">
                <Check className="text-success mr-2 h-4 w-4" />
                <p className="text-sm text-secondary">
                  {subscription.plan === SUBSCRIPTION_PLANS.BASIC && "5 cases per month"}
                  {subscription.plan === SUBSCRIPTION_PLANS.PRO && "20 cases per month"}
                  {subscription.plan === SUBSCRIPTION_PLANS.ENTERPRISE && "Unlimited cases"}
                </p>
              </div>
              <div className="flex items-center mb-2">
                <Check className="text-success mr-2 h-4 w-4" />
                <p className="text-sm text-secondary">Priority support</p>
              </div>
              <div className="flex items-center">
                <Check className="text-success mr-2 h-4 w-4" />
                <p className="text-sm text-secondary">
                  {subscription.plan === SUBSCRIPTION_PLANS.BASIC && "Basic reporting"}
                  {subscription.plan === SUBSCRIPTION_PLANS.PRO && "Advanced reporting"}
                  {subscription.plan === SUBSCRIPTION_PLANS.ENTERPRISE && "Custom reporting"}
                </p>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0">
              <Link href="/subscription">
                <Button className="bg-accent hover:bg-opacity-90 text-white px-6 py-2 rounded-md font-medium">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Case Usage</p>
                <div className="flex items-center mt-1">
                  <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-accent h-2.5 rounded-full" 
                      style={{ width: `${percentUsed}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-secondary ml-3">
                    {usedCases}/{maxCases} used
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-secondary">Need More Cases?</p>
                <Link href="/subscription">
                  <Button variant="link" className="text-accent hover:underline text-sm font-medium mt-1 p-0">
                    View Upgrade Options
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionInfo;
