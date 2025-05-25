import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader, Send, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Messages = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Parse caseId from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const caseId = params.get("caseId");
    if (caseId) {
      setSelectedCase(parseInt(caseId));
    }
  }, [location]);

  // Fetch user's cases
  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ["/api/cases"],
    refetchOnWindowFocus: false,
  });

  // Fetch selected case details
  const { data: caseDetails, isLoading: caseDetailsLoading } = useQuery({
    queryKey: [selectedCase ? `/api/cases/${selectedCase}` : null],
    enabled: !!selectedCase,
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ caseId, content }: { caseId: number; content: string }) => {
      await apiRequest("POST", `/api/cases/${caseId}/messages`, { content });
    },
    onSuccess: () => {
      setNewMessage("");
      if (selectedCase) {
        queryClient.invalidateQueries({ queryKey: [`/api/cases/${selectedCase}`] });
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

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCase) return;
    
    sendMessage.mutate({
      caseId: selectedCase,
      content: newMessage,
    });
  };

  // Filter cases by search term
  const filteredCases = cases?.filter((caseItem: any) => {
    if (!searchTerm) return true;
    return caseItem.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
        <h1 className="text-2xl font-bold text-primary">Messages</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-white rounded-lg card-shadow">
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
                <Input
                  placeholder="Search cases..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {!filteredCases || filteredCases.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-secondary">No cases found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCases.map((caseItem: any) => (
                    <div
                      key={caseItem.id}
                      className={`p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedCase === caseItem.id ? "bg-gray-50 border-accent" : "border-gray-200"
                      }`}
                      onClick={() => setSelectedCase(caseItem.id)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-primary">
                          {caseItem.title.length > 20
                            ? `${caseItem.title.substring(0, 20)}...`
                            : caseItem.title}
                        </h3>
                        <Badge className={`
                          ${caseItem.status === 'new' ? 'bg-blue-100 text-blue-700' : 
                            caseItem.status === 'active' ? 'bg-green-100 text-success' :
                            'bg-gray-100 text-gray-700'} 
                          text-xs px-2 py-1
                        `}>
                          {caseItem.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-secondary mt-1">
                        {format(new Date(caseItem.startDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedCase && caseDetailsLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : selectedCase && caseDetails ? (
            <Card className="bg-white rounded-lg card-shadow">
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{caseDetails.case.title}</CardTitle>
                    <p className="text-sm text-secondary mt-1">
                      Case #{caseDetails.case.id} · {caseDetails.case.status}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] flex flex-col">
                  <div className="flex-grow overflow-y-auto p-6">
                    {caseDetails.messages && caseDetails.messages.length > 0 ? (
                      <div className="space-y-4">
                        {caseDetails.messages.map((message: any) => {
                          const isCurrentUser = message.senderId === caseDetails.case.clientId;
                          
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                            >
                              {!isCurrentUser && (
                                <Avatar className="h-8 w-8 mr-2 mt-1">
                                  <AvatarImage src="/placeholder-investigator.jpg" />
                                  <AvatarFallback>PI</AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  isCurrentUser
                                    ? "bg-accent text-white rounded-br-none"
                                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                                }`}
                              >
                                <p className="text-sm">
                                  {message.content}
                                </p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isCurrentUser ? "text-white/70" : "text-gray-500"
                                  }`}
                                >
                                  {format(new Date(message.createdAt), "MMM d, h:mm a")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-secondary mb-2">No messages yet.</p>
                          <p className="text-sm text-muted-foreground">
                            Start the conversation by sending a message below.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-grow"
                        disabled={!caseDetails.case.investigatorId || sendMessage.isPending}
                      />
                      <Button
                        type="submit"
                        className="bg-accent text-white"
                        disabled={!newMessage.trim() || !caseDetails.case.investigatorId || sendMessage.isPending}
                      >
                        {sendMessage.isPending ? 
                          <Loader className="h-4 w-4 animate-spin" /> : 
                          <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                    {!caseDetails.case.investigatorId && (
                      <p className="text-sm text-red-500 mt-2">
                        You need an assigned investigator to send messages.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white rounded-lg card-shadow">
              <CardContent className="p-10 text-center">
                <p className="text-secondary mb-4">
                  Select a case from the list to view messages.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
