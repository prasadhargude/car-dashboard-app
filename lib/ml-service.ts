/**
 * ML Service for gesture detection and voice wake word detection
 * Communicates with Python backend through Next.js API routes
 */

export async function detectGesture(imageBlob: Blob): Promise<GestureDetectionResult> {
  try {
    const formData = new FormData()
    formData.append("file", imageBlob, "frame.jpg")

    const response = await fetch("/api/ml/gesture", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Gesture detection failed")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] Gesture detection error:", error)
    return {
      gesture_detected: "none",
      confidence: 0,
      action: "none",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function detectWakeWord(audioBase64: string): Promise<WakeWordDetectionResult> {
  try {
    const response = await fetch("/api/ml/voice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio: audioBase64 }),
    })

    if (!response.ok) {
      throw new Error("Wake word detection failed")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] Wake word detection error:", error)
    return {
      wake_word_detected: false,
      confidence: 0,
      command: "none",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function checkMLBackendHealth(): Promise<MLHealthStatus> {
  try {
    const response = await fetch("/api/ml/gesture")

    if (!response.ok) {
      return {
        status: "unavailable",
        models: { gesture: false, voice: false },
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    return {
      status: "unavailable",
      models: { gesture: false, voice: false },
    }
  }
}

// Type definitions
export interface GestureDetectionResult {
  gesture_detected: "peace_sign" | "thumbs_up" | "none"
  confidence: number
  action: "capture" | "none"
  error?: string
}

export interface WakeWordDetectionResult {
  wake_word_detected: boolean
  confidence: number
  command: "capture_inside" | "capture_outside" | "none"
  error?: string
}

export interface MLHealthStatus {
  status: "healthy" | "unavailable"
  models: {
    gesture: boolean
    voice: boolean
  }
}
