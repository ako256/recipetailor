"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Recipe } from "@/types/recipe"

interface GenerateRecipeInput {
  ingredients: string[]
  recipeName: string
  preferences: {
    vegetarian: boolean
    vegan: boolean
    glutenFree: boolean
    dairyFree: boolean
    nutFree: boolean
  }
}

export async function generateRecipe(input: GenerateRecipeInput): Promise<Recipe> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set")
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const preferencesText = Object.entries(input.preferences)
    .filter(([, value]) => value)
    .map(([key]) => key.replace(/([A-Z])/g, " $1").toLowerCase())
    .join(", ")

  const prompt = `Generate a detailed recipe for "${input.recipeName}" using these ingredients: ${input.ingredients.join(", ")}.
${preferencesText ? `The recipe must be: ${preferencesText}.` : ""}
Assume common kitchen items like salt, pepper, oil, butter, garlic, onions, etc. are available.

Return the recipe as a JSON object with this exact structure:
{
  "title": "Recipe Name",
  "description": "Brief description",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed step description",
      "tools": ["tool 1", "tool 2"],
      "duration": 10
    }
  ],
  "nutrition": {
    "calories_per_serving": 350,
    "protein_g": 25,
    "carbs_g": 45,
    "fat_g": 12,
    "fiber_g": 5,
    "servings": 4
  }
}

Make sure:
- Each step has a clear title and detailed description
- Include tools/utensils needed for each step
- Include estimated time in minutes for each step
- Steps are logical and easy to follow
- The recipe is practical and uses the provided ingredients
- Nutrition estimates are realistic for the recipe servings provided`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found in response")

    const recipe = JSON.parse(jsonMatch[0]) as Recipe
    return recipe
  } catch (error) {
    throw new Error("Failed to parse generated recipe")
  }
}
