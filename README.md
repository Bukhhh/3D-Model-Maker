# 🔷 3D Forge

> **AI-powered 3D model generator** — Describe what you want, watch it come to life.

![3D Forge Demo](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## ✨ What is 3D Forge?

3D Forge is a web-based chatbot that generates **real 3D models** from natural language descriptions. Simply describe what you want — "Create a red cube" or "Build a snowman" — and watch it render instantly in your browser.

### Key Features

- 💬 **Natural Language Input** — Describe 3D objects in plain English
- ⚡ **Real-time Rendering** — Instant Three.js visualization
- 🔄 **Interactive Viewer** — Rotate, zoom, and pan with mouse controls
- 📥 **Export Options** — Download as GLTF, OBJ, or PNG screenshot
- 🔒 **Secure** — API keys never exposed to frontend

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [OpenRouter API Key](https://openrouter.ai/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/3d-forge.git
cd 3d-forge

# Install dependencies
npm install

# Configure API key
cp .env.example .env
# Edit .env and add your OpenRouter API key
```

### Run

```bash
# Start both servers
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🎮 Usage

| Try This Prompt | Result |
|-----------------|--------|
| `Create a red cube` | Red box geometry |
| `Make a blue sphere` | Blue sphere |
| `Build a snowman` | 3 stacked white spheres |
| `Create a green cylinder on a yellow platform` | Composite object |

### Controls

- **Left-click + Drag** — Rotate view
- **Scroll** — Zoom in/out
- **Right-click + Drag** — Pan

### Export

| Button | Format |
|--------|--------|
| GLTF | Industry-standard 3D format |
| OBJ | Legacy geometry format |
| PNG | Screenshot of current view |

---

## 🏗️ Project Structure

```
├── server.js           # Express backend (API proxy)
├── index.html          # Main entry
├── src/
│   ├── main.js         # App orchestration
│   ├── styles/main.css # Dark UI theme
│   ├── components/
│   │   ├── chat.js     # Chat interface
│   │   └── viewer.js   # Three.js scene
│   ├── services/
│   │   └── api.js      # Backend communication
│   └── utils/
│       ├── sandbox.js  # Code validation
│       └── exporters.js# Export utilities
└── .env                # API key (not committed)
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key |

### Change AI Model

Edit `server.js` line 69:
```javascript
model: 'google/gemini-3-flash-preview',  // or any OpenRouter model
```

---

## 🛡️ Security

- ✅ API key stored server-side only
- ✅ Generated code validated before execution
- ✅ 18 dangerous patterns blocked (eval, fetch, document, etc.)

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📝 License

MIT © 2024

---

<p align="center">
  Made with ◈ by <a href="https://github.com/yourusername">Your Name</a>
</p>
