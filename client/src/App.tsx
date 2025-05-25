import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Marketplace from "@/pages/marketplace";
import Cases from "@/pages/cases";
import Messages from "@/pages/messages";
import Subscription from "@/pages/subscription";
import CaseDetails from "@/pages/case-details";
import InvestigatorDetails from "@/pages/investigator-details";
import Settings from "@/pages/settings";
import AdminDashboard from "@/pages/admin-dashboard";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

function Router() {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  
  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }
  
  // Show different routes based on authentication state
  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={Login} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Check if current location is admin route
  const isAdminRoute = location.startsWith("/admin");

  // Check if the current route is dashboard-related
  const isDashboardRoute = [
    "/dashboard",
    "/marketplace",
    "/cases",
    "/messages",
    "/subscription",
    "/case/",
    "/investigator/",
    "/settings",
    "/admin"
  ].some(route => location.startsWith(route));

  // Determine if the current user is admin
  const isAdmin = user.role === "admin";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className={`flex-grow flex ${isDashboardRoute ? "flex-col md:flex-row" : ""}`}>
        <main className={`flex-grow ${isDashboardRoute ? "bg-background" : ""}`}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/cases" component={Cases} />
            <Route path="/messages" component={Messages} />
            <Route path="/subscription" component={Subscription} />
            <Route path="/case/:id" component={CaseDetails} />
            <Route path="/investigator/:id" component={InvestigatorDetails} />
            <Route path="/settings" component={Settings} />
            {isAdmin && <Route path="/admin" component={AdminDashboard} />}
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return <Router />;
}

export default App;
