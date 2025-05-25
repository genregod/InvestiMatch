import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/ui/Sidebar";
import { adminApi } from "@/lib/api";
import { User, Case, AdminStats } from "@shared/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Users,
  Briefcase,
  DollarSign,
  CreditCard,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [caseSearch, setCaseSearch] = useState("");

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch users for Users tab
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: activeTab === "users",
  });

  // Fetch cases for Cases tab
  const { data: cases, isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/admin/cases"],
    enabled: activeTab === "cases",
  });

  // Fetch subscriptions for Subscriptions tab
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/subscriptions"],
    enabled: activeTab === "subscriptions",
  });

  // Filter users based on search
  const filteredUsers = users?.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filter cases based on search
  const filteredCases = cases?.filter(caseItem => 
    caseItem.title.toLowerCase().includes(caseSearch.toLowerCase()) ||
    caseItem.status.toLowerCase().includes(caseSearch.toLowerCase()) ||
    caseItem.type.toLowerCase().includes(caseSearch.toLowerCase())
  );

  // Chart colors
  const COLORS = ['#38B2AC', '#2D3748', '#4A5568', '#48BB78', '#F56565'];

  // Format revenue for display
  const formatRevenue = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Create chart data
  const revenueData = stats?.revenueByPlan || [];
  const statusData = stats?.casesByStatus || [];

  // Example growth data (would come from API in real implementation)
  const subscriptionGrowthData = [
    { name: 'Jan', count: 10 },
    { name: 'Feb', count: 15 },
    { name: 'Mar', count: 25 },
    { name: 'Apr', count: 32 },
    { name: 'May', count: 45 },
    { name: 'Jun', count: 58 },
  ];

  return (
    <div className="flex flex-1">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Admin Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-secondary mt-1">Monitor and manage platform activity</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-background border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="cases">Cases</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              {statsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-secondary">Total Users</p>
                            <h3 className="text-2xl font-bold text-primary mt-1">{stats?.totalUsers || 0}</h3>
                          </div>
                          <div className="rounded-full bg-accent bg-opacity-10 p-3">
                            <Users className="h-6 w-6 text-accent" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center">
                          <span className="text-xs font-medium text-success flex items-center">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            12% growth
                          </span>
                          <span className="text-xs text-secondary ml-2">from last month</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-secondary">Total Cases</p>
                            <h3 className="text-2xl font-bold text-primary mt-1">{stats?.totalCases || 0}</h3>
                          </div>
                          <div className="rounded-full bg-primary bg-opacity-10 p-3">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center">
                          <span className="text-xs font-medium text-success flex items-center">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            8% growth
                          </span>
                          <span className="text-xs text-secondary ml-2">from last month</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-secondary">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-primary mt-1">
                              ${(stats?.revenueByPlan?.reduce((sum, plan) => sum + plan.revenue, 0) || 0).toLocaleString()}
                            </h3>
                          </div>
                          <div className="rounded-full bg-success bg-opacity-10 p-3">
                            <DollarSign className="h-6 w-6 text-success" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center">
                          <span className="text-xs font-medium text-success flex items-center">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            15% growth
                          </span>
                          <span className="text-xs text-secondary ml-2">from last month</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-secondary">Active Subscriptions</p>
                            <h3 className="text-2xl font-bold text-primary mt-1">{stats?.totalSubscriptions || 0}</h3>
                          </div>
                          <div className="rounded-full bg-secondary bg-opacity-10 p-3">
                            <CreditCard className="h-6 w-6 text-secondary" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center">
                          <span className="text-xs font-medium text-success flex items-center">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            5% growth
                          </span>
                          <span className="text-xs text-secondary ml-2">from last month</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue by Plan</CardTitle>
                        <CardDescription>Monthly revenue breakdown by subscription plan</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={revenueData}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="plan" />
                              <YAxis tickFormatter={formatRevenue} />
                              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                              <Legend />
                              <Bar dataKey="revenue" name="Revenue" fill="#38B2AC" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Cases by Status</CardTitle>
                        <CardDescription>Distribution of cases by current status</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="status"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {statusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value, name) => [value, name]} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Growth</CardTitle>
                      <CardDescription>Active subscriptions over the past 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={subscriptionGrowthData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" name="Subscriptions" stroke="#38B2AC" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage platform users</CardDescription>
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                      <Input
                        placeholder="Search users by name, email, or role..."
                        className="pl-10"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                    </div>
                  ) : filteredUsers && filteredUsers.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center">
                                  <img 
                                    src={user.profileImageUrl || "https://via.placeholder.com/40"} 
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-8 w-8 rounded-full object-cover mr-3" 
                                  />
                                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  user.role === "admin" ? "default" : 
                                  user.role === "investigator" ? "secondary" : 
                                  "outline"
                                }>
                                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">View</Button>
                                <Button variant="ghost" size="sm">Edit</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-secondary">No users found matching your search.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Cases Tab */}
            <TabsContent value="cases">
              <Card>
                <CardHeader>
                  <CardTitle>Case Management</CardTitle>
                  <CardDescription>View and manage all investigation cases</CardDescription>
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                      <Input
                        placeholder="Search cases by title, status, or type..."
                        className="pl-10"
                        value={caseSearch}
                        onChange={(e) => setCaseSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {casesLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                    </div>
                  ) : filteredCases && filteredCases.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Case</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Investigator</TableHead>
                            <TableHead>Last Activity</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCases.map((caseItem) => (
                            <TableRow key={caseItem.id}>
                              <TableCell className="font-medium">{caseItem.title}</TableCell>
                              <TableCell>{caseItem.type.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</TableCell>
                              <TableCell>
                                <Badge className={
                                  caseItem.status === "In Progress" ? "bg-green-100 text-green-800" :
                                  caseItem.status === "Awaiting Info" ? "bg-yellow-100 text-yellow-800" :
                                  caseItem.status === "Review Needed" ? "bg-blue-100 text-blue-800" :
                                  caseItem.status === "Completed" ? "bg-gray-100 text-gray-800" :
                                  "bg-red-100 text-red-800"
                                }>
                                  {caseItem.status}
                                </Badge>
                              </TableCell>
                              <TableCell>Client Name</TableCell>
                              <TableCell>
                                {caseItem.investigator ? (
                                  <div className="flex items-center">
                                    <img 
                                      src={caseItem.investigator.profileImageUrl || "https://via.placeholder.com/40"} 
                                      alt={`${caseItem.investigator.firstName} ${caseItem.investigator.lastName}`}
                                      className="h-6 w-6 rounded-full object-cover mr-2" 
                                    />
                                    <span>
                                      {caseItem.investigator.firstName} {caseItem.investigator.lastName}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-secondary text-sm">Unassigned</span>
                                )}
                              </TableCell>
                              <TableCell>{new Date(caseItem.lastActivity).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">View</Button>
                                <Button variant="ghost" size="sm">Edit</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-secondary">No cases found matching your search.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>View and manage user subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  {subscriptionsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                    </div>
                  ) : subscriptions && subscriptions.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Billing Cycle</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Next Billing</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subscriptions.map((subscription) => (
                            <TableRow key={subscription.id}>
                              <TableCell>User Name</TableCell>
                              <TableCell>
                                <Badge className={
                                  subscription.plan === "Basic" ? "bg-gray-100 text-gray-800" :
                                  subscription.plan === "Pro" ? "bg-accent bg-opacity-20 text-accent" :
                                  "bg-primary bg-opacity-20 text-primary"
                                }>
                                  {subscription.plan}
                                </Badge>
                              </TableCell>
                              <TableCell>${subscription.amount}</TableCell>
                              <TableCell>{subscription.billingCycle}</TableCell>
                              <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(subscription.nextBillingDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge className={
                                  subscription.status === "active" ? "bg-green-100 text-green-800" :
                                  "bg-red-100 text-red-800"
                                }>
                                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">View</Button>
                                <Button variant="ghost" size="sm">Edit</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-secondary">No subscriptions found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Growth</CardTitle>
                    <CardDescription>Overview of platform growth metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={subscriptionGrowthData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="count" name="Users" stroke="#2D3748" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="count" name="Cases" stroke="#38B2AC" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="count" name="Subscriptions" stroke="#48BB78" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Distribution</CardTitle>
                      <CardDescription>Breakdown of users by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Subscribers', value: 65 },
                                { name: 'Investigators', value: 30 },
                                { name: 'Admins', value: 5 },
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {[0, 1, 2].map((index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, name]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Revenue</CardTitle>
                      <CardDescription>Revenue trends over the past 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Jan', value: 4000 },
                              { name: 'Feb', value: 5000 },
                              { name: 'Mar', value: 6000 },
                              { name: 'Apr', value: 8500 },
                              { name: 'May', value: 10000 },
                              { name: 'Jun', value: 12000 },
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `$${value}`} />
                            <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                            <Legend />
                            <Bar dataKey="value" name="Revenue" fill="#48BB78" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
