# Video Control

Generate music videos that respond to audio.

## Overview

Video Control provides a collection of browser-based tools for creating visualizations and music videos from audio files. Each tool is designed for a specific aesthetic or visualization style.

## Visualizers

- **Phosphor Scope** - CRT oscilloscope with film projector effects

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
│   └── phosphor-scope/   # CRT oscilloscope visualizer
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## License

Apache-2.0
