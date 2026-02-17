# Beginner's Guide to Adventure Land Code 🎮

Welcome! This guide will help you understand how "Adventure Land" works and how you can customize it, even if you're new to JavaScript and Game Development.

## 1. How the Game Works (The Big Picture)

Games run in a **Loop**. Imagine a flipbook animation:
1.  **Update**: Move characters, check if they hit something, or if a button was pressed.
2.  **Render**: Draw the scene to the screen.
3.  **Repeat**: Do this 60 times every second!

In our project, [SceneManager.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/SceneManager.ts) is the "Director". It sets up the stage (Scene), camera, and runs this loop in the [animate()](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/SceneManager.ts#164-173) function.

## 2. Project Structure
- **[src/main.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/main.ts)**: The starting point. It just loads the [SceneManager](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/SceneManager.ts#6-223).
- **[src/game/SceneManager.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/SceneManager.ts)**: The "Brain" of the game. Handles the score, game over state, and tells the Player and Obstacles when to move.
- **[src/game/Player.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/Player.ts)**: The code for your character (movement, jumping).
- **[src/game/Obstacle.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/Obstacle.ts)**: The code for the red blocks.
- **[src/game/Collision.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/Collision.ts)**: The referee that decides if you hit an obstacle.

---

## 3. How to Change the Player Image 🖼️

Right now, the player is just a green square (`MeshBasicMaterial` with color). To use an image (like a specialized sprite), you need to use a **Texture**.

**Steps:**
1.  Put your image file (e.g., `player.png`) inside the `public/` folder.
2.  Open [src/game/Player.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/Player.ts).
3.  Find the [constructor](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/Obstacle.ts#8-21) where we create the `material`.
4.  Change it to load a texture:

```typescript
// OLD CODE (Green Color)
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// NEW CODE (Image Texture)
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/player.png'); // Path starts from public/
const material = new THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true // Important if your PNG has a transparent background!
});
```

## 4. How Obstacles Work & Customizing Them 🧱

Obstacles are created in [src/game/Obstacle.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/Obstacle.ts). They are similar to the player.

**To make them look different:**
You can do the same texture trick as the player if you want image obstacles (like spikes or rocks).

**To change their size or speed:**
Look at the [constructor](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/Obstacle.ts#8-21) in [Obstacle.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/Obstacle.ts):
```typescript
const width = 0.8 + Math.random() * 0.5; // Random width
const height = 0.8 + Math.random() * 1.0; // Random height
```
Change these numbers to make them huge or tiny!

## 5. Understanding Collision (The "Hit" Logic) 💥

How do we know if the player hits a block? We use **Bounding Boxes**.

Imagine an invisible box wrapped tightly around the player and another one around the obstacle.
In [src/game/Collision.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/Collision.ts):
```typescript
const box1 = new THREE.Box3().setFromObject(mesh1);
const box2 = new THREE.Box3().setFromObject(mesh2);
return box1.intersectsBox(box2); // Returns TRUE if boxes touch
```
This is called **AABB Collision** (Axis-Aligned Bounding Box). It's very fast and great for simple shapes.

**Pro Tip:**
If your player image has a lot of empty space around it, the collision might feel "unfair" (you die without touching the visible part).
*   **Fix:** Crop your images tightly!
*   **Advanced Fix:** Make the collision box smaller than the visible mesh.

## 6. How to Tweak Gameplay ⚙️

Go to [src/game/SceneManager.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/SceneManager.ts) to change the game feel.

*   **Game Speed**: Look for `this.speedMultiplier` in the [update](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/SceneManager.ts#174-209) function.
*   **Gravity**: Go to [src/game/Player.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/Player.ts) and change `private readonly gravity = -30;`. Lower number (e.g., -50) = heavier fall. Higher number (e.g., -10) = floaty moon gravity.
*   **Jump Height**: Change `jumpForce` in [Player.ts](file:///d:/projects_2/AI_vibe_code_antigravity/game_1/src/game/Player.ts).

## Summary
1.  **SceneManager** loops the game.
2.  **TextureLoader** loads images.
3.  **Box3** checks for collisions.
4.  **Variables** control speed and gravity.

Have fun experimenting! Try changing one number at a time and see what happens. 🚀
