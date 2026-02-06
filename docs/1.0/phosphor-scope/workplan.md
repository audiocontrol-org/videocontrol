# Phosphor Scope - Workplan

**GitHub Milestone:** [Week of Feb 3-7](https://github.com/audiocontrol-org/videocontrol/milestone/1)
**GitHub Issues:**

- [Parent: CRT Oscilloscope Visualizer (#1)](https://github.com/audiocontrol-org/videocontrol/issues/1)
- [Set up pnpm monorepo and module scaffolding (#2)](https://github.com/audiocontrol-org/videocontrol/issues/2)
- [Implement video-core AudioEngine (#3)](https://github.com/audiocontrol-org/videocontrol/issues/3)
- [Implement video-core VideoRecorder (#4)](https://github.com/audiocontrol-org/videocontrol/issues/4)
- [Build phosphor-scope React UI shell (#5)](https://github.com/audiocontrol-org/videocontrol/issues/5)
- [Implement canvas waveform/Lissajous/spectrum rendering (#6)](https://github.com/audiocontrol-org/videocontrol/issues/6)
- [Implement film projector effects (#7)](https://github.com/audiocontrol-org/videocontrol/issues/7)
- [Wire up video recording and export (#8)](https://github.com/audiocontrol-org/videocontrol/issues/8)
- [Add keyboard shortcuts and polish (#9)](https://github.com/audiocontrol-org/videocontrol/issues/9)

## Technical Approach

Convert the single-file `phosphor-oscilloscope.html` into a TypeScript React application with proper module separation. The shared audio engine and recording infrastructure live in `video-core`; the visualizer-specific code lives in `phosphor-scope`.

### Source Material

- Original file: `~/Downloads/phosphor-oscilloscope.html`
- ~1500 lines of HTML/CSS/JS
- Key components to extract:
  - Audio loading and playback (Web Audio API)
  - Stereo channel splitting for Lissajous mode
  - Waveform, Lissajous, and spectrum rendering
  - Film effects (grain, weave, flicker, scratches, light leaks, dust)
  - Video recording with MediaRecorder API

### Module Boundaries

**video-core** (shared):
- `AudioEngine` class — load files, play/pause, get analysis data
- `VideoRecorder` class — capture canvas + audio, export WebM
- Type definitions for formats, colors, analysis data

**phosphor-scope** (visualizer):
- React UI components (TopBar, ControlPanel, ScopeDisplay)
- Zustand stores (audio, scope params, film params, recording)
- Canvas rendering hooks and utilities
- Film effects rendering

## Implementation Phases

### Phase 1: Repository and Project Setup

- Initialize pnpm monorepo with workspace config
- Create module scaffolding for video-core and phosphor-scope
- Set up Vite, TypeScript, Tailwind, ESLint configs
- Add CLAUDE.md with project conventions

### Phase 2: Video Core Module

- Implement `AudioEngine` class
  - File loading via Web Audio API
  - Play/pause/stop controls
  - FFT analysis (time domain + frequency)
  - Stereo channel splitting
- Implement `VideoRecorder` class
  - Canvas stream capture
  - Audio stream merging
  - Format selection (YouTube, Shorts, Instagram, Square)
  - WebM export with VP9/VP8 codec
- Export shared types

### Phase 3: Phosphor Scope UI Shell

- Create React app entry point
- Implement layout components (TopBar, ControlPanel)
- Create Zustand stores for state management
- Implement drag-and-drop file loading
- Wire up audio playback controls

### Phase 4: Canvas Rendering

- Implement ScopeDisplay component with canvas
- Port waveform rendering from original
- Port Lissajous (X/Y) rendering from original
- Port spectrum (FFT) rendering from original
- Implement phosphor color switching
- Add beam controls (persistence, glow, width, gain)

### Phase 5: Film Effects

- Port film grain effect
- Port gate weave effect
- Port brightness flicker effect
- Port scratches effect
- Port light leaks effect
- Port dust/hair particles effect
- Port color fade (sepia) effect

### Phase 6: Recording and Export

- Wire VideoRecorder to scope canvas
- Implement recording UI (start/stop, format selection, timer)
- Composite full frame for recording (scope + photo overlay + effects)
- Test recording in all four formats

### Phase 7: Polish and Testing

- Keyboard shortcuts (Space for play/pause, 1/2/3 for modes)
- Responsive design verification
- Cross-browser testing (Chrome, Firefox, Safari)
- Performance optimization

## Success Criteria Per Phase

| Phase | Criteria |
|-------|----------|
| Phase 1 | `pnpm install` succeeds, modules resolve |
| Phase 2 | Audio plays, analysis data available |
| Phase 3 | UI renders, file loading works |
| Phase 4 | All three visualization modes render |
| Phase 5 | All film effects render correctly |
| Phase 6 | Video recording exports playable files |
| Phase 7 | Works in major browsers, keyboard shortcuts functional |

## Extensibility Notes

This is the first visualizer in the videocontrol suite. The architecture should support:
- Adding new visualizer modules (e.g., spectrum bars, particle systems)
- Shared audio engine across all visualizers
- Shared recording infrastructure
- Consistent UI patterns (control panels, transport controls)
