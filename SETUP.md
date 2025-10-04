# Tata Moments Dashboard - Setup Guide

## Quick Start

This app requires three main components:
1. **MongoDB** - For storing moment metadata
2. **Cloudinary** - For storing and optimizing images
3. **Python Backend** (Optional) - For custom PyTorch model inference

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- Cloudinary account (free tier available)
- Python 3.8+ (only if using custom PyTorch models)

---

## Part 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Cluster

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Click **"Build a Database"**
4. Select **M0 Free** tier
5. Choose a cloud provider and region (closest to you)
6. Click **"Create Cluster"**

### Step 2: Configure Database Access

1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username and password (save these!)
5. Set user privileges to **"Read and write to any database"**
6. Click **"Add User"**

### Step 3: Configure Network Access

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database password
6. Add `/tata-moments` at the end

Example:
\`\`\`
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/tata-moments
\`\`\`

---

## Part 2: Cloudinary Setup

### Step 1: Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click **"Sign Up for Free"**
3. Fill in your details and create account
4. Verify your email address

### Step 2: Get Your Credentials

1. After logging in, you'll see your **Dashboard**
2. Find your **Account Details** section with:
   - **Cloud Name** (e.g., `dxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click "Reveal" to see it)
3. **Save these credentials** - you'll need them for the `.env` file

### Step 3: Configure Upload Settings (Optional)

1. Go to **Settings** → **Upload**
2. Under **Upload presets**, you can create custom presets
3. For this app, the default settings work fine

**Why Cloudinary?**
- ✅ Free tier includes 25GB storage and 25GB bandwidth
- ✅ Automatic image optimization and format conversion
- ✅ Built-in CDN for fast image delivery
- ✅ No complex bucket policies or IAM configuration needed
- ✅ Automatic responsive image transformations

---

## Part 3: Environment Variables

Create a `.env` file in the root directory:

\`\`\`env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tata-moments

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Python Backend (Optional - only if using custom PyTorch models)
PYTHON_BACKEND_URL=http://localhost:8000
\`\`\`

Replace the placeholder values with your actual credentials from the dashboards.

---

## Part 4: Install and Run

### Install Dependencies

\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

### Run the App

\`\`\`bash
npm run dev
\`\`\`

The app will be available at `http://localhost:5173`

---

## Part 5: PyTorch Models Integration (Optional)

If you have custom PyTorch models for voice wake word detection and gesture recognition:

### Step 1: Set Up Python Backend

\`\`\`bash
cd python-backend
pip install -r requirements.txt
\`\`\`

### Step 2: Add Your Models

Place your `.pt` model files in the `models/` directory:
- `models/gesture-detection.pt`
- `models/voice-wake-word.pt`

### Step 3: Run Python Backend

\`\`\`bash
cd python-backend
python server.py
\`\`\`

The Python backend will run on `http://localhost:8000`

### Step 4: Update Model Inference Code

See `MODELS_INTEGRATION.md` for detailed instructions on integrating your models.

---

## Troubleshooting

### MongoDB Connection Failed
- ✅ Check your connection string format
- ✅ Verify username and password are correct
- ✅ Ensure IP address is whitelisted in Network Access
- ✅ Make sure `/tata-moments` is at the end of the connection string

### Cloudinary Upload Failed
- ✅ Verify cloud name, API key, and API secret are correct
- ✅ Check that credentials are properly set in `.env` file
- ✅ Ensure you haven't exceeded free tier limits (25GB/month)
- ✅ Check browser console for detailed error messages

### Camera Not Working
- ✅ Grant camera permissions in your browser
- ✅ Check browser console for errors
- ✅ Try a different browser (Chrome/Edge recommended)
- ✅ Ensure no other app is using the camera

### Python Backend Not Connecting
- ✅ Ensure Python backend is running on port 8000
- ✅ Check `PYTHON_BACKEND_URL` in `.env` file
- ✅ Verify CORS is enabled in Python backend
- ✅ Check Python backend logs for errors

---

## Testing the Setup

### Test MongoDB Connection
\`\`\`bash
# The app will log connection status on startup
# Look for: "✅ Connected to MongoDB"
\`\`\`

### Test Cloudinary Upload
1. Open the app
2. Go to Camera tab
3. Capture a photo
4. Click "Save"
5. Go to your Cloudinary dashboard → Media Library
6. You should see the uploaded image in `tata-moments/` folder

### Test Python Backend (if using)
\`\`\`bash
curl http://localhost:8000/health
\`\`\`

Should return:
\`\`\`json
{
  "status": "healthy",
  "models": {
    "gesture": { "loaded": true },
    "voice": { "loaded": true }
  }
}
\`\`\`

---

## Next Steps

1. ✅ Verify all environment variables are set correctly
2. ✅ Test camera capture and save functionality
3. ✅ Check that images appear in your Cloudinary Media Library
4. ✅ Verify moments are saved to MongoDB
5. ✅ (Optional) Integrate your PyTorch models

## Support

If you encounter issues:
1. Check the browser console for errors (F12)
2. Check the terminal logs for backend errors
3. Verify all environment variables are set correctly
4. Ensure all services (MongoDB, Cloudinary, Python backend) are accessible

## Security Notes

⚠️ **Important for Production:**
- Never commit `.env` file to version control
- Use environment-specific credentials
- Rotate API keys regularly
- Enable MongoDB IP whitelisting for production
- Use HTTPS for all API endpoints
- Consider using Cloudinary's signed uploads for production
