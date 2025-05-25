import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Case } from "@shared/types";
import Sidebar from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Search, Filter, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Cases = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch all cases
  const { data: cases, isLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  // Filter cases based on active filters
  const filteredCases = cases
    ? cases.filter(caseItem => {
        const matchesSearch = searchTerm === "" || 
          caseItem.title.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || 
          caseItem.status.toLowerCase() === statusFilter.toLowerCase();
        
        const matchesType = typeFilter === "all" || 
          caseItem.type.toLowerCase() === typeFilter.toLowerCase();
        
        return matchesSearch && matchesStatus && matchesType;
      })
    : [];

  // Group cases by status for tabs
  const activeCases = filteredCases?.filter(c => 
    c.status.toLowerCase() !== "completed" && c.status.toLowerCase() !== "cancelled"
  ) || [];
  
  const completedCases = filteredCases?.filter(c => 
    c.status.toLowerCase() === "completed"
  ) || [];
  
  const cancelledCases = filteredCases?.filter(c => 
    c.status.toLowerCase() === "cancelled"
  ) || [];

  // Map status to badge variants
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case "awaiting info":
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      case "review needed":
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
      case "cancelled":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format case type
  const formatCaseType = (type: string) => {
    return type.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  // Format the date to a readable format
  const formatLastActivity = (date: Date) => {
    return `${new Date(date).toLocaleDateString()} (${formatDistanceToNow(new Date(date), { addSuffix: true })})`;
  };

  // Render cases table
  const renderCasesTable = (casesToRender: Case[]) => {
    if (casesToRender.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">No Cases Found</h3>
          <p className="text-secondary mb-4">
            You don't have any cases in this category yet.
          </p>
          <Button 
            onClick={() => setLocation("/marketplace")}
            className="bg-accent hover:bg-accent-dark text-white"
          >
            Find an Investigator
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-secondary text-xs uppercase">Case</TableHead>
              <TableHead className="text-secondary text-xs uppercase">Type</TableHead>
              <TableHead className="text-secondary text-xs uppercase">Investigator</TableHead>
              <TableHead className="text-secondary text-xs uppercase">Status</TableHead>
              <TableHead className="text-secondary text-xs uppercase">Last Activity</TableHead>
              <TableHead className="text-secondary text-xs uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {casesToRender.map((caseItem) => (
              <TableRow key={caseItem.id}>
                <TableCell className="font-medium">{caseItem.title}</TableCell>
                <TableCell>{formatCaseType(caseItem.type)}</TableCell>
                <TableCell>
                  {caseItem.investigator ? (
                    <div className="flex items-center">
                      <img 
                        className="h-8 w-8 rounded-full object-cover mr-3" 
                        src={caseItem.investigator.profileImageUrl || "https://via.placeholder.com/32"} 
                        alt={`${caseItem.investigator.firstName} ${caseItem.investigator.lastName}`} 
                      />
                      <div>
                        <div className="text-sm font-medium text-primary">
                          {caseItem.investigator.firstName} {caseItem.investigator.lastName}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-secondary text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                <TableCell className="text-sm text-secondary">
                  {formatLastActivity(caseItem.lastActivity)}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    className="text-accent hover:text-accent-dark"
                    onClick={() => setLocation(`/case/${caseItem.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="flex flex-1">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Cases Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">My Cases</h1>
              <p className="text-secondary mt-1">Manage and track your investigation cases</p>
            </div>
            <Button 
              onClick={() => setLocation("/cases/new")}
              className="bg-accent hover:bg-accent-dark text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> New Case
            </Button>
          </div>
          
          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                  <Input
                    placeholder="Search cases..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <Filter className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="in progress">In Progress</SelectItem>
                        <SelectItem value="awaiting info">Awaiting Info</SelectItem>
                        <SelectItem value="review needed">Review Needed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full sm:w-48">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <Filter className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Type" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="background-check">Background Check</SelectItem>
                        <SelectItem value="asset-search">Asset Search</SelectItem>
                        <SelectItem value="fraud-investigation">Fraud Investigation</SelectItem>
                        <SelectItem value="missing-person">Missing Person</SelectItem>
                        <SelectItem value="corporate-investigation">Corporate Investigation</SelectItem>
                        <SelectItem value="surveillance">Surveillance</SelectItem>
                        <SelectItem value="digital-forensics">Digital Forensics</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Cases Table with Tabs */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : (
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="active">
                  Active Cases ({activeCases.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedCases.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({cancelledCases.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {renderCasesTable(activeCases)}
              </TabsContent>
              
              <TabsContent value="completed">
                {renderCasesTable(completedCases)}
              </TabsContent>
              
              <TabsContent value="cancelled">
                {renderCasesTable(cancelledCases)}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cases;
