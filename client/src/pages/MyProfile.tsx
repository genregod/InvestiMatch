import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { USER_ROLES } from "@shared/schema";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schema for investigator profile form
const investigatorProfileSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  yearsOfExperience: z.string().transform((val) => parseInt(val, 10)),
  hourlyRate: z.string().transform((val) => parseFloat(val)),
  isAvailable: z.boolean().default(true),
  specializations: z.array(z.string()).min(1, "Select at least one specialization"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
});

// Schema for subscriber profile form
const subscriberProfileSchema = z.object({
  company: z.string().optional(),
});

const MyProfile = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newSkill, setNewSkill] = useState("");

  // Fetch profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/profile"],
    refetchOnWindowFocus: false,
  });

  // Form for investigator profile
  const investigatorForm = useForm<z.infer<typeof investigatorProfileSchema>>({
    resolver: zodResolver(investigatorProfileSchema),
    defaultValues: {
      title: "",
      bio: "",
      location: "",
      yearsOfExperience: "0",
      hourlyRate: "0",
      isAvailable: true,
      specializations: [],
      skills: [],
    },
  });

  // Form for subscriber profile
  const subscriberForm = useForm<z.infer<typeof subscriberProfileSchema>>({
    resolver: zodResolver(subscriberProfileSchema),
    defaultValues: {
      company: "",
    },
  });

  // Update investigator profile mutation
  const updateInvestigatorProfile = useMutation({
    mutationFn: async (data: z.infer<typeof investigatorProfileSchema>) => {
      await apiRequest("PATCH", "/api/investigators/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your investigator profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Set form values when profile data is loaded
  useEffect(() => {
    if (profileData && user?.role === USER_ROLES.INVESTIGATOR && profileData.profile) {
      investigatorForm.reset({
        title: profileData.profile.title || "",
        bio: profileData.profile.bio || "",
        location: profileData.profile.location || "",
        yearsOfExperience: String(profileData.profile.yearsOfExperience || 0),
        hourlyRate: String(profileData.profile.hourlyRate || 0),
        isAvailable: profileData.profile.isAvailable || true,
        specializations: profileData.profile.specializations || [],
        skills: profileData.profile.skills || [],
      });
    }

    if (profileData && user?.role === USER_ROLES.SUBSCRIBER && profileData.profile) {
      subscriberForm.reset({
        company: profileData.profile.company || "",
      });
    }
  }, [profileData, user?.role]);

  // Handle form submission for investigator profile
  const onInvestigatorSubmit = (data: z.infer<typeof investigatorProfileSchema>) => {
    updateInvestigatorProfile.mutate(data);
  };

  // Handle adding new specialization
  const handleAddSpecialization = () => {
    if (newSpecialization.trim()) {
      const current = investigatorForm.getValues().specializations || [];
      if (!current.includes(newSpecialization)) {
        investigatorForm.setValue("specializations", [...current, newSpecialization]);
        setNewSpecialization("");
      }
    }
  };

  // Handle adding new skill
  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const current = investigatorForm.getValues().skills || [];
      if (!current.includes(newSkill)) {
        investigatorForm.setValue("skills", [...current, newSkill]);
        setNewSkill("");
      }
    }
  };

  // Remove specialization
  const removeSpecialization = (item: string) => {
    const current = investigatorForm.getValues().specializations || [];
    investigatorForm.setValue(
      "specializations",
      current.filter((i) => i !== item)
    );
  };

  // Remove skill
  const removeSkill = (item: string) => {
    const current = investigatorForm.getValues().skills || [];
    investigatorForm.setValue(
      "skills",
      current.filter((i) => i !== item)
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 flex justify-center items-center h-96">
        <Loader className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-primary mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Card */}
        <Card className="bg-white rounded-lg card-shadow lg:col-span-1">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                <AvatarFallback>
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-secondary text-sm mb-2">{user?.email}</p>
              <Badge
                className={`${
                  user?.role === USER_ROLES.SUBSCRIBER
                    ? "bg-blue-100 text-blue-800"
                    : user?.role === USER_ROLES.INVESTIGATOR
                    ? "bg-green-100 text-green-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {user?.role === USER_ROLES.SUBSCRIBER
                  ? "Subscriber"
                  : user?.role === USER_ROLES.INVESTIGATOR
                  ? "Investigator"
                  : "Admin"}
              </Badge>

              <div className="mt-6 w-full">
                <p className="text-sm text-gray-500 mb-1">Member since</p>
                <p className="font-medium">
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card className="bg-white rounded-lg card-shadow lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {user?.role === USER_ROLES.INVESTIGATOR
                ? "Investigator Profile"
                : "Subscriber Profile"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.role === USER_ROLES.INVESTIGATOR ? (
              <Form {...investigatorForm}>
                <form onSubmit={investigatorForm.handleSubmit(onInvestigatorSubmit)} className="space-y-6">
                  <FormField
                    control={investigatorForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Corporate Investigation Specialist" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={investigatorForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your experience and expertise..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={investigatorForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. New York, NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={investigatorForm.control}
                      name="yearsOfExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={investigatorForm.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={investigatorForm.control}
                      name="isAvailable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability Status</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value === "true")}
                            defaultValue={field.value ? "true" : "false"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select availability" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Available for new cases</SelectItem>
                              <SelectItem value="false">Not available (busy)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={investigatorForm.control}
                    name="specializations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specializations</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {field.value.map((specialization, index) => (
                            <Badge key={index} variant="secondary" className="py-1 px-2">
                              {specialization}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1"
                                onClick={() => removeSpecialization(specialization)}
                              >
                                ✕
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newSpecialization}
                            onChange={(e) => setNewSpecialization(e.target.value)}
                            placeholder="Add specialization (e.g. Background Checks)"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddSpecialization}
                          >
                            Add
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={investigatorForm.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {field.value.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="py-1 px-2">
                              {skill}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1"
                                onClick={() => removeSkill(skill)}
                              >
                                ✕
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add skill (e.g. Surveillance)"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddSkill}
                          >
                            Add
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full md:w-auto"
                    disabled={updateInvestigatorProfile.isPending}
                  >
                    {updateInvestigatorProfile.isPending ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...subscriberForm}>
                <form className="space-y-6">
                  <FormField
                    control={subscriberForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your company name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be visible to investigators when you create cases.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium text-primary mb-2">Subscription Information</h3>
                    <p className="text-sm text-secondary mb-4">
                      Current Plan: <span className="font-semibold">{profileData?.profile?.subscriptionPlan || "Basic"}</span>
                    </p>
                    <p className="text-sm text-secondary mb-2">
                      Cases Remaining: <span className="font-semibold">{profileData?.profile?.casesRemaining || 0}</span>
                    </p>
                    <Button className="mt-2" asChild>
                      <a href="/subscription">Manage Subscription</a>
                    </Button>
                  </div>

                  <Button type="submit" disabled>Save Profile</Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
