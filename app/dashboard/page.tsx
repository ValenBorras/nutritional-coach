import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import DashboardLayout from "@/app/components/dashboard-layout"
import NutritionChatbot from "@/app/components/nutrition-chatbot"
import MealPlanCard from "@/app/components/meal-plan-card"
import ProgressTracker from "@/app/components/progress-tracker"
import { Calendar, MessageSquare, Activity } from "lucide-react"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-warm-sand border-soft-rose/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="w-5 h-5 text-coral" />
              Today's Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-marcellus text-charcoal mb-2">Mindful Eating</h3>
            <p className="text-charcoal/70 text-sm">Focus on eating slowly and recognizing hunger cues today.</p>
            <Button variant="link" className="text-coral p-0 h-auto mt-2">
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-warm-sand border-soft-rose/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Activity className="w-5 h-5 text-sage-green" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-charcoal/70 text-sm">Weekly Goal</span>
              <span className="text-charcoal font-medium">65%</span>
            </div>
            <div className="w-full h-2 bg-soft-rose/20 rounded-full overflow-hidden">
              <div className="h-full bg-sage-green rounded-full" style={{ width: "65%" }}></div>
            </div>
            <Button variant="link" className="text-sage-green p-0 h-auto mt-2">
              View All Goals
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-warm-sand border-soft-rose/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-soft-rose" />
              Nutritionist Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-charcoal/70 text-sm italic">
              "Great progress on your water intake! Let's focus on adding more leafy greens this week."
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-8 h-8 rounded-full bg-soft-rose flex items-center justify-center">
                <span className="text-xs font-semibold">DR</span>
              </div>
              <span className="text-charcoal text-sm">Dr. Rebecca, RD</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MealPlanCard />
          <ProgressTracker />
        </div>

        <div className="lg:col-span-1">
          <NutritionChatbot />
        </div>
      </div>
    </DashboardLayout>
  )
}
