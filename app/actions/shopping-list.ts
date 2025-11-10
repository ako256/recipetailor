"use server"

import { createClient } from "@/lib/supabase/server"

export async function createShoppingList(recipeId: string, recipeTitle: string, ingredients: string[]) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    // Create shopping list
    const { data: listData, error: listError } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: user.id,
        recipe_id: recipeId,
        recipe_title: recipeTitle,
      })
      .select()
      .single()

    if (listError) throw listError

    // Create shopping list items
    const items = ingredients.map((ingredient) => ({
      shopping_list_id: listData.id,
      item_name: ingredient,
      is_checked: false,
    }))

    const { error: itemsError } = await supabase.from("shopping_list_items").insert(items)

    if (itemsError) throw itemsError

    return listData.id
  } catch (err) {
    console.error("Error creating shopping list:", err)
    throw err
  }
}

export async function getShoppingList(recipeId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("shopping_lists")
      .select(
        `
        id,
        recipe_title,
        created_at,
        shopping_list_items (
          id,
          item_name,
          is_checked
        )
      `,
      )
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) throw error

    // Return the first item if it exists, otherwise return null
    return data && data.length > 0 ? data[0] : null
  } catch (err) {
    console.error("Error fetching shopping list:", err)
    return null
  }
}

export async function getAllShoppingLists() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("shopping_lists")
      .select(
        `
        id,
        recipe_title,
        created_at,
        shopping_list_items (
          id,
          item_name,
          is_checked
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (err) {
    console.error("Error fetching shopping lists:", err)
    return []
  }
}

export async function deleteShoppingList(shoppingListId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase.from("shopping_lists").delete().eq("id", shoppingListId).eq("user_id", user.id)

    if (error) throw error
  } catch (err) {
    console.error("Error deleting shopping list:", err)
    throw err
  }
}

export async function toggleShoppingListItem(itemId: string, isChecked: boolean) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("shopping_list_items").update({ is_checked: !isChecked }).eq("id", itemId)

    if (error) throw error
  } catch (err) {
    console.error("Error toggling shopping list item:", err)
    throw err
  }
}
