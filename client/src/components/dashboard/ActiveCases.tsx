import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { USER_ROLES, CASE_STATUS } from "@shared/schema";

type ActiveCasesProps = {
  cases: any[];
  userRole: string;
};

const ActiveCases = ({ cases = [], userRole }: ActiveCasesProps) => {
  // Filter active cases
  const activeCases = cases.filter(
    (c) => c.status === CASE_STATUS.ACTIVE || c.status === CASE_STATUS.NEW
  );

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary">Active Cases</h2>
        <Link href="/cases" className="text-accent hover:underline text-sm font-medium">
          View All
        </Link>
      </div>

      {activeCases.length === 0 ? (
        <Card className="bg-white rounded-lg overflow-hidden card-shadow border border-gray-100">
          <CardContent className="p-6">
            <p className="text-secondary text-center py-8">
              No active cases at the moment.
              {userRole === USER_ROLES.SUBSCRIBER && (
                <Link href="/cases/new">
                  <Button variant="link" className="ml-2">
                    Create a new case
                  </Button>
                </Link>
              )}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeCases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className="bg-white rounded-lg overflow-hidden card-shadow border border-gray-100"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`
                    ${caseItem.status === CASE_STATUS.NEW ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-success'} 
                    text-xs font-medium px-2.5 py-1 rounded-full
                  `}>
                    {caseItem.status === CASE_STATUS.NEW ? 'New' : 'Active'}
                  </span>
                  <p className="text-sm text-secondary">
                    Started: {formatDistanceToNow(new Date(caseItem.startDate), { addSuffix: true })}
                  </p>
                </div>
                
                <h3 className="text-lg font-semibold text-primary mb-2">{caseItem.title}</h3>
                <p className="text-secondary text-sm mb-4">
                  {caseItem.description.length > 100
                    ? `${caseItem.description.substring(0, 100)}...`
                    : caseItem.description}
                </p>
                
                {caseItem.investigatorId ? (
                  <div className="flex items-center mb-4">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarImage src="/placeholder-investigator.jpg" alt="Investigator" />
                      <AvatarFallback>PI</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-primary">Assigned Investigator</p>
                      <div className="flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className="w-3 h-3 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-xs text-secondary ml-1">5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center mb-4">
                    <p className="text-sm text-secondary italic">No investigator assigned yet</p>
                  </div>
                )}
                
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-secondary">Progress</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2.5 mt-1">
                        <div
                          className="bg-accent h-2.5 rounded-full"
                          style={{ width: `${caseItem.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <Link href={`/messages?caseId=${caseItem.id}`}>
                      <Button variant="ghost" size="sm" className="text-accent hover:text-accent-dark">
                        <MessageSquare size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveCases;
