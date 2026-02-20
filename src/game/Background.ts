import * as THREE from 'three';

const CONFIG = {
    SKY: {
        Y: 3.0,      // Up/Down
        Z: -5,     // Depth
        SCALE_X: 40,
        SCALE_Y: 22.5 // Maintains 16:9 ratio
    },
    MOUNTAINS: {
        Y: 1.0,     // Align perfectly below sky / overlap ground
        Z: -2,     // Depth
        SCALE_Y: 10, // Height
        SPEED: 0.02
    },
    GROUND: {
        Y: -7.0,     // Up/Down: mesh ranges from -10 to -4. Lines up behind physical blocks at Y=-4.
        Z: -1,     // Depth
        WIDTH: 40,
        HEIGHT: 6,
        SPEED: 0.2
    }
};

export class Background {
    private layers: THREE.Mesh[] = [];
    private sky: THREE.Mesh;

    constructor(scene: THREE.Scene) {
        const loader = new THREE.TextureLoader();

        // Sky (Static)
        const skyGeo = new THREE.PlaneGeometry(CONFIG.SKY.SCALE_X, CONFIG.SKY.SCALE_Y);
        const skyMat = new THREE.MeshBasicMaterial({ map: loader.load('/sky.svg') });
        this.sky = new THREE.Mesh(skyGeo, skyMat);
        this.sky.position.set(0, CONFIG.SKY.Y, CONFIG.SKY.Z);
        scene.add(this.sky);

        // Mountains (Slow Parallax) ratio 1024x512 = 2
        // We want repeat proportional to width / (height * 2) = 40 / (12 * 2) = 1.666
        this.createLayer(scene, '/mountain.svg', CONFIG.MOUNTAINS.Z, CONFIG.MOUNTAINS.SCALE_Y, CONFIG.MOUNTAINS.Y, 40 / (CONFIG.MOUNTAINS.SCALE_Y * 2));

        // Ground (Fast Parallax) matches format ratio 1024x512 = 2
        // We want repeat proportional to width / (height * 2) = 40 / (6 * 2) = 3.333
        const groundTex = loader.load('/ground.svg');
        groundTex.wrapS = THREE.RepeatWrapping;
        groundTex.repeat.set(CONFIG.GROUND.WIDTH / (CONFIG.GROUND.HEIGHT * 2), 1);

        const groundGeo = new THREE.PlaneGeometry(CONFIG.GROUND.WIDTH, CONFIG.GROUND.HEIGHT);
        const groundMat = new THREE.MeshBasicMaterial({ map: groundTex, transparent: true });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.set(0, CONFIG.GROUND.Y, CONFIG.GROUND.Z);
        scene.add(ground);
        this.layers.push(ground);
    }

    private createLayer(scene: THREE.Scene, url: string, z: number, scaleY: number, y: number, repeatX: number) {
        const loader = new THREE.TextureLoader();
        const tex = loader.load(url);
        tex.wrapS = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, 1);

        const geo = new THREE.PlaneGeometry(40, scaleY);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, y, z);
        scene.add(mesh);
        this.layers.push(mesh);
    }

    update(cameraX: number) {
        // Sky tracks camera exactly (infinite distance)
        this.sky.position.x = cameraX;

        // Mountains track camera, texture offsets slightly for parallax
        if (this.layers[0]) {
            this.layers[0].position.x = cameraX;
            const mtTex = (this.layers[0].material as THREE.MeshBasicMaterial).map;
            if (mtTex) mtTex.offset.x = cameraX * 0.015;
        }

        // Ground track camera, texture offsets for mid-ground depth
        if (this.layers[1]) {
            this.layers[1].position.x = cameraX;
            const groundTex = (this.layers[1].material as THREE.MeshBasicMaterial).map;
            if (groundTex) groundTex.offset.x = cameraX * 0.05;
        }
    }
}
