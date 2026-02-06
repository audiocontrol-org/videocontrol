export function App() {
  return (
    <div className="flex h-screen flex-col bg-black text-gray-400">
      <header className="flex items-center justify-between border-b border-crt-border bg-crt-panel px-5 py-2.5">
        <div className="font-display text-sm font-bold uppercase tracking-[3px] text-gray-300">
          <span className="text-phosphor-green drop-shadow-[0_0_10px_#39ff14]">
            Phosphor
          </span>{' '}
          Scope
        </div>
        <div className="font-mono text-xs text-gray-500">
          Drop an audio file to begin
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl opacity-20">&#x1F4FB;</div>
          <p className="font-mono text-sm text-gray-600">
            Drag and drop an audio file here
          </p>
          <p className="mt-2 font-mono text-xs text-gray-700">
            Supports MP3, WAV, FLAC
          </p>
        </div>
      </main>
    </div>
  )
}
