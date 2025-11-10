"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

interface GenerateSuggestionsInput {
  ingredients: string[]
  preferences: {
    vegetarian: boolean
    vegan: boolean
    glutenFree: boolean
    dairyFree: boolean
    nutFree: boolean
  }
}

export async function generateRecipeSuggestions(input: GenerateSuggestionsInput): Promise<string[]> {
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

  const prompt = `Based on these ingredients: ${input.ingredients.join(", ")}.
${preferencesText ? `The recipes must be: ${preferencesText}.` : ""}

Suggest exactly 3 different dish names that can be made with these ingredients. Assume common kitchen items like salt, pepper, oil, butter, garlic, onions, etc. are available.

Return ONLY a JSON array of 3 dish names, nothing else:
["Dish Name 1", "Dish Name 2", "Dish Name 3"]`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error("No JSON array found in response")

    const suggestions = JSON.parse(jsonMatch[0]) as string[]
    return suggestions.slice(0, 3)
  } catch (error) {
    throw new Error("Failed to parse recipe suggestions")
  }
}
