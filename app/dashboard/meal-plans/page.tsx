import { Metadata } from "next"
import DashboardLayout from "@/app/components/dashboard-layout"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Utensils } from "lucide-react"

export const metadata: Metadata = {
  title: "Planes de Comidas - NutriGuide",
  description: "Planifica tus comidas y sigue tu plan nutricional personalizado.",
}

export default function MealPlansPage() {
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - date.getDay() + i + 1)
    return {
      day: weekDays[i],
      date: date.getDate(),
      isToday: i === new Date().getDay() - 1,
    }
  })

  const mealPlan = {
    breakfast: {
      time: "7:30 AM",
      items: [
        {
          name: "Yogur Griego con Frutas",
          calories: 250,
          protein: 20,
          carbs: 30,
          fats: 5,
          prepTime: "5 min",
        },
      ],
    },
    lunch: {
      time: "12:30 PM",
      items: [
        {
          name: "Ensalada Mediterránea",
          calories: 450,
          protein: 25,
          carbs: 35,
          fats: 20,
          prepTime: "15 min",
        },
      ],
    },
    snack: {
      time: "3:30 PM",
      items: [
        {
          name: "Manzana con Mantequilla de Almendras",
          calories: 200,
          protein: 5,
          carbs: 25,
          fats: 10,
          prepTime: "2 min",
        },
      ],
    },
    dinner: {
      time: "7:00 PM",
      items: [
        {
          name: "Salmón al Horno con Verduras",
          calories: 550,
          protein: 35,
          carbs: 30,
          fats: 25,
          prepTime: "25 min",
        },
      ],
    },
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-marcellus text-charcoal">Planes de Comidas</h1>
          <Button className="bg-coral hover:bg-coral/90 text-mist-white gap-2">
            <Plus size={16} />
            Crear Plan
          </Button>
        </div>

        <Card className="bg-warm-sand border-soft-rose/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Calendar className="w-5 h-5 text-coral" />
                Semana Actual
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-charcoal hover:bg-soft-rose/10">
                  <ChevronLeft size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="text-charcoal hover:bg-soft-rose/10">
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {currentWeek.map((day, index) => (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg ${
                    day.isToday
                      ? "bg-coral text-mist-white"
                      : "bg-mist-white text-charcoal hover:bg-soft-rose/10"
                  }`}
                >
                  <div className="text-sm font-medium">{day.day}</div>
                  <div className="text-lg font-marcellus">{day.date}</div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {Object.entries(mealPlan).map(([meal, data]) => (
                <div key={meal} className="bg-mist-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-charcoal capitalize">{meal}</h3>
                    <div className="flex items-center gap-2 text-charcoal/70">
                      <Clock size={16} />
                      <span>{data.time}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {data.items.map((item, index) => (
                      <div key={index} className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-charcoal">{item.name}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-soft-rose/20 text-coral">
                              {item.prepTime}
                            </span>
                          </div>
                          <div className="flex gap-4 mt-1">
                            <span className="text-sm text-charcoal/70">{item.calories} kcal</span>
                            <span className="text-sm text-sage-green">{item.protein}g proteína</span>
                            <span className="text-sm text-soft-rose">{item.carbs}g carbos</span>
                            <span className="text-sm text-amber-500">{item.fats}g grasas</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-charcoal/60 hover:text-coral">
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="text-charcoal/60 hover:text-coral">
                            Reemplazar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-warm-sand border-soft-rose/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Utensils className="w-5 h-5 text-sage-green" />
                Comidas Favoritas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  "Ensalada Mediterránea",
                  "Salmón al Horno",
                  "Bowl de Quinoa",
                  "Smoothie Verde",
                ].map((meal, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-soft-rose/10 last:border-0">
                    <span className="text-charcoal">{meal}</span>
                    <Button variant="ghost" size="sm" className="text-coral hover:text-coral/90">
                      Agregar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-warm-sand border-soft-rose/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Clock className="w-5 h-5 text-soft-rose" />
                Recordatorios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "7:30 AM", meal: "Desayuno" },
                  { time: "12:30 PM", meal: "Almuerzo" },
                  { time: "3:30 PM", meal: "Merienda" },
                  { time: "7:00 PM", meal: "Cena" },
                ].map((reminder, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-soft-rose/10 last:border-0">
                    <div>
                      <span className="text-charcoal font-medium">{reminder.time}</span>
                      <span className="text-charcoal/70 ml-2">{reminder.meal}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-soft-rose/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coral"></div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 