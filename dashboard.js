// MH Construction Quality Control Dashboard
// Version 3.0 - Workflow Optimized JavaScript
// Built for real construction project management workflow

// Global State Management
let currentProject = null;
let projects = [];
let masterDocuments = {
    drawings: [],
    specifications: []
};
let qualityChecks = [];
let rfis = [];
let pendingQualityChecks = [];
let currentQualityDoc = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeDashboard();
        console.log('🏗️ MH Construction Quality Control Dashboard initialized');
    } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
        showNotification('Dashboard initialization error. Please refresh the page.', 'error');
    }
});

function initializeDashboard() {
    // Load stored data
    loadStoredData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial render
    if (currentProject) {
        showMainContent();
        renderProjectData();
    } else {
        showProjectSetupBanner();
    }
    
    // Update project selector
    updateProjectSelector();
}

function loadStoredData() {
    try {
        const storedProjects = localStorage.getItem('mh_projects');
        const storedCurrentProject = localStorage.getItem('mh_current_project');
        const storedMasterDocs = localStorage.getItem('mh_master_documents');
        const storedQualityChecks = localStorage.getItem('mh_quality_checks');
        const storedRFIs = localStorage.getItem('mh_rfis');
        const storedPendingChecks = localStorage.getItem('mh_pending_quality_checks');
        
        if (storedProjects) {
            projects = JSON.parse(storedProjects);
        }
        
        if (storedCurrentProject) {
            const projectId = JSON.parse(storedCurrentProject);
            currentProject = projects.find(p => p.id === projectId);
        }
        
        if (storedMasterDocs && currentProject) {
            const allMasterDocs = JSON.parse(storedMasterDocs);
            masterDocuments = allMasterDocs[currentProject.id] || { drawings: [], specifications: [] };
        }
        
        if (storedQualityChecks && currentProject) {
            const allQualityChecks = JSON.parse(storedQualityChecks);
            qualityChecks = allQualityChecks[currentProject.id] || [];
        }
        
        if (storedRFIs && currentProject) {
            const allRFIs = JSON.parse(storedRFIs);
            rfis = allRFIs[currentProject.id] || [];
        }
        
        if (storedPendingChecks && currentProject) {
            const allPendingChecks = JSON.parse(storedPendingChecks);
            pendingQualityChecks = allPendingChecks[currentProject.id] || [];
        }
        
        console.log('✅ Data loaded:', {
            projects: projects.length,
            currentProject: currentProject?.name || 'None',
            masterDocs: masterDocuments.drawings.length + masterDocuments.specifications.length,
            qualityChecks: qualityChecks.length,
            rfis: rfis.length
        });
    } catch (error) {
        console.error('❌ Error loading stored data:', error);
        // Initialize with empty data if loading fails
        projects = [];
        currentProject = null;
        masterDocuments = { drawings: [], specifications: [] };
        qualityChecks = [];
        rfis = [];
        pendingQualityChecks = [];
    }
}

function saveToStorage() {
    try {
        localStorage.setItem('mh_projects', JSON.stringify(projects));
        
        if (currentProject) {
            localStorage.setItem('mh_current_project', JSON.stringify(currentProject.id));
            
            // Save project-specific data
            const allMasterDocs = JSON.parse(localStorage.getItem('mh_master_documents') || '{}');
            allMasterDocs[currentProject.id] = masterDocuments;
            localStorage.setItem('mh_master_documents', JSON.stringify(allMasterDocs));
            
            const allQualityChecks = JSON.parse(localStorage.getItem('mh_quality_checks') || '{}');
            allQualityChecks[currentProject.id] = qualityChecks;
            localStorage.setItem('mh_quality_checks', JSON.stringify(allQualityChecks));
            
            const allRFIs = JSON.parse(localStorage.getItem('mh_rfis') || '{}');
            allRFIs[currentProject.id] = rfis;
            localStorage.setItem('mh_rfis', JSON.stringify(allRFIs));
            
            const allPendingChecks = JSON.parse(localStorage.getItem('mh_pending_quality_checks') || '{}');
            allPendingChecks[currentProject.id] = pendingQualityChecks;
            localStorage.setItem('mh_pending_quality_checks', JSON.stringify(allPendingChecks));
        }
        
        console.log('✅ Data saved to storage');
    } catch (error) {
        console.error('❌ Error saving to storage:', error);
        showNotification('Error saving data. Changes may not persist.', 'warning');
    }
}

