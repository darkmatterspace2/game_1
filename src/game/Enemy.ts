import * as THREE from 'three';
import { Level } from './Level';

export class Enemy {
    public mesh: THREE.Mesh;
    private velocity: THREE.Vector3;

    // Physics Config
    private readonly moveSpeed: number = 2;
    private readonly gravity: number = -40;

    // Size config for AABB
    public readonly width: number = 1.0;
    public readonly height: number = 1.0;

    public active: boolean = true;
    private direction: number = -1; // -1 for left, 1 for right

    constructor(scene: THREE.Scene, x: number, y: number) {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('/enemy.svg');
        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            color: 0xffffff
        });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.set(x, y, 0);
        this.velocity = new THREE.Vector3();

        scene.add(this.mesh);
    }

    update(deltaTime: number, level: Level) {
        if (!this.active) return;

        // Horiz Movement
        let dx = this.moveSpeed * this.direction * deltaTime;
        this.mesh.position.x += dx;

        const hCollisions = level.getCollidingBlocks(this.mesh.position.x, this.mesh.position.y, this.width, this.height);
        if (hCollisions.length > 0) {
            // Reverse direction if hitting a wall
            this.direction *= -1;
            const block = hCollisions[0];
            if (dx > 0) {
                this.mesh.position.x = block.x - block.width / 2 - this.width / 2 - 0.001;
            } else {
                this.mesh.position.x = block.x + block.width / 2 + this.width / 2 + 0.001;
            }
        }

        // Gravity
        this.velocity.y += this.gravity * deltaTime;

        if (this.velocity.y < -20) {
            this.velocity.y = -20;
        }

        let dy = this.velocity.y * deltaTime;

        this.mesh.position.y += dy;
        const vCollisions = level.getCollidingBlocks(this.mesh.position.x, this.mesh.position.y, this.width, this.height);

        if (vCollisions.length > 0) {
            const block = vCollisions[0];
            if (this.velocity.y < 0) {
                // Falling -> Land
                this.mesh.position.y = block.y + block.height / 2 + this.height / 2 + 0.001;
                this.velocity.y = 0;
            } else if (this.velocity.y > 0) {
                // Hitting ceiling
                this.mesh.position.y = block.y - block.height / 2 - this.height / 2 - 0.001;
                this.velocity.y = 0;
            }
        }

        // Death by falling off map
        if (this.mesh.position.y < -15) {
            this.active = false;
        }
    }

    die(scene: THREE.Scene) {
        this.active = false;
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        (this.mesh.material as THREE.Material).dispose();
    }
}
