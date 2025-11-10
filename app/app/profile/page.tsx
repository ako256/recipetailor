"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Alert } from "@/components/ui/alert"

interface UserProfile {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  email: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatarUrl: "",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio")
        .eq("id", user.id)
        .single()

      if (error && error.code !== "PGRST116") throw error

      const profileData: UserProfile = {
        id: user.id,
        username: data?.username || null,
        avatar_url: data?.avatar_url || null,
        bio: data?.bio || null,
        email: user.email || null,
      }

      setProfile(profileData)
      setFormData({
        username: profileData.username || "",
        bio: profileData.bio || "",
        avatarUrl: profileData.avatar_url || "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username || null,
          avatar_url: formData.avatarUrl || null,
          bio: formData.bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setProfile({
        ...profile!,
        username: formData.username || null,
        avatar_url: formData.avatarUrl || null,
        bio: formData.bio || null,
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load profile</p>
        </div>
      </div>
    )
  }

  const getInitials = (username: string | null, email: string | null) => {
    if (username) {
      return username.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your public profile and account information</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && <Alert className="bg-red-50 text-red-600 border-red-200">{error}</Alert>}
            {success && (
              <Alert className="bg-green-50 text-green-600 border-green-200">Profile updated successfully!</Alert>
            )}

            {/* Avatar Section */}
            <div className="flex flex-col gap-4">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.avatarUrl || undefined} alt={formData.username || "User"} />
                  <AvatarFallback>{getInitials(formData.username, profile.email)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="avatar-url" className="text-sm">
                    Avatar URL
                  </Label>
                  <Input
                    id="avatar-url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Email Display */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address
              </Label>
              <Input id="email" type="email" value={profile.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Your email cannot be changed from this page</p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Your unique username for the community</p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-semibold">
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground">Maximum 500 characters</p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  )
}
