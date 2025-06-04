import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Calendar, ChevronRight } from "lucide-react";
import { Utensils } from "lucide-react";

export default function MealPlanCard() {
  const meals = [
    {
      type: "Breakfast",
      title: "Greek Yogurt Bowl",
      description:
        "Greek yogurt with berries, honey, and a sprinkle of granola",
      time: "7:30 AM",
      completed: true,
    },
    {
      type: "Lunch",
      title: "Mediterranean Salad",
      description:
        "Mixed greens, cherry tomatoes, cucumber, feta, olives, and grilled chicken with olive oil dressing",
      time: "12:30 PM",
      completed: false,
    },
    {
      type: "Snack",
      title: "Apple with Almond Butter",
      description: "1 medium apple with 1 tablespoon of almond butter",
      time: "3:30 PM",
      completed: false,
    },
    {
      type: "Dinner",
      title: "Baked Salmon with Vegetables",
      description:
        "Baked salmon fillet with roasted asparagus and sweet potato",
      time: "7:00 PM",
      completed: false,
    },
  ];

  return (
    <Card className="bg-warm-sand border-soft-rose/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Utensils className="w-5 h-5 text-coral" />
          Today's Meal Plan
        </CardTitle>
        <Button
          variant="ghost"
          className="text-coral hover:bg-soft-rose/10 h-8 px-2"
        >
          View Full Plan
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meals.map((meal, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="min-w-[80px] text-sm text-charcoal/70">
                {meal.time}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-charcoal">{meal.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-soft-rose/20 text-coral">
                    {meal.type}
                  </span>
                </div>
                <p className="text-sm text-charcoal/70 mt-1">
                  {meal.description}
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={meal.completed}
                  readOnly
                  className="h-5 w-5 rounded-full border-2 border-sage-green text-sage-green focus:ring-sage-green"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between items-center">
          <div>
            <span className="text-sm text-charcoal/70">Water Intake</span>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    index < 5
                      ? "bg-sage-green text-mist-white"
                      : "bg-sage-green/20 text-sage-green"
                  }`}
                >
                  <span className="text-xs">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            className="border-sage-green text-sage-green hover:bg-sage-green/10"
          >
            Add Water
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
