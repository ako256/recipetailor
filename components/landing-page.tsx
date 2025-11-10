"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Recipe Tailor</span>
          </div>
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
              Recipes Tailored to <span className="text-primary">Your Taste</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-xl mx-auto">
              Discover personalized recipes based on your preferences, dietary needs, and available ingredients. Let AI
              create the perfect meal for you.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8">
            <div className="p-4 rounded-lg bg-card border border-border/40 hover:border-primary/50 transition-colors">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-foreground mb-1">Personalized</h3>
              <p className="text-sm text-muted-foreground">Recipes matched to your preferences</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border/40 hover:border-primary/50 transition-colors">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-foreground mb-1">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Smart recommendations in seconds</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border/40 hover:border-primary/50 transition-colors">
              <div className="text-2xl mb-2">🍽️</div>
              <h3 className="font-semibold text-foreground mb-1">Diverse</h3>
              <p className="text-sm text-muted-foreground">Endless recipe possibilities</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/sign-up" className="flex-1 sm:flex-none">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login" className="flex-1 sm:flex-none">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Recipe Tailor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
