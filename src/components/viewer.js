/**
 * Three.js Scene Viewer
 * Manages the 3D scene, camera, lighting, and rendering
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneViewer {
    constructor(container) {
        this.container = container;
        this.userObjects = [];

        this.init();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        this.camera.position.set(5, 4, 8);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true // Required for screenshots
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 50;
        this.controls.target.set(0, 0, 0);

        // Lighting
        this.setupLighting();

        // Grid Helper
        this.setupGrid();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }

    setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        // Main directional light (key light)
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
        keyLight.position.set(5, 10, 7);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 0.1;
        keyLight.shadow.camera.far = 50;
        keyLight.shadow.camera.left = -10;
        keyLight.shadow.camera.right = 10;
        keyLight.shadow.camera.top = 10;
        keyLight.shadow.camera.bottom = -10;
        this.scene.add(keyLight);

        // Fill light (softer, from opposite side)
        const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
        fillLight.position.set(-5, 3, -5);
        this.scene.add(fillLight);

        // Rim light (backlight for edge definition)
        const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.2);
        rimLight.position.set(0, 5, -10);
        this.scene.add(rimLight);
    }

    setupGrid() {
        // Main grid
        const gridHelper = new THREE.GridHelper(20, 20, 0x444466, 0x333344);
        gridHelper.position.y = -0.01;
        this.scene.add(gridHelper);

        // Ground plane for shadows
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    /**
     * Add a 3D object to the scene
     * @param {THREE.Object3D} object - The object to add
     */
    addObject(object) {
        if (!(object instanceof THREE.Object3D)) {
            console.error('Invalid object type');
            return;
        }

        // Enable shadows
        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.scene.add(object);
        this.userObjects.push(object);

        // Center camera on new object
        this.focusOnObject(object);
    }

    /**
     * Focus camera on an object
     * @param {THREE.Object3D} object - Object to focus on
     */
    focusOnObject(object) {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Calculate optimal camera distance
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 2.5;

        // Animate camera to new position
        const targetPosition = new THREE.Vector3(
            center.x + distance * 0.6,
            center.y + distance * 0.4,
            center.z + distance * 0.6
        );

        // Update controls target
        this.controls.target.copy(center);
        this.camera.position.copy(targetPosition);
        this.controls.update();
    }

    /**
     * Clear all user objects from scene
     */
    clearUserObjects() {
        this.userObjects.forEach(obj => {
            this.disposeObject(obj);
            this.scene.remove(obj);
        });
        this.userObjects = [];
    }

    /**
     * Properly dispose of Three.js object (prevent memory leaks)
     * @param {THREE.Object3D} object - Object to dispose
     */
    disposeObject(object) {
        object.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => this.disposeMaterial(mat));
                } else {
                    this.disposeMaterial(child.material);
                }
            }
        });
    }

    disposeMaterial(material) {
        if (material.map) material.map.dispose();
        if (material.lightMap) material.lightMap.dispose();
        if (material.bumpMap) material.bumpMap.dispose();
        if (material.normalMap) material.normalMap.dispose();
        if (material.specularMap) material.specularMap.dispose();
        if (material.envMap) material.envMap.dispose();
        material.dispose();
    }

    /**
     * Reset camera to default position
     */
    resetCamera() {
        this.camera.position.set(5, 4, 8);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    /**
     * Handle window resize
     */
    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    /**
     * Take a screenshot of the current scene
     * @returns {string} Data URL of the screenshot
     */
    takeScreenshot() {
        this.renderer.render(this.scene, this.camera);
        return this.renderer.domElement.toDataURL('image/png');
    }

    /**
     * Get all user objects for export
     * @returns {THREE.Object3D[]}
     */
    getUserObjects() {
        return this.userObjects;
    }

    /**
     * Get the scene for export
     * @returns {THREE.Scene}
     */
    getScene() {
        return this.scene;
    }

    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.clearUserObjects();
        this.renderer.dispose();
        this.controls.dispose();
        window.removeEventListener('resize', this.onResize);
    }
}
