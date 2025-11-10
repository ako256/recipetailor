"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { NutritionInfo } from "@/types/recipe"

interface NutritionDisplayProps {
  nutrition?: NutritionInfo
}

export function NutritionDisplay({ nutrition }: NutritionDisplayProps) {
  if (!nutrition) {
    return null
  }

  const macroTotal = nutrition.protein_g + nutrition.carbs_g + nutrition.fat_g
  const proteinPercent = (nutrition.protein_g / macroTotal) * 100
  const carbsPercent = (nutrition.carbs_g / macroTotal) * 100
  const fatPercent = (nutrition.fat_g / macroTotal) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nutrition Information</CardTitle>
        <CardDescription>Per serving (out of {nutrition.servings})</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">{nutrition.calories_per_serving}</div>
          <div className="text-sm text-muted-foreground">Calories</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-semibold">{nutrition.protein_g.toFixed(1)}g</div>
            <div className="text-xs text-muted-foreground">Protein</div>
            <Progress value={proteinPercent} className="mt-2 h-2" />
          </div>
          <div>
            <div className="text-2xl font-semibold">{nutrition.carbs_g.toFixed(1)}g</div>
            <div className="text-xs text-muted-foreground">Carbs</div>
            <Progress value={carbsPercent} className="mt-2 h-2" />
          </div>
          <div>
            <div className="text-2xl font-semibold">{nutrition.fat_g.toFixed(1)}g</div>
            <div className="text-xs text-muted-foreground">Fat</div>
            <Progress value={fatPercent} className="mt-2 h-2" />
          </div>
          <div>
            <div className="text-2xl font-semibold">{nutrition.fiber_g.toFixed(1)}g</div>
            <div className="text-xs text-muted-foreground">Fiber</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
