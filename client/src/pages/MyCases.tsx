import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Loader, 
  ChevronRight, 
  Clock, 
  Calendar, 
  MapPin, 
  FileText, 
  MessageSquare, 
  Star, 
  Send 
} from "lucide-react";
import { USER_ROLES, CASE_STATUS } from "@shared/schema";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface MyCasesProps {
  id?: string;
}

const MyCases = ({ id }: MyCasesProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(id || null);
  const [newMessage, setNewMessage] = useState("");
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();

  // Fetch all user cases
  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ["/api/cases"],
    refetchOnWindowFocus: false,
  });

  // Fetch selected case details
  const { data: caseDetails, isLoading: caseDetailsLoading } = useQuery({
    queryKey: [selectedCaseId ? `/api/cases/${selectedCaseId}` : null],
    enabled: !!selectedCaseId,
  });

  // Update case status mutation
  const updateCaseStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/cases/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Case Updated",
        description: "Case status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      if (selectedCaseId) {
        queryClient.invalidateQueries({ queryKey: [`/api/cases/${selectedCaseId}`] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update case status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ caseId, content }: { caseId: string; content: string }) => {
      await apiRequest("POST", `/api/cases/${caseId}/messages`, { content });
    },
    onSuccess: () => {
      setNewMessage("");
      if (selectedCaseId) {
        queryClient.invalidateQueries({ queryKey: [`/api/cases/${selectedCaseId}`] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async ({ caseId, rating, comment }: { caseId: string; rating: number; comment: string }) => {
      await apiRequest("POST", `/api/cases/${caseId}/review`, { rating, comment });
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      if (selectedCaseId) {
        queryClient.invalidateQueries({ queryKey: [`/api/cases/${selectedCaseId}`] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update URL when case is selected
  useEffect(() => {
    if (selectedCaseId) {
      navigate(`/cases/${selectedCaseId}`, { replace: true });
    }
  }, [selectedCaseId]);

  // Filter cases based on active tab
  const filteredCases = cases?.filter((caseItem: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return caseItem.status === CASE_STATUS.ACTIVE || caseItem.status === CASE_STATUS.NEW;
    if (activeTab === "completed") return caseItem.status === CASE_STATUS.COMPLETED;
    return true;
  });

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCaseId) return;
    
    sendMessage.mutate({
      caseId: selectedCaseId,
      content: newMessage,
    });
  };

  // Handle case status change
  const handleStatusChange = (id: string, status: string) => {
    updateCaseStatus.mutate({ id, status });
  };

  // Get case status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case CASE_STATUS.NEW:
        return "bg-blue-100 text-blue-700";
      case CASE_STATUS.ACTIVE:
        return "bg-green-100 text-success";
      case CASE_STATUS.ON_HOLD:
        return "bg-yellow-100 text-yellow-700";
      case CASE_STATUS.COMPLETED:
        return "bg-purple-100 text-purple-700";
      case CASE_STATUS.CANCELLED:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (casesLoading) {
    return (
      <div className="container mx-auto px-6 py-8 flex justify-center items-center h-96">
        <Loader className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">My Cases</h1>
        {user?.role === USER_ROLES.SUBSCRIBER && (
          <Link href="/cases/new">
            <Button className="bg-accent hover:bg-opacity-90 text-white">
              <svg
                className="mr-2"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Case
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-white rounded-lg card-shadow">
            <CardHeader>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {!filteredCases || filteredCases.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-secondary">No cases found.</p>
                  {user?.role === USER_ROLES.SUBSCRIBER && (
                    <Link href="/cases/new">
                      <Button variant="link" className="mt-2">
                        Create your first case
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCases.map((caseItem: any) => (
                    <div
                      key={caseItem.id}
                      className={`p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedCaseId === caseItem.id.toString() ? "bg-gray-50 border-accent" : "border-gray-200"
                      }`}
                      onClick={() => setSelectedCaseId(caseItem.id.toString())}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-primary">
                          {caseItem.title.length > 20
                            ? `${caseItem.title.substring(0, 20)}...`
                            : caseItem.title}
                        </h3>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={getStatusBadge(caseItem.status)}>
                          {caseItem.status}
                        </Badge>
                        <span className="text-xs text-secondary">
                          {format(new Date(caseItem.startDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedCaseId && caseDetailsLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : selectedCaseId && caseDetails ? (
            <Card className="bg-white rounded-lg card-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <Badge className={getStatusBadge(caseDetails.case.status)}>
                      {caseDetails.case.status}
                    </Badge>
                    <CardTitle className="mt-2">{caseDetails.case.title}</CardTitle>
                  </div>
                  {user?.role === USER_ROLES.SUBSCRIBER && (
                    <Select
                      value={caseDetails.case.status}
                      onValueChange={(value) => handleStatusChange(caseDetails.case.id, value)}
                      disabled={updateCaseStatus.isPending}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CASE_STATUS.NEW}>New</SelectItem>
                        <SelectItem value={CASE_STATUS.ACTIVE}>Active</SelectItem>
                        <SelectItem value={CASE_STATUS.ON_HOLD}>On Hold</SelectItem>
                        <SelectItem value={CASE_STATUS.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={CASE_STATUS.CANCELLED}>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-semibold text-primary mb-2">Case Details</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-secondary">
                          Started: {format(new Date(caseDetails.case.startDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      {caseDetails.case.endDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-secondary">
                            Completed: {format(new Date(caseDetails.case.endDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-secondary">
                          Type: {caseDetails.case.caseType}
                        </span>
                      </div>
                      {caseDetails.case.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-secondary">
                            Location: {caseDetails.case.location}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-secondary">{caseDetails.case.description}</p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-secondary">Progress</h3>
                      <span className="text-sm text-secondary">{caseDetails.case.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-accent h-2.5 rounded-full"
                        style={{ width: `${caseDetails.case.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Investigator details */}
                  {caseDetails.case.investigatorId ? (
                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="text-md font-semibold text-primary mb-3">Assigned Investigator</h3>
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src="/placeholder-investigator.jpg" alt="Investigator" />
                          <AvatarFallback>PI</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-primary">Investigator #{caseDetails.case.investigatorId}</p>
                          <Link href={`/investigators/${caseDetails.case.investigatorId}`}>
                            <Button variant="link" className="p-0 h-auto text-accent text-sm">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    user?.role === USER_ROLES.SUBSCRIBER && (
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm text-secondary mb-2">No investigator assigned yet.</p>
                        <Link href="/find-investigators">
                          <Button size="sm" className="bg-accent text-white">
                            Find an Investigator
                          </Button>
                        </Link>
                      </div>
                    )
                  )}

                  {/* Messages */}
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-md font-semibold text-primary mb-3 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" /> Messages
                    </h3>
                    <div className="bg-gray-50 rounded-md p-4 h-64 overflow-y-auto mb-4">
                      {caseDetails.messages && caseDetails.messages.length > 0 ? (
                        <div className="space-y-4">
                          {caseDetails.messages.map((message: any) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.senderId === user?.id ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  message.senderId === user?.id
                                    ? "bg-accent text-white"
                                    : "bg-white border border-gray-200"
                                }`}
                              >
                                <p className="text-sm">
                                  {message.content}
                                </p>
                                <p
                                  className={`text-xs mt-1 ${
                                    message.senderId === user?.id ? "text-white/70" : "text-gray-400"
                                  }`}
                                >
                                  {format(new Date(message.createdAt), "MMM d, h:mm a")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-secondary text-sm py-10">
                          No messages yet. Start the conversation!
                        </p>
                      )}
                    </div>
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={!caseDetails.case.investigatorId || sendMessage.isPending}
                      />
                      <Button
                        type="submit"
                        disabled={!newMessage.trim() || !caseDetails.case.investigatorId || sendMessage.isPending}
                      >
                        {sendMessage.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                  </div>

                  {/* Review section - only show for subscribers with completed cases */}
                  {user?.role === USER_ROLES.SUBSCRIBER && 
                   caseDetails.case.status === CASE_STATUS.COMPLETED && 
                   caseDetails.case.investigatorId && (
                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="text-md font-semibold text-primary mb-3 flex items-center">
                        <Star className="h-4 w-4 mr-2" /> Leave a Review
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-1">
                            Rating
                          </label>
                          <Select defaultValue="5">
                            <SelectTrigger>
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 Stars - Excellent</SelectItem>
                              <SelectItem value="4">4 Stars - Very Good</SelectItem>
                              <SelectItem value="3">3 Stars - Good</SelectItem>
                              <SelectItem value="2">2 Stars - Fair</SelectItem>
                              <SelectItem value="1">1 Star - Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-1">
                            Comments
                          </label>
                          <Textarea placeholder="Share your experience with this investigator..." />
                        </div>
                        <Button className="bg-accent text-white">
                          Submit Review
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white rounded-lg card-shadow">
              <CardContent className="p-10 text-center">
                <p className="text-secondary mb-4">
                  Select a case from the list to view details.
                </p>
                {user?.role === USER_ROLES.SUBSCRIBER && (
                  <Link href="/cases/new">
                    <Button>Create New Case</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCases;
