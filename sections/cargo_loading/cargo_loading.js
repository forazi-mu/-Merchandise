class CargoLoading {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Load common components
        this.loadCommonComponents();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Load initial data
        this.loadContainerTracking();
    }

    loadCommonComponents() {
        // Load header, sidebar, and footer
        document.getElementById('header-placeholder').innerHTML = document.querySelector('header').outerHTML;
        document.getElementById('sidebar-placeholder').innerHTML = document.querySelector('.list-group').outerHTML;
        document.getElementById('footer-placeholder').innerHTML = document.querySelector('footer').outerHTML;
    }

    setupEventListeners() {
        // Loading List Form submission
        document.getElementById('loadingListForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitLoadingList();
        });

        // Container Tracking Search
        document.getElementById('searchTracking').addEventListener('click', () => {
            this.searchContainerTracking();
        });
    }

    submitLoadingList() {
        const formData = new FormData(document.getElementById('loadingListForm'));
        const loadingData = {
            shipmentId: formData.get('shipmentId'),
            loadingDate: formData.get('loadingDate'),
            containerNumber: formData.get('containerNumber'),
            billOfLading: formData.get('billOfLading'),
            loadingListFile: formData.get('loadingListFile')
        };

        // Generate unique ID for the loading list
        const loadingListId = this.generateUniqueId('LOAD');

        // Save to localStorage (in production, this would be an API call)
        const loadingLists = JSON.parse(localStorage.getItem('loadingLists') || '[]');
        loadingLists.push({
            id: loadingListId,
            ...loadingData,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            createdBy: localStorage.getItem('username')
        });
        localStorage.setItem('loadingLists', JSON.stringify(loadingLists));

        // Show success message
        this.showAlert('Loading list submitted successfully!', 'success');
        
        // Reset form
        document.getElementById('loadingListForm').reset();
        
        // Refresh tracking table
        this.loadContainerTracking();
    }

    loadContainerTracking() {
        const trackingTable = document.getElementById('trackingTable').getElementsByTagName('tbody')[0];
        const loadingLists = JSON.parse(localStorage.getItem('loadingLists') || '[]');

        trackingTable.innerHTML = loadingLists.map(list => `
            <tr>
                <td>${list.containerNumber}</td>
                <td>${list.billOfLading}</td>
                <td>${new Date(list.loadingDate).toLocaleDateString()}</td>
                <td><span class="badge bg-${this.getStatusColor(list.status)}">${list.status}</span></td>
                <td>${this.getContainerLocation(list.status)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="cargoLoading.viewDetails('${list.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="cargoLoading.editLoadingList('${list.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    searchContainerTracking() {
        const searchTerm = document.getElementById('trackingSearch').value.toLowerCase();
        const rows = document.getElementById('trackingTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const containerNo = row.cells[0].textContent.toLowerCase();
            const blNo = row.cells[1].textContent.toLowerCase();
            row.style.display = containerNo.includes(searchTerm) || blNo.includes(searchTerm) ? '' : 'none';
        });
    }

    viewDetails(loadingListId) {
        const loadingLists = JSON.parse(localStorage.getItem('loadingLists') || '[]');
        const loadingList = loadingLists.find(list => list.id === loadingListId);
        
        if (loadingList) {
            // Show loading list details in a modal
            this.showLoadingListDetails(loadingList);
        }
    }

    editLoadingList(loadingListId) {
        const loadingLists = JSON.parse(localStorage.getItem('loadingLists') || '[]');
        const loadingList = loadingLists.find(list => list.id === loadingListId);
        
        if (loadingList) {
            // Populate form with loading list data
            document.getElementById('shipmentId').value = loadingList.shipmentId;
            document.getElementById('loadingDate').value = loadingList.loadingDate;
            document.getElementById('containerNumber').value = loadingList.containerNumber;
            document.getElementById('billOfLading').value = loadingList.billOfLading;
        }
    }

    showLoadingListDetails(loadingList) {
        const modalHtml = `
            <div class="modal fade" id="loadingListModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Loading List Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Shipment ID:</strong> ${loadingList.shipmentId}</p>
                            <p><strong>Container Number:</strong> ${loadingList.containerNumber}</p>
                            <p><strong>Bill of Lading:</strong> ${loadingList.billOfLading}</p>
                            <p><strong>Loading Date:</strong> ${new Date(loadingList.loadingDate).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> <span class="badge bg-${this.getStatusColor(loadingList.status)}">${loadingList.status}</span></p>
                            <p><strong>Created By:</strong> ${loadingList.createdBy}</p>
                            <p><strong>Created At:</strong> ${new Date(loadingList.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('loadingListModal'));
        modal.show();

        // Remove modal from DOM after it's hidden
        document.getElementById('loadingListModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
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

    getContainerLocation(status) {
        switch (status.toLowerCase()) {
            case 'complete':
                return 'Delivered';
            case 'in progress':
                return 'In Transit';
            case 'pending':
                return 'Loading Port';
            default:
                return 'Unknown';
        }
    }

    generateUniqueId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

// Initialize cargo loading when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cargoLoading = new CargoLoading();
}); 