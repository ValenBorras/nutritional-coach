import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { TrendingUp, ChevronRight, Target, Award } from "lucide-react";

export default function ProgressTracker() {
  const weeklyData = [
    { day: "Mon", value: 65 },
    { day: "Tue", value: 70 },
    { day: "Wed", value: 60 },
    { day: "Thu", value: 80 },
    { day: "Fri", value: 75 },
    { day: "Sat", value: 85 },
    { day: "Sun", value: 78 },
  ];

  const goals = [
    {
      name: "Protein Intake",
      current: 75,
      target: 100,
      unit: "g",
      color: "bg-coral",
    },
    {
      name: "Vegetable Servings",
      current: 4,
      target: 5,
      unit: "servings",
      color: "bg-sage-green",
    },
    {
      name: "Steps",
      current: 7500,
      target: 10000,
      unit: "steps",
      color: "bg-soft-rose",
    },
  ];

  return (
    <Card className="bg-warm-sand border-soft-rose/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sage-green" />
          Progress Tracker
        </CardTitle>
        <Button
          variant="ghost"
          className="text-sage-green hover:bg-sage-green/10 h-8 px-2"
        >
          View Details
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-sm font-medium text-charcoal mb-3">
            Weekly Consistency
          </h3>
          <div className="flex items-end justify-between h-32">
            {weeklyData.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 w-full"
              >
                <div className="w-full max-w-[30px] bg-sage-green/10 rounded-t-lg relative">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-sage-green rounded-t-lg"
                    style={{ height: `${item.value}%` }}
                  ></div>
                </div>
                <span className="text-xs text-charcoal/70">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-charcoal mb-3">
            Today's Goals
          </h3>
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-charcoal">{goal.name}</span>
                  <span className="text-sm text-charcoal/70">
                    {goal.current} / {goal.target} {goal.unit}
                  </span>
                </div>
                <div className="w-full h-2 bg-soft-rose/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${goal.color} rounded-full`}
                    style={{ width: `${(goal.current / goal.target) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
