import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  const client = new MongoClient(process.env.MONGO_URI || "")
  await client.connect()
  cachedClient = client
  return client
}

// GET all moments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const client = await connectToDatabase()
    const db = client.db("tata-moments")
    const collection = db.collection("moments")

    const query = category ? { category } : {}
    const moments = await collection.find(query).sort({ timestamp: -1 }).limit(limit).toArray()

    return NextResponse.json({
      success: true,
      moments,
      count: moments.length,
    })
  } catch (error) {
    console.error("[v0] Fetch moments error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch moments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE a moment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const momentId = searchParams.get("id")

    if (!momentId) {
      return NextResponse.json({ error: "Moment ID required" }, { status: 400 })
    }

    const client = await connectToDatabase()
    const db = client.db("tata-moments")
    const collection = db.collection("moments")

    const result = await collection.deleteOne({ _id: momentId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Moment not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Moment deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Delete moment error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete moment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
