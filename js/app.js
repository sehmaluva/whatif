/**
 * What If - The Imagination World
 * A platform for sharing dream projects and finding collaborators
 */

// Constants
const STORAGE_KEY = 'whatif_ideas';

// Category labels for display
const CATEGORY_LABELS = {
    'app': 'App Idea',
    'feature': 'Feature Request',
    'innovation': 'Innovation',
    'collaboration': 'Looking for Collaboration',
    'other': 'Other'
};

// Sample ideas to show on first load
const SAMPLE_IDEAS = [
    {
        id: 1,
        title: "we could build an AI assistant that helps junior developers learn best practices in real-time",
        description: "Imagine a tool that integrates with your IDE and provides contextual advice, suggests improvements, and explains why certain patterns are preferred. It could learn from your coding style and help you grow faster.",
        category: "app",
        githubRef: "https://github.com/microsoft/vscode",
        author: "CodeDreamer",
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        title: "there was a platform where open source maintainers could easily find contributors who match their project needs",
        description: "A matching system that connects developers looking for projects with maintainers who need help. Based on skills, interests, timezone, and availability.",
        category: "collaboration",
        githubRef: "",
        author: "OpenSourceFan",
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 3,
        title: "GitHub had a 'dream mode' where you could sketch out features before implementing them",
        description: "A visual planning tool integrated into GitHub where teams can brainstorm, create wireframes, and vote on ideas before writing any code. Perfect for community-driven projects.",
        category: "feature",
        githubRef: "https://github.com/github",
        author: "InnovatorX",
        createdAt: new Date(Date.now() - 172800000).toISOString()
    }
];

/**
 * Main Application Class
 */
class WhatIfApp {
    constructor() {
        this.ideas = [];
        this.form = document.getElementById('idea-form');
        this.container = document.getElementById('ideas-container');
        this.filterSelect = document.getElementById('filter-category');
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadIdeas();
        this.bindEvents();
        this.renderIdeas();
    }

    /**
     * Load ideas from localStorage or use sample ideas
     */
    loadIdeas() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            this.ideas = JSON.parse(stored);
        } else {
            this.ideas = [...SAMPLE_IDEAS];
            this.saveIdeas();
        }
    }

    /**
     * Save ideas to localStorage
     */
    saveIdeas() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ideas));
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.filterSelect.addEventListener('change', () => this.renderIdeas());
    }

    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const title = this.sanitizeInput(formData.get('title'));
        const description = this.sanitizeInput(formData.get('description'));
        const category = formData.get('category');
        const githubRef = this.sanitizeInput(formData.get('github-ref'));
        const author = this.sanitizeInput(formData.get('author')) || 'Anonymous Dreamer';

        // Validate GitHub URL if provided
        if (githubRef && !this.isValidGitHubUrl(githubRef)) {
            this.showToast('Please enter a valid GitHub URL', false);
            return;
        }

        const newIdea = {
            id: Date.now(),
            title,
            description,
            category,
            githubRef,
            author,
            createdAt: new Date().toISOString()
        };

        this.ideas.unshift(newIdea);
        this.saveIdeas();
        this.renderIdeas();
        this.form.reset();
        this.showToast('Your dream has been shared! ✨', true);
    }

    /**
     * Sanitize user input to prevent XSS
     * @param {string} input - Raw user input
     * @returns {string} Sanitized input
     */
    sanitizeInput(input) {
        if (!input) return '';
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * Validate GitHub URL
     * @param {string} url - URL to validate
     * @returns {boolean} Whether the URL is a valid GitHub URL
     */
    isValidGitHubUrl(url) {
        if (!url) return true;
        try {
            const parsed = new URL(url);
            return parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com';
        } catch {
            return false;
        }
    }

    /**
     * Render ideas to the DOM
     */
    renderIdeas() {
        const filter = this.filterSelect.value;
        const filteredIdeas = filter === 'all' 
            ? this.ideas 
            : this.ideas.filter(idea => idea.category === filter);

        if (filteredIdeas.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <h3>No dreams here yet... 💭</h3>
                    <p>Be the first to share your imagination!</p>
                </div>
            `;
            return;
        }

        this.container.innerHTML = filteredIdeas.map(idea => this.createIdeaCard(idea)).join('');
    }

    /**
     * Create HTML for an idea card
     * @param {Object} idea - Idea object
     * @returns {string} HTML string for the card
     */
    createIdeaCard(idea) {
        const date = new Date(idea.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const githubLink = idea.githubRef 
            ? `<a href="${this.escapeHtml(idea.githubRef)}" target="_blank" rel="noopener noreferrer" class="github-link">📦 View Related Project</a>`
            : '';

        return `
            <article class="idea-card">
                <h3>${this.escapeHtml(idea.title)}</h3>
                <p class="description">${this.escapeHtml(idea.description)}</p>
                <div class="meta">
                    <span class="category-badge">${CATEGORY_LABELS[idea.category] || idea.category}</span>
                    <span class="author">by ${this.escapeHtml(idea.author)}</span>
                </div>
                ${githubLink}
                <p class="date">Shared on ${date}</p>
            </article>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {boolean} success - Whether it's a success message
     */
    showToast(message, success = true) {
        const toast = document.createElement('div');
        toast.className = success ? 'toast success' : 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WhatIfApp();
});
