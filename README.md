<div align="center">

# Smart Lipsum

**The fastest way to generate placeholder text in Chrome.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-6366F1.svg)](https://github.com/AlexBatok/lorem-ipsum)

</div>

---

Smart Lipsum is a lightweight Chrome extension that generates placeholder text instantly via popup, right-click context menu, and keyboard shortcut. It always copies clean plain text (no rich text formatting issues), requires only minimal browser permissions, and works 100% offline with zero data collection. Built with TypeScript and Manifest V3, the total extension size is under 50KB with zero external dependencies.

## Features

- **Three input methods** — popup interface, right-click context menu, keyboard shortcut (Ctrl+Shift+L)
- **Paragraphs, sentences, or words** — choose your unit and exact count (1–99 paragraphs, 1–9999 words)
- **Always plain text** — no rich text formatting, pastes cleanly into code editors and CMS
- **Optional HTML wrapping** — `<p>`, `<li>`, `<h1>`–`<h3>` tags for quick prototyping
- **3 customizable presets** — save and switch between favorite configurations
- **Auto-copy** — optionally skip the Copy button entirely
- **Dark mode** — auto/light/dark theme that matches your browser
- **Settings sync** — preferences follow you across Chrome browsers
- **Under 50KB** — installs instantly, zero memory usage when idle

## Installation

### Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store listing](https://chrome.google.com/webstore/detail/EXTENSION_ID) *(coming soon)*
2. Click **"Add to Chrome"**
3. Click the extension icon or press **Ctrl+Shift+L** to generate text

### Manual Installation (Developer Mode)

1. Clone the repository: `git clone https://github.com/AlexBatok/lorem-ipsum.git`
2. Run `npm install && npm run build`
3. Open `chrome://extensions/` and enable **Developer mode**
4. Click **"Load unpacked"** and select the `extension/` folder

## Keyboard Shortcut

| Action | Windows/Linux | Mac |
|--------|:---:|:---:|
| Generate & copy lorem ipsum | `Ctrl+Shift+L` | `Cmd+Shift+L` |

Customize in Chrome → Extensions → Keyboard Shortcuts.

## Privacy

Smart Lipsum collects **zero user data**. It makes no network requests, includes no analytics or tracking, and works 100% offline. The only stored data is your personal preferences (theme, count, presets), saved locally via Chrome's sync storage. Full [privacy policy](docs/privacy-policy.md).

## Tech Stack

- TypeScript + esbuild
- Chrome Manifest V3
- Zero external dependencies
- Total size: <50KB

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Make your changes and run `npm run build`
4. Submit a pull request

## License

[MIT](LICENSE)
