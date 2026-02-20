import * as THREE from 'three';

export enum BlockType {
    EMPTY,
    GROUND,
    BRICK,
    ITEM
}

export interface Block {
    x: number;
    y: number;
    width: number;
    height: number;
    type: BlockType;
    mesh: THREE.Mesh | null;
}

export interface EnemySpawn {
    x: number;
    y: number;
}

export class Level {
    public blocks: Block[] = [];
    public initialEnemies: EnemySpawn[] = [];
    private scene: THREE.Scene;
    private textureLoader = new THREE.TextureLoader();

    private groundMaterial: THREE.MeshBasicMaterial;
    private brickMaterial: THREE.MeshBasicMaterial;
    private itemMaterial: THREE.MeshBasicMaterial;

    private readonly blockSize = 1;

    // . = Empty
    // G = Ground
    // B = Brick
    // ? = Item Block
    // E = Enemy
    private readonly defaultMap: string[] = [
        "..................................................",
        "..................................................",
        "..................................................",
        "..................................................",
        "..................................................",
        "..........................????....................",
        "..................................................",
        "..................B?B.............................",
        ".......................................B...B......",
        "........?.............................B.....B.....",
        "........................E............B...E...B....",
        "..................GG.................B.......B....",
        "GGGGGGGGGGGGGGGGGGGGGGGGGG....GGGGGGGGGGGGGGGGGGGG",
        "GGGGGGGGGGGGGGGGGGGGGGGGGG....GGGGGGGGGGGGGGGGGGGG"
    ];

    constructor(scene: THREE.Scene) {
        this.scene = scene;

        // Load textures
        this.groundMaterial = new THREE.MeshBasicMaterial({ map: this.textureLoader.load('/block_ground.svg'), transparent: true });
        this.brickMaterial = new THREE.MeshBasicMaterial({ map: this.textureLoader.load('/block_brick.svg'), transparent: true });
        this.itemMaterial = new THREE.MeshBasicMaterial({ map: this.textureLoader.load('/block_item.svg'), transparent: true });

        this.parseMap(this.defaultMap);
    }

    private parseMap(map: string[]) {
        const rows = map.length;
        const startY = 8; // Top of the map coordinate 

        for (let r = 0; r < rows; r++) {
            const rowStr = map[r];
            for (let c = 0; c < rowStr.length; c++) {
                const char = rowStr[c];

                // Map screen coordinates: 
                // X = c * blockSize (starting near 0 or -5)
                // Y = startY - r * blockSize (going downwards)
                const x = c * this.blockSize - 5; // Start a bit to the left
                const y = startY - r * this.blockSize;

                let type = BlockType.EMPTY;
                let material: THREE.MeshBasicMaterial | null = null;

                if (char === 'G') {
                    type = BlockType.GROUND;
                    material = this.groundMaterial;
                } else if (char === 'B') {
                    type = BlockType.BRICK;
                    material = this.brickMaterial;
                } else if (char === '?') {
                    type = BlockType.ITEM;
                    material = this.itemMaterial;
                } else if (char === 'E') {
                    this.initialEnemies.push({ x, y });
                    continue; // Enemies are fully dynamic, parsed separately
                }

                if (type !== BlockType.EMPTY && material) {
                    const geometry = new THREE.PlaneGeometry(this.blockSize, this.blockSize);
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set(x, y, 0);
                    this.scene.add(mesh);

                    this.blocks.push({
                        x, y,
                        width: this.blockSize,
                        height: this.blockSize,
                        type,
                        mesh
                    });
                }
            }
        }
    }

    public getCollidingBlocks(px: number, py: number, pWidth: number, pHeight: number): Block[] {
        const colliding: Block[] = [];
        for (const b of this.blocks) {
            // AABB Collision
            const bLeft = b.x - b.width / 2;
            const bRight = b.x + b.width / 2;
            const bBottom = b.y - b.height / 2;
            const bTop = b.y + b.height / 2;

            const pLeft = px - pWidth / 2;
            const pRight = px + pWidth / 2;
            const pBottom = py - pHeight / 2;
            const pTop = py + pHeight / 2;

            if (pLeft < bRight && pRight > bLeft && pBottom < bTop && pTop > bBottom) {
                colliding.push(b);
            }
        }
        return colliding;
    }
}
