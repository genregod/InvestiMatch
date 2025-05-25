import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form schema for new case
const caseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  caseType: z.string().min(1, "Please select a case type"),
  location: z.string().optional(),
});

type CaseFormValues = z.infer<typeof caseSchema>;

const NewCase = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Form setup
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: "",
      description: "",
      caseType: "",
      location: "",
    },
  });

  // Check subscription status
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/subscription'],
    refetchOnWindowFocus: false,
  });

  // Create case mutation
  const createCase = useMutation({
    mutationFn: async (values: CaseFormValues) => {
      const response = await apiRequest("POST", "/api/cases", values);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Case Created",
        description: "Your case has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      navigate(`/cases/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: CaseFormValues) => {
    createCase.mutate(values);
  };

  // Check if user has cases remaining
  const hasCasesRemaining = subscription?.profile?.casesRemaining > 0;

  if (subscriptionLoading) {
    return (
      <div className="container mx-auto px-6 py-8 flex justify-center items-center h-96">
        <Loader className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">Create New Case</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-lg card-shadow">
            <CardHeader>
              <CardTitle>Case Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!hasCasesRemaining ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">
                    You have used all your available cases for this month.
                  </p>
                  <Button onClick={() => navigate("/subscription")}>
                    Upgrade Your Subscription
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Background Check Investigation" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            A clear, concise title for your investigation case.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="caseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a case type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="background">Background Check</SelectItem>
                              <SelectItem value="corporate">Corporate Investigation</SelectItem>
                              <SelectItem value="fraud">Fraud Investigation</SelectItem>
                              <SelectItem value="asset">Asset Location & Recovery</SelectItem>
                              <SelectItem value="surveillance">Surveillance</SelectItem>
                              <SelectItem value="digital">Digital Forensics</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the type of investigation you need.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Seattle, WA" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The primary location for this investigation, if applicable.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide details about what you need investigated..." 
                              className="min-h-32" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Describe the details of your case, including what you're looking to investigate and any relevant background information.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-accent text-white"
                        disabled={createCase.isPending}
                      >
                        {createCase.isPending ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Case"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-white rounded-lg card-shadow">
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-secondary">Current Plan</p>
                  <p className="font-medium text-primary">
                    {subscription?.profile?.subscriptionPlan?.charAt(0).toUpperCase() + 
                      subscription?.profile?.subscriptionPlan?.slice(1) || "Basic"} Plan
                  </p>
                </div>

                <div>
                  <p className="text-sm text-secondary">Cases Available</p>
                  <p className={`font-medium ${hasCasesRemaining ? 'text-primary' : 'text-red-500'}`}>
                    {subscription?.profile?.casesRemaining || 0} remaining
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-secondary mb-2">Usage</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-accent h-2.5 rounded-full" 
                      style={{ 
                        width: `${subscription?.profile ? 
                          ((subscription.profile.casesRemaining / getMaxCases(subscription.profile.subscriptionPlan)) * 100) :
                          0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-secondary mt-2">
                    {subscription?.profile ? 
                      `${getMaxCases(subscription.profile.subscriptionPlan) - subscription.profile.casesRemaining}/${getMaxCases(subscription.profile.subscriptionPlan)} used` :
                      "0/5 used"}
                  </p>
                </div>

                <Button 
                  onClick={() => navigate("/subscription")} 
                  variant="outline" 
                  className="w-full mt-4"
                >
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-lg card-shadow mt-6">
            <CardHeader>
              <CardTitle>Tips for Case Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-secondary">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Be specific about what you want investigated</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Include relevant dates, names, and locations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Specify any legal constraints or considerations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Note any deadlines or time constraints</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Mention any previous investigation attempts</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper function to get max cases based on subscription plan
function getMaxCases(plan: string | undefined): number {
  switch (plan) {
    case "basic":
      return 5;
    case "pro":
      return 20;
    case "enterprise":
      return 999;
    default:
      return 5;
  }
}

export default NewCase;
