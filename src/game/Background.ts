import * as THREE from 'three';

export class Background {
    private layers: THREE.Mesh[] = [];
    private sky: THREE.Mesh;

    constructor(scene: THREE.Scene) {
        const loader = new THREE.TextureLoader();

        // Sky (Static)
        const skyGeo = new THREE.PlaneGeometry(30, 20);
        const skyMat = new THREE.MeshBasicMaterial({ map: loader.load('/sky.svg') });
        this.sky = new THREE.Mesh(skyGeo, skyMat);
        this.sky.position.z = -5;
        scene.add(this.sky);

        // Mountains (Slow Parallax)
        this.createLayer(scene, '/mountain.svg', -2, 4, -4);

        // Ground (Fast - matches game speed)
        // We create a tiling ground
        const groundTex = loader.load('/ground.svg');
        groundTex.wrapS = THREE.RepeatWrapping;
        groundTex.wrapT = THREE.RepeatWrapping;
        groundTex.repeat.set(20, 1);

        const groundGeo = new THREE.PlaneGeometry(40, 4);
        const groundMat = new THREE.MeshBasicMaterial({ map: groundTex });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.set(0, -6, -1);
        scene.add(ground);
        this.layers.push(ground);
    }

    private createLayer(scene: THREE.Scene, url: string, z: number, scaleY: number, y: number) {
        const loader = new THREE.TextureLoader();
        const tex = loader.load(url);
        // tex.wrapS = THREE.RepeatWrapping; 
        // Simple 2-panel loop strategy often better for non-tiling images, 
        // but for mountains let's just stretch a big plane for now or use repeat if the SVG allows.
        // Our SVG is simple, let's try repeat.
        tex.wrapS = THREE.RepeatWrapping;
        tex.repeat.set(3, 1);

        const geo = new THREE.PlaneGeometry(40, scaleY);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, y, z);
        scene.add(mesh);
        this.layers.push(mesh);
    }

    update(deltaTime: number, speed: number) {
        // Ground is index 1 (last added)
        if (this.layers[1]) {
            const groundTex = (this.layers[1].material as THREE.MeshBasicMaterial).map;
            if (groundTex) groundTex.offset.x += 0.2 * deltaTime * speed;
        }

        // Mountains index 0
        if (this.layers[0]) {
            const mtTex = (this.layers[0].material as THREE.MeshBasicMaterial).map;
            if (mtTex) mtTex.offset.x += 0.02 * deltaTime * speed;
        }
    }
}
