import { Button } from "@/components/ui/button";

type RoleSwitcherProps = {
  activeRole: string;
  onRoleSwitch: (role: "subscriber" | "investigator" | "admin") => void;
};

const RoleSwitcher = ({ activeRole, onRoleSwitch }: RoleSwitcherProps) => {
  return (
    <div className="bg-white border-b border-gray-200 mb-8">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center space-x-6 overflow-x-auto">
          <Button
            onClick={() => onRoleSwitch("subscriber")}
            className={
              activeRole === "subscriber"
                ? "px-4 py-2 text-sm font-medium text-white bg-accent rounded-md focus:outline-none"
                : "px-4 py-2 text-sm font-medium text-secondary hover:text-accent focus:outline-none"
            }
          >
            Subscriber View
          </Button>
          <Button
            onClick={() => onRoleSwitch("investigator")}
            className={
              activeRole === "investigator"
                ? "px-4 py-2 text-sm font-medium text-white bg-accent rounded-md focus:outline-none"
                : "px-4 py-2 text-sm font-medium text-secondary hover:text-accent focus:outline-none"
            }
          >
            PI View
          </Button>
          <Button
            onClick={() => onRoleSwitch("admin")}
            className={
              activeRole === "admin"
                ? "px-4 py-2 text-sm font-medium text-white bg-accent rounded-md focus:outline-none"
                : "px-4 py-2 text-sm font-medium text-secondary hover:text-accent focus:outline-none"
            }
          >
            Admin View
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcher;
