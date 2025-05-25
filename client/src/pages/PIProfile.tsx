import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Award, 
  Calendar, 
  Clock, 
  Star, 
  Briefcase, 
  DollarSign, 
  Loader, 
  BookOpen, 
  ThumbsUp,
  Shield 
} from "lucide-react";
import { useLocation } from "wouter";
import { USER_ROLES } from "@shared/schema";

interface PIProfileProps {
  id: string;
}

const PIProfile = ({ id }: PIProfileProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isSubscriber } = useUser();
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [caseDescription, setCaseDescription] = useState("");

  // Fetch investigator profile
  const { data: investigator, isLoading } = useQuery({
    queryKey: [`/api/investigators/${id}`],
    refetchOnWindowFocus: false,
  });

  // Create case and assign to PI mutation
  const createCase = useMutation({
    mutationFn: async (data: any) => {
      const newCase = await apiRequest("POST", "/api/cases", {
        title: data.title,
        description: data.description,
        caseType: data.caseType,
        location: data.location,
      });
      const caseResponse = await newCase.json();
      
      await apiRequest("POST", `/api/cases/${caseResponse.id}/assign`, {
        investigatorId: id,
      });
      
      return caseResponse;
    },
    onSuccess: (data) => {
      toast({
        title: "Case Created",
        description: "Your case has been assigned to the investigator.",
      });
      setHireDialogOpen(false);
      setCaseDescription("");
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

  // Handle hire PI
  const handleHire = () => {
    if (!caseDescription.trim()) {
      toast({
        title: "Error",
        description: "Please provide a case description.",
        variant: "destructive",
      });
      return;
    }

    createCase.mutate({
      title: `Case with ${investigator?.user?.firstName} ${investigator?.user?.lastName}`,
      description: caseDescription,
      caseType: investigator?.profile?.specializations?.[0] || "background",
      location: investigator?.profile?.location || "",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 flex justify-center items-center h-96">
        <Loader className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!investigator) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="bg-white rounded-lg card-shadow">
          <CardContent className="p-10 text-center">
            <p className="text-secondary mb-4">
              Investigator not found or profile is unavailable.
            </p>
            <Button onClick={() => navigate("/find-investigators")}>
              Browse Investigators
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data from API response
  const { profile, user: piUser, reviews } = investigator;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Profile Info */}
        <div className="lg:col-span-1">
          <Card className="bg-white rounded-lg card-shadow sticky top-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={piUser?.profileImageUrl} alt={piUser?.firstName} />
                  <AvatarFallback className="text-2xl">
                    {piUser?.firstName?.[0] || piUser?.email?.[0] || 'PI'}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold text-primary">
                  {piUser?.firstName} {piUser?.lastName}
                </h1>
                <p className="text-secondary text-sm mt-1">{profile?.title}</p>
                
                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(profile?.averageRating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-secondary ml-2">
                    {profile?.averageRating?.toFixed(1) || "0.0"} ({profile?.reviewCount || 0} reviews)
                  </span>
                </div>
                
                <Badge 
                  className={`mt-4 ${profile?.isAvailable ? "bg-green-100 text-success" : "bg-yellow-100 text-yellow-600"}`}
                >
                  {profile?.isAvailable ? "Available for Work" : "Currently Busy"}
                </Badge>

                {isSubscriber && profile?.isAvailable && (
                  <Button
                    className="mt-6 w-full bg-accent text-white"
                    onClick={() => setHireDialogOpen(true)}
                  >
                    Hire Investigator
                  </Button>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-accent mr-3" />
                  <span className="text-secondary">{profile?.location || "Location not specified"}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-accent mr-3" />
                  <span className="text-secondary">{profile?.yearsOfExperience || 0} years of experience</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-accent mr-3" />
                  <span className="text-secondary">${profile?.hourlyRate || 0}/hour</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-accent mr-3" />
                  <span className="text-secondary">{profile?.isVerified ? "Verified Investigator" : "Verification Pending"}</span>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="text-md font-semibold text-primary mb-3 flex items-center">
                  <Award className="h-4 w-4 mr-2" /> Specializations
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile?.specializations?.map((specialization: string, index: number) => (
                    <Badge key={index} variant="secondary" className="px-2 py-1 bg-blue-50 text-blue-700">
                      {specialization}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-md font-semibold text-primary mb-3 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.skills?.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="px-2 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Tabs with Bio, Reviews, etc. */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-lg card-shadow mb-8">
            <CardHeader>
              <CardTitle>About {piUser?.firstName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary">
                {profile?.bio || 
                 "This investigator has not added a bio yet. Professional investigators on our platform typically have extensive experience in various types of investigations, including background checks, surveillance operations, and asset recovery."}
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="experience" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="caseTypes">Case Types</TabsTrigger>
            </TabsList>
            
            {/* Experience Tab */}
            <TabsContent value="experience">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="border-l-2 border-accent pl-4 ml-2">
                      <h3 className="font-semibold text-primary">Senior Investigator</h3>
                      <p className="text-sm text-secondary">Smith & Associates</p>
                      <p className="text-xs text-muted-foreground mt-1">2018 - Present</p>
                      <p className="mt-2 text-secondary text-sm">
                        Specialized in corporate investigations, background checks, and fraud cases.
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-gray-200 pl-4 ml-2">
                      <h3 className="font-semibold text-primary">Lead Investigator</h3>
                      <p className="text-sm text-secondary">Johnson Investigations</p>
                      <p className="text-xs text-muted-foreground mt-1">2013 - 2018</p>
                      <p className="mt-2 text-secondary text-sm">
                        Managed a team of investigators focusing on asset recovery and surveillance operations.
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-gray-200 pl-4 ml-2">
                      <h3 className="font-semibold text-primary">Security Consultant</h3>
                      <p className="text-sm text-secondary">SecureTech Inc.</p>
                      <p className="text-xs text-muted-foreground mt-1">2010 - 2013</p>
                      <p className="mt-2 text-secondary text-sm">
                        Provided security assessments and investigation services for corporate clients.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card>
                <CardContent className="p-6">
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>
                                  {review.clientName?.[0] || 'C'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-primary">{review.clientName || "Client"}</p>
                                <p className="text-xs text-secondary">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-secondary text-sm mt-2">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <ThumbsUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-secondary">No reviews yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This investigator hasn't received any reviews yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Case Types Tab */}
            <TabsContent value="caseTypes">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {profile?.specializations?.map((specialization: string, index: number) => {
                      // Generate a progress value between 70-100 for each specialization
                      const progressValue = 70 + Math.floor(Math.random() * 30);
                      
                      return (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-medium text-primary">{specialization}</h3>
                            <span className="text-sm text-secondary">{progressValue}%</span>
                          </div>
                          <Progress value={progressValue} className="h-2" />
                          <p className="text-sm text-secondary mt-2">
                            {getSpecializationDescription(specialization)}
                          </p>
                        </div>
                      );
                    })}

                    {(!profile?.specializations || profile.specializations.length === 0) && (
                      <div className="text-center py-8">
                        <p className="text-secondary">
                          This investigator hasn't specified their case specializations yet.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="bg-white rounded-lg card-shadow">
            <CardHeader>
              <CardTitle>Ready to Work with {piUser?.firstName}?</CardTitle>
              <CardDescription>
                Create a case and get matched with this investigator to start working together.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-primary flex items-center mb-2">
                    <Briefcase className="h-4 w-4 mr-2" /> Process
                  </h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex">
                      <span className="bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 shrink-0">1</span>
                      <span className="text-secondary">Create a case with specific details</span>
                    </li>
                    <li className="flex">
                      <span className="bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 shrink-0">2</span>
                      <span className="text-secondary">Investigator will review and accept</span>
                    </li>
                    <li className="flex">
                      <span className="bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 shrink-0">3</span>
                      <span className="text-secondary">Communicate securely through our platform</span>
                    </li>
                    <li className="flex">
                      <span className="bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 shrink-0">4</span>
                      <span className="text-secondary">Receive updates and final reports</span>
                    </li>
                  </ol>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-primary flex items-center mb-2">
                    <Shield className="h-4 w-4 mr-2" /> Why Choose InvestiMatch?
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-success mr-2 mt-0.5" />
                      <span className="text-secondary">Verified professional investigators</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-success mr-2 mt-0.5" />
                      <span className="text-secondary">Secure communication channels</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-success mr-2 mt-0.5" />
                      <span className="text-secondary">Transparent pricing and billing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-success mr-2 mt-0.5" />
                      <span className="text-secondary">Confidentiality guaranteed</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-success mr-2 mt-0.5" />
                      <span className="text-secondary">Subscription-based pricing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate("/find-investigators")}>
                View Other Investigators
              </Button>
              {isSubscriber && profile?.isAvailable && (
                <Button className="bg-accent text-white" onClick={() => setHireDialogOpen(true)}>
                  Hire {piUser?.firstName}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Hire Dialog */}
      <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Case with {piUser?.firstName}</DialogTitle>
            <DialogDescription>
              Describe your investigation needs in detail to help the investigator understand your requirements.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="case-description">Case Description</Label>
              <Textarea
                id="case-description"
                placeholder="Describe your investigation needs..."
                rows={6}
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setHireDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              className="bg-accent text-white"
              onClick={handleHire}
              disabled={createCase.isPending || !caseDescription.trim()}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper function to get specialization descriptions
function getSpecializationDescription(specialization: string): string {
  const descriptions: Record<string, string> = {
    "Background Checks": "Comprehensive verification of personal and professional history, including criminal records, employment verification, and reference checks.",
    "Corporate Investigations": "Investigating fraud, embezzlement, intellectual property theft, and other corporate misconduct.",
    "Fraud Investigations": "Uncovering evidence of insurance fraud, financial fraud, identity theft, and other deceptive practices.",
    "Asset Location & Recovery": "Finding and recovering missing or hidden assets, including property, financial accounts, and valuables.",
    "Surveillance": "Discreet observation and documentation of activities, behaviors, and interactions for legal purposes.",
    "Digital Forensics": "Recovering and analyzing electronic data from computers, mobile devices, and other digital sources.",
    "Due Diligence": "Thorough assessment of individuals or businesses prior to important transactions or partnerships.",
    "Skip Tracing": "Locating individuals who have disappeared or are avoiding contact for legal or financial reasons.",
  };
  
  return descriptions[specialization] || 
    "Specialized investigation services tailored to client needs with thorough documentation and reporting.";
}

export default PIProfile;
