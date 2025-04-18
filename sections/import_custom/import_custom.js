class ImportCustom {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Load common components
        this.loadCommonComponents();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Load initial data
        this.loadDocuments();
    }

    loadCommonComponents() {
        // Load header, sidebar, and footer
        document.getElementById('header-placeholder').innerHTML = document.querySelector('header').outerHTML;
        document.getElementById('sidebar-placeholder').innerHTML = document.querySelector('.list-group').outerHTML;
        document.getElementById('footer-placeholder').innerHTML = document.querySelector('footer').outerHTML;
    }

    setupEventListeners() {
        // Pro Forma Invoice Form submission
        document.getElementById('proFormaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitProFormaInvoice();
        });

        // L/C Form submission
        document.getElementById('lcForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitLetterOfCredit();
        });

        // Document Search
        document.getElementById('searchDocs').addEventListener('click', () => {
            this.searchDocuments();
        });
    }

    submitProFormaInvoice() {
        const formData = new FormData(document.getElementById('proFormaForm'));
        const piData = {
            piNumber: formData.get('piNumber'),
            piDate: formData.get('piDate'),
            supplier: formData.get('supplier'),
            currency: formData.get('currency'),
            totalAmount: formData.get('totalAmount'),
            piFile: formData.get('piFile')
        };

        // Generate unique ID for the PI
        const piId = this.generateUniqueId('PI');

        // Save to localStorage (in production, this would be an API call)
        const proFormaInvoices = JSON.parse(localStorage.getItem('proFormaInvoices') || '[]');
        proFormaInvoices.push({
            id: piId,
            ...piData,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            createdBy: localStorage.getItem('username')
        });
        localStorage.setItem('proFormaInvoices', JSON.stringify(proFormaInvoices));

        // Show success message
        this.showAlert('Pro Forma Invoice submitted successfully!', 'success');
        
        // Reset form
        document.getElementById('proFormaForm').reset();
        
        // Refresh documents table
        this.loadDocuments();
    }

    submitLetterOfCredit() {
        const formData = new FormData(document.getElementById('lcForm'));
        const lcData = {
            lcNumber: formData.get('lcNumber'),
            lcDate: formData.get('lcDate'),
            bankName: formData.get('bankName'),
            currency: formData.get('lcCurrency'),
            lcAmount: formData.get('lcAmount'),
            lcFile: formData.get('lcFile')
        };

        // Generate unique ID for the L/C
        const lcId = this.generateUniqueId('LC');

        // Save to localStorage (in production, this would be an API call)
        const lettersOfCredit = JSON.parse(localStorage.getItem('lettersOfCredit') || '[]');
        lettersOfCredit.push({
            id: lcId,
            ...lcData,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            createdBy: localStorage.getItem('username')
        });
        localStorage.setItem('lettersOfCredit', JSON.stringify(lettersOfCredit));

        // Show success message
        this.showAlert('Letter of Credit submitted successfully!', 'success');
        
        // Reset form
        document.getElementById('lcForm').reset();
        
        // Refresh documents table
        this.loadDocuments();
    }

    loadDocuments() {
        const documentsTable = document.getElementById('documentsTable').getElementsByTagName('tbody')[0];
        const proFormaInvoices = JSON.parse(localStorage.getItem('proFormaInvoices') || '[]');
        const lettersOfCredit = JSON.parse(localStorage.getItem('lettersOfCredit') || '[]');

        // Combine and sort documents
        const documents = proFormaInvoices.map(pi => {
            const lc = lettersOfCredit.find(lc => lc.piNumber === pi.piNumber);
            return {
                piNumber: pi.piNumber,
                lcNumber: lc ? lc.lcNumber : '-',
                supplier: pi.supplier,
                amount: `${pi.currency} ${pi.totalAmount}`,
                status: this.getDocumentStatus(pi, lc),
                piId: pi.id,
                lcId: lc ? lc.id : null
            };
        });

        documentsTable.innerHTML = documents.map(doc => `
            <tr>
                <td>${doc.piNumber}</td>
                <td>${doc.lcNumber}</td>
                <td>${doc.supplier}</td>
                <td>${doc.amount}</td>
                <td><span class="badge bg-${this.getStatusColor(doc.status)}">${doc.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="importCustom.viewDetails('${doc.piId}', '${doc.lcId}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="importCustom.editDocument('${doc.piId}', '${doc.lcId}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    searchDocuments() {
        const searchTerm = document.getElementById('docSearch').value.toLowerCase();
        const rows = document.getElementById('documentsTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const piNo = row.cells[0].textContent.toLowerCase();
            const lcNo = row.cells[1].textContent.toLowerCase();
            row.style.display = piNo.includes(searchTerm) || lcNo.includes(searchTerm) ? '' : 'none';
        });
    }

    viewDetails(piId, lcId) {
        const proFormaInvoices = JSON.parse(localStorage.getItem('proFormaInvoices') || '[]');
        const lettersOfCredit = JSON.parse(localStorage.getItem('lettersOfCredit') || '[]');
        
        const pi = proFormaInvoices.find(pi => pi.id === piId);
        const lc = lcId ? lettersOfCredit.find(lc => lc.id === lcId) : null;
        
        if (pi) {
            this.showDocumentDetails(pi, lc);
        }
    }

    editDocument(piId, lcId) {
        const proFormaInvoices = JSON.parse(localStorage.getItem('proFormaInvoices') || '[]');
        const lettersOfCredit = JSON.parse(localStorage.getItem('lettersOfCredit') || '[]');
        
        const pi = proFormaInvoices.find(pi => pi.id === piId);
        const lc = lcId ? lettersOfCredit.find(lc => lc.id === lcId) : null;
        
        if (pi) {
            // Populate PI form
            document.getElementById('piNumber').value = pi.piNumber;
            document.getElementById('piDate').value = pi.piDate;
            document.getElementById('supplier').value = pi.supplier;
            document.getElementById('currency').value = pi.currency;
            document.getElementById('totalAmount').value = pi.totalAmount;
        }
        
        if (lc) {
            // Populate L/C form
            document.getElementById('lcNumber').value = lc.lcNumber;
            document.getElementById('lcDate').value = lc.lcDate;
            document.getElementById('bankName').value = lc.bankName;
            document.getElementById('lcCurrency').value = lc.currency;
            document.getElementById('lcAmount').value = lc.lcAmount;
        }
    }

    showDocumentDetails(pi, lc) {
        const modalHtml = `
            <div class="modal fade" id="documentModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Document Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Pro Forma Invoice</h6>
                                    <p><strong>PI Number:</strong> ${pi.piNumber}</p>
                                    <p><strong>Date:</strong> ${new Date(pi.piDate).toLocaleDateString()}</p>
                                    <p><strong>Supplier:</strong> ${pi.supplier}</p>
                                    <p><strong>Amount:</strong> ${pi.currency} ${pi.totalAmount}</p>
                                    <p><strong>Status:</strong> <span class="badge bg-${this.getStatusColor(pi.status)}">${pi.status}</span></p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Letter of Credit</h6>
                                    ${lc ? `
                                        <p><strong>L/C Number:</strong> ${lc.lcNumber}</p>
                                        <p><strong>Date:</strong> ${new Date(lc.lcDate).toLocaleDateString()}</p>
                                        <p><strong>Bank:</strong> ${lc.bankName}</p>
                                        <p><strong>Amount:</strong> ${lc.currency} ${lc.lcAmount}</p>
                                        <p><strong>Status:</strong> <span class="badge bg-${this.getStatusColor(lc.status)}">${lc.status}</span></p>
                                    ` : '<p class="text-muted">No L/C associated</p>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('documentModal'));
        modal.show();

        // Remove modal from DOM after it's hidden
        document.getElementById('documentModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
    }

    getDocumentStatus(pi, lc) {
        if (!lc) return 'Pending L/C';
        if (pi.status === 'Pending' || lc.status === 'Pending') return 'Pending';
        if (pi.status === 'Complete' && lc.status === 'Complete') return 'Complete';
        return 'In Progress';
    }

    getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'complete':
                return 'success';
            case 'in progress':
                return 'warning';
            case 'pending':
            case 'pending l/c':
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

// Initialize import custom when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.importCustom = new ImportCustom();
}); 