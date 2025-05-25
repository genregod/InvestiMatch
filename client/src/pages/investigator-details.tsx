import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Investigator, Case } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/ui/Sidebar";
import InvestigatorProfile from "@/components/marketplace/InvestigatorProfile";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChevronLeft, CreditCard, FileText } from "lucide-react";

const InvestigatorDetailsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute<{ id: string }>("/investigator/:id");
  const [, setLocation] = useLocation();
  
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const investigatorId = params?.id;

  // Fetch investigator details
  const { 
    data: investigator, 
    isLoading, 
    isError 
  } = useQuery<Investigator>({
    queryKey: [`/api/investigators/${investigatorId}`],
    enabled: !!investigatorId,
  });

  // Fetch user's cases for dropdown
  const { data: userCases } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
    enabled: !!user,
  });

  // Handle contact investigator form submission
  const handleContactSubmit = async () => {
    if (!message.trim() || !caseTitle.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await apiRequest("POST", `/api/messages/contact/${investigatorId}`, {
        caseTitle,
        message
      });
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the investigator.",
      });
      
      setIsContactDialogOpen(false);
      setCaseTitle("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle new case form submission
  const handleNewCaseSubmit = async () => {
    if (!caseTitle.trim() || !caseDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await apiRequest("POST", "/api/cases", {
        title: caseTitle,
        description: caseDescription,
        investigatorId,
        type: "other", // Default type, would normally be selected by user
        priority: "medium", // Default priority, would normally be selected by user
      });
      
      const newCase = await response.json();
      
      toast({
        title: "Case Created",
        description: "Your new case has been successfully created.",
      });
      
      setIsNewCaseDialogOpen(false);
      setCaseTitle("");
      setCaseDescription("");
      
      // Redirect to the new case
      setLocation(`/case/${newCase.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 p-6 bg-background flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (isError || !investigator) {
    return (
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 p-6 bg-background flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Investigator Not Found</h1>
          <p className="text-secondary mb-6">The investigator profile you're looking for doesn't exist or is no longer available.</p>
          <Button 
            onClick={() => setLocation("/marketplace")}
            className="bg-accent hover:bg-accent-dark text-white"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 p-6 bg-background">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation("/marketplace")}
              className="mb-4"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Button>
          </div>
          
          {/* Investigator Profile */}
          <InvestigatorProfile investigator={investigator} detailed={true} />
          
          {/* Actions Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="bg-accent hover:bg-accent-dark text-white flex-1 sm:flex-none sm:min-w-[200px]"
              onClick={() => setIsContactDialogOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Contact Investigator
            </Button>
            <Button 
              variant="outline"
              className="flex-1 sm:flex-none sm:min-w-[200px]"
              onClick={() => setIsNewCaseDialogOpen(true)}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Create New Case
            </Button>
          </div>
        </div>
      </div>
      
      {/* Contact Investigator Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact {investigator.firstName} {investigator.lastName}</DialogTitle>
            <DialogDescription>
              Send a message to inquire about your case needs
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="case-title" className="text-right text-sm font-medium col-span-1">
                Case Title
              </label>
              <Input
                id="case-title"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                className="col-span-3"
                placeholder="Brief description of your case"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="message" className="text-right text-sm font-medium col-span-1 pt-2">
                Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="col-span-3"
                rows={5}
                placeholder="Describe your case and what assistance you need"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsContactDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleContactSubmit}
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent-dark text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                "Send Message"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create New Case Dialog */}
      <Dialog open={isNewCaseDialogOpen} onOpenChange={setIsNewCaseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create a Case with {investigator.firstName} {investigator.lastName}</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new investigation case
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-case-title" className="text-right text-sm font-medium col-span-1">
                Case Title
              </label>
              <Input
                id="new-case-title"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Background Check: Smith Co."
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="case-description" className="text-right text-sm font-medium col-span-1 pt-2">
                Description
              </label>
              <Textarea
                id="case-description"
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                className="col-span-3"
                rows={8}
                placeholder="Provide detailed information about what you need investigated..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewCaseDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleNewCaseSubmit}
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent-dark text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Case"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestigatorDetailsPage;
