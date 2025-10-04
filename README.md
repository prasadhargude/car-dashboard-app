# Tata Moments Dashboard

A futuristic car dashboard app for capturing and managing moments with voice commands, gesture detection, and cloud storage.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/prasad1252070022-9305s-projects/v0-car-dashboard-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/fgAB2Jk44Ao)

## Features

- **Camera Capture**: Inside and outside car views with live camera feed
- **Voice Commands**: "Hey Tata, take a selfie" or "Hey Tata, capture outside"
- **Gesture Detection**: Peace sign (✌️) and thumbs up (👍) to capture moments (requires ML backend)
- **Cloud Storage**: Images stored on Cloudinary with automatic optimization
- **MongoDB Integration**: Metadata storage for all captured moments
- **Social Sharing**: Preview and share moments to social platforms
- **Moments Gallery**: View all captured moments with filtering options

## Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

### 2. Environment Variables

The following environment variables are already configured in your v0 project settings:

- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `MONGO_URI` - Your MongoDB connection string

If running locally, create a `.env` file:

\`\`\`env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tata-moments
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

### 3. Run the App

\`\`\`bash
npm run dev
\`\`\`

The app will start at **http://localhost:5173**

### 4. Build for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## ML Models Integration (Optional)

The app supports custom PyTorch models for gesture detection and voice wake word detection. These features are optional and the app will work without them.

### Setup Python Backend

1. **Navigate to Python backend directory:**

\`\`\`bash
cd python-backend
\`\`\`

2. **Install Python dependencies:**

\`\`\`bash
pip install -r requirements.txt
\`\`\`

3. **Add your PyTorch models:**

Place your `.pt` model files in the `python-backend/models/` directory:
- `gesture_model.pt` - For gesture detection
- `voice_model.pt` - For wake word detection

4. **Update inference code:**

Edit `python-backend/server.py` to load and use your models.

5. **Run the Python backend:**

\`\`\`bash
python server.py
\`\`\`

The Python backend will start at **http://localhost:8000**

6. **Add environment variable:**

\`\`\`env
PYTHON_BACKEND_URL=http://localhost:8000
\`\`\`

### Without ML Backend

The app will automatically detect if the ML backend is unavailable and:
- Use browser's Web Speech API for voice commands
- Disable gesture detection features
- Show appropriate UI indicators

## Project Structure

\`\`\`
tata-moments-dashboard/
├── app/
│   ├── api/
│   │   ├── upload/route.ts       # Cloudinary upload endpoint
│   │   ├── moments/route.ts      # MongoDB moments endpoint
│   │   └── ml/                   # ML model endpoints
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── src/
│   └── components/
│       ├── Dashboard.jsx         # Main dashboard component
│       ├── CameraFeed.jsx        # Camera with gesture detection
│       ├── VoiceAssistant.jsx    # Voice command handler
│       ├── MomentsFeed.jsx       # Gallery of captured moments
│       ├── PreviewModal.jsx      # Preview before saving
│       ├── SocialConnections.jsx # Social media integration
│       └── Settings.jsx          # App settings
├── lib/
│   ├── upload-service.ts         # Cloudinary & MongoDB service
│   └── ml-service.ts             # ML model service
├── python-backend/               # Optional ML backend
│   ├── server.py                 # FastAPI server
│   ├── requirements.txt
│   └── models/                   # Place .pt files here
└── package.json
\`\`\`

## Usage

### Capturing Moments

**Manual Capture:**
- Click the camera button at the bottom

**Voice Commands:**
- Say "Hey Tata, take a selfie" for inside view
- Say "Hey Tata, capture outside" for outside view

**Gesture Detection (requires ML backend):**
- Make a peace sign (✌️) or thumbs up (👍) gesture
- The camera will automatically capture

### Viewing Moments

1. Click the "Moments" tab in the sidebar
2. Browse your captured moments
3. Click any moment to view details
4. Download or share to social media

### Settings

- Toggle voice commands on/off
- Adjust camera quality
- Configure social media connections

## Technologies

- **Frontend**: React, Next.js, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, MongoDB, Cloudinary
- **ML (Optional)**: PyTorch, FastAPI, OpenCV
- **UI Components**: Radix UI, Lucide Icons

## Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [MODELS_INTEGRATION.md](./MODELS_INTEGRATION.md) - ML models integration guide
- [python-backend/README.md](./python-backend/README.md) - Python backend setup

## Deployment

Your project is live at:

**[https://vercel.com/prasad1252070022-9305s-projects/v0-car-dashboard-app](https://vercel.com/prasad1252070022-9305s-projects/v0-car-dashboard-app)**

Continue building on:

**[https://v0.app/chat/projects/fgAB2Jk44Ao](https://v0.app/chat/projects/fgAB2Jk44Ao)**

## Troubleshooting

### Camera not working
- Check browser permissions (look for camera icon in address bar)
- Ensure no other app is using the camera
- Try refreshing the page

### Upload failing
- Verify Cloudinary credentials in environment variables
- Check MongoDB connection string
- Look at browser console for error details

### Voice commands not working
- Allow microphone permissions in browser
- Speak clearly and wait for the listening indicator
- Check if Web Speech API is supported in your browser

### Gesture detection not working
- Ensure Python backend is running
- Check `PYTHON_BACKEND_URL` environment variable
- Verify your PyTorch models are in the correct directory

## License

Built with [v0.app](https://v0.app)
