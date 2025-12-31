/**
 * Export Utilities - GLTF, OBJ, and Screenshot exports
 */

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import * as THREE from 'three';

/**
 * Export scene to GLTF format
 * @param {THREE.Scene} scene - The scene to export
 * @param {string} filename - Output filename (without extension)
 */
export function exportGLTF(scene, filename = '3d-model') {
    const exporter = new GLTFExporter();

    // Create a temporary group with only user objects
    const exportScene = new THREE.Scene();
    scene.children.forEach(child => {
        // Skip helpers and lights
        if (child.isGridHelper || child.isLight || child.isShadowMaterial) return;
        if (child.material && child.material.isShadowMaterial) return;

        // Clone user objects
        if (child.isMesh || child.isGroup) {
            const clone = child.clone();
            exportScene.add(clone);
        }
    });

    exporter.parse(
        exportScene,
        (gltf) => {
            const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
            downloadBlob(blob, `${filename}.gltf`);
        },
        (error) => {
            console.error('GLTF export error:', error);
            throw new Error('Failed to export GLTF');
        },
        { binary: false }
    );
}

/**
 * Export scene to OBJ format
 * @param {THREE.Scene} scene - The scene to export
 * @param {string} filename - Output filename (without extension)
 */
export function exportOBJ(scene, filename = '3d-model') {
    const exporter = new OBJExporter();

    // Create export scene with only meshes
    const exportScene = new THREE.Scene();
    scene.children.forEach(child => {
        if (child.isGridHelper || child.isLight) return;
        if (child.material && child.material.isShadowMaterial) return;

        if (child.isMesh || child.isGroup) {
            const clone = child.clone();
            exportScene.add(clone);
        }
    });

    const result = exporter.parse(exportScene);
    const blob = new Blob([result], { type: 'text/plain' });
    downloadBlob(blob, `${filename}.obj`);
}

/**
 * Download screenshot as PNG
 * @param {string} dataUrl - Base64 data URL
 * @param {string} filename - Output filename
 */
export function downloadScreenshot(dataUrl, filename = 'screenshot') {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.png`;
    link.click();
}

/**
 * Helper function to download a blob
 * @param {Blob} blob - The blob to download
 * @param {string} filename - Output filename
 */
function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
