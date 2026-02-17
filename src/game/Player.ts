import * as THREE from 'three';

export interface PlayerInput {
    left: boolean;
    right: boolean;
    jump: boolean;
}

export class Player {
    public mesh: THREE.Mesh;
    private velocity: THREE.Vector3;
    private isJumping: boolean;
    private readonly speed: number = 5;
    private readonly jumpForce: number = 10;
    private readonly gravity: number = -30;
    private readonly groundY: number = -3.5;

    constructor(scene: THREE.Scene) {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green player
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.y = this.groundY;
        this.mesh.position.x = -4;

        this.velocity = new THREE.Vector3();
        this.isJumping = false;

        scene.add(this.mesh);
    }

    update(deltaTime: number, input: PlayerInput) {
        // Horizontal movement
        if (input.left) {
            this.mesh.position.x -= this.speed * deltaTime;
        }
        if (input.right) {
            this.mesh.position.x += this.speed * deltaTime;
        }

        // Clamp to screen bounds
        this.mesh.position.x = Math.max(-7, Math.min(7, this.mesh.position.x));

        // Jump
        if (input.jump && !this.isJumping) {
            this.velocity.y = this.jumpForce;
            this.isJumping = true;
        }

        // Gravity
        this.velocity.y += this.gravity * deltaTime;
        this.mesh.position.y += this.velocity.y * deltaTime;

        // Ground collision
        if (this.mesh.position.y <= this.groundY) {
            this.mesh.position.y = this.groundY;
            this.velocity.y = 0;
            this.isJumping = false;
        }
    }
}
