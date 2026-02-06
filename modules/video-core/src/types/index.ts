// Shared type definitions

export type PhosphorColor = 'green' | 'amber' | 'blue' | 'white'

export type VisualizationMode = 'waveform' | 'lissajous' | 'spectrum'

export type VideoFormat = 'youtube' | 'shorts' | 'instagram' | 'square'

export interface VideoFormatConfig {
  name: string
  aspectRatio: string
  width: number
  height: number
}

export const VIDEO_FORMATS: Record<VideoFormat, VideoFormatConfig> = {
  youtube: { name: 'YouTube', aspectRatio: '16:9', width: 1920, height: 1080 },
  shorts: { name: 'Shorts', aspectRatio: '9:16', width: 1080, height: 1920 },
  instagram: { name: 'Instagram', aspectRatio: '4:5', width: 1080, height: 1350 },
  square: { name: 'Square', aspectRatio: '1:1', width: 1080, height: 1080 },
}

// Audio types

export interface AudioEngineConfig {
  fftSize?: number
  smoothingTimeConstant?: number
}

export interface AudioAnalysisData {
  /** Time domain data for mono/left channel (waveform) */
  timeDomainLeft: Uint8Array
  /** Time domain data for right channel (for Lissajous) */
  timeDomainRight: Uint8Array
  /** Frequency data (for spectrum) */
  frequencyData: Uint8Array
}

export interface AudioEngineState {
  isPlaying: boolean
  isLoaded: boolean
  duration: number
  currentTime: number
  fileName: string | null
}

export type AudioEngineEventType =
  | 'statechange'
  | 'ended'
  | 'loaded'
  | 'error'

export interface AudioEngineEventMap {
  statechange: AudioEngineState
  ended: void
  loaded: { fileName: string; duration: number }
  error: Error
}
