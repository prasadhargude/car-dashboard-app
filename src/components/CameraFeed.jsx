"use client"

import { useRef, useEffect, useState } from "react"
import VoiceAssistant from "./VoiceAssistant"
import { Camera, SwitchCamera, Circle } from "lucide-react"

function CameraFeed({ onCapture, cameraMode, setCameraMode }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraMode])

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraMode === "inside" ? "user" : "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      setStream(mediaStream)
      setPermissionGranted(true)

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 0)
    } catch (error) {
      console.error("Camera permission denied:", error)
      setPermissionGranted(false)
    }
  }

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch((err) => console.error("Video play error:", err))
    }
  }, [stream])

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageUrl = canvas.toDataURL("image/jpeg", 0.9)
    onCapture(imageUrl, cameraMode)
  }

  const handleVoiceCapture = (mode) => {
    setCameraMode(mode)
    setTimeout(() => captureFrame(), 500)
  }

  const toggleCameraMode = () => {
    setCameraMode((prev) => (prev === "inside" ? "outside" : "inside"))
  }

  return (
    <div className="relative h-full flex flex-col bg-background">
      <div className="relative border-b border-primary/30 bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full ${cameraMode === "inside" ? "bg-neon-cyan" : "bg-accent"}`}
              ></div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-mono tracking-wider uppercase">Camera View</span>
                <span className="text-base font-bold tracking-wide text-foreground uppercase">
                  {cameraMode === "inside" ? "Inside Car" : "Outside Car"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleCameraMode}
              className="px-4 py-2 rounded-md bg-muted border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-colors flex items-center gap-2"
              title="Switch camera view"
            >
              <SwitchCamera size={18} className="text-primary" />
              <span className="text-xs font-mono text-foreground">SWITCH</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-black">
        {permissionGranted ? (
          <div className="relative w-full h-full">
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/60"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/60"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/60"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/60"></div>

            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/40">
              <Circle size={8} className="text-red-500 fill-red-500" />
              <span className="text-xs font-mono text-foreground tracking-wider">RECORDING</span>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-6 py-3 rounded-lg border border-primary/40">
              <div className="flex items-center gap-6 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Voice Commands:</span>
                  <div className="flex gap-4">
                    <span className="text-neon-cyan">"Hey Tata, take a selfie"</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-accent">"Hey Tata, capture outside"</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-primary/30"></div>
                <div className="flex gap-3 items-center">
                  <span className="text-muted-foreground">Gestures:</span>
                  <span className="text-lg">✌️</span>
                  <span className="text-lg">👍</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
                <Camera size={40} className="text-primary" />
              </div>
              <p className="text-lg font-bold text-foreground mb-2 tracking-wide uppercase">Camera Access Required</p>
              <p className="text-sm text-muted-foreground mb-6">Enable camera to capture moments</p>
              <button
                onClick={startCamera}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-bold tracking-wider hover:bg-primary/90 transition-colors"
              >
                ENABLE CAMERA
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative border-t border-primary/30 bg-card">
        <div className="px-6 py-5 flex items-center justify-center gap-6">
          <VoiceAssistant onVoiceCommand={handleVoiceCapture} />

          <button
            onClick={captureFrame}
            disabled={!permissionGranted}
            className="relative w-16 h-16 rounded-full bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-4 border-background shadow-lg"
          >
            <Camera size={28} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CameraFeed
