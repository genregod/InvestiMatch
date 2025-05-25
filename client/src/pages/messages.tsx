import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Case, Investigator, Message } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/ui/Sidebar";
import ChatInterface from "@/components/messages/ChatInterface";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquare, AlertCircle } from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Extract case ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const caseId = params.get("case");
    if (caseId) {
      setActiveCaseId(caseId);
    }
  }, [location]);

  // Fetch user's cases
  const { data: cases, isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  // Get active case if ID is set
  const activeCase = activeCaseId 
    ? cases?.find(c => c.id === activeCaseId)
    : null;

  // Fetch messages for active case
  const { 
    data: messages, 
    isLoading: messagesLoading,
    refetch: refetchMessages
  } = useQuery<Message[]>({
    queryKey: ["/api/messages", activeCaseId],
    enabled: !!activeCaseId,
  });

  // Filter cases by search term
  const filteredCases = cases
    ? cases.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.investigator && 
          `${c.investigator.firstName} ${c.investigator.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  // Send message handler
  const handleSendMessage = async (content: string) => {
    if (!activeCaseId || !content.trim() || !user) return;

    try {
      setIsSending(true);
      await apiRequest("POST", `/api/messages/${activeCaseId}`, { content });
      await refetchMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-1">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex h-full bg-background">
        {/* Conversations Sidebar */}
        <div className="hidden md:flex md:w-80 flex-col border-r bg-white">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-primary mb-2">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
              <Input
                placeholder="Search conversations..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {casesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : filteredCases && filteredCases.length > 0 ? (
              <div className="divide-y">
                {filteredCases.map((caseItem) => {
                  const isActive = activeCaseId === caseItem.id;
                  return (
                    <div 
                      key={caseItem.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${isActive ? 'bg-accent bg-opacity-5 border-l-4 border-accent' : ''}`}
                      onClick={() => setActiveCaseId(caseItem.id)}
                    >
                      <div className="flex items-center mb-2">
                        {caseItem.investigator ? (
                          <img 
                            src={caseItem.investigator.profileImageUrl || "https://via.placeholder.com/40"} 
                            alt={`${caseItem.investigator.firstName} ${caseItem.investigator.lastName}`}
                            className="h-10 w-10 rounded-full object-cover mr-3" 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mr-3">
                            <MessageSquare className="h-5 w-5 text-secondary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-primary truncate">
                              {caseItem.investigator ? 
                                `${caseItem.investigator.firstName} ${caseItem.investigator.lastName}` : 
                                "No Investigator"}
                            </h3>
                            <span className="text-xs text-secondary ml-2 whitespace-nowrap">
                              {new Date(caseItem.lastActivity).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-secondary truncate">{caseItem.title}</p>
                        </div>
                      </div>
                      <div className="text-xs truncate text-secondary">
                        {/* Would normally show last message here */}
                        {caseItem.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <MessageSquare className="h-8 w-8 text-secondary mx-auto mb-2" />
                <p className="text-secondary text-sm">No conversations found</p>
                <Button 
                  className="mt-4 bg-accent hover:bg-accent-dark text-white"
                  onClick={() => setLocation("/marketplace")}
                >
                  Find an Investigator
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Message Content */}
        <div className="flex-1 flex flex-col h-full">
          {activeCaseId && activeCase ? (
            messagesLoading ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : (
              <ChatInterface
                activeCase={activeCase}
                messages={messages || []}
                currentUser={user!}
                onSendMessage={handleSendMessage}
              />
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
              <div className="text-center max-w-md">
                <MessageSquare className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-primary mb-2">Your Messages</h2>
                <p className="text-secondary mb-6">
                  Select a conversation from the sidebar to view messages or start a new conversation with an investigator.
                </p>
                <Button 
                  className="bg-accent hover:bg-accent-dark text-white"
                  onClick={() => setLocation("/marketplace")}
                >
                  Find an Investigator
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
