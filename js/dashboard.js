class Dashboard {
    constructor() {
        this.username = localStorage.getItem('username') || 'User';
        this.initialize();
    }

    initialize() {
        // Set username in header
        document.getElementById('username').textContent = this.username;

        // Initialize event listeners
        this.setupEventListeners();
        
        // Load initial data
        this.loadShipmentStatus();
        this.loadRecentActivities();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.list-group-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Logout
        document.getElementById('logoutLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Help chat
        document.getElementById('helpButton').addEventListener('click', () => {
            this.toggleHelpChat();
        });
    }

    loadShipmentStatus() {
        const statusContainer = document.getElementById('shipmentStatus');
        const sections = [
            { name: 'Cargo Loading', status: 'Pending', icon: 'bi-box-seam' },
            { name: 'Import & Custom', status: 'In Progress', icon: 'bi-file-earmark-text' },
            { name: 'Delivery & Inventory', status: 'Pending', icon: 'bi-truck' },
            { name: 'Accounts', status: 'Complete', icon: 'bi-calculator' }
        ];

        statusContainer.innerHTML = sections.map(section => `
            <div class="col-md-3">
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">
                            <i class="bi ${section.icon}"></i> ${section.name}
                        </h6>
                        <p class="card-text">
                            Status: <span class="badge bg-${this.getStatusColor(section.status)}">${section.status}</span>
                        </p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadRecentActivities() {
        const activitiesTable = document.getElementById('recentActivities').getElementsByTagName('tbody')[0];
        const activities = [
            { date: '2024-04-18', activity: 'Cargo Loading List Entry', status: 'Pending', action: 'Review' },
            { date: '2024-04-17', activity: 'Import Document Submission', status: 'Complete', action: 'View' },
            { date: '2024-04-16', activity: 'Payment Processing', status: 'Complete', action: 'View' }
        ];

        activitiesTable.innerHTML = activities.map(activity => `
            <tr>
                <td>${activity.date}</td>
                <td>${activity.activity}</td>
                <td><span class="badge bg-${this.getStatusColor(activity.status)}">${activity.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary">${activity.action}</button>
                </td>
            </tr>
        `).join('');
    }

    getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'complete':
                return 'success';
            case 'in progress':
                return 'warning';
            case 'pending':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    navigateToSection(section) {
        // Update active navigation item
        document.querySelectorAll('.list-group-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });

        // Load section content
        // This would be replaced with actual content loading logic
        console.log(`Navigating to section: ${section}`);
    }

    toggleHelpChat() {
        const helpContent = document.getElementById('helpContent');
        helpContent.style.display = helpContent.style.display === 'none' ? 'block' : 'none';
    }

    logout() {
        localStorage.removeItem('userToken');
        localStorage.removeItem('username');
        window.location.href = '../index.html';
    }
}

// Initialize dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
}); 