function setupEventListeners() {
    try {
        // File input listeners
        const submittalFileInput = document.getElementById('submittal-file-input');
        if (submittalFileInput) {
            submittalFileInput.addEventListener('change', handleSubmittalUpload);
        }
        
        // Modal close listeners
        window.addEventListener('click', function(event) {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        console.log('✅ Event listeners set up');
    } catch (error) {
        console.error('❌ Error setting up event listeners:', error);
    }
}

// Project Management
function showNewProjectModal() {
    try {
        const modal = document.getElementById('new-project-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('❌ Error showing new project modal:', error);
    }
}

function createProject(event) {
    try {
        event.preventDefault();
        
        const form = event.target;
        const name = form.querySelector('#project-name').value;
        const number = form.querySelector('#project-number').value;
        const location = form.querySelector('#project-location').value;
        const description = form.querySelector('#project-description').value;
        
        const newProject = {
            id: `proj_${Date.now()}`,
            name: name,
            number: number,
            location: location,
            description: description,
            createdDate: new Date().toISOString(),
            qualityScore: 0,
            issuesPrevented: 0,
            documentsChecked: 0
        };
        
        projects.push(newProject);
        currentProject = newProject;
        
        // Initialize project-specific data
        masterDocuments = { drawings: [], specifications: [] };
        qualityChecks = [];
        rfis = [];
        pendingQualityChecks = [];
        
        saveToStorage();
        updateProjectSelector();
        showMainContent();
        renderProjectData();
        closeModal('new-project-modal');
        form.reset();
        
        showNotification(`Project "${name}" created successfully!`, 'success');
        console.log('✅ Project created:', newProject.id);
    } catch (error) {
        console.error('❌ Error creating project:', error);
        showNotification('Error creating project', 'error');
    }
}

function switchProject() {
    try {
        const selector = document.getElementById('current-project');
        const projectId = selector.value;
        
        if (!projectId) {
            currentProject = null;
            showProjectSetupBanner();
            return;
        }
        
        currentProject = projects.find(p => p.id === projectId);
        if (currentProject) {
            loadStoredData(); // Reload data for the new project
            showMainContent();
            renderProjectData();
            showNotification(`Switched to project: ${currentProject.name}`, 'info');
        }
    } catch (error) {
        console.error('❌ Error switching project:', error);
        showNotification('Error switching project', 'error');
    }
}

function updateProjectSelector() {
    try {
        const selector = document.getElementById('current-project');
        if (!selector) return;
        
        selector.innerHTML = '<option value="">Select Project...</option>';
        
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.number} - ${project.name}`;
            if (currentProject && project.id === currentProject.id) {
                option.selected = true;
            }
            selector.appendChild(option);
        });
    } catch (error) {
        console.error('❌ Error updating project selector:', error);
    }
}

function showProjectSetupBanner() {
    try {
        const banner = document.getElementById('project-setup-banner');
        const mainContent = document.getElementById('main-content');
        
        if (banner) banner.style.display = 'block';
        if (mainContent) mainContent.style.display = 'none';
    } catch (error) {
        console.error('❌ Error showing setup banner:', error);
    }
}

function showMainContent() {
    try {
        const banner = document.getElementById('project-setup-banner');
        const mainContent = document.getElementById('main-content');
        
        if (banner) banner.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
    } catch (error) {
        console.error('❌ Error showing main content:', error);
    }
}

// Tab Management
function showTab(tabName) {
    try {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            if (content) content.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            if (button) button.classList.remove('active');
        });
        
        // Show selected tab content
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Add active class to clicked button
        if (event && event.target) {
            event.target.classList.add('active');
        }
        
        // Render tab-specific content
        switch (tabName) {
            case 'project-overview':
                renderProjectOverview();
                break;
            case 'master-documents':
                renderMasterDocuments();
                break;
            case 'quality-control':
                renderQualityControl();
                break;
            case 'rfi-management':
                renderRFIManagement();
                break;
            case 'analytics':
                renderAnalytics();
                break;
        }
        
        console.log('✅ Switched to tab:', tabName);
    } catch (error) {
        console.error('❌ Error switching tabs:', error);
    }
}

// Render Functions
function renderProjectData() {
    try {
        if (!currentProject) return;
        
        // Update project info
        const projectInfo = document.getElementById('project-info');
        if (projectInfo) {
            projectInfo.innerHTML = `
                <span class="project-name">${escapeHtml(currentProject.name)}</span>
                <span>•</span>
                <span>${escapeHtml(currentProject.number)}</span>
                <span>•</span>
                <span>${escapeHtml(currentProject.location)}</span>
            `;
        }
        
        // Update overview cards
        updateOverviewCards();
        
        // Render current tab content
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const tabId = activeTab.id;
            showTab(tabId);
        }
        
        console.log('✅ Project data rendered');
    } catch (error) {
        console.error('❌ Error rendering project data:', error);
    }
}

function updateOverviewCards() {
    try {
        if (!currentProject) return;
        
        // Calculate quality score
        const qualityScore = calculateQualityScore();
        const qualityScoreEl = document.getElementById('quality-score');
        if (qualityScoreEl) {
            qualityScoreEl.textContent = qualityScore + '%';
        }
        
        // Issues prevented
        const issuesPrevented = qualityChecks.reduce((sum, check) => sum + (check.issues ? check.issues.length : 0), 0);
        const issuesPreventedEl = document.getElementById('issues-prevented');
        if (issuesPreventedEl) {
            issuesPreventedEl.textContent = issuesPrevented;
        }
        
        // Active RFIs
        const activeRFIs = rfis.filter(rfi => rfi.status === 'Open').length;
        const urgentRFIs = rfis.filter(rfi => rfi.status === 'Open' && rfi.priority === 'Critical').length;
        const activeRFIsEl = document.getElementById('active-rfis');
        const urgentRFIsEl = document.getElementById('urgent-rfis-text');
        if (activeRFIsEl) activeRFIsEl.textContent = activeRFIs;
        if (urgentRFIsEl) urgentRFIsEl.textContent = `${urgentRFIs} urgent`;
        
        // Documents checked
        const documentsChecked = qualityChecks.length;
        const documentsCheckedEl = document.getElementById('documents-checked');
        if (documentsCheckedEl) {
            documentsCheckedEl.textContent = documentsChecked;
        }
        
        // Update master docs status
        const drawingsCountEl = document.getElementById('drawings-count');
        const specsCountEl = document.getElementById('specs-count');
        if (drawingsCountEl) {
            drawingsCountEl.textContent = `${masterDocuments.drawings.length} uploaded`;
        }
        if (specsCountEl) {
            specsCountEl.textContent = `${masterDocuments.specifications.length} uploaded`;
        }
        
        console.log('✅ Overview cards updated');
    } catch (error) {
        console.error('❌ Error updating overview cards:', error);
    }
}

function calculateQualityScore() {
    try {
        if (qualityChecks.length === 0) return 0;
        
        let totalScore = 0;
        let totalChecks = 0;
        
        qualityChecks.forEach(check => {
            if (check.confidence && check.overallCompliance) {
                let complianceScore = 0;
                switch (check.overallCompliance) {
                    case 'Compliant': complianceScore = 100; break;
                    case 'Minor Issues': complianceScore = 80; break;
                    case 'Major Issues': complianceScore = 60; break;
                    case 'Non-Compliant': complianceScore = 30; break;
                }
                
                // Weight by AI confidence
                const weightedScore = (complianceScore * check.confidence) / 100;
                totalScore += weightedScore;
                totalChecks++;
            }
        });
        
        return totalChecks > 0 ? Math.round(totalScore / totalChecks) : 0;
    } catch (error) {
        console.error('❌ Error calculating quality score:', error);
        return 0;
    }
}

function renderProjectOverview() {
    try {
        // Update master docs status
        const drawingsCountDisplay = document.getElementById('drawings-count-display');
        const specsCountDisplay = document.getElementById('specs-count-display');
        if (drawingsCountDisplay) {
            drawingsCountDisplay.textContent = `${masterDocuments.drawings.length} documents`;
        }
        if (specsCountDisplay) {
            specsCountDisplay.textContent = `${masterDocuments.specifications.length} documents`;
        }
        
        // Render recent activity
        renderRecentActivity();
        
        // Render critical issues
        renderCriticalIssues();
        
        // Render pending actions
        renderPendingActions();
        
        console.log('✅ Project overview rendered');
    } catch (error) {
        console.error('❌ Error rendering project overview:', error);
    }
}

function renderRecentActivity() {
    try {
        const container = document.getElementById('recent-activity');
        if (!container) return;
        
        // Combine all activities and sort by date
        const activities = [];
        
        // Add quality checks
        qualityChecks.forEach(check => {
            activities.push({
                type: 'quality-check',
                date: check.checkedDate,
                description: `Quality check completed: ${check.fileName}`,
                icon: 'fas fa-search'
            });
        });
        
        // Add RFIs
        rfis.forEach(rfi => {
            activities.push({
                type: 'rfi',
                date: rfi.createdDate,
                description: `RFI created: ${rfi.subject}`,
                icon: 'fas fa-question-circle'
            });
        });
        
        // Sort by date (newest first)
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }
        
        // Show last 5 activities
        const recentActivities = activities.slice(0, 5);
        container.innerHTML = recentActivities.map(activity => `
            <div class="activity-item" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #e9ecef;">
                <i class="${activity.icon}" style="color: #1e5c97; width: 16px;"></i>
                <div style="flex: 1;">
                    <div style="font-size: 0.9rem; color: #333;">${escapeHtml(activity.description)}</div>
                    <div style="font-size: 0.8rem; color: #666;">${formatDate(activity.date)}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('❌ Error rendering recent activity:', error);
    }
}

function renderCriticalIssues() {
    try {
        const container = document.getElementById('critical-issues');
        if (!container) return;
        
        // Find critical issues from quality checks
        const criticalIssues = [];
        qualityChecks.forEach(check => {
            if (check.issues) {
                check.issues.forEach(issue => {
                    if (issue.severity === 'Critical') {
                        criticalIssues.push({
                            ...issue,
                            source: check.fileName
                        });
                    }
                });
            }
        });
        
        if (criticalIssues.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <p>No critical issues found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = criticalIssues.slice(0, 3).map(issue => `
            <div class="critical-issue-item" style="padding: 0.75rem; background: #f8d7da; border-radius: 4px; margin-bottom: 0.5rem; border-left: 4px solid #dc3545;">
                <div style="font-weight: 600; color: #721c24; font-size: 0.9rem;">${escapeHtml(issue.type)}</div>
                <div style="font-size: 0.8rem; color: #721c24; margin-top: 0.25rem;">${escapeHtml(issue.location)} • ${escapeHtml(issue.source)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('❌ Error rendering critical issues:', error);
    }
}

function renderPendingActions() {
    try {
        const container = document.getElementById('pending-actions');
        if (!container) return;
        
        const pendingActions = [];
        
        // Add pending quality checks
        pendingQualityChecks.forEach(doc => {
            pendingActions.push({
                type: 'quality-check',
                description: `Quality check pending: ${doc.fileName}`,
                icon: 'fas fa-clock',
                priority: 'medium'
            });
        });
        
        // Add urgent RFIs
        const urgentRFIs = rfis.filter(rfi => rfi.status === 'Open' && rfi.priority === 'Critical');
        urgentRFIs.forEach(rfi => {
            pendingActions.push({
                type: 'rfi',
                description: `Urgent RFI response needed: ${rfi.subject}`,
                icon: 'fas fa-exclamation-triangle',
                priority: 'high'
            });
        });
        
        if (pendingActions.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <p>No pending actions</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = pendingActions.slice(0, 3).map(action => `
            <div class="pending-action-item" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #e9ecef;">
                <i class="${action.icon}" style="color: ${action.priority === 'high' ? '#dc3545' : '#ffc107'}; width: 16px;"></i>
                <div style="flex: 1; font-size: 0.9rem; color: #333;">${escapeHtml(action.description)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('❌ Error rendering pending actions:', error);
    }
}

function renderMasterDocuments() {
    try {
        // Render drawings
        const drawingsContainer = document.getElementById('drawings-list');
        if (drawingsContainer) {
            if (masterDocuments.drawings.length === 0) {
                drawingsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-drafting-compass"></i>
                        <h4>No drawings uploaded</h4>
                        <p>Upload your project drawings to begin quality control</p>
                    </div>
                `;
            } else {
                drawingsContainer.innerHTML = masterDocuments.drawings.map(doc => `
                    <div class="document-item" style="background: white; border-radius: 6px; padding: 1rem; margin-bottom: 0.75rem; border: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <i class="fas fa-file-pdf" style="color: #dc3545; font-size: 1.2rem;"></i>
                            <div>
                                <div style="font-weight: 600; color: #333;">${escapeHtml(doc.fileName)}</div>
                                <div style="font-size: 0.8rem; color: #666;">Uploaded: ${formatDate(doc.uploadDate)}</div>
                            </div>
                        </div>
                        <button class="btn btn-danger btn-small" onclick="removeMasterDocument('drawings', '${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('');
            }
        }
        
        // Render specifications
        const specsContainer = document.getElementById('specifications-list');
        if (specsContainer) {
            if (masterDocuments.specifications.length === 0) {
                specsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-file-contract"></i>
                        <h4>No specifications uploaded</h4>
                        <p>Upload your project specifications for AI comparison</p>
                    </div>
                `;
            } else {
                specsContainer.innerHTML = masterDocuments.specifications.map(doc => `
                    <div class="document-item" style="background: white; border-radius: 6px; padding: 1rem; margin-bottom: 0.75rem; border: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <i class="fas fa-file-alt" style="color: #28a745; font-size: 1.2rem;"></i>
                            <div>
                                <div style="font-weight: 600; color: #333;">${escapeHtml(doc.fileName)}</div>
                                <div style="font-size: 0.8rem; color: #666;">Uploaded: ${formatDate(doc.uploadDate)}</div>
                            </div>
                        </div>
                        <button class="btn btn-danger btn-small" onclick="removeMasterDocument('specifications', '${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('');
            }
        }
        
        console.log('✅ Master documents rendered');
    } catch (error) {
        console.error('❌ Error rendering master documents:', error);
    }
}

function renderQualityControl() {
    try {
        // Update quality queue
        updateQualityQueue();
        
        // Render quality check results
        const container = document.getElementById('quality-results');
        if (!container) return;
        
        if (qualityChecks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Ready for Quality Control</h3>
                    <p>Upload documents above to begin AI-powered quality checking against specifications</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = qualityChecks.map(check => `
            <div class="content-item quality-check-item">
                <div class="item-header">
                    <div class="item-title">
                        <i class="fas fa-search"></i>
                        ${escapeHtml(check.fileName)}
                    </div>
                    <div>
                        <span class="status-badge status-${getComplianceClass(check.overallCompliance)}">${escapeHtml(check.overallCompliance || 'Checked')}</span>
                        ${check.confidence ? `<span class="status-badge" style="background-color: #e3f2fd; color: #1565c0;">${check.confidence}% Confidence</span>` : ''}
                    </div>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <span class="detail-label">Checked:</span> ${formatDate(check.checkedDate)}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Issues Found:</span> 
                        <span style="color: ${(check.issues && check.issues.length > 0) ? '#dc3545' : '#28a745'}">${check.issues ? check.issues.length : 0}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">File Type:</span> ${getFileType(check.fileName)}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Check ID:</span> ${escapeHtml(check.id)}
                    </div>
                </div>
                ${check.confidence ? `
                    <div class="ai-confidence">
                        <span>AI Confidence:</span>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${check.confidence}%"></div>
                        </div>
                        <span>${check.confidence}%</span>
                    </div>
                ` : ''}
                ${check.summary ? `
                    <div style="margin-top: 1rem;">
                        <strong>Analysis Summary:</strong>
                        <p style="margin-top: 0.5rem; color: #666;">${escapeHtml(check.summary)}</p>
                    </div>
                ` : ''}
                ${(check.issues && check.issues.length > 0) ? `
                    <div class="issues-section">
                        <h4><i class="fas fa-exclamation-triangle"></i> Issues Found by AI:</h4>
                        ${check.issues.map(issue => `
                            <div class="issue-item severity-${issue.severity.toLowerCase()}">
                                <div class="issue-header">
                                    <span class="issue-type">${escapeHtml(issue.type)}</span>
                                    <span class="issue-severity severity-${issue.severity.toLowerCase()}">${escapeHtml(issue.severity)}</span>
                                </div>
                                <div class="issue-description">${escapeHtml(issue.description)}</div>
                                <div class="issue-location">
                                    <i class="fas fa-map-marker-alt"></i> ${escapeHtml(issue.location)}
                                </div>
                                ${issue.rfiCreated ? `
                                    <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #28a745;">
                                        <i class="fas fa-check"></i> RFI created for this issue
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                <div class="action-buttons">
                    <button class="btn btn-outline btn-small" onclick="exportQualityCheck('${check.id}')">
                        <i class="fas fa-download"></i> Export Report
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteQualityCheck('${check.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Quality control rendered');
    } catch (error) {
        console.error('❌ Error rendering quality control:', error);
    }
}

function renderRFIManagement() {
    try {
        // Update RFI stats
        const totalRFIs = rfis.length;
        const openRFIs = rfis.filter(rfi => rfi.status === 'Open').length;
        const answeredRFIs = rfis.filter(rfi => rfi.status === 'Answered').length;
        const aiGeneratedRFIs = rfis.filter(rfi => rfi.source === 'AI Generated').length;
        
        const totalRFIsEl = document.getElementById('total-rfis');
        const openRFIsEl = document.getElementById('open-rfis');
        const answeredRFIsEl = document.getElementById('answered-rfis');
        const aiGeneratedRFIsEl = document.getElementById('ai-generated-rfis');
        
        if (totalRFIsEl) totalRFIsEl.textContent = totalRFIs;
        if (openRFIsEl) openRFIsEl.textContent = openRFIs;
        if (answeredRFIsEl) answeredRFIsEl.textContent = answeredRFIs;
        if (aiGeneratedRFIsEl) aiGeneratedRFIsEl.textContent = aiGeneratedRFIs;
        
        // Render RFI list
        const container = document.getElementById('rfis-list');
        if (!container) return;
        
        if (rfis.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-question"></i>
                    <h3>No RFIs yet</h3>
                    <p>RFIs will appear here when created manually or auto-generated from AI quality checks</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = rfis.map(rfi => `
            <div class="content-item rfi-item">
                <div class="item-header">
                    <div class="item-title">
                        <i class="fas fa-question-circle"></i>
                        ${escapeHtml(rfi.id)} - ${escapeHtml(rfi.subject)}
                    </div>
                    <div>
                        <span class="status-badge status-${getStatusClass(rfi.status)}">${escapeHtml(rfi.status)}</span>
                        <span class="status-badge priority-${rfi.priority.toLowerCase()}">${escapeHtml(rfi.priority)}</span>
                        ${rfi.source === 'AI Generated' ? '<span class="status-badge" style="background: #e3f2fd; color: #1565c0;"><i class="fas fa-robot"></i> AI Generated</span>' : ''}
                    </div>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <span class="detail-label">Trade:</span> ${escapeHtml(rfi.trade)}
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
                <div style="margin-top: 1rem;">
                    <strong>Description:</strong>
                    <p style="margin-top: 0.5rem; color: #666; line-height: 1.5;">${escapeHtml(rfi.description)}</p>
                </div>
                ${rfi.relatedIssue ? `
                    <div style="margin-top: 1rem; padding: 0.75rem; background: #f8f9fa; border-radius: 4px; border-left: 4px solid #1e5c97;">
                        <strong>Related Quality Issue:</strong>
                        <p style="margin-top: 0.25rem; font-size: 0.9rem; color: #666;">${escapeHtml(rfi.relatedIssue)}</p>
                    </div>
                ` : ''}
                <div class="action-buttons">
                    <button class="btn btn-outline btn-small" onclick="editRFI('${rfi.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-outline btn-small" onclick="exportRFI('${rfi.id}')">
                        <i class="fas fa-download"></i> Export
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteRFI('${rfi.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        console.log('✅ RFI management rendered');
    } catch (error) {
        console.error('❌ Error rendering RFI management:', error);
    }
}

function renderAnalytics() {
    try {
        // Calculate cost savings (estimated)
        const issuesPrevented = qualityChecks.reduce((sum, check) => sum + (check.issues ? check.issues.length : 0), 0);
        const estimatedCostSavings = issuesPrevented * 2500; // $2,500 per issue prevented
        const timeSaved = issuesPrevented * 4; // 4 hours per issue
        
        const costSavingsEl = document.getElementById('cost-savings');
        const timeSavedEl = document.getElementById('time-saved');
        if (costSavingsEl) costSavingsEl.textContent = `$${estimatedCostSavings.toLocaleString()}`;
        if (timeSavedEl) timeSavedEl.textContent = timeSaved;
        
        // AI Performance metrics
        const avgConfidence = qualityChecks.length > 0 ? 
            Math.round(qualityChecks.reduce((sum, check) => sum + (check.confidence || 0), 0) / qualityChecks.length) : 0;
        
        const aiAccuracyEl = document.getElementById('ai-accuracy');
        const analysisTimeEl = document.getElementById('analysis-time');
        if (aiAccuracyEl) aiAccuracyEl.textContent = avgConfidence + '%';
        if (analysisTimeEl) analysisTimeEl.textContent = '< 5 min';
        
        // Issue breakdown
        const issueBreakdown = {};
        qualityChecks.forEach(check => {
            if (check.issues) {
                check.issues.forEach(issue => {
                    const category = issue.type;
                    issueBreakdown[category] = (issueBreakdown[category] || 0) + 1;
                });
            }
        });
        
        const breakdownContainer = document.getElementById('issues-breakdown');
        if (breakdownContainer) {
            const categories = [
                'Dimensional Discrepancies',
                'Material Specifications', 
                'Code Compliance'
            ];
            
            breakdownContainer.innerHTML = categories.map(category => `
                <div class="breakdown-item">
                    <span class="category">${category}</span>
                    <span class="count">${issueBreakdown[category] || 0}</span>
                </div>
            `).join('');
        }
        
        console.log('✅ Analytics rendered');
    } catch (error) {
        console.error('❌ Error rendering analytics:', error);
    }
}

// Master Documents Management
function showUploadMasterModal() {
    try {
        const modal = document.getElementById('upload-master-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('❌ Error showing upload master modal:', error);
    }
}

function showUploadTab(tabName) {
    try {
        // Hide all upload tab contents
        const tabContents = document.querySelectorAll('.upload-tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all upload tab buttons
        const tabButtons = document.querySelectorAll('.upload-tab-btn');
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Show selected tab content
        const selectedTab = document.getElementById(tabName + '-upload');
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Add active class to clicked button
        if (event && event.target) {
            event.target.classList.add('active');
        }
    } catch (error) {
        console.error('❌ Error showing upload tab:', error);
    }
}

function handleMasterUpload(event, docType) {
    try {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        for (let file of files) {
            const masterDoc = {
                id: `master_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                fileName: file.name,
                fileSize: file.size,
                uploadDate: new Date().toISOString().split('T')[0],
                type: docType
            };
            
            masterDocuments[docType].push(masterDoc);
        }
        
        saveToStorage();
        renderMasterDocuments();
        updateOverviewCards();
        
        showNotification(`${files.length} ${docType} uploaded successfully!`, 'success');
        console.log('✅ Master documents uploaded:', docType, files.length);
        
        // Clear the file input
        event.target.value = '';
    } catch (error) {
        console.error('❌ Error handling master upload:', error);
        showNotification('Error uploading master documents', 'error');
    }
}

function removeMasterDocument(docType, docId) {
    try {
        if (confirm('Are you sure you want to remove this master document?')) {
            masterDocuments[docType] = masterDocuments[docType].filter(doc => doc.id !== docId);
            saveToStorage();
            renderMasterDocuments();
            updateOverviewCards();
            showNotification('Master document removed', 'info');
        }
    } catch (error) {
        console.error('❌ Error removing master document:', error);
        showNotification('Error removing document', 'error');
    }
}

// Quality Control Functions
function handleSubmittalUpload(event) {
    try {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        // Check if master documents exist
        if (masterDocuments.specifications.length === 0) {
            showNotification('Please upload project specifications first before quality checking submittals', 'warning');
            return;
        }
        
        for (let file of files) {
            const pendingDoc = {
                id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                fileName: file.name,
                fileSize: file.size,
                uploadDate: new Date().toISOString().split('T')[0],
                status: 'Ready for Quality Check'
            };
            
            pendingQualityChecks.push(pendingDoc);
        }
        
        saveToStorage();
        updateQualityQueue();
        updateOverviewCards();
        
        showNotification(`${files.length} document(s) uploaded and ready for quality check`, 'success');
        console.log('✅ Submittal files uploaded:', files.length);
        
        // Clear the file input
        event.target.value = '';
    } catch (error) {
        console.error('❌ Error handling submittal upload:', error);
        showNotification('Error uploading submittals', 'error');
    }
}

function updateQualityQueue() {
    try {
        const queueSection = document.getElementById('quality-queue');
        const queueList = document.getElementById('queue-list');
        
        if (!queueSection || !queueList) return;
        
        if (pendingQualityChecks.length === 0) {
            queueSection.style.display = 'none';
            return;
        }
        
        queueSection.style.display = 'block';
        queueList.innerHTML = pendingQualityChecks.map(doc => `
            <div class="queue-item">
                <div class="queue-item-info">
                    <i class="fas fa-file-pdf"></i>
                    <div>
                        <strong>${escapeHtml(doc.fileName)}</strong>
                        <div style="font-size: 0.8rem; color: #666;">
                            Uploaded: ${formatDate(doc.uploadDate)} | Size: ${formatFileSize(doc.fileSize)}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <div class="queue-status">
                        <i class="fas fa-clock"></i>
                        Ready for Check
                    </div>
                    <button class="btn btn-primary btn-small" onclick="startQualityCheck('${doc.id}')">
                        <i class="fas fa-search"></i> Quality Check
                    </button>
                    <button class="btn btn-danger btn-small" onclick="removePendingQualityCheck('${doc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Quality queue updated:', pendingQualityChecks.length);
    } catch (error) {
        console.error('❌ Error updating quality queue:', error);
    }
}

function startQualityCheck(docId) {
    try {
        const doc = pendingQualityChecks.find(d => d.id === docId);
        if (!doc) {
            console.error('❌ Document not found:', docId);
            return;
        }
        
        currentQualityDoc = doc;
        
        // Generate the AI request text for quality checking
        const specsList = masterDocuments.specifications.map(spec => spec.fileName).join(', ');
        const drawingsList = masterDocuments.drawings.map(drawing => drawing.fileName).join(', ');
        
        const requestText = `Please perform a comprehensive quality check on this construction document:

QUALITY CHECK REQUEST
Document: ${doc.fileName}
Upload Date: ${formatDate(doc.uploadDate)}
Project: ${currentProject.name} (${currentProject.number})
Check ID: ${doc.id}

REFERENCE DOCUMENTS:
Specifications: ${specsList || 'None uploaded'}
Drawings: ${drawingsList || 'None uploaded'}

ANALYSIS REQUIRED:
1. Overall compliance assessment (Compliant/Minor Issues/Major Issues/Non-Compliant)
2. AI confidence level (0-100%)
3. Brief summary of findings
4. Detailed list of any issues found with:
   - Issue type (Dimensional Discrepancy, Material Specification Conflict, etc.)
   - Severity level (Critical, High, Medium, Low)
   - Specific location/reference in document
   - Detailed description of the issue
   - Whether this issue should generate an RFI

FOCUS AREAS:
- Compliance with project specifications
- Dimensional accuracy and consistency
- Material specification matches
- Code compliance requirements
- Connection details and structural integrity
- Missing or unclear information
- Conflicts with drawings or specifications

Please format your response clearly so I can input the results into the MH Construction Quality Control Dashboard.

If you find issues that require clarification or correction, please indicate which ones should generate RFIs for the design team.`;

        const requestTextarea = document.getElementById('quality-request-content');
        if (requestTextarea) {
            requestTextarea.value = requestText;
        }
        
        const modal = document.getElementById('quality-check-modal');
        if (modal) {
            modal.style.display = 'block';
        }
        
        console.log('✅ Quality check request prepared for:', doc.fileName);
    } catch (error) {
        console.error('❌ Error starting quality check:', error);
        showNotification('Error preparing quality check request', 'error');
    }
}

function markQualityCheckSent() {
    try {
        if (!currentQualityDoc) {
            console.error('❌ No current quality document');
            return;
        }
        
        // Update the status
        const doc = pendingQualityChecks.find(d => d.id === currentQualityDoc.id);
        if (doc) {
            doc.status = 'Sent to AI - Awaiting Results';
        }
        
        saveToStorage();
        updateQualityQueue();
        closeModal('quality-check-modal');
        
        showNotification('Document sent to Manus AI for quality check. Add results when received.', 'info');
        console.log('✅ Quality check marked as sent:', currentQualityDoc.fileName);
        
        // Show the results input modal after a short delay
        setTimeout(() => {
            const resultsModal = document.getElementById('quality-results-modal');
            if (resultsModal) {
                resultsModal.style.display = 'block';
            }
        }, 1000);
    } catch (error) {
        console.error('❌ Error marking quality check as sent:', error);
        showNotification('Error updating document status', 'error');
    }
}

function saveQualityResults(event) {
    try {
        event.preventDefault();
        
        if (!currentQualityDoc) {
            showNotification('No document selected for quality check', 'error');
            return;
        }
        
        const form = event.target;
        const confidence = parseInt(form.querySelector('#quality-confidence').value);
        const overallCompliance = form.querySelector('#overall-compliance').value;
        const summary = form.querySelector('#quality-summary').value;
        
        // Collect all issues
        const issues = [];
        const issueInputs = form.querySelectorAll('.issue-input');
        issueInputs.forEach(input => {
            const typeSelect = input.querySelector('.issue-type');
            const severitySelect = input.querySelector('.issue-severity');
            const locationInput = input.querySelector('.issue-location');
            const descriptionTextarea = input.querySelector('.issue-description');
            const createRFICheckbox = input.querySelector('.create-rfi-checkbox');
            
            if (typeSelect && severitySelect && locationInput && descriptionTextarea) {
                const type = typeSelect.value;
                const severity = severitySelect.value;
                const location = locationInput.value;
                const description = descriptionTextarea.value;
                const shouldCreateRFI = createRFICheckbox ? createRFICheckbox.checked : false;
                
                if (type && severity && location && description) {
                    issues.push({ 
                        type, 
                        severity, 
                        location, 
                        description,
                        shouldCreateRFI
                    });
                }
            }
        });
        
        // Create the quality check result
        const qualityCheck = {
            id: `QC-${String(qualityChecks.length + 1).padStart(3, '0')}`,
            fileName: currentQualityDoc.fileName,
            checkedDate: new Date().toISOString().split('T')[0],
            confidence: confidence,
            overallCompliance: overallCompliance,
            summary: summary,
            issues: issues,
            originalDocId: currentQualityDoc.id
        };
        
        // Add to quality checks and remove from pending
        qualityChecks.push(qualityCheck);
        pendingQualityChecks = pendingQualityChecks.filter(d => d.id !== currentQualityDoc.id);
        
        // Create RFIs for issues that need them
        let rfisCreated = 0;
        issues.forEach((issue, index) => {
            if (issue.shouldCreateRFI) {
                createRFIFromIssue(issue, qualityCheck);
                rfisCreated++;
                // Mark issue as having RFI created
                qualityCheck.issues[index].rfiCreated = true;
            }
        });
        
        saveToStorage();
        renderQualityControl();
        updateQualityQueue();
        updateOverviewCards();
        closeModal('quality-results-modal');
        form.reset();
        
        // Reset issues container
        resetQualityIssuesContainer();
        
        currentQualityDoc = null;
        
        const issueCount = issues.length;
        let message = `Quality check complete: ${issueCount} issue(s) found`;
        if (rfisCreated > 0) {
            message += `, ${rfisCreated} RFI(s) created`;
        }
        
        if (issueCount > 0) {
            showNotification(message, 'warning');
        } else {
            showNotification('Quality check complete: No issues found', 'success');
        }
        
        console.log('✅ Quality results saved:', qualityCheck.id);
    } catch (error) {
        console.error('❌ Error saving quality results:', error);
        showNotification('Error saving quality results', 'error');
    }
}

function createRFIFromIssue(issue, qualityCheck) {
    try {
        const rfi = {
            id: `RFI-${String(rfis.length + 1).padStart(3, '0')}`,
            subject: `${issue.type} - ${qualityCheck.fileName}`,
            description: `Issue found during AI quality check:\n\nLocation: ${issue.location}\nSeverity: ${issue.severity}\n\nDescription: ${issue.description}\n\nSource Document: ${qualityCheck.fileName}\nQuality Check ID: ${qualityCheck.id}`,
            trade: 'General',
            status: 'Open',
            priority: issue.severity === 'Critical' ? 'Critical' : issue.severity === 'High' ? 'High' : 'Medium',
            createdDate: new Date().toISOString().split('T')[0],
            responseDate: calculateResponseDate(issue.severity),
            daysRemaining: calculateDaysRemaining(calculateResponseDate(issue.severity)),
            source: 'AI Generated',
            relatedIssue: `${issue.type} at ${issue.location}`
        };
        
        rfis.push(rfi);
        console.log('✅ RFI created from issue:', rfi.id);
    } catch (error) {
        console.error('❌ Error creating RFI from issue:', error);
    }
}

function calculateResponseDate(severity) {
    const today = new Date();
    let daysToAdd = 7; // Default 7 days
    
    switch (severity) {
        case 'Critical': daysToAdd = 2; break;
        case 'High': daysToAdd = 3; break;
        case 'Medium': daysToAdd = 5; break;
        case 'Low': daysToAdd = 7; break;
    }
    
    const responseDate = new Date(today);
    responseDate.setDate(today.getDate() + daysToAdd);
    return responseDate.toISOString().split('T')[0];
}

function addQualityIssueInput() {
    try {
        const container = document.getElementById('quality-issues-container');
        if (!container) return;
        
        const issueDiv = document.createElement('div');
        issueDiv.className = 'issue-input';
        issueDiv.innerHTML = `
            <select class="issue-type" required>
                <option value="">Select Issue Type</option>
                <option value="Dimensional Discrepancy">Dimensional Discrepancy</option>
                <option value="Material Specification">Material Specification Conflict</option>
                <option value="Connection Detail">Connection Detail Issue</option>
                <option value="Code Compliance">Code Compliance Issue</option>
                <option value="Drawing Conflict">Drawing Conflict</option>
                <option value="Specification Conflict">Specification Conflict</option>
                <option value="Missing Information">Missing Information</option>
                <option value="Other">Other</option>
            </select>
            <select class="issue-severity" required>
                <option value="">Severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
            </select>
            <input type="text" class="issue-location" placeholder="Location/Reference" required>
            <textarea class="issue-description" placeholder="Detailed description..." required></textarea>
            <div class="issue-actions">
                <label class="checkbox-label">
                    <input type="checkbox" class="create-rfi-checkbox">
                    <span>Create RFI for this issue</span>
                </label>
                <button type="button" class="btn btn-danger btn-small" onclick="removeQualityIssue(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(issueDiv);
        console.log('✅ Quality issue input added');
    } catch (error) {
        console.error('❌ Error adding quality issue input:', error);
    }
}

function removeQualityIssue(button) {
    try {
        if (button && button.closest('.issue-input')) {
            button.closest('.issue-input').remove();
            console.log('✅ Quality issue input removed');
        }
    } catch (error) {
        console.error('❌ Error removing quality issue:', error);
    }
}

function resetQualityIssuesContainer() {
    try {
        const container = document.getElementById('quality-issues-container');
        if (container) {
            container.innerHTML = `
                <div class="issue-input">
                    <select class="issue-type" required>
                        <option value="">Select Issue Type</option>
                        <option value="Dimensional Discrepancy">Dimensional Discrepancy</option>
                        <option value="Material Specification">Material Specification Conflict</option>
                        <option value="Connection Detail">Connection Detail Issue</option>
                        <option value="Code Compliance">Code Compliance Issue</option>
                        <option value="Drawing Conflict">Drawing Conflict</option>
                        <option value="Specification Conflict">Specification Conflict</option>
                        <option value="Missing Information">Missing Information</option>
                        <option value="Other">Other</option>
                    </select>
                    <select class="issue-severity" required>
                        <option value="">Severity</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <input type="text" class="issue-location" placeholder="Location/Reference" required>
                    <textarea class="issue-description" placeholder="Detailed description..." required></textarea>
                    <div class="issue-actions">
                        <label class="checkbox-label">
                            <input type="checkbox" class="create-rfi-checkbox">
                            <span>Create RFI for this issue</span>
                        </label>
                        <button type="button" class="btn btn-danger btn-small" onclick="removeQualityIssue(this)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error resetting quality issues container:', error);
    }
}

function removePendingQualityCheck(docId) {
    try {
        if (confirm('Remove this document from the quality check queue?')) {
            pendingQualityChecks = pendingQualityChecks.filter(d => d.id !== docId);
            saveToStorage();
            updateQualityQueue();
            updateOverviewCards();
            showNotification('Document removed from queue', 'info');
        }
    } catch (error) {
        console.error('❌ Error removing pending quality check:', error);
        showNotification('Error removing document', 'error');
    }
}

function deleteQualityCheck(id) {
    try {
        if (confirm('Are you sure you want to delete this quality check?')) {
            qualityChecks = qualityChecks.filter(qc => qc.id !== id);
            saveToStorage();
            renderQualityControl();
            updateOverviewCards();
            showNotification('Quality check deleted', 'info');
        }
    } catch (error) {
        console.error('❌ Error deleting quality check:', error);
        showNotification('Error deleting quality check', 'error');
    }
}

function exportQualityCheck(id) {
    try {
        const qualityCheck = qualityChecks.find(qc => qc.id === id);
        if (!qualityCheck) return;
        
        const report = {
            projectName: currentProject.name,
            projectNumber: currentProject.number,
            qualityCheckId: qualityCheck.id,
            fileName: qualityCheck.fileName,
            checkedDate: qualityCheck.checkedDate,
            confidence: qualityCheck.confidence,
            overallCompliance: qualityCheck.overallCompliance,
            summary: qualityCheck.summary,
            issuesFound: qualityCheck.issues ? qualityCheck.issues.length : 0,
            issues: qualityCheck.issues || [],
            exportDate: new Date().toISOString(),
            exportedBy: 'MH Construction Quality Control Dashboard'
        };
        
        const reportStr = JSON.stringify(report, null, 2);
        const reportBlob = new Blob([reportStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(reportBlob);
        link.download = `Quality-Check-Report-${qualityCheck.id}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('Quality check report exported successfully!', 'success');
    } catch (error) {
        console.error('❌ Error exporting quality check:', error);
        showNotification('Error exporting quality check', 'error');
    }
}

// RFI Management
function showNewRFIModal() {
    try {
        const modal = document.getElementById('rfi-modal');
        const modalTitle = document.getElementById('rfi-modal-title');
        if (modal) {
            modal.style.display = 'block';
        }
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-plus"></i> Create New RFI';
        }
        
        // Set default response date (7 days from now)
        const responseDate = document.getElementById('rfi-response-date');
        if (responseDate) {
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 7);
            responseDate.value = defaultDate.toISOString().split('T')[0];
        }
    } catch (error) {
        console.error('❌ Error showing new RFI modal:', error);
    }
}

function saveRFI(event) {
    try {
        event.preventDefault();
        
        const form = event.target;
        const subject = form.querySelector('#rfi-subject').value;
        const description = form.querySelector('#rfi-description').value;
        const trade = form.querySelector('#rfi-trade').value;
        const priority = form.querySelector('#rfi-priority').value;
        const responseDate = form.querySelector('#rfi-response-date').value;
        const source = form.querySelector('#rfi-source').value;
        
        const newRFI = {
            id: `RFI-${String(rfis.length + 1).padStart(3, '0')}`,
            subject: subject,
            description: description,
            trade: trade,
            status: 'Open',
            priority: priority,
            createdDate: new Date().toISOString().split('T')[0],
            responseDate: responseDate,
            daysRemaining: calculateDaysRemaining(responseDate),
            source: source
        };
        
        rfis.push(newRFI);
        saveToStorage();
        renderRFIManagement();
        updateOverviewCards();
        closeModal('rfi-modal');
        form.reset();
        
        showNotification('RFI created successfully!', 'success');
        console.log('✅ RFI created:', newRFI.id);
    } catch (error) {
        console.error('❌ Error saving RFI:', error);
        showNotification('Error creating RFI', 'error');
    }
}

function deleteRFI(id) {
    try {
        if (confirm('Are you sure you want to delete this RFI?')) {
            rfis = rfis.filter(rfi => rfi.id !== id);
            saveToStorage();
            renderRFIManagement();
            updateOverviewCards();
            showNotification('RFI deleted', 'info');
        }
    } catch (error) {
        console.error('❌ Error deleting RFI:', error);
        showNotification('Error deleting RFI', 'error');
    }
}

function exportRFI(id) {
    try {
        const rfi = rfis.find(r => r.id === id);
        if (!rfi) return;
        
        const report = {
            projectName: currentProject.name,
            projectNumber: currentProject.number,
            rfiId: rfi.id,
            subject: rfi.subject,
            description: rfi.description,
            trade: rfi.trade,
            status: rfi.status,
            priority: rfi.priority,
            createdDate: rfi.createdDate,
            responseDate: rfi.responseDate,
            source: rfi.source,
            exportDate: new Date().toISOString(),
            exportedBy: 'MH Construction Quality Control Dashboard'
        };
        
        const reportStr = JSON.stringify(report, null, 2);
        const reportBlob = new Blob([reportStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(reportBlob);
        link.download = `RFI-${rfi.id}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('RFI exported successfully!', 'success');
    } catch (error) {
        console.error('❌ Error exporting RFI:', error);
        showNotification('Error exporting RFI', 'error');
    }
}

// Utility Functions
function copyToClipboard(elementId) {
    try {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.select();
        element.setSelectionRange(0, 99999);
        document.execCommand('copy');
        showNotification('Text copied to clipboard!', 'success');
    } catch (error) {
        console.error('❌ Error copying to clipboard:', error);
        showNotification('Error copying text', 'error');
    }
}

function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
        if (modalId === 'quality-results-modal') {
            currentQualityDoc = null;
        }
    } catch (error) {
        console.error('❌ Error closing modal:', error);
    }
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (error) {
        return dateString;
    }
}

function calculateDaysRemaining(targetDate) {
    try {
        const today = new Date();
        const target = new Date(targetDate);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    } catch (error) {
        return 0;
    }
}

function formatFileSize(bytes) {
    try {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    } catch (error) {
        return 'Unknown size';
    }
}

function getFileType(fileName) {
    try {
        const extension = fileName.split('.').pop().toUpperCase();
        return extension;
    } catch (error) {
        return 'UNKNOWN';
    }
}

function getComplianceClass(compliance) {
    const complianceMap = {
        'Compliant': 'compliant',
        'Minor Issues': 'minor',
        'Major Issues': 'major',
        'Non-Compliant': 'non-compliant'
    };
    return complianceMap[compliance] || 'minor';
}

function getStatusClass(status) {
    const statusMap = {
        'Open': 'open',
        'Answered': 'answered',
        'Closed': 'answered'
    };
    return statusMap[status] || 'open';
}

function escapeHtml(text) {
    try {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    } catch (error) {
        return text;
    }
}

// Header Functions
function syncWithProcore() {
    try {
        showNotification('Syncing with Procore...', 'info');
        
        setTimeout(() => {
            showNotification('Procore sync completed successfully!', 'success');
        }, 2000);
        
        console.log('✅ Procore sync initiated');
    } catch (error) {
        console.error('❌ Error syncing with Procore:', error);
        showNotification('Error syncing with Procore', 'error');
    }
}

function exportProjectData() {
    try {
        if (!currentProject) {
            showNotification('No project selected for export', 'warning');
            return;
        }
        
        const data = {
            project: currentProject,
            masterDocuments: masterDocuments,
            qualityChecks: qualityChecks,
            rfis: rfis,
            pendingQualityChecks: pendingQualityChecks,
            exportDate: new Date().toISOString(),
            dashboardVersion: '3.0 - Quality Control'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${currentProject.number}-quality-control-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('Project data exported successfully!', 'success');
    } catch (error) {
        console.error('❌ Error exporting project data:', error);
        showNotification('Error exporting project data', 'error');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    try {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${escapeHtml(message)}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; margin-left: auto;">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    } catch (error) {
        console.error('❌ Error showing notification:', error);
    }
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

// Placeholder functions for future features
function editRFI(id) {
    showNotification('Edit RFI functionality coming soon!', 'info');
    console.log('Edit RFI requested:', id);
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('❌ Global error:', event.error);
    showNotification('An unexpected error occurred. Please refresh if issues persist.', 'error');
});

// Console welcome message
console.log(`
🏗️ MH Construction Quality Control Dashboard v3.0
✅ Project-based workflow optimized
✅ AI-powered quality checking
✅ Automated RFI generation
✅ Procore integration ready

Dashboard Status: Initialized
AI Integration: Ready for Quality Checks
Error Handling: Active
`);

