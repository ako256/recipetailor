"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Eye } from "lucide-react"
import { RecipeDisplay } from "@/components/recipe-display"
import { fetchRecipe } from "@/app/actions/fetch-recipe"
import type { Recipe } from "@/types/recipe"

interface RecipeCard {
  id: string
  title: string
  description: string | null
  ingredients: string[]
  is_published: boolean
  user_id: string
}

export default function DiscoverPage() {
  const [recipes, setRecipes] = useState<RecipeCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isFetchingRecipe, setIsFetchingRecipe] = useState(false)
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadRecipes()
    loadSavedRecipes()
  }, [])

  const loadRecipes = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, description, ingredients, is_published, user_id")
        .eq("is_published", true)

      if (error) throw error
      setRecipes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recipes")
    } finally {
      setIsLoading(false)
    }
  }

  const loadSavedRecipes = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("saved_recipes").select("recipe_id")

      if (error) throw error
      setSavedRecipes(new Set(data?.map((r) => r.recipe_id) || []))
    } catch (err) {
      console.error("Failed to load saved recipes:", err)
    }
  }

  const handleSaveRecipe = async (recipeId: string) => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("saved_recipes").insert({
        user_id: user.id,
        recipe_id: recipeId,
      })

      if (error) throw error

      setSavedRecipes((prev) => new Set([...prev, recipeId]))
    } catch (err) {
      console.error("Failed to save recipe:", err)
    }
  }

  const handleViewRecipe = async (recipe: RecipeCard) => {
    setSelectedRecipeId(recipe.id)
    setIsFetchingRecipe(true)
    try {
      const fullRecipe = await fetchRecipe(recipe.id)
      if (fullRecipe) {
        setSelectedRecipe(fullRecipe)
      } else {
        setError("Failed to load recipe details")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recipe")
    } finally {
      setIsFetchingRecipe(false)
    }
  }

  if (selectedRecipe) {
    return (
      <RecipeDisplay
        recipe={selectedRecipe}
        onBack={() => {
          setSelectedRecipe(null)
          setSelectedRecipeId(null)
        }}
        recipeId={selectedRecipeId || undefined}
      />
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Discover Recipes</h1>
          <p className="text-muted-foreground">Explore recipes created by the community</p>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 mb-6">{error}</div>}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recipes published yet. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
                  {recipe.description && (
                    <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Ingredients</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <li className="text-muted-foreground">+{recipe.ingredients.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleViewRecipe(recipe)}
                      disabled={isFetchingRecipe}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {isFetchingRecipe ? "Loading..." : "View"}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSaveRecipe(recipe.id)}
                      disabled={savedRecipes.has(recipe.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {savedRecipes.has(recipe.id) ? "Saved" : "Save"}
                    </Button>
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
