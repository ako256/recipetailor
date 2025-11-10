"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface UserPreferences {
  vegetarian: boolean
  vegan: boolean
  gluten_free: boolean
  dairy_free: boolean
  nut_free: boolean
  daily_calorie_goal: number | null
  allergies: string[] | null
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    vegetarian: false,
    vegan: false,
    gluten_free: false,
    dairy_free: false,
    nut_free: false,
    daily_calorie_goal: null,
    allergies: null,
  })
  const [allergiesText, setAllergiesText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error && error.code !== "PGRST116") throw error

      if (data) {
        setPreferences({
          vegetarian: data.vegetarian || false,
          vegan: data.vegan || false,
          gluten_free: data.gluten_free || false,
          dairy_free: data.dairy_free || false,
          nut_free: data.nut_free || false,
          daily_calorie_goal: data.daily_calorie_goal || null,
          allergies: data.allergies || null,
        })
        setAllergiesText((data.allergies || []).join(", "))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preferences")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const allergiesArray = allergiesText
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0)

      const { error } = await supabase
        .from("profiles")
        .update({
          vegetarian: preferences.vegetarian,
          vegan: preferences.vegan,
          gluten_free: preferences.gluten_free,
          dairy_free: preferences.dairy_free,
          nut_free: preferences.nut_free,
          daily_calorie_goal: preferences.daily_calorie_goal,
          allergies: allergiesArray.length > 0 ? allergiesArray : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreferenceChange = (
    key: keyof Omit<UserPreferences, "daily_calorie_goal" | "allergies">,
    value: boolean,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your dietary preferences and goals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dietary Preferences</CardTitle>
            <CardDescription>
              Set your global dietary preferences. These will be applied by default when creating new recipes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}
            {success && (
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600">Preferences saved successfully!</div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="vegetarian"
                  checked={preferences.vegetarian}
                  onCheckedChange={(checked) => handlePreferenceChange("vegetarian", checked as boolean)}
                />
                <Label htmlFor="vegetarian" className="font-normal cursor-pointer">
                  <div className="font-semibold">Vegetarian</div>
                  <div className="text-sm text-muted-foreground">No meat, poultry, or fish</div>
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="vegan"
                  checked={preferences.vegan}
                  onCheckedChange={(checked) => handlePreferenceChange("vegan", checked as boolean)}
                />
                <Label htmlFor="vegan" className="font-normal cursor-pointer">
                  <div className="font-semibold">Vegan</div>
                  <div className="text-sm text-muted-foreground">No animal products at all</div>
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="gluten-free"
                  checked={preferences.gluten_free}
                  onCheckedChange={(checked) => handlePreferenceChange("gluten_free", checked as boolean)}
                />
                <Label htmlFor="gluten-free" className="font-normal cursor-pointer">
                  <div className="font-semibold">Gluten Free</div>
                  <div className="text-sm text-muted-foreground">No gluten-containing ingredients</div>
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="dairy-free"
                  checked={preferences.dairy_free}
                  onCheckedChange={(checked) => handlePreferenceChange("dairy_free", checked as boolean)}
                />
                <Label htmlFor="dairy-free" className="font-normal cursor-pointer">
                  <div className="font-semibold">Dairy Free</div>
                  <div className="text-sm text-muted-foreground">No milk, cheese, or dairy products</div>
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="nut-free"
                  checked={preferences.nut_free}
                  onCheckedChange={(checked) => handlePreferenceChange("nut_free", checked as boolean)}
                />
                <Label htmlFor="nut-free" className="font-normal cursor-pointer">
                  <div className="font-semibold">Nut Free</div>
                  <div className="text-sm text-muted-foreground">No tree nuts or peanuts</div>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allergies & Intolerances</CardTitle>
            <CardDescription>List any allergies or intolerances (comma-separated)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Shellfish, Sesame, Peanuts"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              className="min-h-20"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Goals</CardTitle>
            <CardDescription>Set your daily calorie target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="calorie-goal">Daily Calorie Goal</Label>
              <div className="flex gap-2">
                <Input
                  id="calorie-goal"
                  type="number"
                  placeholder="e.g., 2000"
                  value={preferences.daily_calorie_goal || ""}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      daily_calorie_goal: e.target.value ? Number.parseInt(e.target.value) : null,
                    })
                  }
                  className="flex-1"
                />
                <span className="text-muted-foreground pt-2">calories/day</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSavePreferences} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}
