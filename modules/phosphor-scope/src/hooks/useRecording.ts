import { useRef, useCallback, useEffect } from 'react'
import { VideoRecorder } from '@videocontrol/video-core'
import { useAudioStore, useRecordingStore, useScopeStore, useFilmStore } from '@/stores'
import {
  PHOSPHOR_COLORS,
  drawWaveform,
  drawLissajous,
  drawSpectrum,
} from '@/lib/rendering'
import {
  drawFilmGrain,
  drawScratches,
  drawDust,
  drawLightLeak,
  calculateFlicker,
  calculateWeave,
} from '@/lib/film'
import type { Scratch, DustParticle } from '@/lib/film'

// Oscilloscope photo dimensions and CRT screen position (must match ScopeDisplay)
const PHOTO = {
  origW: 654,
  origH: 984,
  crtCX: 325,
  crtCY: 250,
  crtR: 179,
}

export function useRecording() {
  const recorderRef = useRef<VideoRecorder | null>(null)
  const animationRef = useRef<number | null>(null)
  const glowCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const scopeImageRef = useRef<HTMLImageElement | null>(null)
  const scratchesRef = useRef<Scratch[]>([])
  const dustRef = useRef<DustParticle[]>([])
  const stopPlaybackRef = useRef<(() => void) | null>(null)

  const { engine, isLoaded } = useAudioStore()
  const { format, isRecording, setIsRecording, setElapsedTime, reset } = useRecordingStore()
  const scope = useScopeStore()
  const film = useFilmStore()

  // Initialize recorder and load oscilloscope image
  useEffect(() => {
    recorderRef.current = new VideoRecorder()

    recorderRef.current.on('complete', ({ blob, filename }) => {
      VideoRecorder.downloadBlob(blob, filename)
      reset()
    })

    recorderRef.current.on('timeupdate', ({ elapsedTime }) => {
      setElapsedTime(elapsedTime)
    })

    recorderRef.current.on('error', (error) => {
      console.error('Recording error:', error)
      reset()
    })

    // Create canvases for rendering
    glowCanvasRef.current = document.createElement('canvas')
    scopeCanvasRef.current = document.createElement('canvas')

    // Load oscilloscope image
    const img = new Image()
    img.src = '/oscilloscope.png'
    img.onload = () => {
      scopeImageRef.current = img
    }

    return () => {
      recorderRef.current?.dispose()
    }
  }, [reset, setElapsedTime])

  // Update format when it changes
  useEffect(() => {
    if (recorderRef.current && !recorderRef.current.isRecording) {
      recorderRef.current.setFormat(format)
    }
  }, [format])

  // Draw a frame to the recording canvas
  const drawRecordingFrame = useCallback(
    (timestamp: number) => {
      const recorder = recorderRef.current
      const glowCanvas = glowCanvasRef.current
      const scopeCanvas = scopeCanvasRef.current
      const scopeImage = scopeImageRef.current
      if (!recorder || !glowCanvas || !scopeCanvas) return

      const ctx = recorder.getRecordingContext()
      const W = recorder.getRecordingCanvas().width
      const H = recorder.getRecordingCanvas().height

      // Calculate layout to fit oscilloscope in recording canvas
      const photoAspect = PHOTO.origW / PHOTO.origH
      let scopeW: number, scopeH: number

      if (W / H > photoAspect) {
        // Canvas is wider than photo - fit to height
        scopeH = H * 0.95
        scopeW = scopeH * photoAspect
      } else {
        // Canvas is taller than photo - fit to width
        scopeW = W * 0.95
        scopeH = scopeW / photoAspect
      }

      const scopeX = (W - scopeW) / 2
      const scopeY = (H - scopeH) / 2

      const scale = scopeW / PHOTO.origW

      // CRT area position and size
      const crtSize = Math.ceil(PHOTO.crtR * 2 * scale)
      const crtX = scopeX + (PHOTO.crtCX - PHOTO.crtR) * scale
      const crtY = scopeY + (PHOTO.crtCY - PHOTO.crtR) * scale

      // Ensure scope canvas matches CRT size
      if (scopeCanvas.width !== crtSize || scopeCanvas.height !== crtSize) {
        scopeCanvas.width = crtSize
        scopeCanvas.height = crtSize
      }
      if (glowCanvas.width !== crtSize || glowCanvas.height !== crtSize) {
        glowCanvas.width = crtSize
        glowCanvas.height = crtSize
      }

      const scopeCtx = scopeCanvas.getContext('2d')
      const glowCtx = glowCanvas.getContext('2d')
      if (!scopeCtx || !glowCtx) return

      const phosphorColor = PHOSPHOR_COLORS[scope.color]

      // === Draw scope visualization to scopeCanvas ===

      // Persistence fade on glow canvas
      glowCtx.globalCompositeOperation = 'source-over'
      glowCtx.fillStyle = `rgba(0, 0, 0, ${1 - scope.persistence})`
      glowCtx.fillRect(0, 0, crtSize, crtSize)

      // Get analysis data and draw
      const analysisData = engine.getAnalysisData()
      if (analysisData) {
        glowCtx.globalCompositeOperation = 'lighter'

        const flicker = 1 - Math.random() * scope.flickerAmount
        const alpha = Math.min(1, 0.9 * flicker)
        const renderParams = {
          gain: scope.gain,
          density: scope.density,
          beamWidth: scope.beamWidth,
        }

        if (scope.mode === 'waveform') {
          drawWaveform(glowCtx, crtSize, crtSize, phosphorColor, alpha, analysisData.timeDomainLeft, renderParams)
        } else if (scope.mode === 'lissajous') {
          drawLissajous(glowCtx, crtSize, crtSize, phosphorColor, alpha, analysisData.timeDomainLeft, analysisData.timeDomainRight, renderParams)
        } else if (scope.mode === 'spectrum') {
          drawSpectrum(glowCtx, crtSize, crtSize, phosphorColor, alpha, analysisData.frequencyData, renderParams)
        }
      }

      // Clear scope canvas and apply CRT effects
      scopeCtx.fillStyle = '#0a0a0a'
      scopeCtx.fillRect(0, 0, crtSize, crtSize)

      // Apply bloom/glow
      if (scope.bloomRadius > 0) {
        scopeCtx.filter = `blur(${scope.bloomRadius}px)`
        scopeCtx.globalAlpha = scope.glowIntensity * 0.3
        scopeCtx.drawImage(glowCanvas, 0, 0)
        scopeCtx.filter = 'none'
        scopeCtx.globalAlpha = 1
      }

      // Draw sharp trace
      scopeCtx.drawImage(glowCanvas, 0, 0)

      // Scanlines
      if (scope.scanlineAlpha > 0) {
        scopeCtx.fillStyle = `rgba(0, 0, 0, ${scope.scanlineAlpha})`
        for (let y = 0; y < crtSize; y += 2) {
          scopeCtx.fillRect(0, y, crtSize, 1)
        }
      }

      // CRT noise
      if (scope.noiseAmount > 0) {
        const imageData = scopeCtx.getImageData(0, 0, crtSize, crtSize)
        const data = imageData.data
        const noiseScale = scope.noiseAmount * 50
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * noiseScale
          data[i] = Math.max(0, Math.min(255, data[i] + noise))
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
        }
        scopeCtx.putImageData(imageData, 0, 0)
      }

      // === Composite to main recording canvas ===

      // Calculate weave offset for film effect
      const weaveOffset = calculateWeave(timestamp, film.weave)

      ctx.save()
      ctx.translate(weaveOffset.x, weaveOffset.y)

      // Clear main canvas
      ctx.fillStyle = '#000000'
      ctx.fillRect(-10, -10, W + 20, H + 20)

      // Draw scope visualization in circular CRT area
      ctx.save()
      ctx.beginPath()
      ctx.arc(crtX + crtSize / 2, crtY + crtSize / 2, crtSize / 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(scopeCanvas, crtX, crtY, crtSize, crtSize)
      ctx.restore()

      // Draw oscilloscope image on top
      if (scopeImage) {
        ctx.drawImage(scopeImage, scopeX, scopeY, scopeW, scopeH)
      }

      ctx.restore()

      // === Apply film effects over entire frame ===

      // Film grain
      if (film.grain > 0) {
        const grainCanvas = document.createElement('canvas')
        grainCanvas.width = W
        grainCanvas.height = H
        const grainCtx = grainCanvas.getContext('2d')
        if (grainCtx) {
          drawFilmGrain(grainCtx, W, H)
          ctx.globalAlpha = film.grain * 0.4
          ctx.globalCompositeOperation = 'overlay'
          ctx.drawImage(grainCanvas, 0, 0)
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = 1
        }
      }

      // Scratches
      if (film.scratches > 0) {
        const scratchCanvas = document.createElement('canvas')
        scratchCanvas.width = W
        scratchCanvas.height = H
        const scratchCtx = scratchCanvas.getContext('2d')
        if (scratchCtx) {
          scratchesRef.current = drawScratches(scratchCtx, W, H, scratchesRef.current, film.scratches)
          ctx.globalAlpha = film.scratches
          ctx.drawImage(scratchCanvas, 0, 0)
          ctx.globalAlpha = 1
        }
      }

      // Dust
      if (film.dust > 0) {
        const dustCanvas = document.createElement('canvas')
        dustCanvas.width = W
        dustCanvas.height = H
        const dustCtx = dustCanvas.getContext('2d')
        if (dustCtx) {
          dustRef.current = drawDust(dustCtx, W, H, dustRef.current, film.dust)
          ctx.globalAlpha = film.dust
          ctx.drawImage(dustCanvas, 0, 0)
          ctx.globalAlpha = 1
        }
      }

      // Light leaks
      if (film.lightLeaks > 0) {
        const leakCanvas = document.createElement('canvas')
        leakCanvas.width = W
        leakCanvas.height = H
        const leakCtx = leakCanvas.getContext('2d')
        if (leakCtx) {
          drawLightLeak(leakCtx, W, H, timestamp, film.lightLeaks)
          ctx.drawImage(leakCanvas, 0, 0)
        }
      }

      // Vignette
      const vigGrad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.7)
      vigGrad.addColorStop(0, 'transparent')
      vigGrad.addColorStop(0.7, 'rgba(0,0,0,0.15)')
      vigGrad.addColorStop(1, 'rgba(0,0,0,0.5)')
      ctx.fillStyle = vigGrad
      ctx.fillRect(0, 0, W, H)

      // Brightness flicker
      const flickerBrightness = calculateFlicker(timestamp, film.flicker)
      if (flickerBrightness < 1) {
        ctx.fillStyle = `rgba(0,0,0,${1 - flickerBrightness})`
        ctx.fillRect(0, 0, W, H)
      } else if (flickerBrightness > 1) {
        ctx.fillStyle = `rgba(255,255,255,${(flickerBrightness - 1) * 0.3})`
        ctx.fillRect(0, 0, W, H)
      }

      // Color fade (sepia effect)
      if (film.colorFade > 0) {
        const imageData = ctx.getImageData(0, 0, W, H)
        const data = imageData.data
        const sepiaAmount = film.colorFade

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          const newR = Math.min(255, r * (1 - sepiaAmount) + (r * 0.393 + g * 0.769 + b * 0.189) * sepiaAmount)
          const newG = Math.min(255, g * (1 - sepiaAmount) + (r * 0.349 + g * 0.686 + b * 0.168) * sepiaAmount)
          const newB = Math.min(255, b * (1 - sepiaAmount) + (r * 0.272 + g * 0.534 + b * 0.131) * sepiaAmount)

          data[i] = newR
          data[i + 1] = newG
          data[i + 2] = newB
        }

        ctx.putImageData(imageData, 0, 0)
      }
    },
    [engine, scope, film]
  )

  // Recording animation loop
  const recordingLoop = useCallback(
    (timestamp: number) => {
      if (!recorderRef.current?.isRecording) return

      drawRecordingFrame(timestamp)
      animationRef.current = requestAnimationFrame(recordingLoop)
    },
    [drawRecordingFrame]
  )

  // Stop recording
  const stopRecording = useCallback(() => {
    // Cancel animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Stop the recorder
    recorderRef.current?.stop()

    // Stop playback using the stored cleanup function
    if (stopPlaybackRef.current) {
      stopPlaybackRef.current()
      stopPlaybackRef.current = null
    }

    setIsRecording(false)
  }, [setIsRecording])

  // Start recording
  const startRecording = useCallback(() => {
    if (!isLoaded || !recorderRef.current) return

    // Guard: don't start if already recording
    if (isRecording || recorderRef.current.isRecording) {
      return
    }

    // Reset film effect state
    scratchesRef.current = []
    dustRef.current = []

    // Create audio stream destination for recording
    const audioDestination = engine.createMediaStreamDestination()
    if (!audioDestination) {
      console.error('Failed to create audio destination for recording')
      return
    }

    // Start recorder with audio stream
    recorderRef.current.start(audioDestination.stream)
    setIsRecording(true)

    // Play audio through the engine (routes to both speakers AND analysers AND recording)
    const cleanup = engine.playForRecording(audioDestination)
    stopPlaybackRef.current = cleanup

    // Auto-stop recording when audio ends
    const handleEnded = () => {
      stopRecording()
      engine.off('ended', handleEnded)
    }
    engine.on('ended', handleEnded)

    // Start recording animation loop
    animationRef.current = requestAnimationFrame(recordingLoop)
  }, [isLoaded, isRecording, engine, setIsRecording, recordingLoop, stopRecording])

  // Toggle recording - uses store state to avoid stale closure
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  return {
    startRecording,
    stopRecording,
    toggleRecording,
    isRecording,
  }
}
