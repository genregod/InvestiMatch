import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Case } from "@shared/types";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  PenSquare, 
  Trash2, 
  Clock, 
  Calendar, 
  MapPin, 
  DollarSign, 
  AlertCircle, 
  MessageSquare 
} from "lucide-react";

interface CaseDetailsProps {
  caseData: Case;
  onEdit?: () => void;
}

const CaseDetails = ({ caseData, onEdit }: CaseDetailsProps) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  // Format case status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case "awaiting info":
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      case "review needed":
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format case type badge
  const getCaseTypeBadge = (type: string) => {
    const types: Record<string, { bg: string, text: string }> = {
      "background-check": { bg: "bg-indigo-100", text: "text-indigo-800" },
      "asset-search": { bg: "bg-purple-100", text: "text-purple-800" },
      "fraud-investigation": { bg: "bg-red-100", text: "text-red-800" },
      "missing-person": { bg: "bg-orange-100", text: "text-orange-800" },
      "corporate-investigation": { bg: "bg-blue-100", text: "text-blue-800" },
      "surveillance": { bg: "bg-green-100", text: "text-green-800" },
      "digital-forensics": { bg: "bg-cyan-100", text: "text-cyan-800" },
      "other": { bg: "bg-gray-100", text: "text-gray-800" },
    };
    
    const style = types[type] || types["other"];
    
    return (
      <Badge className={`${style.bg} ${style.text}`}>
        {type.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
      </Badge>
    );
  };

  // Format priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority} Priority</Badge>;
    }
  };

  // Format the date to a readable format
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle case deletion
  const handleDeleteCase = async () => {
    try {
      setIsDeleting(true);
      await apiRequest("DELETE", `/api/cases/${caseData.id}`, null);
      
      toast({
        title: "Case Deleted",
        description: "The case has been successfully deleted.",
      });
      
      // Invalidate cases query
      queryClient.invalidateQueries({ queryKey: ['/api/cases'] });
      
      // Redirect to cases page
      setLocation("/cases");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{caseData.title}</CardTitle>
            <CardDescription className="mt-1">
              Case #{caseData.id} • Created {formatDate(caseData.createdAt)}
            </CardDescription>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="flex items-center" 
              onClick={onEdit}
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the case
                    and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteCase} 
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {getStatusBadge(caseData.status)}
          {getCaseTypeBadge(caseData.type)}
          {getPriorityBadge(caseData.priority)}
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Case Details</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-secondary mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-secondary">{caseData.status}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-secondary mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Last Activity</p>
                  <p className="text-sm text-secondary">
                    {formatDate(caseData.lastActivity)} ({formatDistanceToNow(new Date(caseData.lastActivity), { addSuffix: true })})
                  </p>
                </div>
              </div>
              
              {caseData.location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-secondary mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-secondary">{caseData.location}</p>
                  </div>
                </div>
              )}
              
              {caseData.budget && (
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-secondary mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Budget</p>
                    <p className="text-sm text-secondary">{caseData.budget}</p>
                  </div>
                </div>
              )}
              
              {caseData.timeframe && (
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-secondary mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Timeframe</p>
                    <p className="text-sm text-secondary">{caseData.timeframe}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Assigned Investigator</h3>
            
            {caseData.investigator ? (
              <div className="flex items-start">
                <img 
                  src={caseData.investigator.profileImageUrl || "https://via.placeholder.com/50"} 
                  alt={`${caseData.investigator.firstName} ${caseData.investigator.lastName}`} 
                  className="h-12 w-12 rounded-full object-cover mr-3" 
                />
                <div>
                  <p className="font-medium">
                    {caseData.investigator.firstName} {caseData.investigator.lastName}
                  </p>
                  <p className="text-sm text-secondary">{caseData.investigator.specialization}</p>
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-accent border-accent hover:bg-accent hover:text-white"
                      onClick={() => setLocation(`/messages?case=${caseData.id}`)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-yellow-50 rounded-md border border-yellow-200 text-yellow-800">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">No investigator assigned yet</span>
              </div>
            )}
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Case Description</h3>
          <div className="whitespace-pre-line text-secondary">
            {caseData.description}
          </div>
        </div>
        
        {caseData.updates && caseData.updates.length > 0 && (
          <>
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Case Updates</h3>
              
              <Accordion type="single" collapsible className="w-full">
                {caseData.updates.map((update, index) => (
                  <AccordionItem key={index} value={`update-${index}`}>
                    <AccordionTrigger className="py-4">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">{update.title}</span>
                        <span className="text-xs text-secondary mt-1">
                          {formatDate(update.date)} - {update.author}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pb-4 text-secondary">
                        {update.content}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" onClick={() => setLocation("/cases")}>
          Back to Cases
        </Button>
        
        <Button 
          className="bg-accent hover:bg-accent-dark text-white"
          onClick={() => setLocation(`/messages?case=${caseData.id}`)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact Investigator
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CaseDetails;
