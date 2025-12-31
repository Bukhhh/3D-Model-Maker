/**
 * 3D Forge - Main Application Entry
 * Connects all components together
 */

import { SceneViewer } from './components/viewer.js';
import { ChatComponent } from './components/chat.js';
import { generateCode } from './services/api.js';
import { executeThreeJSCode, cleanCode } from './utils/sandbox.js';
import { exportGLTF, exportOBJ, downloadScreenshot } from './utils/exporters.js';

class App {
    constructor() {
        this.viewer = null;
        this.chat = null;
        this.init();
    }

    init() {
        // Initialize 3D Viewer
        const viewerContainer = document.getElementById('viewerContainer');
        this.viewer = new SceneViewer(viewerContainer);

        // Initialize Chat
        this.chat = new ChatComponent({
            messagesContainer: document.getElementById('chatMessages'),
            input: document.getElementById('chatInput'),
            sendBtn: document.getElementById('sendBtn'),
            onSendMessage: (message) => this.handleGenerate(message)
        });

        // Bind toolbar buttons
        this.bindToolbar();

        // Hide overlay initially to show the empty scene
        // We'll show it again only when needed
        console.log('🚀 3D Forge initialized');
    }

    bindToolbar() {
        // Reset Camera
        document.getElementById('resetCameraBtn').addEventListener('click', () => {
            this.viewer.resetCamera();
        });

        // Clear Scene
        document.getElementById('clearSceneBtn').addEventListener('click', () => {
            this.viewer.clearUserObjects();
            this.showOverlay();
        });

        // Download GLTF
        document.getElementById('downloadGltfBtn').addEventListener('click', () => {
            if (this.viewer.getUserObjects().length === 0) {
                alert('No objects to export. Create something first!');
                return;
            }
            try {
                exportGLTF(this.viewer.getScene(), '3d-forge-model');
            } catch (error) {
                alert('Export failed: ' + error.message);
            }
        });

        // Download OBJ
        document.getElementById('downloadObjBtn').addEventListener('click', () => {
            if (this.viewer.getUserObjects().length === 0) {
                alert('No objects to export. Create something first!');
                return;
            }
            try {
                exportOBJ(this.viewer.getScene(), '3d-forge-model');
            } catch (error) {
                alert('Export failed: ' + error.message);
            }
        });

        // Screenshot
        document.getElementById('screenshotBtn').addEventListener('click', () => {
            const dataUrl = this.viewer.takeScreenshot();
            downloadScreenshot(dataUrl, '3d-forge-screenshot');
        });
    }

    async handleGenerate(message) {
        this.chat.setLoading(true);
        this.chat.addTypingIndicator();
        this.showLoading(true);

        try {
            // Call API to generate code
            const response = await generateCode(message);

            if (!response.success) {
                throw new Error(response.error || 'Generation failed');
            }

            // Clean the code
            const cleanedCode = cleanCode(response.code);

            // Execute the code safely
            const object = executeThreeJSCode(cleanedCode);

            // Add to scene
            this.viewer.addObject(object);
            this.hideOverlay();

            // Show success message
            this.chat.removeTypingIndicator();
            this.chat.addMessage(
                'I\'ve created your 3D model! You can rotate it by dragging, zoom with scroll, and download it using the toolbar.',
                'ai',
                { code: cleanedCode }
            );

        } catch (error) {
            console.error('Generation error:', error);

            this.chat.removeTypingIndicator();
            this.chat.addMessage(
                'I encountered an issue creating that object.',
                'ai',
                { error: error.message }
            );
        } finally {
            this.chat.setLoading(false);
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }

    showOverlay() {
        const overlay = document.getElementById('viewerOverlay');
        overlay.classList.remove('hidden');
    }

    hideOverlay() {
        const overlay = document.getElementById('viewerOverlay');
        overlay.classList.add('hidden');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
