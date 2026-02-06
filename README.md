# Video Control

Generate music videos that respond to audio.

## Overview

Video Control provides a collection of browser-based tools for creating visualizations and music videos from audio files. Each tool is designed for a specific aesthetic or visualization style.

## Modules

- **Phosphor Scope** - CRT oscilloscope with film projector effects (browser-based)
- **Text Overlay** - YAML-driven text overlay generator with ProRes 4444 alpha output (CLI/Remotion)

## Getting Started

```bash
# Install dependencies
pnpm install

# Run all visualizers in dev mode
pnpm dev

# Build all modules
pnpm build
```

## Project Structure

```
videocontrol/
├── modules/
│   ├── video-core/       # Shared audio/recording infrastructure
│   ├── phosphor-scope/   # CRT oscilloscope visualizer
│   └── text-overlay/     # Text overlay generator (Remotion-based)
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## License

Apache-2.0
