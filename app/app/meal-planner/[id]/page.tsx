"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import { getMealPlanWithRecipes, deleteMealFromMealPlan } from "@/app/actions/meal-plan-actions"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"]

interface MealPlanItem {
  id: string
  day_of_week: number
  meal_type: string
  recipes: {
    id: string
    title: string
    description: string | null
    ingredients: string[]
    nutrition_info: {
      calories_per_serving: number
    }[]
  }
}

export default function MealPlanDetailPage() {
  const params = useParams()
  const planId = params.id as string
  const [meals, setMeals] = useState<MealPlanItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!planId) {
      setIsLoading(false)
      return
    }

    loadMealPlan()
  }, [planId])

  const loadMealPlan = async () => {
    try {
      const data = await getMealPlanWithRecipes(planId)
      setMeals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meal plan")
    } finally {
      setIsLoading(false)
    }
  }

  const getMealsForDay = (dayOfWeek: number, mealType: string) => {
    return meals.filter((m) => m.day_of_week === dayOfWeek && m.meal_type === mealType)
  }

  const getTotalCaloriesForDay = (dayOfWeek: number) => {
    return meals
      .filter((m) => m.day_of_week === dayOfWeek)
      .reduce((sum, m) => sum + (m.recipes?.nutrition_info?.[0]?.calories_per_serving || 0), 0)
  }

  const handleDeleteMeal = async (mealItemId: string) => {
    if (!confirm("Remove this meal?")) return

    try {
      await deleteMealFromMealPlan(mealItemId)
      setMeals(meals.filter((m) => m.id !== mealItemId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete meal")
    }
  }

  if (!planId) {
    return (
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/app/meal-planner">
            <Button variant="outline" className="mb-6 bg-transparent">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Plans
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/app/meal-planner">
          <Button variant="outline" className="mb-6 bg-transparent">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
        </Link>

        {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 mb-6">{error}</div>}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading meal plan...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {DAYS_OF_WEEK.map((day, dayIndex) => (
              <Card key={dayIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{day}</CardTitle>
                      <CardDescription>Daily target: {getTotalCaloriesForDay(dayIndex)} calories</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {MEAL_TYPES.map((mealType) => {
                      const dayMeals = getMealsForDay(dayIndex, mealType)
                      return (
                        <div key={mealType} className="border rounded-lg p-4 space-y-2">
                          <h4 className="font-semibold capitalize text-sm">{mealType}</h4>
                          {dayMeals.length === 0 ? (
                            <div className="text-xs text-muted-foreground py-4 text-center">
                              <p>No meal planned</p>
                            </div>
                          ) : (
                            dayMeals.map((meal) => (
                              <div key={meal.id} className="bg-primary/10 rounded p-2 text-xs space-y-1">
                                <p className="font-medium line-clamp-2">{meal.recipes?.title}</p>
                                <p className="text-muted-foreground">
                                  {meal.recipes?.nutrition_info?.[0]?.calories_per_serving || 0} cal
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-6 text-xs"
                                  onClick={() => handleDeleteMeal(meal.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            ))
                          )}
                          <Link href={`/app/discover?mealType=${mealType}&day=${dayIndex}`}>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8 bg-transparent">
                              <Plus className="h-3 w-3 mr-1" />
                              Add Recipe
                            </Button>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
