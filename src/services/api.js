/**
 * API Service - Handles communication with backend
 */

export async function generateCode(message) {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate code');
    }

    return response.json();
}

export async function checkHealth() {
    const response = await fetch('/api/health');
    return response.json();
}
