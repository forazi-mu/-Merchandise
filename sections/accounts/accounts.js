class Accounts {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Load common components
        this.loadCommonComponents();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Generate initial payment ID
        this.generatePaymentId();
        
        // Load initial payment data
        this.loadPayments();
    }

    loadCommonComponents() {
        // Load header, sidebar, and footer
        document.getElementById('header-placeholder').innerHTML = document.querySelector('header').outerHTML;
        document.getElementById('sidebar-placeholder').innerHTML = document.querySelector('.list-group').outerHTML;
        document.getElementById('footer-placeholder').innerHTML = document.querySelector('footer').outerHTML;
    }

    setupEventListeners() {
        // Payment Form submission
        document.getElementById('paymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitPayment();
        });

        // Payment Search
        document.getElementById('searchPayments').addEventListener('click', () => {
            this.searchPayments();
        });

        // Payment Type Filter
        document.getElementById('paymentTypeFilter').addEventListener('change', () => {
            this.filterPayments();
        });

        // Date Filter
        document.getElementById('filterByDate').addEventListener('click', () => {
            this.filterPayments();
        });
    }

    generatePaymentId() {
        const paymentId = this.generateUniqueId('PAY');
        document.getElementById('paymentId').value = paymentId;
    }

    submitPayment() {
        const formData = new FormData(document.getElementById('paymentForm'));
        const paymentData = {
            paymentId: formData.get('paymentId'),
            paymentDate: formData.get('paymentDate'),
            paymentType: formData.get('paymentType'),
            referenceNumber: formData.get('referenceNumber'),
            currency: formData.get('currency'),
            amount: parseFloat(formData.get('amount')),
            paymentMethod: formData.get('paymentMethod'),
            paymentNotes: formData.get('paymentNotes')
        };

        // Save to localStorage (in production, this would be an API call)
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payments.push({
            ...paymentData,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            createdBy: localStorage.getItem('username')
        });
        localStorage.setItem('payments', JSON.stringify(payments));

        // Show success message
        this.showAlert('Payment submitted successfully!', 'success');
        
        // Reset form and generate new payment ID
        document.getElementById('paymentForm').reset();
        this.generatePaymentId();
        
        // Refresh payments table
        this.loadPayments();
    }

    loadPayments() {
        const paymentsTable = document.getElementById('paymentsTable').getElementsByTagName('tbody')[0];
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');

        paymentsTable.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.paymentId}</td>
                <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td>${this.formatPaymentType(payment.paymentType)}</td>
                <td>${payment.referenceNumber}</td>
                <td>${payment.currency} ${payment.amount.toFixed(2)}</td>
                <td>${this.formatPaymentMethod(payment.paymentMethod)}</td>
                <td><span class="badge bg-${this.getStatusColor(payment.status)}">${payment.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="accounts.viewPaymentDetails('${payment.paymentId}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="accounts.editPayment('${payment.paymentId}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    searchPayments() {
        const searchTerm = document.getElementById('paymentSearch').value.toLowerCase();
        const rows = document.getElementById('paymentsTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const paymentId = row.cells[0].textContent.toLowerCase();
            const reference = row.cells[3].textContent.toLowerCase();
            row.style.display = paymentId.includes(searchTerm) || reference.includes(searchTerm) ? '' : 'none';
        });
    }

    filterPayments() {
        const paymentType = document.getElementById('paymentTypeFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        const rows = document.getElementById('paymentsTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const type = row.cells[2].textContent.toLowerCase();
            const date = row.cells[1].textContent;
            
            let showRow = true;
            
            if (paymentType && !type.includes(paymentType.toLowerCase())) {
                showRow = false;
            }
            
            if (dateFilter && date !== new Date(dateFilter).toLocaleDateString()) {
                showRow = false;
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }

    viewPaymentDetails(paymentId) {
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        const payment = payments.find(p => p.paymentId === paymentId);
        
        if (payment) {
            this.showPaymentDetails(payment);
        }
    }

    editPayment(paymentId) {
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        const payment = payments.find(p => p.paymentId === paymentId);
        
        if (payment) {
            // Populate form
            document.getElementById('paymentId').value = payment.paymentId;
            document.getElementById('paymentDate').value = payment.paymentDate;
            document.getElementById('paymentType').value = payment.paymentType;
            document.getElementById('referenceNumber').value = payment.referenceNumber;
            document.getElementById('currency').value = payment.currency;
            document.getElementById('amount').value = payment.amount;
            document.getElementById('paymentMethod').value = payment.paymentMethod;
            document.getElementById('paymentNotes').value = payment.paymentNotes;
        }
    }

    showPaymentDetails(payment) {
        const modalHtml = `
            <div class="modal fade" id="paymentModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Payment Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Payment ID:</strong> ${payment.paymentId}</p>
                            <p><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
                            <p><strong>Type:</strong> ${this.formatPaymentType(payment.paymentType)}</p>
                            <p><strong>Reference:</strong> ${payment.referenceNumber}</p>
                            <p><strong>Amount:</strong> ${payment.currency} ${payment.amount.toFixed(2)}</p>
                            <p><strong>Method:</strong> ${this.formatPaymentMethod(payment.paymentMethod)}</p>
                            <p><strong>Status:</strong> <span class="badge bg-${this.getStatusColor(payment.status)}">${payment.status}</span></p>
                            <p><strong>Notes:</strong> ${payment.paymentNotes || 'None'}</p>
                            <p><strong>Created By:</strong> ${payment.createdBy}</p>
                            <p><strong>Created At:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();

        // Remove modal from DOM after it's hidden
        document.getElementById('paymentModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
    }

    formatPaymentType(type) {
        const types = {
            'supplier': 'Supplier Payment',
            'customs': 'Customs Payment',
            'shipping': 'Shipping Payment',
            'other': 'Other'
        };
        return types[type] || type;
    }

    formatPaymentMethod(method) {
        const methods = {
            'bank_transfer': 'Bank Transfer',
            'cash': 'Cash'
        };
        return methods[method] || method;
    }

    getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
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

// Initialize accounts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.accounts = new Accounts();
}); 