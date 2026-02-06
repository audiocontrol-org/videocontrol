import { useRef, useEffect, useCallback } from 'react'
import { useFilmStore } from '@/stores'
import { useAnimationFrame } from '@/hooks'
import {
  drawScratches,
  drawDust,
  drawLightLeak,
  calculateFlicker,
  calculateWeave,
} from '@/lib/film'
import type { Scratch, DustParticle } from '@/lib/film'

interface FilmEffectsProps {
  width: number
  height: number
}

// Generate grain at a fixed small size for performance
const GRAIN_SIZE = 256

/**
 * Pre-generate grain texture at small size.
 * This is much faster than generating full-size grain every frame.
 */
function generateGrainTexture(ctx: CanvasRenderingContext2D): void {
  const imageData = ctx.createImageData(GRAIN_SIZE, GRAIN_SIZE)
  const data = imageData.data
  const blockSize = 2

  for (let by = 0; by < GRAIN_SIZE; by += blockSize) {
    for (let bx = 0; bx < GRAIN_SIZE; bx += blockSize) {
      const v = Math.floor(Math.random() * 80 + 88)

      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          const idx = ((by + dy) * GRAIN_SIZE + (bx + dx)) * 4
          data[idx] = v
          data[idx + 1] = v
          data[idx + 2] = v
          data[idx + 3] = 255
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export function FilmEffects({ width, height }: FilmEffectsProps) {
  const grainCanvasRef = useRef<HTMLCanvasElement>(null)
  const scratchCanvasRef = useRef<HTMLCanvasElement>(null)
  const dustCanvasRef = useRef<HTMLCanvasElement>(null)
  const leakCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Persistent state for scratches and dust
  const scratchesRef = useRef<Scratch[]>([])
  const dustRef = useRef<DustParticle[]>([])
  const timestampRef = useRef<number>(0)
  const lastGrainUpdateRef = useRef<number>(0)

  const { grain, weave, flicker, scratches, lightLeaks, dust, colorFade } =
    useFilmStore()

  // Initialize grain canvas at fixed small size
  useEffect(() => {
    const grainCanvas = grainCanvasRef.current
    if (grainCanvas) {
      grainCanvas.width = GRAIN_SIZE
      grainCanvas.height = GRAIN_SIZE
    }
  }, [])

  // Resize other canvases when dimensions change
  useEffect(() => {
    const canvases = [
      scratchCanvasRef.current,
      dustCanvasRef.current,
      leakCanvasRef.current,
    ]

    canvases.forEach((canvas) => {
      if (canvas) {
        canvas.width = width
        canvas.height = height
      }
    })
  }, [width, height])

  // Animation frame callback
  const animate = useCallback(
    (deltaTime: number) => {
      timestampRef.current += deltaTime

      const grainCanvas = grainCanvasRef.current
      const scratchCanvas = scratchCanvasRef.current
      const dustCanvas = dustCanvasRef.current
      const leakCanvas = leakCanvasRef.current
      const container = containerRef.current

      if (!grainCanvas || !scratchCanvas || !dustCanvas || !leakCanvas || !container) {
        return
      }

      const grainCtx = grainCanvas.getContext('2d')
      const scratchCtx = scratchCanvas.getContext('2d')
      const dustCtx = dustCanvas.getContext('2d')
      const leakCtx = leakCanvas.getContext('2d')

      if (!grainCtx || !scratchCtx || !dustCtx || !leakCtx) return

      const timestamp = timestampRef.current

      // Gate weave - apply transform to container
      if (weave > 0) {
        const weaveOffset = calculateWeave(timestamp, weave)
        container.style.transform = `translate(${weaveOffset.x}px, ${weaveOffset.y}px)`
      } else {
        container.style.transform = 'none'
      }

      // Brightness flicker
      if (flicker > 0) {
        const brightness = calculateFlicker(timestamp, flicker)
        container.style.filter = `brightness(${brightness})`
      } else {
        container.style.filter = 'none'
      }

      // Film grain - update at ~15fps for performance (authentic film look)
      if (grain > 0) {
        grainCanvas.style.opacity = String(grain * 0.6)
        const grainInterval = 67 // ~15fps
        if (timestamp - lastGrainUpdateRef.current > grainInterval) {
          generateGrainTexture(grainCtx)
          lastGrainUpdateRef.current = timestamp
        }
      } else {
        grainCanvas.style.opacity = '0'
      }

      // Scratches - update at ~30fps
      if (scratches > 0) {
        scratchCanvas.style.opacity = String(scratches)
        scratchesRef.current = drawScratches(
          scratchCtx,
          width,
          height,
          scratchesRef.current,
          scratches
        )
      } else {
        scratchCanvas.style.opacity = '0'
      }

      // Dust - update at ~30fps
      if (dust > 0) {
        dustCanvas.style.opacity = String(dust)
        dustRef.current = drawDust(
          dustCtx,
          width,
          height,
          dustRef.current,
          dust
        )
      } else {
        dustCanvas.style.opacity = '0'
      }

      // Light leaks
      if (lightLeaks > 0) {
        drawLightLeak(leakCtx, width, height, timestamp, lightLeaks)
      } else {
        leakCtx.clearRect(0, 0, width, height)
      }
    },
    [grain, weave, flicker, scratches, lightLeaks, dust, width, height]
  )

  useAnimationFrame(animate)

  // Calculate color fade filter
  const colorFadeFilter =
    colorFade > 0
      ? `sepia(${colorFade * 60}%) saturate(${1 - colorFade * 0.5}) brightness(${1 + colorFade * 0.1})`
      : 'none'

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ filter: colorFadeFilter }}
    >
      {/* Film grain overlay - small texture tiled via CSS */}
      <canvas
        ref={grainCanvasRef}
        className="absolute inset-0"
        style={{
          mixBlendMode: 'overlay',
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />

      {/* Scratches overlay */}
      <canvas ref={scratchCanvasRef} className="absolute inset-0" />

      {/* Dust overlay */}
      <canvas ref={dustCanvasRef} className="absolute inset-0" />

      {/* Light leaks overlay */}
      <canvas ref={leakCanvasRef} className="absolute inset-0" />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  )
}
