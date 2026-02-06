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

export interface AudioAnalysisData {
  timeData: Float32Array
  frequencyData: Float32Array
  leftChannel: Float32Array
  rightChannel: Float32Array
}
