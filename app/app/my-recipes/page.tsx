"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Eye, Share2 } from "lucide-react"
import { RecipeDisplay } from "@/components/recipe-display"
import { fetchRecipe } from "@/app/actions/fetch-recipe"
import type { Recipe } from "@/types/recipe"

interface MyRecipe {
  id: string
  title: string
  description: string | null
  ingredients: string[]
  is_published: boolean
  created_at: string
}

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<MyRecipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [isFetchingRecipe, setIsFetchingRecipe] = useState(false)
  const [activeTab, setActiveTab] = useState<"created" | "saved">("created")

  useEffect(() => {
    loadRecipes()
  }, [activeTab])

  const loadRecipes = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      if (activeTab === "created") {
        const { data, error } = await supabase
          .from("recipes")
          .select("id, title, description, ingredients, is_published, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setRecipes(data || [])
      } else {
        const { data, error } = await supabase
          .from("saved_recipes")
          .select("recipe_id, recipes(id, title, description, ingredients, is_published, created_at)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        const savedRecipes = data?.map((item: any) => item.recipes).filter(Boolean) || []
        setRecipes(savedRecipes)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recipes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("recipes").delete().eq("id", recipeId)

      if (error) throw error
      setRecipes((prev) => prev.filter((r) => r.id !== recipeId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete recipe")
    }
  }

  const handlePublishRecipe = async (recipeId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("recipes").update({ is_published: !currentStatus }).eq("id", recipeId)

      if (error) throw error
      setRecipes((prev) => prev.map((r) => (r.id === recipeId ? { ...r, is_published: !currentStatus } : r)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update recipe")
    }
  }

  const handleViewRecipe = async (recipe: MyRecipe) => {
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
        onBack={() => setSelectedRecipe(null)}
        recipeId={selectedRecipeId || undefined}
      />
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <p className="text-muted-foreground">Manage your created and saved recipes</p>
        </div>

        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("created")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "created"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Created ({recipes.filter((r) => !r.is_published).length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "saved"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Saved
          </button>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 mb-6">{error}</div>}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {activeTab === "created"
                ? "You haven't created any recipes yet. Start by creating one!"
                : "You haven't saved any recipes yet. Explore and save recipes from the Discover page!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
                      {recipe.description && (
                        <CardDescription className="line-clamp-2 mt-1">{recipe.description}</CardDescription>
                      )}
                    </div>
                    {activeTab === "created" && (
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                          recipe.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {recipe.is_published ? "Published" : "Draft"}
                      </span>
                    )}
                  </div>
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
                    {activeTab === "created" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublishRecipe(recipe.id, recipe.is_published)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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
