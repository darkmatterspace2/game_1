import * as THREE from 'three';
import { Level } from './Level';

export interface PlayerInput {
    left: boolean;
    right: boolean;
    jump: boolean;
}

export class Player {
    public mesh: THREE.Mesh;
    private velocity: THREE.Vector3;
    private isJumping: boolean;

    // Physics Config
    private readonly moveSpeed: number = 8;
    private readonly jumpForce: number = 16;
    private readonly gravity: number = -40;

    // Size config for AABB
    public readonly width: number = 1.0;
    public readonly height: number = 1.0;

    constructor(scene: THREE.Scene) {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('/player.svg');
        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            color: 0xffffff
        });
        this.mesh = new THREE.Mesh(geometry, material);

        // Spawn position
        this.mesh.position.set(-2, 0, 0);

        this.velocity = new THREE.Vector3();
        this.isJumping = true; // start in air

        scene.add(this.mesh);
    }

    update(deltaTime: number, input: PlayerInput, level: Level) {
        // --- HORIZONTAL MOVEMENT ---
        let dx = 0;
        if (input.left) dx -= this.moveSpeed * deltaTime;
        if (input.right) dx += this.moveSpeed * deltaTime;

        // Apply Horizontal and check collisions
        if (dx !== 0) {
            this.mesh.position.x += dx;
            const hCollisions = level.getCollidingBlocks(this.mesh.position.x, this.mesh.position.y, this.width, this.height);
            if (hCollisions.length > 0) {
                // Determine direction of collision
                const block = hCollisions[0];
                if (dx > 0) {
                    // Moving right, hit left side of block
                    this.mesh.position.x = block.x - block.width / 2 - this.width / 2 - 0.001;
                } else {
                    // Moving left, hit right side of block
                    this.mesh.position.x = block.x + block.width / 2 + this.width / 2 + 0.001;
                }
            }
        }

        // --- VERTICAL MOVEMENT ---
        // Gravity
        this.velocity.y += this.gravity * deltaTime;

        // Terminal velocity to prevent tunneling
        if (this.velocity.y < -20) {
            this.velocity.y = -20;
        }

        let dy = this.velocity.y * deltaTime;

        this.mesh.position.y += dy;
        const vCollisions = level.getCollidingBlocks(this.mesh.position.x, this.mesh.position.y, this.width, this.height);

        if (vCollisions.length > 0) {
            const block = vCollisions[0];
            if (this.velocity.y < 0) {
                // Falling down, hit top of block
                this.mesh.position.y = block.y + block.height / 2 + this.height / 2 + 0.001;
                this.velocity.y = 0;
                this.isJumping = false;
            } else if (this.velocity.y > 0) {
                // Jumping up, hit bottom of block
                this.mesh.position.y = block.y - block.height / 2 - this.height / 2 - 0.001;
                this.velocity.y = 0;
            }
        } else {
            // No ground underneath => we are in the air
            this.isJumping = true;
        }

        // --- JUMP ACTION ---
        if (input.jump && !this.isJumping) {
            this.velocity.y = this.jumpForce;
            this.isJumping = true;
        }

        // Death by falling out of world bounds
        if (this.mesh.position.y < -15) {
            // Reset to start for now
            this.mesh.position.set(-2, 4, 0);
            this.velocity.set(0, 0, 0);
        }
    }

    public bounce() {
        this.velocity.y = this.jumpForce * 0.8; // A slightly shorter bounce when jumping on enemies
        this.isJumping = true;
    }
}
