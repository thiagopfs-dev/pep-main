/**
 * Modal component functionality
 */

class Modal {
    constructor() {
        this.overlay = document.getElementById('modalOverlay');
        this.currentModal = null;
        this.bindEvents();
    }

    bindEvents() {
        // Close modal when clicking overlay
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    show(title, content, options = {}) {
        const modal = this.createModal(title, content, options);
        this.overlay.innerHTML = '';
        this.overlay.appendChild(modal);
        this.overlay.classList.add('show');
        this.currentModal = modal;

        // Focus first input if exists
        setTimeout(() => {
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);

        return modal;
    }

    close() {
        this.overlay.classList.remove('show');
        setTimeout(() => {
            this.overlay.innerHTML = '';
            this.currentModal = null;
        }, 300);
    }

    isOpen() {
        return this.overlay.classList.contains('show');
    }

    createModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" type="button">&times;</button>
        `;

        const body = document.createElement('div');
        body.className = 'modal-body';
        
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }

        modal.appendChild(header);
        modal.appendChild(body);

        // Add footer if buttons provided
        if (options.buttons) {
            const footer = document.createElement('div');
            footer.className = 'modal-footer';
            
            options.buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = `btn ${button.class || ''}`;
                btn.textContent = button.text;
                btn.onclick = button.onclick || (() => {});
                footer.appendChild(btn);
            });

            modal.appendChild(footer);
        }

        // Bind close button
        header.querySelector('.modal-close').onclick = () => this.close();

        return modal;
    }

    // Specific modal types
    confirm(title, message, onConfirm, onCancel) {
        const content = `<p>${message}</p>`;
        const buttons = [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: () => {
                    this.close();
                    if (onCancel) onCancel();
                }
            },
            {
                text: 'Confirmar',
                class: 'btn-primary',
                onclick: () => {
                    this.close();
                    if (onConfirm) onConfirm();
                }
            }
        ];

        return this.show(title, content, { buttons });
    }

    alert(title, message, onClose) {
        const content = `<p>${message}</p>`;
        const buttons = [
            {
                text: 'OK',
                class: 'btn-primary',
                onclick: () => {
                    this.close();
                    if (onClose) onClose();
                }
            }
        ];

        return this.show(title, content, { buttons });
    }

    form(title, formHTML, onSubmit, onCancel) {
        const form = document.createElement('form');
        form.innerHTML = formHTML;
        
        const buttons = [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: () => {
                    this.close();
                    if (onCancel) onCancel();
                }
            },
            {
                text: 'Salvar',
                class: 'btn-primary',
                onclick: () => {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData);
                    
                    if (onSubmit) {
                        const result = onSubmit(data, form);
                        if (result !== false) {
                            this.close();
                        }
                    }
                }
            }
        ];

        // Handle form submission
        form.onsubmit = (e) => {
            e.preventDefault();
            buttons[1].onclick();
        };

        return this.show(title, form, { buttons });
    }

    loading(title, message) {
        const content = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;

        const modal = this.show(title, content);
        
        // Add loading styles
        const style = document.createElement('style');
        style.textContent = `
            .loading {
                text-align: center;
                padding: 2rem;
            }
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        return modal;
    }
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modal = new Modal();
});