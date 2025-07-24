# Veo3 Scene Composer

A tool for crafting detailed Veo3 video generation prompts. Easily create more structured Veo3 prompts to get more control over your Veo3 videos.

🎬 **Try it live at [scenecomposer.com](https://scenecomposer.com)**

## What is Scene Composer?

Scene Composer is a React-based tool designed to help creators generate more detailed and structured prompts for Google's Veo3 video generation model. Instead of writing complex prompts manually, you can:

- 📝 Build multi-segment video sequences visually
- 🎨 Configure style, camera movements, and environments
- ⏱️ Set precise timing for each scene
- 📤 Export to YAML format ready for Veo3
- 💾 Save and manage your prompt library locally (using localstorage)

## Features

- **Visual Timeline Builder**: Drag and drop segments to create your video sequence
- **Rich Metadata Controls**: Set video style, environment, camera settings, and more
- **Real-time YAML Preview**: See your prompt structure as you build
- **Local Storage**: Save your favorite prompts for later use
- **Dark Mode**: Easy on the eyes during those late-night creative sessions
- **No Backend Required**: Everything runs in your browser

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/smthomas/scene-composer.git
cd scene-composer

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

The app will be available at `http://localhost:8080`

### Building for Production

```bash
# Create production build
pnpm run build

# Preview production build
pnpm run preview
```

## Usage

1. **Set Video Metadata**: Configure your video's overall style, environment, and camera settings
2. **Build Your Timeline**: Add segments with descriptions, timing, and transitions
3. **Preview & Export**: Review your YAML output and copy it for use with Veo3
4. **Save for Later**: Store your prompts locally for future use or iteration

## Tech Stack

- **React** + **TypeScript** for type-safe development
- **Vite** for lightning-fast builds
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible components
- **Framer Motion** for smooth animations

## Contributing

We welcome contributions! Whether it's bug fixes, new features, or documentation improvements, we'd love to have your help making Scene Composer better.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Reporting Issues

Found a bug or have a suggestion? Please [open an issue](https://github.com/yourusername/scene-composer/issues) with:

- A clear description of the problem or suggestion
- Steps to reproduce (if applicable)
- Expected vs actual behavior
- Screenshots if relevant

## Development

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines and architecture notes.

### Available Scripts

```bash
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run preview  # Preview production build
pnpm run lint     # Run ESLint
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Connect

Created by Shane Thomas

- 🌐 [scenecomposer.com](https://scenecomposer.com)
- 🐦 [@smthomas3](https://x.com/smthomas3)

---

⭐ If you find Scene Composer helpful, please consider giving it a star on GitHub!
