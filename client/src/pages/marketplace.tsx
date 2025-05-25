import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Investigator } from "@shared/types";
import Sidebar from "@/components/ui/Sidebar";
import InvestigatorProfile from "@/components/marketplace/InvestigatorProfile";
import SkillTag from "@/components/marketplace/SkillTag";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Users, SlidersHorizontal, X } from "lucide-react";

const Marketplace = () => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [availability, setAvailability] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [rating, setRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch investigators
  const { data: investigators, isLoading } = useQuery<Investigator[]>({
    queryKey: ["/api/investigators"],
  });

  // Extract all unique skills from investigators for filter options
  const allSkills = investigators
    ? [...new Set(investigators.flatMap(inv => inv.skills))]
    : [];

  // Filter investigators based on selected filters
  const filteredInvestigators = investigators
    ? investigators.filter(investigator => {
        // Filter by search term (name or specialization)
        const matchesSearch = searchTerm === "" || 
          `${investigator.firstName} ${investigator.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
          investigator.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by specialization
        const matchesSpecialization = specialization === "" || 
          investigator.specialization.toLowerCase().includes(specialization.toLowerCase());
        
        // Filter by availability
        const matchesAvailability = availability === "" || 
          (availability === "available" ? investigator.available : !investigator.available);
        
        // Filter by selected skills
        const matchesSkills = selectedSkills.length === 0 || 
          selectedSkills.every(skill => investigator.skills.includes(skill));
        
        // Filter by rating
        const matchesRating = rating === "" || 
          investigator.rating >= parseInt(rating);
        
        return matchesSearch && matchesSpecialization && matchesAvailability && 
               matchesSkills && matchesRating;
      })
    : [];

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSpecialization("");
    setAvailability("");
    setSelectedSkills([]);
    setRating("");
  };

  return (
    <div className="flex flex-1">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Marketplace Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">PI Marketplace</h1>
            <p className="text-secondary mt-1">Find and connect with professional investigators for your cases</p>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                <Input
                  placeholder="Search by name or specialization..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </div>
            
            {showFilters && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Filter Investigators</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-secondary hover:text-primary"
                    >
                      Clear Filters
                    </Button>
                  </div>
                  <CardDescription>Refine your search with specific criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Specialization</label>
                      <Select value={specialization} onValueChange={setSpecialization}>
                        <SelectTrigger>
                          <SelectValue placeholder="All specializations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All specializations</SelectItem>
                          <SelectItem value="corporate">Corporate Investigation</SelectItem>
                          <SelectItem value="asset">Asset Investigation</SelectItem>
                          <SelectItem value="fraud">Fraud Specialist</SelectItem>
                          <SelectItem value="background">Background Checks</SelectItem>
                          <SelectItem value="surveillance">Surveillance</SelectItem>
                          <SelectItem value="digital">Digital Forensics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Availability</label>
                      <Select value={availability} onValueChange={setAvailability}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any availability</SelectItem>
                          <SelectItem value="available">Available Now</SelectItem>
                          <SelectItem value="unavailable">Coming Soon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                      <Select value={rating} onValueChange={setRating}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any rating</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="text-sm font-medium mb-2 block">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {allSkills.map((skill, index) => (
                        <SkillTag
                          key={index}
                          skill={skill}
                          selected={selectedSkills.includes(skill)}
                          onClick={() => toggleSkill(skill)}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Investigators Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : filteredInvestigators && filteredInvestigators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvestigators.map((investigator) => (
                <InvestigatorProfile key={investigator.id} investigator={investigator} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-card">
              <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-primary mb-2">No Investigators Found</h3>
              <p className="text-secondary mb-6">
                We couldn't find any investigators matching your criteria.
              </p>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center mx-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
          
          {/* Pagination if needed */}
          {filteredInvestigators && filteredInvestigators.length > 12 && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="mx-1">Previous</Button>
              <Button variant="outline" className="mx-1">1</Button>
              <Button variant="default" className="mx-1 bg-accent">2</Button>
              <Button variant="outline" className="mx-1">3</Button>
              <Button variant="outline" className="mx-1">Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
