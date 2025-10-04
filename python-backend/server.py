from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import numpy as np
from PIL import Image
import io
import base64
import os

app = FastAPI(title="Tata Moments ML Backend")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model paths
GESTURE_MODEL_PATH = "../models/gesture-detection.pt"
VOICE_MODEL_PATH = "../models/voice-wake-word.pt"

# Load models
gesture_model = None
voice_model = None

try:
    if os.path.exists(GESTURE_MODEL_PATH):
        gesture_model = torch.load(GESTURE_MODEL_PATH, map_location=torch.device('cpu'))
        gesture_model.eval()
        print("✅ Gesture detection model loaded successfully")
    else:
        print(f"⚠️ Gesture model not found at {GESTURE_MODEL_PATH}")
except Exception as e:
    print(f"❌ Failed to load gesture model: {e}")

try:
    if os.path.exists(VOICE_MODEL_PATH):
        voice_model = torch.load(VOICE_MODEL_PATH, map_location=torch.device('cpu'))
        voice_model.eval()
        print("✅ Voice wake word model loaded successfully")
    else:
        print(f"⚠️ Voice model not found at {VOICE_MODEL_PATH}")
except Exception as e:
    print(f"❌ Failed to load voice model: {e}")

@app.get("/")
async def root():
    return {
        "service": "Tata Moments ML Backend",
        "status": "running",
        "endpoints": ["/health", "/api/detect-gesture", "/api/detect-wake-word"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models": {
            "gesture": {
                "loaded": gesture_model is not None,
                "path": GESTURE_MODEL_PATH,
                "exists": os.path.exists(GESTURE_MODEL_PATH)
            },
            "voice": {
                "loaded": voice_model is not None,
                "path": VOICE_MODEL_PATH,
                "exists": os.path.exists(VOICE_MODEL_PATH)
            }
        }
    }

@app.post("/api/detect-gesture")
async def detect_gesture(file: UploadFile = File(...)):
    """
    Detect gestures from an uploaded image
    Expected gestures: peace sign (✌️), thumbs up (👍)
    
    Returns:
        gesture_detected: str - "peace_sign", "thumbs_up", or "none"
        confidence: float - confidence score (0-1)
        action: str - action to trigger ("capture" or "none")
    """
    if gesture_model is None:
        return {
            "gesture_detected": "none",
            "confidence": 0.0,
            "action": "none",
            "error": "Model not loaded. Please add gesture-detection.pt to models/ directory"
        }
    
    try:
        # Read and preprocess image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # TODO: Replace this with your actual model inference
        # Example preprocessing:
        # 1. Resize image to model input size
        # 2. Convert to tensor
        # 3. Normalize
        # 4. Run inference
        
        # image_tensor = preprocess(image)
        # with torch.no_grad():
        #     output = gesture_model(image_tensor)
        #     gesture_class = torch.argmax(output, dim=1).item()
        #     confidence = torch.softmax(output, dim=1).max().item()
        
        # Placeholder response (replace with actual inference)
        return {
            "gesture_detected": "none",  # Change to "peace_sign" or "thumbs_up" based on model output
            "confidence": 0.0,
            "action": "none"  # Change to "capture" when gesture is detected
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gesture detection error: {str(e)}")

@app.post("/api/detect-wake-word")
async def detect_wake_word(audio_data: dict):
    """
    Detect wake word from audio data
    Expected wake word: "Hey Tata"
    
    Input:
        audio_data: dict with "audio" key containing base64 encoded audio
    
    Returns:
        wake_word_detected: bool - whether wake word was detected
        confidence: float - confidence score (0-1)
        command: str - detected command ("capture_inside", "capture_outside", or "none")
    """
    if voice_model is None:
        return {
            "wake_word_detected": False,
            "confidence": 0.0,
            "command": "none",
            "error": "Model not loaded. Please add voice-wake-word.pt to models/ directory"
        }
    
    try:
        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_data["audio"])
        
        # TODO: Replace this with your actual model inference
        # Example preprocessing:
        # 1. Convert audio bytes to waveform
        # 2. Generate spectrogram or MFCC features
        # 3. Convert to tensor
        # 4. Run inference
        
        # audio_tensor = preprocess_audio(audio_bytes)
        # with torch.no_grad():
        #     output = voice_model(audio_tensor)
        #     wake_word_detected = output > threshold
        #     confidence = output.item()
        
        # Placeholder response (replace with actual inference)
        return {
            "wake_word_detected": False,
            "confidence": 0.0,
            "command": "none"  # Change to "capture_inside" or "capture_outside" based on model output
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wake word detection error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting Tata Moments ML Backend...")
    print("📍 Server will run on http://localhost:8000")
    print("📚 API docs available at http://localhost:8000/docs")
    print("\n⚠️  Note: Add your .pt model files to the models/ directory\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
