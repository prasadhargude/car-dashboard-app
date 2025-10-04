import { type NextRequest, NextResponse } from "next/server"

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Forward request to Python backend
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/detect-gesture`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Gesture detection failed")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Gesture detection error:", error)
    return NextResponse.json(
      {
        error: "Failed to detect gesture",
        details: error instanceof Error ? error.message : "Unknown error",
        fallback: true,
      },
      { status: 500 },
    )
  }
}

// Health check endpoint
export async function GET() {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/health`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unavailable",
        error: "Python backend not reachable",
      },
      { status: 503 },
    )
  }
}
