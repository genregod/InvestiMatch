import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  DollarSign,
  Search,
  FileText,
  UserCheck,
  CreditCard,
  Loader,
  BarChart,
  PieChart,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { USER_ROLES } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { format } from "date-fns";

// Sample chart component using Recharts
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const AdminDashboard = () => {
  const [, navigate] = useLocation();
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not admin
  if (!isAdmin) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to view this page.",
      variant: "destructive",
    });
    navigate("/");
    return null;
  }

  // Fetch dashboard stats
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 flex justify-center items-center h-96">
        <Loader className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Sample data for charts (in a real application, this would come from the API)
  const userRoleData = [
    { name: "Subscribers", value: 65, color: "#38B2AC" },
    { name: "Investigators", value: 30, color: "#48BB78" },
    { name: "Admins", value: 5, color: "#4A5568" },
  ];

  const caseStatusData = [
    { name: "New", count: 12 },
    { name: "Active", count: 25 },
    { name: "On Hold", count: 8 },
    { name: "Completed", count: 18 },
    { name: "Cancelled", count: 5 },
  ];

  const subscriptionData = [
    { name: "Basic", value: 45, color: "#38B2AC" },
    { name: "Pro", value: 35, color: "#48BB78" },
    { name: "Enterprise", value: 20, color: "#2D3748" },
  ];

  const revenueData = [
    { month: "Jan", revenue: 4500 },
    { month: "Feb", revenue: 5200 },
    { month: "Mar", revenue: 6800 },
    { month: "Apr", revenue: 7400 },
    { month: "May", revenue: 9100 },
    { month: "Jun", revenue: 8700 },
  ];

  // Sample table data (would come from API)
  const recentUsers = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: USER_ROLES.SUBSCRIBER,
      date: "2023-05-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael@example.com",
      role: USER_ROLES.INVESTIGATOR,
      date: "2023-05-14T14:45:00Z",
    },
    {
      id: "3",
      name: "Jessica Williams",
      email: "jessica@example.com",
      role: USER_ROLES.SUBSCRIBER,
      date: "2023-05-13T09:15:00Z",
    },
    {
      id: "4",
      name: "David Kim",
      email: "david@example.com",
      role: USER_ROLES.INVESTIGATOR,
      date: "2023-05-12T16:20:00Z",
    },
    {
      id: "5",
      name: "Emily Rodriguez",
      email: "emily@example.com",
      role: USER_ROLES.SUBSCRIBER,
      date: "2023-05-11T11:10:00Z",
    },
  ];

  const recentCases = [
    {
      id: "101",
      title: "Corporate Fraud Investigation",
      client: "TechCorp Inc.",
      investigator: "James Wilson",
      status: "active",
      date: "2023-05-15T08:45:00Z",
    },
    {
      id: "102",
      title: "Background Check",
      client: "HR Solutions",
      investigator: "Maria Rodriguez",
      status: "completed",
      date: "2023-05-14T13:30:00Z",
    },
    {
      id: "103",
      title: "Asset Recovery",
      client: "Financial Group",
      investigator: "Robert Chen",
      status: "new",
      date: "2023-05-13T16:15:00Z",
    },
    {
      id: "104",
      title: "Surveillance Operation",
      client: "Legal Associates",
      investigator: "Lisa Thompson",
      status: "on_hold",
      date: "2023-05-12T10:20:00Z",
    },
    {
      id: "105",
      title: "Digital Forensics Analysis",
      client: "SecureTech",
      investigator: "David Kim",
      status: "active",
      date: "2023-05-11T09:10:00Z",
    },
  ];

  const recentPayments = [
    {
      id: "201",
      client: "TechCorp Inc.",
      amount: 149.00,
      plan: "Pro",
      status: "paid",
      date: "2023-05-15T14:30:00Z",
    },
    {
      id: "202",
      client: "HR Solutions",
      amount: 49.00,
      plan: "Basic",
      status: "paid",
      date: "2023-05-14T10:15:00Z",
    },
    {
      id: "203",
      client: "Financial Group",
      amount: 500.00,
      plan: "Enterprise",
      status: "pending",
      date: "2023-05-13T16:45:00Z",
    },
    {
      id: "204",
      client: "Legal Associates",
      amount: 149.00,
      plan: "Pro",
      status: "paid",
      date: "2023-05-12T11:20:00Z",
    },
    {
      id: "205",
      client: "SecureTech",
      amount: 49.00,
      plan: "Basic",
      status: "failed",
      date: "2023-05-11T09:50:00Z",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "active":
        return "bg-green-100 text-success";
      case "on_hold":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-success";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white rounded-lg card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Total Users</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {dashboardData?.userStats?.length || 100}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent bg-opacity-10 flex items-center justify-center">
                <Users className="text-accent text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-secondary">
                <span className="text-success font-medium">↑ 12%</span> from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-lg card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Active Cases</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {dashboardData?.caseStats?.filter((c: any) => c.status === "active").length || 25}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                <Briefcase className="text-primary text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-secondary">
                <span className="text-success font-medium">↑ 8%</span> from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-lg card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary mt-1">$8,745</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success bg-opacity-10 flex items-center justify-center">
                <DollarSign className="text-success text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-secondary">
                <span className="text-success font-medium">↑ 15%</span> from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-lg card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Verified PIs</p>
                <p className="text-2xl font-bold text-primary mt-1">42</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent bg-opacity-10 flex items-center justify-center">
                <UserCheck className="text-accent text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-secondary">
                <span className="text-success font-medium">↑ 5%</span> from last month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white rounded-lg card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={revenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#38B2AC" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-lg card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Data Tables */}
      <Tabs defaultValue="users" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="cases" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Cases
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
        </TabsList>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
            <Input
              placeholder="Search..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={
                          user.role === USER_ROLES.SUBSCRIBER
                            ? "bg-blue-100 text-blue-700"
                            : user.role === USER_ROLES.INVESTIGATOR
                            ? "bg-green-100 text-success"
                            : "bg-purple-100 text-purple-700"
                        }>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(user.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Investigator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.id}</TableCell>
                      <TableCell>{caseItem.title}</TableCell>
                      <TableCell>{caseItem.client}</TableCell>
                      <TableCell>{caseItem.investigator}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(caseItem.status)}>
                          {caseItem.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(caseItem.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.client}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.plan}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusBadge(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(payment.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white rounded-lg card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Subscription Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-lg card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Case Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={caseStatusData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#38B2AC" radius={[0, 4, 4, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-lg card-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <UserCheck className="mr-2 h-4 w-4" /> Verify New Investigators
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Review Pending Cases
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="mr-2 h-4 w-4" /> Process Payments
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" /> Manage User Accounts
              </Button>
              <Button className="w-full bg-accent text-white">
                View All Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
