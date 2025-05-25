import { Link } from "wouter";
import { Investigator } from "@shared/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import SkillTag from "@/components/marketplace/SkillTag";

interface InvestigatorCardProps {
  investigator: Investigator;
}

const InvestigatorCard = ({ investigator }: InvestigatorCardProps) => {
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
        
        <p className="text-sm text-secondary mb-4">{investigator.bio}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {investigator.skills.map((skill, index) => (
            <SkillTag key={index} skill={skill} />
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
          <Link href={`/investigator/${investigator.id}`}>
            <Button className="px-4 py-2 bg-accent text-white text-sm font-medium rounded hover:bg-accent-dark">
              Contact
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestigatorCard;
