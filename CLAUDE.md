# Video Control - Claude Code Instructions

## Project Overview

Video Control is a collection of tools for generating music videos that respond to uploaded audio. Each visualizer is a separate module in the monorepo.

## Architecture

- **Monorepo structure** using pnpm workspaces
- **Modules** live in `modules/` directory
- **Shared code** in `modules/video-core/` for audio analysis, recording infrastructure
- **Visualizers** are separate modules (e.g., `modules/phosphor-scope/`)

## Technical Standards

- **TypeScript** with strict mode
- **React 18** for UI components
- **Vite** for bundling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Web Audio API** for audio analysis
- **MediaRecorder API** for video capture

## Conventions

- Use the `@/` import pattern for TypeScript paths within modules
- Follow audiocontrol project patterns for module structure
- Keep files under 300-500 lines
- Use composition over inheritance
- Interface-first design for cross-boundary contracts

## Module Structure

Each visualizer module follows this structure:

```
modules/<visualizer-name>/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── ui/           # Shared UI components
│   │   └── visualizer/   # Visualizer-specific components
│   ├── hooks/
│   ├── stores/
│   ├── lib/
│   │   ├── audio/        # Audio analysis
│   │   └── recording/    # Video recording
│   └── types/
└── public/
```

## Key Interfaces

Visualizers should implement a common interface for:
- Audio input (file upload, drag-drop)
- Parameter controls (sliders, buttons)
- Video recording (format selection, export)
- Film effects (grain, scratches, flicker - optional)

## Testing

- Use Vitest for unit tests
- Playwright for E2E tests
- Test audio processing with mock data
