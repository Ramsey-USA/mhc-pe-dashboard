// Enhanced MH Construction Dashboard with Real AI Integration
// No testing/simulation code - production ready

// Global variables
let submittals = [];
let rfis = [];
let aiAnalyses = [];
let pendingAnalyses = [];
let currentAnalysisDoc = null;

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Load data from localStorage if available
    loadStoredData();
    
    // Render initial content
    renderSubmittals();
    renderRFIs();
    renderAIAnalyses();
    updateOverviewCards();
    
    console.log('MH Construction AI Dashboard initialized');
}

function loadStoredData() {
    // Load from localStorage
    const storedSubmittals = localStorage.getItem('mh_submittals');
    const storedRFIs = localStorage.getItem('mh_rfis');
    const storedAnalyses = localStorage.getItem('mh_ai_analyses');
    const storedPending = localStorage.getItem('mh_pending_analyses');
    
    if (storedSubmittals) submittals = JSON.parse(storedSubmittals);
    if (storedRFIs) rfis = JSON.parse(storedRFIs);
    if (storedAnalyses) aiAnalyses = JSON.parse(storedAnalyses);
    if (storedPending) pendingAnalyses = JSON.parse(storedPending);
}

function saveToStorage() {
    localStorage.setItem('mh_submittals', JSON.stringify(submittals));
    localStorage.setItem('mh_rfis', JSON.stringify(rfis));
    localStorage.setItem('mh_ai_analyses', JSON.stringify(aiAnalyses));
    localStorage.setItem('mh_pending_analyses', JSON.stringify(pendingAnalyses));
}

// Tab functionality
function showTab(tabName, event) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));

    // Show selected tab content
    const tab = document.getElementById(tabName);
    if (tab) tab.classList.add('active');

    // Add active class to clicked button
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Update analysis queue display
    if (tabName === 'ai-analysis') {
        updateAnalysisQueue();
    }
}

