import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Case } from "@shared/types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Define form schema
const caseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description must be less than 1000 characters"),
  type: z.string().min(1, "Please select a case type"),
  priority: z.string().min(1, "Please select a priority level"),
  location: z.string().optional(),
  budget: z.string().optional(),
  timeframe: z.string().optional(),
});

type CaseFormValues = z.infer<typeof caseSchema>;

interface CaseFormProps {
  initialData?: Partial<Case>;
  isEdit?: boolean;
}

const CaseForm = ({ initialData, isEdit = false }: CaseFormProps) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values or edit data
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: initialData?.type || "",
      priority: initialData?.priority || "",
      location: initialData?.location || "",
      budget: initialData?.budget || "",
      timeframe: initialData?.timeframe || "",
    },
  });

  // Form submission handler
  const onSubmit = async (data: CaseFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEdit && initialData?.id) {
        // Update existing case
        await apiRequest("PATCH", `/api/cases/${initialData.id}`, data);
        toast({
          title: "Case Updated",
          description: "Your case has been successfully updated.",
        });
        setLocation(`/case/${initialData.id}`);
      } else {
        // Create new case
        const response = await apiRequest("POST", "/api/cases", data);
        const newCase = await response.json();
        toast({
          title: "Case Created",
          description: "Your new case has been successfully created.",
        });
        setLocation(`/case/${newCase.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: isEdit 
          ? "Failed to update case. Please try again." 
          : "Failed to create case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-card">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Case" : "Create New Case"}</CardTitle>
        <CardDescription>
          {isEdit 
            ? "Update the details of your existing case." 
            : "Fill in the details to create a new investigation case."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Background Check: Smith Co." {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, concise title for your investigation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select case type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="background-check">Background Check</SelectItem>
                      <SelectItem value="asset-search">Asset Search</SelectItem>
                      <SelectItem value="fraud-investigation">Fraud Investigation</SelectItem>
                      <SelectItem value="missing-person">Missing Person</SelectItem>
                      <SelectItem value="corporate-investigation">Corporate Investigation</SelectItem>
                      <SelectItem value="surveillance">Surveillance</SelectItem>
                      <SelectItem value="digital-forensics">Digital Forensics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the category that best describes your investigation
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
                      placeholder="Provide detailed information about what you need investigated..." 
                      className="min-h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include all relevant details to help investigators understand your needs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - Not Time-Sensitive</SelectItem>
                        <SelectItem value="medium">Medium - Somewhat Urgent</SelectItem>
                        <SelectItem value="high">High - Urgent</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="e.g., New York, NY" {...field} />
                    </FormControl>
                    <FormDescription>
                      Where the investigation should take place
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $1,000-$2,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeframe (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 weeks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation(isEdit ? `/case/${initialData?.id}` : "/cases")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-accent hover:bg-accent-dark" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEdit ? "Update Case" : "Create Case"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CaseForm;
