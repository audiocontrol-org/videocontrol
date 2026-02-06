import { useAudioStore } from '@/stores'

export function ScopeDisplay() {
  const { isLoaded } = useAudioStore()

  return (
    <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
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
        <div className="text-center">
          <div className="text-6xl opacity-40 mb-4">◉</div>
          <p className="font-mono text-sm text-gray-500">
            Canvas rendering will be implemented in Issue #6
          </p>
        </div>
      )}
    </div>
  )
}
