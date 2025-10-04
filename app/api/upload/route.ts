import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { MongoClient } from "mongodb"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// MongoDB connection
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData, category, caption, location } = body

    // Validate required fields
    if (!imageData || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const uploadResult = await cloudinary.uploader.upload(imageData, {
      folder: `tata-moments/${category}`,
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    })

    // Save metadata to MongoDB
    const client = await connectToDatabase()
    const db = client.db("tata-moments")
    const collection = db.collection("moments")

    const momentDocument = {
      category,
      caption,
      location: location || null,
      imageUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      timestamp: new Date(),
      posted: false,
      postedPlatforms: [],
      metadata: {
        uploadedAt: new Date(),
        fileSize: uploadResult.bytes,
        contentType: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
      },
    }

    const result = await collection.insertOne(momentDocument)

    return NextResponse.json({
      success: true,
      momentId: result.insertedId,
      imageUrl: uploadResult.secure_url,
      message: "Moment uploaded successfully",
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to upload moment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
