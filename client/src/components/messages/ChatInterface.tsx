import { useState, useRef, useEffect } from "react";
import { Case, Message, User } from "@shared/types";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  activeCase: Case;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string) => Promise<void>;
}

const ChatInterface = ({
  activeCase,
  messages,
  currentUser,
  onSendMessage,
}: ChatInterfaceProps) => {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format message timestamp
  const formatMessageTime = (date: Date) => {
    const today = new Date().toDateString();
    const messageDate = new Date(date).toDateString();
    
    if (today === messageDate) {
      return new Date(date).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setIsSending(true);
      await onSendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press to send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSending) {
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-card">
      <CardHeader className="px-6 py-4 border-b">
        <div className="flex items-center">
          <div className="flex-1">
            <CardTitle className="text-lg">{activeCase.title}</CardTitle>
            <div className="text-sm text-secondary mt-1">
              {activeCase.investigator ? (
                <div className="flex items-center">
                  <img 
                    src={activeCase.investigator.profileImageUrl || "https://via.placeholder.com/32"} 
                    alt={`${activeCase.investigator.firstName} ${activeCase.investigator.lastName}`}
                    className="h-6 w-6 rounded-full object-cover mr-2" 
                  />
                  <span>
                    {activeCase.investigator.firstName} {activeCase.investigator.lastName}
                  </span>
                </div>
              ) : (
                "No investigator assigned"
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              activeCase.investigator?.available ? "bg-success" : "bg-gray-300"
            }`}></div>
            <span className="text-sm text-secondary">
              {activeCase.investigator?.available ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No messages yet. Send a message to get started.</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.senderId === currentUser.id;
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "flex",
                    isCurrentUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div className="flex items-start max-w-[80%]">
                    {!isCurrentUser && (
                      <img 
                        src={message.senderAvatar || "https://via.placeholder.com/32"} 
                        alt={message.senderName}
                        className="h-8 w-8 rounded-full object-cover mr-2 mt-1" 
                      />
                    )}
                    
                    <div>
                      <div 
                        className={cn(
                          "px-4 py-3 rounded-lg",
                          isCurrentUser 
                            ? "bg-accent text-white" 
                            : "bg-gray-100 text-gray-800"
                        )}
                      >
                        <div className="flex items-center mb-1">
                          <span className={cn(
                            "text-xs font-medium",
                            isCurrentUser ? "text-white" : "text-gray-600"
                          )}>
                            {message.senderName}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 flex justify-end">
                        {formatMessageTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0" 
            type="button"
            onClick={() => toast({
              title: "Feature Coming Soon",
              description: "File attachments will be available in a future update."
            })}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1"
          />
          
          <Button 
            className="bg-accent hover:bg-accent-dark shrink-0" 
            size="icon"
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
