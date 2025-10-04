# Tata Moments Python Backend

This is the Python backend service for running PyTorch model inference for gesture detection and voice wake word detection.

## Setup

1. **Install Python dependencies:**

\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. **Add your PyTorch models:**

Place your `.pt` model files in the `models/` directory:
- `models/gesture-detection.pt` - Gesture recognition model
- `models/voice-wake-word.pt` - Voice wake word detection model

3. **Run the server:**

\`\`\`bash
python server.py
\`\`\`

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check
\`\`\`bash
GET http://localhost:8000/health
\`\`\`

Returns the status of loaded models.

### Gesture Detection
\`\`\`bash
POST http://localhost:8000/api/detect-gesture
Content-Type: multipart/form-data

file: <image file>
\`\`\`

Returns detected gesture and confidence score.

### Voice Wake Word Detection
\`\`\`bash
POST http://localhost:8000/api/detect-wake-word
Content-Type: application/json

{
  "audio": "<base64 encoded audio>"
}
\`\`\`

Returns whether wake word was detected and the command.

## Testing

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## Model Integration

The current implementation includes placeholder code. To integrate your models:

1. Update the preprocessing pipeline in each endpoint
2. Replace placeholder inference code with actual model calls
3. Adjust confidence thresholds as needed
4. Test with sample images/audio

See `MODELS_INTEGRATION.md` in the root directory for detailed instructions.
