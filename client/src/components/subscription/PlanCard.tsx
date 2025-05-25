import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface PlanCardProps {
  name: string;
  price: number;
  interval: "month" | "year";
  description: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  buttonText?: string;
  onSubscribe?: () => void;
}

const PlanCard = ({
  name,
  price,
  interval,
  description,
  features,
  isPopular = false,
  isCurrentPlan = false,
  buttonText = "Subscribe",
  onSubscribe,
}: PlanCardProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Handle subscription button click
  const handleSubscribe = async () => {
    if (onSubscribe) {
      onSubscribe();
      return;
    }

    try {
      setIsLoading(true);
      
      // Call the API to initiate subscription
      await apiRequest("POST", "/api/subscriptions/subscribe", {
        plan: name,
        interval,
      });
      
      toast({
        title: "Subscription Initiated",
        description: "You'll be redirected to complete your subscription.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process subscription request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`shadow-card ${isPopular ? "border-accent" : ""} ${isCurrentPlan ? "bg-accent/5" : ""}`}>
      {isPopular && (
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <Badge className="bg-accent text-white">Popular</Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{name}</CardTitle>
          {isCurrentPlan && <Badge variant="outline">Current Plan</Badge>}
        </div>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold">${price}</span>
          <span className="text-sm text-secondary ml-1">/{interval}</span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className={`rounded-full p-1 ${feature.included ? "bg-success/20 text-success" : "bg-secondary/20 text-secondary"} mr-2 mt-0.5`}>
                <Check className="h-3 w-3" />
              </div>
              <div>
                <span className="text-sm font-medium">{feature.name}</span>
                {feature.description && (
                  <p className="text-xs text-secondary mt-0.5">{feature.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          className={`w-full ${isCurrentPlan ? "bg-secondary text-white hover:bg-secondary/90" : "bg-accent text-white hover:bg-accent-dark"}`}
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : (
            buttonText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
