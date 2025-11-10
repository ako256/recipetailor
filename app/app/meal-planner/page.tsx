"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Calendar } from "lucide-react"
import { createMealPlan, getMealPlans, deleteMealPlan } from "@/app/actions/meal-plan-actions"
import type { MealPlan } from "@/types/recipe"

export default function MealPlannerPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newPlanName, setNewPlanName] = useState("")
  const [newPlanDescription, setNewPlanDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMealPlans()
  }, [])

  const loadMealPlans = async () => {
    try {
      const plans = await getMealPlans()
      setMealPlans(plans)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meal plans")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) {
      setError("Please enter a meal plan name")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const newPlan = await createMealPlan(newPlanName, newPlanDescription)
      setMealPlans([newPlan, ...mealPlans])
      setNewPlanName("")
      setNewPlanDescription("")
      setShowNewForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create meal plan")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this meal plan?")) return

    try {
      await deleteMealPlan(planId)
      setMealPlans(mealPlans.filter((p) => p.id !== planId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete meal plan")
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Meal Planner</h1>
            <p className="text-muted-foreground">Create and manage weekly meal plans</p>
          </div>
          <Button onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="mr-2 h-4 w-4" />
            New Meal Plan
          </Button>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 mb-6">{error}</div>}

        {showNewForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Meal Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  placeholder="e.g., Weekly Keto Plan"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="plan-description">Description (optional)</Label>
                <Input
                  id="plan-description"
                  placeholder="e.g., Low carb, high protein meals"
                  value={newPlanDescription}
                  onChange={(e) => setNewPlanDescription(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePlan} disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create Plan"}
                </Button>
                <Button variant="outline" onClick={() => setShowNewForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading meal plans...</p>
          </div>
        ) : mealPlans.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No meal plans yet</p>
            <Button onClick={() => setShowNewForm(true)}>Create Your First Meal Plan</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mealPlans.map((plan) => (
              <Link key={plan.id} href={`/app/meal-planner/${plan.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{plan.name}</CardTitle>
                    {plan.description && <CardDescription className="line-clamp-2">{plan.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(plan.created_at).toLocaleDateString()}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault()
                        handleDeletePlan(plan.id)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
