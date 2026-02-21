'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from './button'

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any

export function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing'>('idle')
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionInstance>(null)

  useEffect(() => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (status === 'listening') {
      recognitionRef.current?.stop()
      setStatus('idle')
      return
    }

    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition

    if (!SpeechRecognition) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setStatus('listening')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript
        }
      }
      if (transcript.trim()) {
        onTranscript(transcript.trim())
      }
    }

    recognition.onerror = () => {
      setStatus('idle')
    }

    recognition.onend = () => {
      setStatus('idle')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [status, onTranscript])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  if (!supported) return null

  return (
    <Button
      type="button"
      variant={status === 'listening' ? 'destructive' : 'outline'}
      size="sm"
      onClick={toggleListening}
      disabled={disabled || status === 'processing'}
      title={status === 'listening' ? 'Stop recording' : 'Start voice input'}
      className={status === 'listening' ? 'animate-pulse' : ''}
    >
      {status === 'processing' ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === 'listening' ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {status === 'listening' ? 'Stop' : 'Voice'}
    </Button>
  )
}
