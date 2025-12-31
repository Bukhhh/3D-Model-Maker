/**
 * Chat Component - Manages chat UI and messaging logic
 */

export class ChatComponent {
    constructor(options) {
        this.messagesContainer = options.messagesContainer;
        this.input = options.input;
        this.sendBtn = options.sendBtn;
        this.onSendMessage = options.onSendMessage || (() => { });

        this.isLoading = false;
        this.init();
    }

    init() {
        // Send button click
        this.sendBtn.addEventListener('click', () => this.handleSend());

        // Enter key to send (Shift+Enter for new line)
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        // Auto-resize textarea
        this.input.addEventListener('input', () => this.autoResize());
    }

    autoResize() {
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
    }

    handleSend() {
        const message = this.input.value.trim();
        if (!message || this.isLoading) return;

        // Add user message
        this.addMessage(message, 'user');

        // Clear input
        this.input.value = '';
        this.autoResize();

        // Trigger callback
        this.onSendMessage(message);
    }

    /**
     * Add a message to the chat
     * @param {string} content - Message content
     * @param {string} type - 'user' or 'ai'
     * @param {object} options - Additional options (code, error)
     */
    addMessage(content, type, options = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'ai' ? '◈' : '●';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // Main content
        const textP = document.createElement('p');
        textP.innerHTML = this.formatContent(content);
        contentDiv.appendChild(textP);

        // Code block if provided
        if (options.code) {
            const codeBlock = document.createElement('pre');
            codeBlock.className = 'message-code';
            codeBlock.textContent = this.truncateCode(options.code);
            contentDiv.appendChild(codeBlock);
        }

        // Error message if provided
        if (options.error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message-error';
            errorDiv.textContent = options.error;
            contentDiv.appendChild(errorDiv);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * Add typing indicator
     * @returns {HTMLElement} - The indicator element (for removal)
     */
    addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message ai-message';
        indicator.id = 'typingIndicator';

        indicator.innerHTML = `
            <div class="message-avatar">◈</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();

        return indicator;
    }

    /**
     * Remove typing indicator
     */
    removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Format content (basic markdown support)
     */
    formatContent(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    /**
     * Truncate long code blocks
     */
    truncateCode(code, maxLines = 15) {
        const lines = code.split('\n');
        if (lines.length > maxLines) {
            return lines.slice(0, maxLines).join('\n') + '\n// ... (truncated)';
        }
        return code;
    }

    /**
     * Scroll to bottom of messages
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        this.sendBtn.disabled = loading;
        this.input.disabled = loading;
    }
}
