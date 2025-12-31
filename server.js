import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// System prompt for Three.js code generation
const SYSTEM_PROMPT = `You are a Three.js code generator. Given a description of a 3D object, generate ONLY valid JavaScript code that creates the object using Three.js.

STRICT RULES:
1. Use only these geometries: BoxGeometry, SphereGeometry, CylinderGeometry, ConeGeometry, TorusGeometry, TorusKnotGeometry, PlaneGeometry, RingGeometry, DodecahedronGeometry, IcosahedronGeometry, OctahedronGeometry, TetrahedronGeometry
2. Use only these materials: MeshStandardMaterial, MeshPhongMaterial, MeshLambertMaterial, MeshBasicMaterial
3. You can use THREE.Group to combine multiple meshes
4. Return a function named 'createObject' that returns a THREE.Object3D, THREE.Mesh, or THREE.Group
5. No external dependencies, no async code, no fetch calls, no imports
6. Use hexadecimal colors (0xRRGGBB format)
7. Set proper position, rotation, scale as needed
8. For complex objects, break them into multiple meshes and group them

OUTPUT FORMAT (EXACTLY):
\`\`\`javascript
function createObject() {
    // Create geometry and material
    // Create mesh(es)
    // Position and configure
    return object; // Must return THREE.Object3D, THREE.Mesh, or THREE.Group
}
\`\`\`

EXAMPLES:
- "red cube" → BoxGeometry with red MeshStandardMaterial
- "blue sphere" → SphereGeometry with blue MeshStandardMaterial
- "snowman" → THREE.Group with 3 white SphereGeometry stacked

Be creative but stick to the rules. Always return valid, executable code.`;

// API endpoint for generating 3D code
app.post('/api/generate', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey || apiKey === 'your_api_key_here') {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        // Make request to OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5173',
                'X-Title': '3D Chatbot Generator'
            },
            body: JSON.stringify({
                model: 'google/gemini-3-flash-preview',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Create a 3D object: ${message}` }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter error:', errorData);
            return res.status(response.status).json({
                error: 'Failed to generate 3D code',
                details: errorData
            });
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || '';

        // Extract code from markdown code blocks
        const codeMatch = aiResponse.match(/```javascript\n([\s\S]*?)```/);
        const code = codeMatch ? codeMatch[1].trim() : aiResponse;

        res.json({
            success: true,
            code: code,
            rawResponse: aiResponse
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate`);
});
