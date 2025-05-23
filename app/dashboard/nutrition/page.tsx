import { Metadata } from "next"
import DashboardLayout from "@/app/components/dashboard-layout"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Progress } from "@/app/components/ui/progress"
import { Plus, TrendingUp, Apple, Droplet, Activity } from "lucide-react"

export const metadata: Metadata = {
  title: "Nutrición - NutriGuide",
  description: "Sigue tu progreso nutricional y mantén un registro de tus comidas.",
}

export default function NutritionPage() {
  const nutritionGoals = [
    { name: "Calorías", current: 1200, target: 1800, unit: "kcal", color: "bg-coral" },
    { name: "Proteínas", current: 60, target: 90, unit: "g", color: "bg-sage-green" },
    { name: "Carbohidratos", current: 120, target: 200, unit: "g", color: "bg-soft-rose" },
    { name: "Grasas", current: 35, target: 60, unit: "g", color: "bg-amber-500" },
  ]

  const meals = [
    {
      time: "Desayuno",
      items: [
        { name: "Yogur Griego", calories: 150, protein: 15, carbs: 8, fats: 5 },
        { name: "Frutas Mixtas", calories: 100, protein: 1, carbs: 25, fats: 0 },
      ],
    },
    {
      time: "Almuerzo",
      items: [
        { name: "Ensalada Mediterránea", calories: 350, protein: 25, carbs: 20, fats: 15 },
        { name: "Pan Integral", calories: 120, protein: 4, carbs: 22, fats: 2 },
      ],
    },
    {
      time: "Merienda",
      items: [
        { name: "Manzana con Mantequilla de Almendras", calories: 200, protein: 5, carbs: 25, fats: 10 },
      ],
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-marcellus text-charcoal">Nutrición</h1>
          <Button className="bg-coral hover:bg-coral/90 text-mist-white gap-2">
            <Plus size={16} />
            Agregar Comida
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nutritionGoals.map((goal, index) => (
            <Card key={index} className="bg-warm-sand border-soft-rose/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-coral" />
                  {goal.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-charcoal/70 text-sm">
                    {goal.current} / {goal.target} {goal.unit}
                  </span>
                  <span className="text-charcoal font-medium">
                    {Math.round((goal.current / goal.target) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(goal.current / goal.target) * 100}
                  className="h-2 bg-soft-rose/20"
                  indicatorClassName={goal.color}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {meals.map((meal, index) => (
              <Card key={index} className="bg-warm-sand border-soft-rose/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">{meal.time}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {meal.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between py-2 border-b border-soft-rose/10 last:border-0">
                        <div>
                          <h4 className="font-medium text-charcoal">{item.name}</h4>
                          <div className="flex gap-4 mt-1">
                            <span className="text-sm text-charcoal/70">{item.calories} kcal</span>
                            <span className="text-sm text-sage-green">{item.protein}g proteína</span>
                            <span className="text-sm text-soft-rose">{item.carbs}g carbos</span>
                            <span className="text-sm text-amber-500">{item.fats}g grasas</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-charcoal/60 hover:text-coral">
                          Editar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="bg-warm-sand border-soft-rose/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-sage-green" />
                  Agua
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-charcoal/70 text-sm">5 / 8 vasos</span>
                  <span className="text-charcoal font-medium">62%</span>
                </div>
                <Progress value={62} className="h-2 bg-soft-rose/20" indicatorClassName="bg-sage-green" />
                <Button variant="outline" className="w-full mt-4 border-sage-green text-sage-green hover:bg-sage-green/10">
                  Agregar Vaso
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-warm-sand border-soft-rose/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Activity className="w-5 h-5 text-soft-rose" />
                  Actividad Física
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-charcoal/70 text-sm">Pasos</span>
                      <span className="text-charcoal font-medium">7,500 / 10,000</span>
                    </div>
                    <Progress value={75} className="h-2 bg-soft-rose/20" indicatorClassName="bg-soft-rose" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-charcoal/70 text-sm">Ejercicio</span>
                      <span className="text-charcoal font-medium">30 / 45 min</span>
                    </div>
                    <Progress value={66} className="h-2 bg-soft-rose/20" indicatorClassName="bg-coral" />
                  </div>
                  <Button variant="outline" className="w-full border-soft-rose text-soft-rose hover:bg-soft-rose/10">
                    Registrar Actividad
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 