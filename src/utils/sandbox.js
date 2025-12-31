/**
 * Code Sandbox - Safe execution of AI-generated Three.js code
 * SECURITY CRITICAL: This module validates and executes code safely
 */

import * as THREE from 'three';

// Forbidden patterns that indicate unsafe code
const FORBIDDEN_PATTERNS = [
    /\bfetch\s*\(/i,
    /\beval\s*\(/i,
    /\bFunction\s*\(/i,
    /\bdocument\s*\./i,
    /\bwindow\s*\./i,
    /\bimport\s+/i,
    /\brequire\s*\(/i,
    /\blocalStorage\b/i,
    /\bsessionStorage\b/i,
    /\bcookie\b/i,
    /\bXMLHttpRequest\b/i,
    /\bWebSocket\b/i,
    /\bworker\b/i,
    /\bsetTimeout\s*\(/i,
    /\bsetInterval\s*\(/i,
    /\b__proto__\b/i,
    /\bprototype\b/i,
    /\bconstructor\s*\[/i,
];

/**
 * Validates code for security issues
 * @param {string} code - The code to validate
 * @returns {{valid: boolean, error: string|null}}
 */
function validateCode(code) {
    for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(code)) {
            return {
                valid: false,
                error: `Security violation: Forbidden pattern detected (${pattern.source})`
            };
        }
    }

    // Check for createObject function
    if (!code.includes('function createObject')) {
        return {
            valid: false,
            error: 'Code must contain a "function createObject()" definition'
        };
    }

    return { valid: true, error: null };
}

/**
 * Executes validated Three.js code in a controlled environment
 * @param {string} codeString - The Three.js code to execute
 * @returns {THREE.Object3D} - The created 3D object
 * @throws {Error} - If code is invalid or execution fails
 */
export function executeThreeJSCode(codeString) {
    // Step 1: Validate code
    const validation = validateCode(codeString);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    try {
        // Step 2: Create a controlled execution environment
        // We provide only THREE as a global, nothing else
        const createObjectFn = new Function('THREE', `
            "use strict";
            ${codeString}
            if (typeof createObject !== 'function') {
                throw new Error('createObject function not found');
            }
            return createObject();
        `);

        // Step 3: Execute with only THREE available
        const result = createObjectFn(THREE);

        // Step 4: Validate result type
        if (!result) {
            throw new Error('createObject() returned null or undefined');
        }

        if (!(result instanceof THREE.Object3D)) {
            throw new Error(`Expected THREE.Object3D but got ${result.constructor?.name || typeof result}`);
        }

        return result;

    } catch (error) {
        // Re-throw with more context
        if (error.message.includes('Security violation')) {
            throw error;
        }
        throw new Error(`Code execution failed: ${error.message}`);
    }
}

/**
 * Extracts and cleans code from AI response
 * @param {string} rawCode - Raw code from AI
 * @returns {string} - Cleaned code
 */
export function cleanCode(rawCode) {
    // Remove markdown code blocks if present
    let code = rawCode;

    const codeBlockMatch = code.match(/```(?:javascript|js)?\n?([\s\S]*?)```/);
    if (codeBlockMatch) {
        code = codeBlockMatch[1];
    }

    // Trim whitespace
    code = code.trim();

    return code;
}
