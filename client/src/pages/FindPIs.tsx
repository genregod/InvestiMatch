import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Circle, Loader } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const FindPIs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");
  const [availableOnly, setAvailableOnly] = useState(true);

  // Fetch investigators with applied filters
  const { data: investigators, isLoading } = useQuery({
    queryKey: [
      '/api/investigators', 
      { search: searchTerm, specialization, location, available: availableOnly }
    ],
    enabled: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled by the query key changes which trigger automatic refetch
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">Find Investigators</h1>
      </div>

      <Card className="bg-white rounded-lg card-shadow mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-secondary mb-2">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    placeholder="Search by name, skills, location..."
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-secondary mb-2">
                  Specialization
                </label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger id="specialization">
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Specializations</SelectItem>
                    <SelectItem value="background">Background Checks</SelectItem>
                    <SelectItem value="corporate">Corporate Investigations</SelectItem>
                    <SelectItem value="fraud">Fraud Investigations</SelectItem>
                    <SelectItem value="asset">Asset Location & Recovery</SelectItem>
                    <SelectItem value="surveillance">Surveillance</SelectItem>
                    <SelectItem value="digital">Digital Forensics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-secondary mb-2">
                  Location
                </label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    <SelectItem value="newyork">New York</SelectItem>
                    <SelectItem value="losangeles">Los Angeles</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="houston">Houston</SelectItem>
                    <SelectItem value="remote">Remote Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="available-only" 
                  checked={availableOnly} 
                  onCheckedChange={setAvailableOnly} 
                />
                <Label htmlFor="available-only">Show available investigators only</Label>
              </div>
              
              <Button type="submit" className="bg-accent text-white">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader className="h-10 w-10 animate-spin text-accent" />
        </div>
      ) : !investigators || investigators.length === 0 ? (
        <Card className="bg-white rounded-lg overflow-hidden card-shadow">
          <CardContent className="p-6">
            <p className="text-secondary text-center py-8">
              No investigators found matching your criteria. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {investigators.map((investigator) => (
            <Card key={investigator.userId} className="bg-white rounded-lg overflow-hidden card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Avatar className="w-16 h-16 rounded-full mr-4">
                    <AvatarImage src={investigator.user?.profileImageUrl} alt={investigator.user?.firstName} />
                    <AvatarFallback>
                      {investigator.user?.firstName?.[0] || investigator.user?.email?.[0] || 'PI'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {investigator.user?.firstName} {investigator.user?.lastName}
                    </h3>
                    <p className="text-sm text-secondary">{investigator.title}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${
                              star <= Math.floor(investigator.averageRating || 0)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-secondary ml-1">
                          {investigator.averageRating?.toFixed(1) || "0.0"} ({investigator.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-secondary mb-3">
                    {investigator.bio?.substring(0, 100) || "Professional investigator with expertise in various fields."}
                    {investigator.bio?.length > 100 ? "..." : ""}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {investigator.specializations?.slice(0, 3).map((specialization, index) => (
                      <Badge key={index} variant="secondary" className="px-2 py-1 bg-blue-50 text-blue-700">
                        {specialization}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-primary">
                      <MapPin className="h-3 w-3 text-red-500 inline mr-1" />
                      {investigator.location || "Remote"}
                    </span>
                    <span className={investigator.isAvailable ? "text-success font-medium" : "text-yellow-600 font-medium"}>
                      <Circle className="h-2 w-2 inline mr-1" />
                      {investigator.isAvailable ? "Available" : "Busy"}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <Link href={`/investigators/${investigator.userId}`}>
                    <Button variant="link" className="text-accent hover:underline font-medium text-sm p-0">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/investigators/${investigator.userId}`}>
                    <Button 
                      className={`${investigator.isAvailable ? "bg-accent hover:bg-opacity-90" : "bg-gray-100 text-secondary"} px-4 py-2 rounded font-medium text-sm`}
                      disabled={!investigator.isAvailable}
                    >
                      {investigator.isAvailable ? "Hire Now" : "Join Waitlist"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindPIs;
