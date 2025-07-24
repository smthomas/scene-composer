# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Veo3 Prompt Composer - a React TypeScript application for creating complex video generation prompts with visual timeline editing and YAML export capabilities.

## Essential Commands

### Development
```bash
# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Architecture & Key Patterns

### Component Structure
The application uses a centralized state pattern where `App.tsx` manages all form state and passes it down to child components:
- `MetadataForm.tsx` - Handles video metadata (style, environment, camera settings)
- `TimelineBuilder.tsx` - Visual timeline editor with drag-and-drop
- `SavedPromptsSidebar.tsx` - Manages saved prompts in localStorage
- `YamlGenerator.tsx` - Converts state to YAML format

### State Management Pattern
All form state is managed in App.tsx using React hooks:
```typescript
const [metadata, setMetadata] = useState<Metadata>({...})
const [segments, setSegments] = useState<Segment[]>([])
```

Child components receive state and update functions as props, maintaining unidirectional data flow.

### UI Component Library
The project extensively uses shadcn-ui components located in `src/components/ui/`. When adding new UI elements, check if a suitable component already exists before creating custom ones.

### Type Definitions
Core data types are defined in component files:
- `Metadata` interface in App.tsx
- `Segment` interface in TimelineBuilder.tsx
- Component prop types are defined inline

### Storage Pattern
Prompts are saved to localStorage using utility functions in `src/lib/storage.ts`. The storage key pattern is `veo3_prompt_[timestamp]`.

### Styling Approach
- Tailwind CSS with custom configuration in `tailwind.config.js`
- Custom CSS variables for theming in `src/index.css`
- Gradient backgrounds and animated elements using Tailwind classes

## Important Implementation Details

### Form State Updates
When updating nested state objects, always create new object references:
```typescript
setMetadata({ ...metadata, style: { ...metadata.style, visual_style: value } })
```

### Timeline Segments
Segments have timestamps and durations. The timeline automatically calculates positions based on cumulative durations.

### YAML Generation
The YAML output follows a specific structure expected by Veo3. Maintain the exact formatting when modifying the YAML generator.

## Development Tips

1. The project uses Vite's HMR for fast development feedback
2. ESLint is configured - ensure no linting errors before committing
3. Type safety is enforced - avoid using `any` types
4. UI components from shadcn-ui have built-in accessibility features
5. The application is designed to work without a backend - all data is stored locally