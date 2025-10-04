"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff } from "lucide-react"
import { detectWakeWord, checkMLBackendHealth } from "../../lib/ml-service"

function VoiceAssistant({ onVoiceCommand }) {
  const [isListening, setIsListening] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const recognitionRef = useRef(null)
  const [mlBackendAvailable, setMlBackendAvailable] = useState(false)
  const [useCustomModel, setUseCustomModel] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  useEffect(() => {
    const checkMLHealth = async () => {
      const health = await checkMLBackendHealth()
      const voiceModelAvailable = health.status === "healthy" && health.models.voice
      setMlBackendAvailable(voiceModelAvailable)
      console.log("[v0] Voice ML Backend status:", health)
    }
    checkMLHealth()
  }, [])

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.warn("Speech recognition not supported")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setPermissionGranted(true)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
      console.log("Voice command:", transcript)

      if (transcript.includes("hey tata")) {
        if (transcript.includes("selfie") || transcript.includes("inside")) {
          onVoiceCommand("inside")
        } else if (transcript.includes("outside") || transcript.includes("capture outside")) {
          onVoiceCommand("outside")
        }
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onVoiceCommand])

  const startCustomModelListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        audioChunksRef.current = []

        // Convert to base64
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(",")[1]

          try {
            const result = await detectWakeWord(base64Audio)

            if (result.wake_word_detected && result.confidence > 0.7) {
              console.log("[v0] Wake word detected:", result.command, "confidence:", result.confidence)

              if (result.command === "capture_inside") {
                onVoiceCommand("inside")
              } else if (result.command === "capture_outside") {
                onVoiceCommand("outside")
              }
            }
          } catch (error) {
            console.error("[v0] Wake word detection error:", error)
          }
        }

        reader.readAsDataURL(audioBlob)

        // Restart recording if still listening
        if (isListening) {
          mediaRecorder.start()
          setTimeout(() => {
            if (mediaRecorder.state === "recording") {
              mediaRecorder.stop()
            }
          }, 2000) // Record 2 second chunks
        }
      }

      mediaRecorderRef.current = mediaRecorder
      setIsListening(true)
      setPermissionGranted(true)

      mediaRecorder.start()
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop()
        }
      }, 2000)
    } catch (error) {
      console.error("[v0] Microphone access error:", error)
      setIsListening(false)
    }
  }

  const stopCustomModelListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
    setIsListening(false)
  }

  const toggleListening = () => {
    if (useCustomModel && mlBackendAvailable) {
      if (isListening) {
        stopCustomModelListening()
      } else {
        startCustomModelListening()
      }
    } else {
      // Use browser's Web Speech API
      if (!recognitionRef.current) return

      if (isListening) {
        recognitionRef.current.stop()
      } else {
        recognitionRef.current.start()
      }
    }
  }

  return (
    <div className="flex items-center gap-3">
      {mlBackendAvailable && (
        <button
          onClick={() => setUseCustomModel((prev) => !prev)}
          className={`px-3 py-2 rounded-md text-xs font-mono transition-colors ${
            useCustomModel
              ? "bg-primary/20 text-primary border border-primary"
              : "bg-muted text-muted-foreground border border-primary/20"
          }`}
          title={useCustomModel ? "Using custom ML model" : "Using browser speech API"}
        >
          {useCustomModel ? "ML MODEL" : "BROWSER"}
        </button>
      )}

      <button
        onClick={toggleListening}
        className={`relative p-5 rounded-full transition-all border-2 ${
          isListening
            ? "bg-accent/20 text-accent border-accent animate-neon-pulse"
            : "bg-muted/50 text-muted-foreground border-primary/20 hover:border-primary/50 hover:bg-primary/10"
        }`}
        title={isListening ? "Listening..." : "Start voice commands"}
      >
        {isListening ? (
          <>
            <Mic size={24} className="drop-shadow-[0_0_8px_rgba(255,107,53,0.8)]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
          </>
        ) : (
          <MicOff size={24} />
        )}
      </button>
    </div>
  )
}

export default VoiceAssistant
