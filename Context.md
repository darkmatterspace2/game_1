Build a beginner-friendly 2D PWA (Progressive Web App) game using Three.js with the following full tech stack and requirements.

---

# 🎮 Project Goal

Create a simple 2D side-scroll style game (basic player movement + obstacles + score counter) using Three.js in 2D mode.

The game must:

* Run in browser but PWA (Progressive Web App) which can also in android, IOS, windows, mac Cross Platform
* Be structured as a Progressive Web App (PWA)
* Be optimized for mobile
* Be deployable to Vercel

---

# 🧱 Required Tech Stack

Use exactly this stack:

* Core rendering engine: Three.js
* Language: TypeScript
* Build tool: Vite
* PWA plugin: vite-plugin-pwa
* Hosting target: Vercel

Do NOT use Phaser or other game engines.

---

# 🕹 Game Requirements

Create a very simple beginner-level 2D game:

### Scene Setup

* Use OrthographicCamera (true 2D projection)
* Flat colored background
* Player = simple square (Mesh + PlaneGeometry)
* Obstacles = moving rectangles
* Basic lighting not required

### Controls

* Arrow keys OR touch controls for mobile
* Player moves left and right
* Optional jump mechanic (basic)

### Mechanics

* Obstacles move toward player
* Collision detection (simple bounding box)
* Score increases over time
* Game Over screen
* Restart button

---

# 🧩 Code Architecture

Structure project cleanly:

src/

* main.ts
* game/

  * SceneManager.ts
  * Player.ts
  * Obstacle.ts
  * Collision.ts
* styles.css
* vite.config.ts

Use modular architecture (no single huge file).

---

# 📱 PWA Requirements

* Add manifest.json
* Add service worker via vite-plugin-pwa
* Must be installable on Android
* Works offline after first load
* Add app icons (placeholder SVG or PNG)

---

# ⚡ Optimization

* Keep bundle size minimal
* Use ES modules
* Avoid unnecessary dependencies
* Mobile responsive canvas
* Use requestAnimationFrame properly

---

# 🚀 Deployment Setup

Include:

* Proper Vite config
* Vercel-compatible project structure
* Build command: npm run build
* Output directory: dist

---

# 📦 Deliverables

Generate:

1. Full project structure
2. All source code files
3. package.json
4. Vite config
5. PWA config
6. Simple README with:

   * How to run locally
   * How to build
   * How to deploy to Vercel

---

Keep the game simple, clean, and beginner-friendly. Avoid overengineering.

**PROMPT END**

---

