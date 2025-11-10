"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { rateRecipe, getRecipeRatings } from "@/app/actions/nutrition-actions"
import type { RecipeRatingData } from "@/types/recipe"

interface RecipeRatingProps {
  recipeId: string | undefined
}

export function RecipeRating({ recipeId }: RecipeRatingProps) {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ratings, setRatings] = useState<RecipeRatingData[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (recipeId) {
      loadRatings()
    }
  }, [recipeId])

  const loadRatings = async () => {
    if (!recipeId) return
    try {
      const data = await getRecipeRatings(recipeId)
      setRatings(data)
      if (data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
        setAverageRating(avg)
      }
    } catch (err) {
      console.error("Failed to load ratings:", err)
    }
  }

  const handleSubmitRating = async () => {
    if (!recipeId || rating === 0) {
      setError("Please select a rating")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await rateRecipe(recipeId, rating, review)
      setRating(0)
      setReview("")
      await loadRatings()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rating")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rate This Recipe</CardTitle>
          <CardDescription>Share your experience with this recipe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${value <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium">Review (optional)</label>
            <Textarea
              placeholder="Share your thoughts about this recipe..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="mt-2 min-h-24"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <Button onClick={handleSubmitRating} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </CardContent>
      </Card>

      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Community Ratings</CardTitle>
            <CardDescription>Average: {averageRating.toFixed(1)} out of 5</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratings.slice(0, 5).map((r) => (
              <div key={r.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{r.rating} out of 5</span>
                </div>
                {r.review && <p className="text-sm text-foreground">{r.review}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
