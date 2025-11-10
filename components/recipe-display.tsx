"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Save, Copy, ShoppingCart } from "lucide-react"
import type { Recipe } from "@/types/recipe"
import { saveRecipe } from "@/app/actions/save-recipe"
import { createShoppingList, getShoppingList, toggleShoppingListItem } from "@/app/actions/shopping-list"
import { saveNutritionInfo } from "@/app/actions/nutrition-actions"
import { NutritionDisplay } from "./nutrition-display"
import { RecipeRating } from "./recipe-rating"

interface RecipeDisplayProps {
  recipe: Recipe
  onBack: () => void
  recipeId?: string
}

interface ShoppingListItem {
  id: string
  item_name: string
  is_checked: boolean
}

interface ShoppingList {
  id: string
  recipe_title: string
  shopping_list_items: ShoppingListItem[]
}

export function RecipeDisplay({ recipe, onBack, recipeId }: RecipeDisplayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [recipeName, setRecipeName] = useState(recipe.title)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null)
  const [isLoadingShoppingList, setIsLoadingShoppingList] = useState(false)
  const [showShoppingList, setShowShoppingList] = useState(false)

  const currentStep = recipe.steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === recipe.steps.length - 1

  useEffect(() => {
    if (recipeId) {
      loadShoppingList()
    }
  }, [recipeId])

  const loadShoppingList = async () => {
    if (!recipeId) return
    setIsLoadingShoppingList(true)
    try {
      const list = await getShoppingList(recipeId)
      setShoppingList(list)
    } catch (err) {
      console.error("Failed to load shopping list:", err)
    } finally {
      setIsLoadingShoppingList(false)
    }
  }

  const handleCreateShoppingList = async () => {
    if (!recipeId) return
    setIsLoadingShoppingList(true)
    try {
      await createShoppingList(recipeId, recipeName, recipe.ingredients)
      await loadShoppingList()
      setShowShoppingList(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to create shopping list")
    } finally {
      setIsLoadingShoppingList(false)
    }
  }

  const handleToggleItem = async (itemId: string, isChecked: boolean) => {
    try {
      await toggleShoppingListItem(itemId, isChecked)
      if (shoppingList) {
        setShoppingList({
          ...shoppingList,
          shopping_list_items: shoppingList.shopping_list_items.map((item) =>
            item.id === itemId ? { ...item, is_checked: !item.is_checked } : item,
          ),
        })
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update item")
    }
  }

  const handleCopyRecipe = () => {
    const recipeText = `${recipeName}\n\nIngredients:\n${recipe.ingredients.map((ing) => `- ${ing}`).join("\n")}\n\nSteps:\n${recipe.steps.map((step, idx) => `${idx + 1}. ${step.title}\n${step.description}`).join("\n\n")}`

    navigator.clipboard.writeText(recipeText)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const handleSaveRecipe = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const recipeToSave = {
        ...recipe,
        title: recipeName,
      }
      const savedRecipe = await saveRecipe(recipeToSave, false)
      if (recipe.nutrition && savedRecipe.id) {
        await saveNutritionInfo(savedRecipe.id, recipe.nutrition)
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save recipe")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublishRecipe = async () => {
    setIsSaving(true)
    setSaveError(null)

    try {
      const recipeToSave = {
        ...recipe,
        title: recipeName,
      }
      const savedRecipe = await saveRecipe(recipeToSave, true)
      if (recipe.nutrition && savedRecipe.id) {
        await saveNutritionInfo(savedRecipe.id, recipe.nutrition)
      }
      setIsPublished(true)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to publish recipe")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleCopyRecipe} variant="outline" title="Copy recipe to clipboard">
              <Copy className="mr-2 h-4 w-4" />
              Copy Recipe
            </Button>
            <Button
              onClick={handleCreateShoppingList}
              disabled={isLoadingShoppingList || !!shoppingList}
              variant="outline"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {shoppingList ? "Shopping List Created" : "Create Shopping List"}
            </Button>
            <Button onClick={handleSaveRecipe} disabled={isSaving} variant="outline">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Recipe"}
            </Button>
            <Button onClick={handlePublishRecipe} disabled={isSaving || isPublished}>
              {isPublished ? "Published" : "Publish Recipe"}
            </Button>
          </div>
        </div>

        {saveError && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{saveError}</div>}
        {saveSuccess && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600">
            {isPublished ? "Recipe published successfully!" : "Copied to clipboard!"}
          </div>
        )}

        {shoppingList && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Shopping List: {shoppingList.recipe_title}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowShoppingList(!showShoppingList)}>
                  {showShoppingList ? "Hide" : "Show"}
                </Button>
              </div>
            </CardHeader>
            {showShoppingList && (
              <CardContent>
                <div className="space-y-2">
                  {shoppingList.shopping_list_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-blue-100">
                      <Checkbox
                        id={item.id}
                        checked={item.is_checked}
                        onCheckedChange={() => handleToggleItem(item.id, item.is_checked)}
                      />
                      <label
                        htmlFor={item.id}
                        className={`flex-1 cursor-pointer text-sm ${
                          item.is_checked ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {item.item_name}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-gray-600">
                  {shoppingList.shopping_list_items.filter((i) => i.is_checked).length} of{" "}
                  {shoppingList.shopping_list_items.length} items checked
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {recipe.nutrition && <NutritionDisplay nutrition={recipe.nutrition} />}

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Label htmlFor="recipe-name">Recipe Name</Label>
              <Input
                id="recipe-name"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="text-2xl font-bold"
              />
            </div>
            {recipe.description && <CardDescription>{recipe.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Ingredients</h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Step {currentStepIndex + 1} of {recipe.steps.length}
            </CardTitle>
            <CardDescription>{currentStep.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{currentStep.description}</p>

            {currentStep.tools && currentStep.tools.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Tools & Utensils</h4>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {currentStep.tools.map((tool, idx) => (
                    <li key={idx}>{tool}</li>
                  ))}
                </ul>
              </div>
            )}

            {currentStep.duration && (
              <div className="rounded-lg bg-primary/10 p-3">
                <p className="text-sm font-semibold">Time: {currentStep.duration} minutes</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
            disabled={isFirstStep}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous Step
          </Button>
          <Button
            onClick={() => setCurrentStepIndex(Math.min(recipe.steps.length - 1, currentStepIndex + 1))}
            disabled={isLastStep}
          >
            Next Step
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {recipeId && <RecipeRating recipeId={recipeId} />}
      </div>
    </div>
  )
}
