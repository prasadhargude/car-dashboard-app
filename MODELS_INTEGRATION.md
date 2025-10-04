# PyTorch Models Integration Guide

This guide explains how to integrate your custom PyTorch models (.pt files) for voice wake word detection and gesture recognition.

## Overview

The app currently uses browser-based APIs for voice and gesture detection:
- **Voice Commands**: Web Speech API (browser-based)
- **Gesture Detection**: Not yet implemented (placeholder for your PyTorch model)

To use your custom PyTorch models, you'll need to set up a Python backend service.

## Architecture

\`\`\`
Frontend (React) → API Routes (Next.js) → Python Backend (FastAPI) → PyTorch Models
\`\`\`

## Step 1: Prepare Your Models

Place your PyTorch model files in the `models/` directory:

\`\`\`
models/
├── voice-wake-word.pt      # Voice wake word detection model
└── gesture-detection.pt    # Gesture recognition model
\`\`\`

## Step 2: Set Up Python Backend

### Install Dependencies

Create a `requirements.txt` file:

\`\`\`txt
fastapi==0.104.1
uvicorn==0.24.0
torch==2.1.0
torchvision==0.16.0
opencv-python==4.8.1
numpy==1.24.3
pillow==10.1.0
python-multipart==0.0.6
\`\`\`

Install dependencies:

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Create FastAPI Server

Create `python-backend/server.py`:

\`\`\`python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import numpy as np
from PIL import Image
import io
import base64

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
try:
    gesture_model = torch.load("../models/gesture-detection.pt")
    gesture_model.eval()
    print("✅ Gesture detection model loaded")
except Exception as e:
    print(f"⚠️ Failed to load gesture model: {e}")
    gesture_model = None

try:
    voice_model = torch.load("../models/voice-wake-word.pt")
    voice_model.eval()
    print("✅ Voice wake word model loaded")
except Exception as e:
    print(f"⚠️ Failed to load voice model: {e}")
    voice_model = None

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models": {
            "gesture": gesture_model is not None,
            "voice": voice_model is not None
        }
    }

@app.post("/api/detect-gesture")
async def detect_gesture(file: UploadFile = File(...)):
    """
    Detect gestures from an uploaded image
    Expected gestures: peace sign (✌️), thumbs up (👍)
    """
    if gesture_model is None:
        raise HTTPException(status_code=503, detail="Gesture model not loaded")
    
    try:
        # Read and preprocess image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # TODO: Add your preprocessing pipeline here
        # Example: resize, normalize, convert to tensor
        # image_tensor = preprocess(image)
        
        # Run inference
        with torch.no_grad():
            # output = gesture_model(image_tensor)
            # gesture = decode_gesture(output)
            pass
        
        # Placeholder response
        return {
            "gesture_detected": "peace_sign",  # or "thumbs_up", "none"
            "confidence": 0.95,
            "action": "capture"  # Action to trigger in the app
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/detect-wake-word")
async def detect_wake_word(audio_data: dict):
    """
    Detect wake word from audio data
    Expected wake word: "Hey Tata"
    """
    if voice_model is None:
        raise HTTPException(status_code=503, detail="Voice model not loaded")
    
    try:
        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_data["audio"])
        
        # TODO: Add your audio preprocessing pipeline here
        # Example: convert to spectrogram, normalize
        # audio_tensor = preprocess_audio(audio_bytes)
        
        # Run inference
        with torch.no_grad():
            # output = voice_model(audio_tensor)
            # wake_word_detected = output > threshold
            pass
        
        # Placeholder response
        return {
            "wake_word_detected": True,
            "confidence": 0.92,
            "command": "capture_inside"  # or "capture_outside"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
\`\`\`

### Run the Python Backend

\`\`\`bash
cd python-backend
python server.py
\`\`\`

The server will run on `http://localhost:8000`

## Step 3: Create Next.js API Routes

These routes act as a proxy between your frontend and Python backend.

### Gesture Detection Route

File: `app/api/ml/gesture/route.ts`

