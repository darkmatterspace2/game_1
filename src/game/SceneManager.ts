import * as THREE from 'three';
import { Player } from './Player';
import { Obstacle } from './Obstacle';
import { checkCollision } from './Collision';
import { Background } from './Background';

export class SceneManager {
    private scene: THREE.Scene;
    private camera: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private lastTime: number = 0;

    // Game Entities
    private player: Player;
    private background: Background;
    private obstacles: Obstacle[] = [];

    // Game State
    private gameActive: boolean = false;
    private score: number = 0;
    private speedMultiplier: number = 1;
    private spawnTimer: number = 0;

    // Inputs
    private input = { left: false, right: false, jump: false };

    constructor(container: HTMLElement) {
        // --- Three.js Setup ---
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x202020);

        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 10;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            0.1,
            1000
        );
        this.camera.position.z = 10;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', this.onWindowResize.bind(this));

        // --- Game Setup ---
        this.background = new Background(this.scene);
        this.player = new Player(this.scene);
        this.setupInputs();
        this.setupUI();

        // Start Loop
        this.animate(0);
    }

    private setupInputs() {
        // Keyboard
        window.addEventListener('keydown', (e) => this.handleKey(e, true));
        window.addEventListener('keyup', (e) => this.handleKey(e, false));

        // Basic Touch Controls
        window.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: false });
        window.addEventListener('touchend', (e) => this.handleTouch(e));
        window.addEventListener('touchcancel', (e) => this.handleTouch(e));
    }

    private handleKey(e: KeyboardEvent, pressed: boolean) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = pressed;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = pressed;
        if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') this.input.jump = pressed;
    }

    private handleTouch(e: TouchEvent) {
        // Prevent default browser zooming/scrolling
        // e.preventDefault(); // Note: might block click events on UI buttons if not careful, but usually needed for games.
        // Actually, we should be careful with e.preventDefault() on the whole window if we have UI buttons.
        // But for gameplay controls, we need it. 
        // Best ensures UI buttons (restart) still work if they are on top.

        const width = window.innerWidth;
        const halfWidth = width / 2;
        const quarterWidth = width / 4;

        // Reset inputs based on active touches
        this.input.left = false;
        this.input.right = false;
        this.input.jump = false;

        // Iterate through all active touches
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const x = touch.clientX;

            if (x > halfWidth) {
                // Right Half -> Jump
                this.input.jump = true;
            } else {
                // Left Half -> Movement
                if (x < quarterWidth) {
                    // Left 25% -> Move Left
                    this.input.left = true;
                } else {
                    // 25-50% -> Move Right
                    this.input.right = true;
                }
            }
        }
    }

    private setupUI() {
        // Bind Restart Button
        const btn = document.getElementById('restart-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Auto start
        this.startGame();
    }

    private startGame() {
        this.gameActive = true;
        this.score = 0;
        this.speedMultiplier = 1;
        this.spawnTimer = 0;

        // Reset Player
        // Re-creating player or resetting position might be cleaner. 
        // For now, hard reset pos.
        this.player.mesh.position.set(-4, -3.5, 0);

        // Clear obstacles
        this.obstacles.forEach(o => o.remove(this.scene));
        this.obstacles = [];

        // UI
        this.updateScoreUI();
        const go = document.getElementById('game-over');
        if (go) go.style.display = 'none';

        // Resume loop if paused?
        this.lastTime = performance.now();
    }

    private gameOver() {
        this.gameActive = false;
        const go = document.getElementById('game-over');
        if (go) go.style.display = 'block';
        const finalScore = document.getElementById('final-score');
        if (finalScore) finalScore.innerText = `Final Score: ${Math.floor(this.score)}`;
    }

    private updateScoreUI() {
        const el = document.getElementById('score');
        if (el) el.innerText = `Score: ${Math.floor(this.score)}`;
    }

    private onWindowResize(): void {
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 10;

        this.camera.left = frustumSize * aspect / -2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = frustumSize / -2;

        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private animate(time: number): void {
        requestAnimationFrame(this.animate.bind(this));

        const deltaTime = Math.min((time - this.lastTime) / 1000, 0.1); // Cap dt
        this.lastTime = time;

        this.update(deltaTime);
        this.render();
    }

    private update(deltaTime: number): void {
        if (!this.gameActive) return;

        // Difficulty & Score
        this.speedMultiplier += deltaTime * 0.02;
        this.score += deltaTime * 10;
        this.updateScoreUI();

        // Background
        this.background.update(deltaTime, this.speedMultiplier);

        // Player
        this.player.update(deltaTime, this.input);

        // Obstacles
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            this.spawnObstacle();
            // Spawn rate gets faster as speed increases
            this.spawnTimer = (1.5 + Math.random() * 1.5) / (this.speedMultiplier * 0.8);
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.update(deltaTime, this.speedMultiplier);

            // Collision
            if (checkCollision(this.player.mesh, obs.mesh)) {
                this.gameOver();
            }

            // Clean up
            if (!obs.active) {
                obs.remove(this.scene);
                this.obstacles.splice(i, 1);
            }
        }
    }

    private spawnObstacle() {
        // Spawn from right edge
        // Camera width is approx 10 * aspect. 
        // Let's spawn at x = 15 to be safe
        const spawnX = 15;
        const spawnY = -4; // Ground levelish
        this.obstacles.push(new Obstacle(this.scene, spawnX, spawnY));
    }

    private render(): void {
        this.renderer.render(this.scene, this.camera);
    }
}
