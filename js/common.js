class Common {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Check authentication
        this.checkAuth();
        
        // Initialize help chat
        this.setupHelpChat();
    }

    checkAuth() {
        const userToken = localStorage.getItem('userToken');
        if (!userToken) {
            window.location.href = '../index.html';
        }
    }

    setupHelpChat() {
        const helpButton = document.getElementById('helpButton');
        const helpContent = document.getElementById('helpContent');

        if (helpButton && helpContent) {
            helpButton.addEventListener('click', () => {
                helpContent.classList.toggle('active');
                this.loadHelpContent();
            });
        }
    }

    loadHelpContent() {
        const helpContent = document.getElementById('helpContent');
        if (!helpContent) return;

        const currentSection = window.location.pathname.split('/').pop().split('.')[0];
        const helpTopics = this.getHelpTopics(currentSection);

        helpContent.innerHTML = `
            <div class="help-header">
                <h6>Help Topics</h6>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.classList.remove('active')"></button>
            </div>
            <div class="help-body">
                ${helpTopics.map(topic => `
                    <div class="help-topic">
                        <h6>${topic.title}</h6>
                        <p>${topic.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getHelpTopics(section) {
        const helpTopics = {
            'cargo_loading': [
                {
                    title: 'Loading List Entry',
                    content: 'Enter the shipment details including container number and bill of lading. Upload the loading list document in Excel or PDF format.'
                },
                {
                    title: 'Container Tracking',
                    content: 'Search for containers using container number or bill of lading number. View current status and location of containers.'
                }
            ],
            'import_custom': [
                {
                    title: 'Import Documents',
                    content: 'Manage import documents including pro forma invoice, packing list, and commercial invoice.'
                },
                {
                    title: 'Custom Clearance',
                    content: 'Track custom clearance status and submit required documents.'
                }
            ],
            'delivery_inventory': [
                {
                    title: 'Warehouse Management',
                    content: 'Track goods received in warehouse and manage inventory.'
                },
                {
                    title: 'Purchase Invoice',
                    content: 'Create and manage purchase invoices for received goods.'
                }
            ],
            'accounts': [
                {
                    title: 'Payment Management',
                    content: 'Track payments and manage financial transactions.'
                },
                {
                    title: 'Account Balance',
                    content: 'View account balances and transaction history.'
                }
            ]
        };

        return helpTopics[section] || [
            {
                title: 'General Help',
                content: 'Select a section to view specific help topics.'
            }
        ];
    }

    showAlert(message, type = 'info') {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Add alert to document
        document.querySelector('.container-fluid').insertAdjacentHTML('afterbegin', alertHtml);

        // Remove alert after 5 seconds
        setTimeout(() => {
            const alert = document.querySelector('.alert');
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }
}

// Initialize common functionality when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.common = new Common();
}); 