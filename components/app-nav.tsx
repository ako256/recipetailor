"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export function AppNav({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/app/discover" className="text-xl font-bold">
            Recipe Tailor
          </Link>
          <div className="flex gap-4">
            <Link href="/app/create" className="text-sm font-medium hover:text-primary">
              Create
            </Link>
            <Link href="/app/discover" className="text-sm font-medium hover:text-primary">
              Discover
            </Link>
            <Link href="/app/my-recipes" className="text-sm font-medium hover:text-primary">
              My Recipes
            </Link>
            <Link href="/app/meal-planner" className="text-sm font-medium hover:text-primary">
              Meal Planner
            </Link>
            <Link href="/app/shopping-lists" className="text-sm font-medium hover:text-primary">
              Shopping List
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/app/profile" className="text-sm font-medium hover:text-primary">
            Profile
          </Link>
          <Link href="/app/settings" className="text-sm font-medium hover:text-primary">
            Settings
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
