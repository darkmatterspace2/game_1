import * as THREE from 'three';

export class Obstacle {
    public mesh: THREE.Mesh;
    public active: boolean = true;
    private readonly baseSpeed: number = 3;

    constructor(scene: THREE.Scene, x: number, y: number) {
        const width = 0.4 + Math.random() * 0.5;
        const height = 0.4 + Math.random() * 1.0;
        const geometry = new THREE.PlaneGeometry(width, height);

        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('/obstacle.svg');
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            color: 0xffffff
        });
        this.mesh = new THREE.Mesh(geometry, material);

        // Pivot is center by default. Position y needs to be half height + ground level to sit on ground.
        // Assuming groundY passed in 'y' is the bottom.
        this.mesh.position.set(x, y + height / 2, 0);

        scene.add(this.mesh);
    }

    update(deltaTime: number, difficultyMultiplier: number) {
        this.mesh.position.x -= (this.baseSpeed * difficultyMultiplier) * deltaTime;

        if (this.mesh.position.x < -10) {
            this.active = false;
        }
    }

    remove(scene: THREE.Scene) {
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        (this.mesh.material as THREE.Material).dispose();
    }
}
