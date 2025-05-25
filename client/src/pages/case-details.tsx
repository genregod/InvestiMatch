import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Case } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import CaseDetails from "@/components/cases/CaseDetails";
import CaseForm from "@/components/cases/CaseForm";
import Sidebar from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const CaseDetailsPage = () => {
  const { user } = useAuth();
  const [, params] = useRoute<{ id: string }>("/case/:id");
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  
  const caseId = params?.id;

  // Fetch case details
  const { 
    data: caseData, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<Case>({
    queryKey: [`/api/cases/${caseId}`],
    enabled: !!caseId,
  });

  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 p-6 bg-background flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (isError || !caseData) {
    return (
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 p-6 bg-background flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Case Not Found</h1>
          <p className="text-secondary mb-6">The case you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button 
            onClick={() => setLocation("/cases")}
            className="bg-accent hover:bg-accent-dark text-white"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 p-6 bg-background">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          {!isEditing && (
            <div className="mb-6">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation("/cases")}
                className="mb-4"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Cases
              </Button>
            </div>
          )}
          
          {isEditing ? (
            <CaseForm 
              initialData={caseData}
              isEdit={true}
            />
          ) : (
            <CaseDetails 
              caseData={caseData} 
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsPage;
