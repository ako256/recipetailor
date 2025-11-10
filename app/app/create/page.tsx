"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { generateRecipeSuggestions } from "@/app/actions/generate-recipe-suggestions"
import { generateRecipe } from "@/app/actions/generate-recipe"
import { RecipeDisplay } from "@/components/recipe-display"
import type { Recipe } from "@/types/recipe"

export default function CreatePage() {
  const [ingredients, setIngredients] = useState("")
  const [vegetarian, setVegetarian] = useState(false)
  const [vegan, setVegan] = useState(false)
  const [glutenFree, setGlutenFree] = useState(false)
  const [dairyFree, setDairyFree] = useState(false)
  const [nutFree, setNutFree] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateSuggestions = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const ingredientList = ingredients
        .split("\n")
        .map((i) => i.trim())
        .filter((i) => i.length > 0)

      if (ingredientList.length === 0) {
        setError("Please enter at least one ingredient")
        setIsLoading(false)
        return
      }

      const recipeSuggestions = await generateRecipeSuggestions({
        ingredients: ingredientList,
        preferences: {
          vegetarian,
          vegan,
          glutenFree,
          dairyFree,
          nutFree,
        },
      })

      setSuggestions(recipeSuggestions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate recipe suggestions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectRecipe = async (recipeName: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const ingredientList = ingredients
        .split("\n")
        .map((i) => i.trim())
        .filter((i) => i.length > 0)

      const fullRecipe = await generateRecipe({
        ingredients: ingredientList,
        recipeName,
        preferences: {
          vegetarian,
          vegan,
          glutenFree,
          dairyFree,
          nutFree,
        },
      })

      setRecipe(fullRecipe)
      setSuggestions([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate recipe")
    } finally {
      setIsLoading(false)
    }
  }

  if (recipe) {
    return <RecipeDisplay recipe={recipe} onBack={() => setRecipe(null)} recipeId={undefined} />
  }

  if (suggestions.length > 0) {
    return (
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Recipe</CardTitle>
              <CardDescription>Select one of the suggested recipes to generate the full recipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    onClick={() => handleSelectRecipe(suggestion)}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-4 px-4"
                  >
                    <span className="text-lg">{suggestion}</span>
                  </Button>
                ))}
              </div>
              <Button onClick={() => setSuggestions([])} variant="ghost" className="w-full mt-4" disabled={isLoading}>
                Back to Ingredients
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create a Recipe</CardTitle>
            <CardDescription>Enter your ingredients and dietary preferences to get recipe suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateSuggestions} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients</Label>
                <Textarea
                  id="ingredients"
                  placeholder="Enter one ingredient per line&#10;e.g.&#10;chicken&#10;tomato&#10;garlic"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="min-h-32"
                />
              </div>

              <div className="space-y-3">
                <Label>Dietary Preferences</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="vegetarian"
                      checked={vegetarian}
                      onCheckedChange={(checked) => setVegetarian(checked as boolean)}
                    />
                    <Label htmlFor="vegetarian" className="font-normal cursor-pointer">
                      Vegetarian
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="vegan" checked={vegan} onCheckedChange={(checked) => setVegan(checked as boolean)} />
                    <Label htmlFor="vegan" className="font-normal cursor-pointer">
                      Vegan
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="gluten-free"
                      checked={glutenFree}
                      onCheckedChange={(checked) => setGlutenFree(checked as boolean)}
                    />
                    <Label htmlFor="gluten-free" className="font-normal cursor-pointer">
                      Gluten Free
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="dairy-free"
                      checked={dairyFree}
                      onCheckedChange={(checked) => setDairyFree(checked as boolean)}
                    />
                    <Label htmlFor="dairy-free" className="font-normal cursor-pointer">
                      Dairy Free
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="nut-free"
                      checked={nutFree}
                      onCheckedChange={(checked) => setNutFree(checked as boolean)}
                    />
                    <Label htmlFor="nut-free" className="font-normal cursor-pointer">
                      Nut Free
                    </Label>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Generating suggestions..." : "Get Recipe Suggestions"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
