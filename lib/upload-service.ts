export async function uploadMoment(imageData: string, category: string, caption: string, location?: string) {
  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageData,
        category,
        caption,
        location,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || "Upload failed")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] Upload service error:", error)
    throw error
  }
}

export async function fetchMoments(category?: string, limit = 50) {
  try {
    const params = new URLSearchParams()
    if (category) params.append("category", category)
    params.append("limit", limit.toString())

    const response = await fetch(`/api/moments?${params.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || "Fetch failed")
    }

    const data = await response.json()
    return data.moments
  } catch (error) {
    console.error("[v0] Fetch service error:", error)
    throw error
  }
}
