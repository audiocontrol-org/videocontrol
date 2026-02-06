import { useRef, useEffect, useCallback, useState } from 'react'
import { useAudioStore, useScopeStore } from '@/stores'
import { useAnimationFrame } from '@/hooks'
import {
  PHOSPHOR_COLORS,
  drawWaveform,
  drawLissajous,
  drawSpectrum,
} from '@/lib/rendering'
import { FilmEffects } from './FilmEffects'

// Oscilloscope photo dimensions and CRT screen position
const PHOTO = {
  origW: 654,
  origH: 984,
  crtCX: 325, // CRT center X in original image coords
  crtCY: 250, // CRT center Y in original image coords
  crtR: 179, // CRT cutout radius in original image coords
}

export function ScopeDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const assemblyRef = useRef<HTMLDivElement>(null)

  const [layout, setLayout] = useState({
    assemblyW: 0,
    assemblyH: 0,
    canvasSize: 0,
    canvasLeft: 0,
    canvasTop: 0,
  })

  const { engine, isLoaded, isPlaying } = useAudioStore()
  const {
    mode,
    color,
    persistence,
    glowIntensity,
    beamWidth,
    bloomRadius,
    gain,
    density,
    scanlineAlpha,
    noiseAmount,
    flickerAmount,
  } = useScopeStore()

  // Resize and position canvas to match CRT screen area
  useEffect(() => {
    const resizeCanvas = () => {
      const container = containerRef.current
      const canvas = canvasRef.current
      const glowCanvas = glowCanvasRef.current
      if (!container || !canvas || !glowCanvas) return

      const { width: wrapW, height: wrapH } = container.getBoundingClientRect()
      const photoAspect = PHOTO.origW / PHOTO.origH
      const pad = 20
      const availW = wrapW - pad
      const availH = wrapH - pad

      let displayW: number, displayH: number
      if (availW / availH > photoAspect) {
        displayH = availH
        displayW = displayH * photoAspect
      } else {
        displayW = availW
        displayH = displayW / photoAspect
      }

      // Scale factor from original image to display size
      const scale = displayW / PHOTO.origW

      // Canvas size and position to cover exactly the CRT area
      const canvasSize = Math.ceil(PHOTO.crtR * 2 * scale)
      const canvasLeft = Math.floor((PHOTO.crtCX - PHOTO.crtR) * scale)
      const canvasTop = Math.floor((PHOTO.crtCY - PHOTO.crtR) * scale)

      canvas.width = canvasSize
      canvas.height = canvasSize
      glowCanvas.width = canvasSize
      glowCanvas.height = canvasSize

      setLayout({
        assemblyW: displayW,
        assemblyH: displayH,
        canvasSize,
        canvasLeft,
        canvasTop,
      })
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [isLoaded])

  // Animation frame callback
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const glowCanvas = glowCanvasRef.current
    if (!canvas || !glowCanvas) return

    const ctx = canvas.getContext('2d')
    const glowCtx = glowCanvas.getContext('2d')
    if (!ctx || !glowCtx) return

    const W = canvas.width
    const H = canvas.height
    const phosphorColor = PHOSPHOR_COLORS[color]

    // Persistence fade on glow canvas
    glowCtx.globalCompositeOperation = 'source-over'
    glowCtx.fillStyle = `rgba(0, 0, 0, ${1 - persistence})`
    glowCtx.fillRect(0, 0, W, H)

    // Get analysis data if playing
    if (isPlaying) {
      const analysisData = engine.getAnalysisData()
      if (analysisData) {
        glowCtx.globalCompositeOperation = 'lighter'

        // Calculate alpha with flicker
        const flicker = 1 - Math.random() * flickerAmount
        const alpha = Math.min(1, 0.9 * flicker)

        const renderParams = { gain, density, beamWidth }

        if (mode === 'waveform') {
          drawWaveform(
            glowCtx,
            W,
            H,
            phosphorColor,
            alpha,
            analysisData.timeDomainLeft,
            renderParams
          )
        } else if (mode === 'lissajous') {
          drawLissajous(
            glowCtx,
            W,
            H,
            phosphorColor,
            alpha,
            analysisData.timeDomainLeft,
            analysisData.timeDomainRight,
            renderParams
          )
        } else if (mode === 'spectrum') {
          drawSpectrum(
            glowCtx,
            W,
            H,
            phosphorColor,
            alpha,
            analysisData.frequencyData,
            renderParams
          )
        }
      }
    }

    // Clear main canvas and draw CRT effects
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)

    // Apply bloom/glow effect
    if (bloomRadius > 0) {
      ctx.filter = `blur(${bloomRadius}px)`
      ctx.globalAlpha = glowIntensity * 0.3
      ctx.drawImage(glowCanvas, 0, 0)
      ctx.filter = 'none'
      ctx.globalAlpha = 1
    }

    // Draw the sharp trace on top
    ctx.drawImage(glowCanvas, 0, 0)

    // Scanlines
    if (scanlineAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${scanlineAlpha})`
      for (let y = 0; y < H; y += 2) {
        ctx.fillRect(0, y, W, 1)
      }
    }

    // Noise
    if (noiseAmount > 0) {
      const imageData = ctx.getImageData(0, 0, W, H)
      const data = imageData.data
      const noiseScale = noiseAmount * 50

      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseScale
        data[i] = Math.max(0, Math.min(255, data[i] + noise))
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
      }

      ctx.putImageData(imageData, 0, 0)
    }
  }, [
    engine,
    isPlaying,
    mode,
    color,
    persistence,
    glowIntensity,
    beamWidth,
    bloomRadius,
    gain,
    density,
    scanlineAlpha,
    noiseAmount,
    flickerAmount,
  ])

  useAnimationFrame(animate)

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-black relative overflow-hidden"
    >
      {!isLoaded ? (
        <div className="text-center">
          <div className="text-6xl opacity-20 mb-4">📻</div>
          <p className="font-mono text-sm text-gray-600">
            Drag and drop an audio file here
          </p>
          <p className="mt-2 font-mono text-xs text-gray-700">
            Supports MP3, WAV, FLAC
          </p>
        </div>
      ) : (
        <div
          ref={assemblyRef}
          className="relative"
          style={{
            width: layout.assemblyW,
            height: layout.assemblyH,
          }}
        >
          {/* Glow canvas (accumulation buffer) - hidden */}
          <canvas
            ref={glowCanvasRef}
            className="absolute rounded-full opacity-0 pointer-events-none"
            style={{
              left: layout.canvasLeft,
              top: layout.canvasTop,
              width: layout.canvasSize,
              height: layout.canvasSize,
            }}
          />

          {/* Main display canvas - positioned inside CRT screen area */}
          <canvas
            ref={canvasRef}
            className="absolute rounded-full"
            style={{
              left: layout.canvasLeft,
              top: layout.canvasTop,
              width: layout.canvasSize,
              height: layout.canvasSize,
              background: '#0a0a0a',
            }}
          />

          {/* Oscilloscope photo overlay */}
          <img
            src="/oscilloscope.png"
            alt=""
            className="relative block w-full h-full pointer-events-none select-none"
            style={{ zIndex: 2 }}
            draggable={false}
          />

          {/* Film effects overlay - covers entire display including oscilloscope */}
          {layout.assemblyW > 0 && layout.assemblyH > 0 && (
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ zIndex: 3 }}
            >
              <FilmEffects width={layout.assemblyW} height={layout.assemblyH} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
