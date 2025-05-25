import { Card, CardContent } from "@/components/ui/card";
import { USER_ROLES } from "@shared/schema";
import { 
  FolderOpen, 
  ClipboardList, 
  UserRoundCheck, 
  Mail, 
  DollarSign, 
  Clock 
} from "lucide-react";

type DashboardStatsProps = {
  stats: any;
  userRole: string;
};

const DashboardStats = ({ stats, userRole }: DashboardStatsProps) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {userRole === USER_ROLES.SUBSCRIBER && (
        <>
          {/* Active Cases */}
          <Card className="bg-white rounded-lg card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Active Cases</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.activeCasesCount || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent bg-opacity-10 flex items-center justify-center">
                  <FolderOpen className="text-accent text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-secondary">
                  <span className="text-success font-medium">
                    {stats.activeCasesCount > 0 ? `↑ ${stats.activeCasesCount} active` : "No active cases"}
                  </span> at the moment
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cases Remaining */}
          <Card className="bg-white rounded-lg card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Cases Remaining</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.casesRemaining || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                  <ClipboardList className="text-primary text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-secondary">
                  On your <span className="font-medium">{stats.subscription?.plan || "Basic"} Plan</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Active PIs */}
          <Card className="bg-white rounded-lg card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Active PIs</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.activeInvestigatorsCount || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success bg-opacity-10 flex items-center justify-center">
                  <UserRoundCheck className="text-success text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-secondary">
                  Working on <span className="font-medium">{stats.activeCasesCount || 0} different cases</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Unread Messages */}
          <Card className="bg-white rounded-lg card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Unread Messages</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.unreadMessagesCount || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Mail className="text-red-500 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-secondary">
                  {stats.unreadMessagesCount > 0 ? (
                    <span className="text-red-500 font-medium">New messages</span>
                  ) : (
                    <span className="font-medium">No new messages</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {userRole === USER_ROLES.INVESTIGATOR && (
        <>
          {/* Active Cases */}
          <Card className="bg-white rounded-lg card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Active Cases</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.activeCasesCount || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent bg-opacity-10 flex items-center justify-center">
                  <FolderOpen className="text-accent text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-secondary">
                  <span className="text-success font-medium">
                    {stats.activeCasesCount > 0 ? `↑ ${stats.activeCasesCount} active` : "No active cases"}
                  </span> at the moment
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Unread Messages */}
          <Card className="bg-white rounded-lg card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Unread Messages</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.unreadMessagesCount || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Mail className="text-red-500 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-secondary">
                  {stats.unreadMessagesCount > 0 ? (
                    <span className="text-red-500 font-medium">New messages</span>
                  ) : (
                    <span className="font-medium">No new messages</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payments */}
          <Card className="bg-white rounded-lg card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Pending Payments</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.pendingPaymentsCount || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <DollarSign className="text-yellow-500 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-secondary">
                  {stats.pendingPaymentsCount > 0 ? (
                    <span className="text-yellow-500 font-medium">Awaiting approval</span>
                  ) : (
                    <span className="font-medium">No pending payments</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="bg-white rounded-lg card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Status</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.investigatorProfile?.isAvailable ? "Available" : "Busy"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="text-green-500 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-secondary">
                  <span className="font-medium">
                    {stats.investigatorProfile?.isAvailable 
                      ? "You are visible to new clients" 
                      : "You are not visible to new clients"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {userRole === USER_ROLES.ADMIN && (
        <>
          {/* Total Users */}
          <Card className="bg-white rounded-lg card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Total Users</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.userStats?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent bg-opacity-10 flex items-center justify-center">
                  <UserRoundCheck className="text-accent text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-secondary">
                  <span className="text-success font-medium">Platform users</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Cases */}
          <Card className="bg-white rounded-lg card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Total Cases</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.caseStats?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                  <FolderOpen className="text-primary text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-secondary">
                  <span className="font-medium">All cases on platform</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Payments */}
          <Card className="bg-white rounded-lg card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Total Payments</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.paymentStats?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success bg-opacity-10 flex items-center justify-center">
                  <DollarSign className="text-success text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-secondary">
                  <span className="font-medium">All transactions</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardStats;