\`\`\`typescript
import { NextRequest, NextResponse } from "next/server"

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
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
      { error: "Failed to detect gesture" },
      { status: 500 }
    )
  }
}
\`\`\`

### Voice Wake Word Route

File: `app/api/ml/voice/route.ts`

\`\`\`typescript
import { NextRequest, NextResponse } from "next/server"

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/detect-wake-word`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Wake word detection failed")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Wake word detection error:", error)
    return NextResponse.json(
      { error: "Failed to detect wake word" },
      { status: 500 }
    )
  }
}
\`\`\`

## Step 4: Update Frontend Components

### Gesture Detection in CameraFeed

Add gesture detection to `src/components/CameraFeed.jsx`:

\`\`\`javascript
// Add this function to CameraFeed component
const detectGesture = async () => {
  const canvas = canvasRef.current
  const video = videoRef.current
  if (!canvas || !video) return

  const ctx = canvas.getContext("2d")
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Convert canvas to blob
  canvas.toBlob(async (blob) => {
    const formData = new FormData()
    formData.append("file", blob, "frame.jpg")

    try {
      const response = await fetch("/api/ml/gesture", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      
      if (data.gesture_detected === "peace_sign" || data.gesture_detected === "thumbs_up") {
        captureFrame()
      }
    } catch (error) {
      console.error("[v0] Gesture detection error:", error)
    }
  }, "image/jpeg")
}

// Run gesture detection every 500ms when camera is active
useEffect(() => {
  if (!permissionGranted) return

  const interval = setInterval(() => {
    detectGesture()
  }, 500)

  return () => clearInterval(interval)
}, [permissionGranted])
\`\`\`

### Voice Wake Word in VoiceAssistant

Update `src/components/VoiceAssistant.jsx` to use your custom model:

\`\`\`javascript
// Replace the Web Speech API with custom model inference
const startAudioCapture = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mediaRecorder = new MediaRecorder(stream)
  
  mediaRecorder.ondataavailable = async (event) => {
    const audioBlob = event.data
    const reader = new FileReader()
    
    reader.onloadend = async () => {
      const base64Audio = reader.result.split(',')[1]
      
      try {
        const response = await fetch("/api/ml/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio: base64Audio }),
        })

        const data = await response.json()
        
        if (data.wake_word_detected) {
          if (data.command === "capture_inside") {
            onVoiceCommand("inside")
          } else if (data.command === "capture_outside") {
            onVoiceCommand("outside")
          }
        }
      } catch (error) {
        console.error("[v0] Wake word detection error:", error)
      }
    }
    
    reader.readAsDataURL(audioBlob)
  }
  
  // Record in chunks
  mediaRecorder.start(1000) // Record 1 second chunks
}
\`\`\`

## Step 5: Environment Variables

Add to your `.env` file:

\`\`\`env
PYTHON_BACKEND_URL=http://localhost:8000
\`\`\`

## Step 6: Testing

1. Start the Python backend:
   \`\`\`bash
   cd python-backend
   python server.py
   \`\`\`

2. Start the Next.js app:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Test the endpoints:
   \`\`\`bash
   # Health check
   curl http://localhost:8000/health
   
   # Test gesture detection
   curl -X POST -F "file=@test-image.jpg" http://localhost:8000/api/detect-gesture
   \`\`\`

## Model Requirements

### Voice Wake Word Model
- **Input**: Audio waveform or spectrogram
- **Output**: Binary classification (wake word detected or not)
- **Expected wake phrase**: "Hey Tata"

### Gesture Detection Model
- **Input**: RGB image (from camera feed)
- **Output**: Gesture class (peace_sign, thumbs_up, none)
- **Expected gestures**: ✌️ (peace sign), 👍 (thumbs up)

## Troubleshooting

### Model Loading Errors
- Ensure your `.pt` files are compatible with your PyTorch version
- Check that model files are in the correct directory
- Verify model architecture matches the saved checkpoint

### CORS Issues
- Ensure the Python backend has CORS enabled for your frontend URL
- Check that the `PYTHON_BACKEND_URL` environment variable is correct

### Performance Issues
- Consider using GPU acceleration: `torch.cuda.is_available()`
- Reduce inference frequency (e.g., every 1 second instead of 500ms)
- Use model quantization for faster inference

## Alternative: Browser-Based Inference

If you prefer to run models in the browser (without Python backend):

1. Convert PyTorch models to ONNX format
2. Use ONNX Runtime Web for browser-based inference
3. Load models directly in React components

See: https://onnxruntime.ai/docs/tutorials/web/

## Next Steps

1. Replace placeholder inference code with your actual model logic
2. Add preprocessing pipelines specific to your models
3. Tune confidence thresholds for better accuracy
4. Add error handling and fallback mechanisms
5. Consider deploying the Python backend to a cloud service (AWS Lambda, Google Cloud Run, etc.)
