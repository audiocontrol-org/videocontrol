# Phosphor Scope - Product Requirements Document

**Created:** 2026-02-05
**Status:** Approved
**Owner:** Orion Letizi

## Problem Statement

Musicians and content creators need tools to generate visually compelling music videos from audio files. The first tool in the videocontrol suite is a CRT oscilloscope visualizer with vintage film projector effects, allowing users to create retro-styled audio visualizations for platforms like YouTube, Instagram, and TikTok.

## User Stories

- As a musician, I want to upload an audio file and see it visualized as a phosphor CRT oscilloscope so that I can create engaging visual content for my music
- As a content creator, I want to choose from multiple visualization modes (waveform, Lissajous, spectrum) so that I can match the visual style to the music genre
- As a content creator, I want to apply vintage film effects (grain, scratches, flicker) so that my videos have an authentic retro aesthetic
- As a musician, I want to record the visualization as a video file in common social media formats so that I can share it directly to YouTube, Instagram Reels, or TikTok
- As a developer, I want shared audio analysis and recording infrastructure so that future visualizers can reuse common functionality

## Success Criteria

- [ ] Users can drag-and-drop or select audio files (MP3, WAV, FLAC)
- [ ] Three visualization modes work: waveform, Lissajous (X/Y), spectrum (FFT)
- [ ] Four phosphor colors available: green, amber, blue, white
- [ ] Film effects are adjustable: grain, weave, flicker, scratches, light leaks, dust
- [ ] Video recording works in four formats: YouTube (16:9), Shorts (9:16), Instagram (4:5), Square (1:1)
- [ ] Recorded videos include synchronized audio
- [ ] App runs entirely in the browser (no server-side processing)
- [ ] Responsive design works on desktop browsers

## Scope

### In Scope

- Convert phosphor-oscilloscope.html to TypeScript React app
- Create shared video-core module for audio analysis and recording
- Create phosphor-scope module as first visualizer
- Vite + React + Tailwind + Zustand stack (matching audiocontrol conventions)
- Video recording via MediaRecorder API
- Keyboard shortcuts for play/pause and mode switching

### Out of Scope

- Mobile app versions
- Server-side rendering or processing
- User accounts or cloud storage
- Real-time microphone input (file upload only for v1)
- Video editing or trimming features
- Direct upload to social platforms

## Technical Architecture

### Monorepo Structure

```
videocontrol/
├── modules/
│   ├── video-core/         # Shared audio/recording infrastructure
│   │   ├── src/audio/      # AudioEngine class (Web Audio API)
│   │   ├── src/recording/  # VideoRecorder class (MediaRecorder API)
│   │   └── src/types/      # Shared types
│   └── phosphor-scope/     # CRT oscilloscope visualizer
│       ├── src/components/ # React components
│       ├── src/stores/     # Zustand stores
│       ├── src/hooks/      # Custom hooks
│       └── src/lib/        # Rendering logic
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

### Key Technical Decisions

- **pnpm workspaces** for monorepo (matching audiocontrol)
- **Vite** for bundling
- **React 18** for UI
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Canvas 2D API** for rendering (not WebGL)
- **Web Audio API** for audio analysis
- **MediaRecorder API** for video capture

### Source Material

The original implementation is in `~/Downloads/phosphor-oscilloscope.html` — a single-file HTML/CSS/JS app with:
- Photo overlay of a vintage oscilloscope
- Canvas-based waveform/Lissajous/spectrum rendering
- Film projector effects (grain, scratches, weave, flicker, light leaks, dust)
- Video recording with format selection

## Dependencies

- Web Audio API (browser)
- MediaRecorder API (browser)
- Canvas 2D API (browser)

## Open Questions

- [x] Repository location? `audiocontrol-org/videocontrol`
- [x] Module naming? `@videocontrol/video-core`, `@videocontrol/phosphor-scope`
- [ ] Should we support real-time microphone input in v1? (Decided: no, file upload only)
- [ ] Hosting/deployment target? (TBD — likely Netlify or Vercel)
