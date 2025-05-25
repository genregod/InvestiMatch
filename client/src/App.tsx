import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/components/LandingPage";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import FindPIs from "@/pages/FindPIs";
import MyCases from "@/pages/MyCases";
import NewCase from "@/pages/NewCase";
import Messages from "@/pages/Messages";
import Subscription from "@/pages/Subscription";
import MyProfile from "@/pages/MyProfile";
import AdminDashboard from "@/pages/AdminDashboard";
import PIProfile from "@/pages/PIProfile";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={LandingPage} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/find-investigators" component={FindPIs} />
          <Route path="/cases" component={MyCases} />
          <Route path="/cases/new" component={NewCase} />
          <Route path="/cases/:id">
            {(params) => <MyCases id={params.id} />}
          </Route>
          <Route path="/messages" component={Messages} />
          <Route path="/subscription" component={Subscription} />
          <Route path="/profile" component={MyProfile} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/investigators/:id">
            {(params) => <PIProfile id={params.id} />}
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        {(isAuthenticated && !isLoading) && <Header />}
        <div className="flex-grow">
          <Router />
        </div>
        {(isAuthenticated && !isLoading) && <Footer />}
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