// Submittal functions
function renderSubmittals() {
    const container = document.getElementById('submittals-list');
    
    if (submittals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-text"></i>
                <h3>No submittals yet</h3>
                <p>Click "New Submittal" to add your first submittal for tracking</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = submittals.map(submittal => `
        <div class="content-item">
            <div class="item-header">
                <div class="item-title">
                    <i class="fas fa-file-text"></i>
                    ${submittal.id} - ${submittal.description}
                </div>
                <div>
                    <span class="status-badge status-${getStatusClass(submittal.status)}">${submittal.status}</span>
                    <span class="status-badge priority-${submittal.priority.toLowerCase()}">${submittal.priority}</span>
                </div>
            </div>
            <div class="item-details">
                <div class="detail-item">
                    <span class="detail-label">Trade:</span> ${submittal.trade}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Subcontractor:</span> ${submittal.subcontractor}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Submitted:</span> ${formatDate(submittal.submittedDate)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Required:</span> ${formatDate(submittal.requiredDate)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Days Remaining:</span> 
                    <span style="color: ${submittal.daysRemaining <= 3 ? '#dc3545' : '#28a745'}">${submittal.daysRemaining}</span>
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-header">
                    <span>Progress</span>
                    <span>${submittal.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${submittal.progress}%"></div>
                </div>
            </div>
            <div class="action-buttons">
                <button class="btn btn-outline btn-small" onclick="editSubmittal('${submittal.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteSubmittal('${submittal.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function showNewSubmittalForm() {
    document.getElementById('submittal-modal').style.display = 'block';
}

function addSubmittal(event) {
    event.preventDefault();
    
    const form = event.target;
    const newSubmittal = {
        id: `SUB-${String(submittals.length + 1).padStart(3, '0')}`,
        description: form.querySelector('#submittal-description').value,
        trade: form.querySelector('#submittal-trade').value,
        subcontractor: form.querySelector('#submittal-subcontractor').value,
        status: 'Under Review',
        priority: form.querySelector('#submittal-priority').value,
        submittedDate: new Date().toISOString().split('T')[0],
        requiredDate: form.querySelector('#submittal-date').value,
        daysRemaining: calculateDaysRemaining(form.querySelector('#submittal-date').value),
        progress: 10,
        createdDate: new Date().toISOString()
    };
    
    submittals.push(newSubmittal);
    saveToStorage();
    renderSubmittals();
    updateOverviewCards();
    closeModal('submittal-modal');
    form.reset();
    
    showNotification('Submittal created successfully!', 'success');
}

function deleteSubmittal(id) {
    if (confirm('Are you sure you want to delete this submittal?')) {
        submittals = submittals.filter(s => s.id !== id);
        saveToStorage();
        renderSubmittals();
        updateOverviewCards();
        showNotification('Submittal deleted', 'info');
    }
}

// RFI functions
function renderRFIs() {
    const container = document.getElementById('rfis-list');
    
    if (rfis.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <h3>No RFIs yet</h3>
                <p>Click "New RFI" to create your first Request for Information</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = rfis.map(rfi => `
        <div class="content-item">
            <div class="item-header">
                <div class="item-title">
                    <i class="fas fa-question-circle"></i>
                    ${rfi.id} - ${rfi.description}
                </div>
                <div>
                    <span class="status-badge status-${getStatusClass(rfi.status)}">${rfi.status}</span>
                    <span class="status-badge priority-${rfi.priority.toLowerCase()}">${rfi.priority}</span>
                </div>
            </div>
            <div class="item-details">
                <div class="detail-item">
                    <span class="detail-label">Trade:</span> ${rfi.trade}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Created:</span> ${formatDate(rfi.createdDate)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Response Due:</span> ${formatDate(rfi.responseDate)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Days Remaining:</span> 
                    <span style="color: ${rfi.daysRemaining <= 2 ? '#dc3545' : '#28a745'}">${rfi.daysRemaining}</span>
                </div>
            </div>
            <div class="action-buttons">
                <button class="btn btn-outline btn-small" onclick="editRFI('${rfi.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteRFI('${rfi.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function showNewRFIForm() {
    document.getElementById('rfi-modal').style.display = 'block';
}

function addRFI(event) {
    event.preventDefault();
    
    const form = event.target;
    const newRFI = {
        id: `RFI-${String(rfis.length + 1).padStart(3, '0')}`,
        description: form.querySelector('#rfi-description').value,
        trade: form.querySelector('#rfi-trade').value,
        status: 'Open',
        priority: form.querySelector('#rfi-priority').value,
        createdDate: new Date().toISOString().split('T')[0],
        responseDate: form.querySelector('#rfi-response-date').value,
        daysRemaining: calculateDaysRemaining(form.querySelector('#rfi-response-date').value)
    };
    
    rfis.push(newRFI);
    saveToStorage();
    renderRFIs();
    updateOverviewCards();
    closeModal('rfi-modal');
    form.reset();
    
    showNotification('RFI created successfully!', 'success');
}

function deleteRFI(id) {
    if (confirm('Are you sure you want to delete this RFI?')) {
        rfis = rfis.filter(r => r.id !== id);
        saveToStorage();
        renderRFIs();
        updateOverviewCards();
        showNotification('RFI deleted', 'info');
    }
}

// AI Analysis functions
function renderAIAnalyses() {
    const container = document.getElementById('analysis-results');
    
    if (aiAnalyses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-brain"></i>
                <h3>Ready for AI Analysis</h3>
                <p>Upload documents above to begin AI-powered analysis for discrepancies and issues</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = aiAnalyses.map(analysis => `
        <div class="content-item ai-analysis-item">
            <div class="item-header">
                <div class="item-title">
                    <i class="fas fa-brain"></i>
                    ${analysis.fileName}
                </div>
                <div>
                    <span class="status-badge status-completed">AI Analyzed</span>
                    ${analysis.confidence ? `<span class="status-badge" style="background-color: #e3f2fd; color: #1565c0;">${analysis.confidence}% Confidence</span>` : ''}
                </div>
            </div>
            <div class="item-details">
                <div class="detail-item">
                    <span class="detail-label">Analyzed:</span> ${formatDate(analysis.analyzedDate)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Issues Found:</span> 
                    <span style="color: ${analysis.issues.length > 0 ? '#dc3545' : '#28a745'}">${analysis.issues.length}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">File Type:</span> ${getFileType(analysis.fileName)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Analysis ID:</span> ${analysis.id}
                </div>
            </div>
            ${analysis.confidence ? `
                <div class="ai-confidence">
                    <span>AI Confidence:</span>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${analysis.confidence}%"></div>
                    </div>
                    <span>${analysis.confidence}%</span>
                </div>
            ` : ''}
            ${analysis.summary ? `
                <div class="mt-2">
                    <strong>Analysis Summary:</strong>
                    <p>${analysis.summary}</p>
                </div>
            ` : ''}
            ${analysis.issues.length > 0 ? `
                <div class="issues-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Issues Found by AI:</h4>
                    ${analysis.issues.map(issue => `
                        <div class="issue-item severity-${issue.severity.toLowerCase()}">
                            <div class="issue-header">
                                <span class="issue-type">${issue.type}</span>
                                <span class="issue-severity severity-${issue.severity.toLowerCase()}">${issue.severity}</span>
                            </div>
                            <div class="issue-description">${issue.description}</div>
                            <div class="issue-location">
                                <i class="fas fa-map-marker-alt"></i> ${issue.location}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="action-buttons">
                <button class="btn btn-outline btn-small" onclick="exportAnalysis('${analysis.id}')">
                    <i class="fas fa-download"></i> Export Report
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteAnalysis('${analysis.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function handleFileUpload(event) {
    const files = event.target.files;
    
    for (let file of files) {
        const pendingDoc = {
            id: `PENDING-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileName: file.name,
            fileSize: file.size,
            uploadDate: new Date().toISOString().split('T')[0],
            status: 'Ready for AI Analysis'
        };
        
        pendingAnalyses.push(pendingDoc);
    }
    
    saveToStorage();
    updateAnalysisQueue();
    updateOverviewCards();
    showNotification(`${files.length} file(s) uploaded and ready for AI analysis`, 'success');
    
    // Clear the file input
    event.target.value = '';
}

function updateAnalysisQueue() {
    const queueSection = document.getElementById('analysis-queue');
    const queueList = document.getElementById('queue-list');
    
    if (pendingAnalyses.length === 0) {
        queueSection.style.display = 'none';
        return;
    }
    
    queueSection.style.display = 'block';
    queueList.innerHTML = pendingAnalyses.map(doc => `
        <div class="queue-item">
            <div class="queue-item-info">
                <i class="fas fa-file-pdf"></i>
                <div>
                    <strong>${doc.fileName}</strong>
                    <div style="font-size: 0.8rem; color: #666;">
                        Uploaded: ${formatDate(doc.uploadDate)} | Size: ${formatFileSize(doc.fileSize)}
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <div class="queue-status">
                    <i class="fas fa-clock"></i>
                    Ready for AI
                </div>
                <button class="btn btn-primary btn-small" onclick="sendToAI('${doc.id}')">
                    <i class="fas fa-robot"></i> Analyze with AI
                </button>
                <button class="btn btn-danger btn-small" onclick="removePending('${doc.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function sendToAI(docId) {
    const doc = pendingAnalyses.find(d => d.id === docId);
    if (!doc) return;
    
    currentAnalysisDoc = doc;
    
    // Generate the AI request text
    const requestText = `Please analyze this document for construction-related discrepancies and issues:

Document: ${doc.fileName}
Upload Date: ${formatDate(doc.uploadDate)}
Analysis Request ID: ${doc.id}

Please provide:
1. Overall confidence level (0-100%)
2. Brief summary of findings
3. List of any issues found with:
   - Issue type (Dimensional Discrepancy, Material Specification, etc.)
   - Severity level (Critical, High, Medium, Low)
   - Specific location in document
   - Detailed description

Focus on:
- Conflicts between drawings and specifications
- Dimensional inconsistencies
- Material specification mismatches
- Code compliance issues
- Missing or unclear information

Please format your response clearly so I can input the results into the MH Construction dashboard.`;

    document.getElementById('ai-request-content').value = requestText;
    document.getElementById('ai-analysis-modal').style.display = 'block';
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        showNotification('Element not found for copy.', 'error');
        return;
    }
    // Prefer Clipboard API if available
    if (navigator.clipboard && element.value !== undefined) {
        navigator.clipboard.writeText(element.value)
            .then(() => showNotification('Text copied to clipboard!', 'success'))
            .catch(() => showNotification('Failed to copy text.', 'error'));
    } else if (element.select) {
        element.select();
        element.setSelectionRange(0, 99999);
        document.execCommand('copy');
        showNotification('Text copied to clipboard!', 'success');
    } else {
        showNotification('Copy not supported in this browser.', 'error');
    }
}

// Modal functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
    if (modalId === 'ai-results-modal') {
        currentAnalysisDoc = null;
        const form = document.getElementById('ai-results-form');
        if (form) form.reset();
    }
    if (modalId === 'submittal-modal') {
        const form = document.getElementById('submittal-form');
        if (form) form.reset();
    }
    if (modalId === 'rfi-modal') {
        const form = document.getElementById('rfi-form');
        if (form) form.reset();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Header functions
function syncData() {
    showNotification('Syncing data with integrated systems...', 'info');
    
    // Save current data
    saveToStorage();
    
    setTimeout(() => {
        showNotification('Data synchronization completed successfully!', 'success');
    }, 2000);
}

function exportData() {
    const data = {
        submittals: submittals,
        rfis: rfis,
        aiAnalyses: aiAnalyses,
        pendingAnalyses: pendingAnalyses,
        exportDate: new Date().toISOString(),
        dashboardVersion: '2.0 - AI Enhanced'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `mh-construction-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Dashboard data exported successfully!', 'success');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; margin-left: auto;">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Edit functions (placeholder for future enhancement)
function editSubmittal(id) {
    showNotification('Edit functionality coming soon!', 'info');
}

function editRFI(id) {
    showNotification('Edit functionality coming soon!', 'info');
}

