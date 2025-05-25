import { useLocation, Link } from "wouter";
import { 
  Home, 
  CheckSquare, 
  Users, 
  MessageCircle, 
  CreditCard, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [location] = useLocation();

  // Define navigation items
  const navItems = [
    {
      name: "Overview",
      path: "/dashboard",
      icon: <Home className="h-5 w-5 mr-2" />
    },
    {
      name: "My Cases",
      path: "/cases",
      icon: <CheckSquare className="h-5 w-5 mr-2" />
    },
    {
      name: "PI Marketplace",
      path: "/marketplace",
      icon: <Users className="h-5 w-5 mr-2" />
    },
    {
      name: "Messages",
      path: "/messages",
      icon: <MessageCircle className="h-5 w-5 mr-2" />
    },
    {
      name: "Subscription",
      path: "/subscription",
      icon: <CreditCard className="h-5 w-5 mr-2" />
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5 mr-2" />
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-lg font-semibold text-primary">Dashboard</h2>
      </div>
      <nav className="px-3 py-2">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={cn(
                "nav-link flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1",
                location === item.path 
                  ? "active text-accent" 
                  : "text-secondary"
              )}
            >
              {React.cloneElement(item.icon, {
                className: cn(
                  "h-5 w-5 mr-2",
                  location === item.path ? "text-accent" : "text-secondary"
                )
              })}
              {item.name}
            </a>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
