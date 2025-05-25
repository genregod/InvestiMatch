import { useState } from "react";
import { Investigator } from "@shared/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, Calendar, Clock, MapPin, Award, FileText, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface InvestigatorProfileProps {
  investigator: Investigator;
  detailed?: boolean;
}

const InvestigatorProfile = ({ investigator, detailed = false }: InvestigatorProfileProps) => {
  const { toast } = useToast();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Calculate rating display
  const renderRating = () => {
    const stars = [];
    const rating = Math.round(investigator.rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }
    
    return (
      <div className="flex">
        {stars}
      </div>
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !caseTitle.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      // Mock API call - would be replaced with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${investigator.firstName} ${investigator.lastName}`,
      });
      
      setIsContactOpen(false);
      setMessage("");
      setCaseTitle("");
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

  if (detailed) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img 
                src={investigator.profileImageUrl || "https://via.placeholder.com/150"} 
                alt={`${investigator.firstName} ${investigator.lastName}`} 
                className="h-40 w-40 rounded-lg object-cover" 
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <div>
                  <CardTitle className="text-2xl">
                    {investigator.firstName} {investigator.lastName}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium mt-1">
                    {investigator.specialization}
                  </CardDescription>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button className="bg-accent hover:bg-accent-dark text-white" onClick={() => setIsContactOpen(true)}>
                    <Mail className="mr-2 h-4 w-4" /> Contact Investigator
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center mt-2 mb-4">
                {renderRating()}
                <span className="text-sm text-secondary ml-2">
                  {investigator.rating.toFixed(1)} ({investigator.reviewCount} reviews)
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-secondary">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {investigator.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {investigator.yearsOfExperience} years experience
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Licensed in {investigator.licensedStates?.length || 0} states
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {investigator.available ? (
                    <span className="text-success font-medium">Available Now</span>
                  ) : (
                    <span>Available {investigator.nextAvailability}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="about">
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="expertise">Expertise</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <div className="prose max-w-none">
                <p>{investigator.bio}</p>
                
                {investigator.experience && (
                  <>
                    <h3 className="text-lg font-semibold mt-4">Experience</h3>
                    <p>{investigator.experience}</p>
                  </>
                )}
                
                {investigator.education && (
                  <>
                    <h3 className="text-lg font-semibold mt-4">Education & Certifications</h3>
                    <p>{investigator.education}</p>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="expertise">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {investigator.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {investigator.licensedStates && investigator.licensedStates.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Licensed States</h3>
                  <div className="flex flex-wrap gap-2">
                    {investigator.licensedStates.map((state, index) => (
                      <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                        {state}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {investigator.specializedTools && investigator.specializedTools.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Specialized Tools & Methods</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {investigator.specializedTools.map((tool, index) => (
                      <li key={index}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews">
              {investigator.reviews && investigator.reviews.length > 0 ? (
                <div className="space-y-4">
                  {investigator.reviews.map((review, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{review.clientName}</div>
                          <div className="text-sm text-secondary">
                            {new Date(review.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm">{review.content}</p>
                      {review.caseType && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {review.caseType}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary">
                  <FileText className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                  <p>No reviews available yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Simple card version for marketplace
  return (
    <Card className="bg-white rounded-lg shadow-card overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <img 
            src={investigator.profileImageUrl || "https://via.placeholder.com/128"} 
            alt={`${investigator.firstName} ${investigator.lastName}`} 
            className="h-16 w-16 rounded-full object-cover mr-4" 
          />
          <div>
            <h3 className="text-lg font-semibold text-primary">
              {investigator.firstName} {investigator.lastName}
            </h3>
            <p className="text-sm text-secondary">{investigator.specialization}</p>
            <div className="flex items-center mt-1">
              {renderRating()}
              <span className="text-xs text-secondary ml-2">
                {investigator.reviewCount} reviews
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-secondary mb-4">{investigator.bio.substring(0, 150)}...</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {investigator.skills.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs py-1 px-2">
              {skill}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${
            investigator.available ? "text-success" : "text-secondary"
          }`}>
            {investigator.available 
              ? "Available Now" 
              : `Available ${investigator.nextAvailability}`}
          </span>
          <Button 
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded hover:bg-accent-dark"
            onClick={() => setIsContactOpen(true)}
          >
            Contact
          </Button>
        </div>
      </CardContent>

      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact {investigator.firstName} {investigator.lastName}</DialogTitle>
            <DialogDescription>
              Send a message to this investigator about your case.
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
              onClick={() => setIsContactOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={isSending}
              className="bg-accent hover:bg-accent-dark text-white"
            >
              {isSending ? (
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
    </Card>
  );
};

export default InvestigatorProfile;
