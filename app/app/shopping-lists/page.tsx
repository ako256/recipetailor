"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { getAllShoppingLists, toggleShoppingListItem, deleteShoppingList } from "@/app/actions/shopping-list"

interface ShoppingListItem {
  id: string
  item_name: string
  is_checked: boolean
}

interface ShoppingList {
  id: string
  recipe_title: string
  created_at: string
  shopping_list_items: ShoppingListItem[]
}

export default function ShoppingListsPage() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadShoppingLists()
  }, [])

  const loadShoppingLists = async () => {
    setIsLoading(true)
    try {
      const lists = await getAllShoppingLists()
      setShoppingLists(lists)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shopping lists")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleItem = async (listId: string, itemId: string, isChecked: boolean) => {
    try {
      await toggleShoppingListItem(itemId, isChecked)
      // Update local state
      setShoppingLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                shopping_list_items: list.shopping_list_items.map((item) =>
                  item.id === itemId ? { ...item, is_checked: !item.is_checked } : item,
                ),
              }
            : list,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item")
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this shopping list?")) return

    try {
      await deleteShoppingList(listId)
      setShoppingLists((prev) => prev.filter((list) => list.id !== listId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete shopping list")
    }
  }

  const toggleExpanded = (listId: string) => {
    setExpandedLists((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(listId)) {
        newSet.delete(listId)
      } else {
        newSet.add(listId)
      }
      return newSet
    })
  }

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Shopping Lists</h1>
          <p className="text-muted-foreground">Manage your shopping lists from recipes</p>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 mb-6">{error}</div>}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading shopping lists...</p>
          </div>
        ) : shoppingLists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              You don't have any shopping lists yet. Create one from a recipe in the Discover or My Recipes section!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shoppingLists.map((list) => {
              const checkedCount = list.shopping_list_items.filter((item) => item.is_checked).length
              const totalCount = list.shopping_list_items.length
              const isExpanded = expandedLists.has(list.id)

              return (
                <Card key={list.id} className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(list.id)}
                            className="p-0 h-auto"
                          >
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </Button>
                          <div>
                            <CardTitle className="text-lg">{list.recipe_title}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {new Date(list.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-blue-700">
                          {checkedCount} of {totalCount} items
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteList(list.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent>
                      <div className="space-y-2">
                        {list.shopping_list_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-blue-100">
                            <Checkbox
                              id={item.id}
                              checked={item.is_checked}
                              onCheckedChange={() => handleToggleItem(list.id, item.id, item.is_checked)}
                            />
                            <label
                              htmlFor={item.id}
                              className={`flex-1 cursor-pointer text-sm ${
                                item.is_checked ? "line-through text-gray-500" : ""
                              }`}
                            >
                              {item.item_name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
