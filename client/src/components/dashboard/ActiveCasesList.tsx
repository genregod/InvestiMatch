import { Link } from "wouter";
import { Case, User } from "@shared/types";
import { formatDistanceToNow } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface ActiveCasesListProps {
  cases: Case[];
  loading?: boolean;
}

const ActiveCasesList = ({ cases, loading = false }: ActiveCasesListProps) => {
  // Map status to badge variants
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
      case "awaiting info":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{status}</Badge>;
      case "review needed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{status}</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date for last activity
  const formatLastActivity = (date: Date) => {
    const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true });
    return `${date.toLocaleDateString()} (${timeAgo})`;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-primary">Active Cases</CardTitle>
        <Link href="/cases">
          <Button variant="ghost" className="text-accent hover:text-accent-dark font-medium text-sm flex items-center">
            View all cases
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-secondary">No active cases found.</p>
            <Button variant="outline" className="mt-4">
              <Link href="/marketplace">Find an Investigator</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-secondary text-xs uppercase">Case</TableHead>
                  <TableHead className="text-secondary text-xs uppercase">Investigator</TableHead>
                  <TableHead className="text-secondary text-xs uppercase">Status</TableHead>
                  <TableHead className="text-secondary text-xs uppercase">Last Activity</TableHead>
                  <TableHead className="text-secondary text-xs uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">{caseItem.title}</TableCell>
                    <TableCell>
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
                          <div className="text-xs text-secondary">{caseItem.investigator.specialization}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                    <TableCell className="text-sm text-secondary">
                      {formatLastActivity(caseItem.lastActivity)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/case/${caseItem.id}`}>
                        <Button variant="ghost" className="text-accent hover:text-accent-dark">View Details</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveCasesList;
