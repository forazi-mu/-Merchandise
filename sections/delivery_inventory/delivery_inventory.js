class DeliveryInventory {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Load common components
        this.loadCommonComponents();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Generate initial delivery ID
        this.generateDeliveryId();
        
        // Load initial inventory data
        this.loadInventory();
    }

    loadCommonComponents() {
        // Load header, sidebar, and footer
        document.getElementById('header-placeholder').innerHTML = document.querySelector('header').outerHTML;
        document.getElementById('sidebar-placeholder').innerHTML = document.querySelector('.list-group').outerHTML;
        document.getElementById('footer-placeholder').innerHTML = document.querySelector('footer').outerHTML;
    }

    setupEventListeners() {
        // Delivery Form submission
        document.getElementById('deliveryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitDelivery();
        });

        // Inventory Form submission
        document.getElementById('inventoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitInventory();
        });

        // Inventory Search
        document.getElementById('searchInventory').addEventListener('click', () => {
            this.searchInventory();
        });
    }

    generateDeliveryId() {
        const deliveryId = this.generateUniqueId('DEL');
        document.getElementById('deliveryId').value = deliveryId;
    }

    submitDelivery() {
        const formData = new FormData(document.getElementById('deliveryForm'));
        const deliveryData = {
            deliveryId: formData.get('deliveryId'),
            deliveryDate: formData.get('deliveryDate'),
            containerNumber: formData.get('containerNumber'),
            billOfLading: formData.get('billOfLading'),
            deliveryNotes: formData.get('deliveryNotes')
        };

        // Save to localStorage (in production, this would be an API call)
        const deliveries = JSON.parse(localStorage.getItem('deliveries') || '[]');
        deliveries.push({
            ...deliveryData,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            createdBy: localStorage.getItem('username')
        });
        localStorage.setItem('deliveries', JSON.stringify(deliveries));

        // Show success message
        this.showAlert('Delivery submitted successfully!', 'success');
        
        // Reset form and generate new delivery ID
        document.getElementById('deliveryForm').reset();
        this.generateDeliveryId();
    }

    submitInventory() {
        const formData = new FormData(document.getElementById('inventoryForm'));
        const inventoryData = {
            itemCode: formData.get('itemCode'),
            itemName: formData.get('itemName'),
            quantity: parseInt(formData.get('quantity')),
            currency: formData.get('currency'),
            unitPrice: parseFloat(formData.get('unitPrice')),
            location: formData.get('location')
        };

        // Save to localStorage (in production, this would be an API call)
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        
        // Check if item already exists
        const existingItemIndex = inventory.findIndex(item => item.itemCode === inventoryData.itemCode);
        
        if (existingItemIndex !== -1) {
            // Update existing item
            inventory[existingItemIndex] = {
                ...inventory[existingItemIndex],
                ...inventoryData,
                lastUpdated: new Date().toISOString(),
                updatedBy: localStorage.getItem('username')
            };
        } else {
            // Add new item
            inventory.push({
                ...inventoryData,
                lastUpdated: new Date().toISOString(),
                createdBy: localStorage.getItem('username')
            });
        }
        
        localStorage.setItem('inventory', JSON.stringify(inventory));

        // Show success message
        this.showAlert('Inventory updated successfully!', 'success');
        
        // Reset form
        document.getElementById('inventoryForm').reset();
        
        // Refresh inventory table
        this.loadInventory();
    }

    loadInventory() {
        const inventoryTable = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');

        inventoryTable.innerHTML = inventory.map(item => `
            <tr>
                <td>${item.itemCode}</td>
                <td>${item.itemName}</td>
                <td>${item.quantity}</td>
                <td>${item.currency} ${item.unitPrice.toFixed(2)}</td>
                <td>${item.location}</td>
                <td>${new Date(item.lastUpdated).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="deliveryInventory.viewItemDetails('${item.itemCode}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="deliveryInventory.editItem('${item.itemCode}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    searchInventory() {
        const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
        const rows = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const itemCode = row.cells[0].textContent.toLowerCase();
            const itemName = row.cells[1].textContent.toLowerCase();
            row.style.display = itemCode.includes(searchTerm) || itemName.includes(searchTerm) ? '' : 'none';
        });
    }

    viewItemDetails(itemCode) {
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        const item = inventory.find(item => item.itemCode === itemCode);
        
        if (item) {
            this.showItemDetails(item);
        }
    }

    editItem(itemCode) {
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        const item = inventory.find(item => item.itemCode === itemCode);
        
        if (item) {
            // Populate form
            document.getElementById('itemCode').value = item.itemCode;
            document.getElementById('itemName').value = item.itemName;
            document.getElementById('quantity').value = item.quantity;
            document.getElementById('currency').value = item.currency;
            document.getElementById('unitPrice').value = item.unitPrice;
            document.getElementById('location').value = item.location;
        }
    }

    showItemDetails(item) {
        const modalHtml = `
            <div class="modal fade" id="itemModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Item Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Item Code:</strong> ${item.itemCode}</p>
                            <p><strong>Item Name:</strong> ${item.itemName}</p>
                            <p><strong>Quantity:</strong> ${item.quantity}</p>
                            <p><strong>Unit Price:</strong> ${item.currency} ${item.unitPrice.toFixed(2)}</p>
                            <p><strong>Location:</strong> ${item.location}</p>
                            <p><strong>Last Updated:</strong> ${new Date(item.lastUpdated).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('itemModal'));
        modal.show();

        // Remove modal from DOM after it's hidden
        document.getElementById('itemModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
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

// Initialize delivery inventory when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.deliveryInventory = new DeliveryInventory();
}); 