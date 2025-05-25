import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  changeValue?: string | number;
  changeText?: string;
  changeDirection?: "up" | "down" | "neutral";
  iconBgColor?: string;
  iconColor?: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  changeValue, 
  changeText, 
  changeDirection = "neutral",
  iconBgColor = "bg-accent bg-opacity-10",
  iconColor = "text-accent"
}: StatCardProps) => {
  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary">{title}</p>
            <h3 className="text-2xl font-bold text-primary mt-1">{value}</h3>
          </div>
          <div className={cn("rounded-full p-3", iconBgColor)}>
            {React.cloneElement(icon as React.ReactElement, { 
              className: cn("h-6 w-6", iconColor)
            })}
          </div>
        </div>
        
        {(changeValue || changeText) && (
          <div className="mt-4 flex items-center">
            {changeDirection && changeDirection !== "neutral" && (
              <span className={cn(
                "text-xs font-medium flex items-center",
                changeDirection === "up" ? "text-success" : "text-destructive"
              )}>
                {changeDirection === "up" ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                {changeValue}
              </span>
            )}
            {changeText && (
              <span className="text-xs text-secondary ml-2">{changeText}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
