/**
 * Export Module for Northwave Resilience Scenario Builder
 * Handles exporting scenario data to CSV and other formats
 */

const exportModule = (function() {
    /**
     * Initialize the export module
     */
    function init() {
        console.log('Export Module initialized');
    }
    
    /**
     * Get the HTML content for the export modal
     * @returns {HTMLElement} - The modal content
     */
    function getExportModalContent() {
        const content = document.createElement('div');
        content.className = 'export-modal-content';
        
        content.innerHTML = `
            <div class="form-group">
                <label for="export-format">Export Format</label>
                <select id="export-format">
                    <option value="csv" selected>CSV (Exercise Injects)</option>
                    <option value="csv-detailed">CSV with Details</option>
                    <option value="print">Printable Version</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Include Phases</label>
                <div class="checkbox-grid">
                    ${Object.keys(APP_STATE.scenario.phases)
                        .filter(phase => phase !== 'setup' && APP_STATE.scenario.phases[phase])
                        .map(phase => `
                            <label>
                                <input type="checkbox" name="export-phase" value="${phase}" checked> 
                                ${PHASES[phase]?.name || phase}
                            </label>
                        `).join('')}
                </div>
            </div>
            
            <div class="form-group">
                <label>Options</label>
                <div class="checkbox-grid">
                    <label>
                        <input type="checkbox" id="export-include-red-herrings" checked> 
                        Include Red Herrings
                    </label>
                    <label>
                        <input type="checkbox" id="export-include-expected-actions" checked> 
                        Include Expected Actions
                    </label>
                    <label>
                        <input type="checkbox" id="export-sort-by-time" checked> 
                        Sort by Timeline
                    </label>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="exportModule.performExport()">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        `;
        
        return content;
    }
    
    /**
     * Perform the export based on selected options
     */
    function performExport() {
        // Get selected format
        const format = document.getElementById('export-format').value;
        
        // Get selected phases
        const selectedPhases = Array.from(
            document.querySelectorAll('input[name="export-phase"]:checked')
        ).map(input => input.value);
        
        // Get options
        const includeRedHerrings = document.getElementById('export-include-red-herrings').checked;
        const includeExpectedActions = document.getElementById('export-include-expected-actions').checked;
        const sortByTime = document.getElementById('export-sort-by-time').checked;
        
        // Filter injects
        let injects = APP_STATE.scenario.injects.filter(inject => {
            // Filter by phase
            if (!selectedPhases.includes(inject.phase)) {
                return false;
            }
            
            // Filter red herrings if not included
            if (!includeRedHerrings && inject.isRedHerring) {
                return false;
            }
            
            return true;
        });
        
        // Sort injects
        if (sortByTime) {
            // Sort by day and time
            injects.sort((a, b) => {
                // Extract day
                const dayA = parseInt(a.timestamp.split(' - ')[0].replace('Day ', ''));
                const dayB = parseInt(b.timestamp.split(' - ')[0].replace('Day ', ''));
                
                // Compare days
                if (dayA !== dayB) {
                    return dayA - dayB;
                }
                
                // Extract time
                const timeA = a.timestamp.split(' - ')[1];
                const timeB = b.timestamp.split(' - ')[1];
                
                // Compare times
                return timeA.localeCompare(timeB);
            });
        } else {
            // Sort by phase and ID
            injects.sort((a, b) => {
                // Sort by phase order
                const phaseOrder = ['identification', 'containment', 'eradication', 'recovery', 'hardening'];
                const phaseA = phaseOrder.indexOf(a.phase);
                const phaseB = phaseOrder.indexOf(b.phase);
                
                if (phaseA !== phaseB) {
                    return phaseA - phaseB;
                }
                
                // Sort by ID if same phase
                return a.id.localeCompare(b.id);
            });
        }
        
        // Export in the selected format
        switch (format) {
            case 'csv':
                exportCSV(injects, includeExpectedActions);
                break;
            case 'csv-detailed':
                exportDetailedCSV(injects, includeExpectedActions);
                break;
            case 'print':
                exportPrintable(injects, includeExpectedActions);
                break;
            default:
                showMessage('Invalid export format selected.', 'error');
        }
        
        // Close the modal
        closeModal();
    }
    
    /**
     * Export injects to a CSV file
     * @param {Array} injects - Array of injects to export
     * @param {boolean} includeExpectedActions - Whether to include expected actions
     */
    function exportCSV(injects, includeExpectedActions) {
        // Define CSV headers
        const headers = [
            'ID',
            'Title',
            'Phase',
            'Time',
            'Type',
            'Sender',
            'Recipient',
            'Content',
            'Business Impact',
            includeExpectedActions ? 'Expected Actions' : null,
            'Red Herring'
        ].filter(Boolean);
        
        // Create CSV rows
        const rows = injects.map(inject => {
            return [
                inject.id,
                inject.title,
                PHASES[inject.phase]?.name || inject.phase,
                inject.timestamp,
                inject.type,
                inject.sender,
                inject.recipient,
                `"${cleanForCSV(inject.content)}"`,
                inject.businessImpact ? `"${cleanForCSV(inject.businessImpact)}"` : '',
                includeExpectedActions ? `"${inject.expectedActions ? cleanForCSV(inject.expectedActions.join('; ')) : ''}"` : null,
                inject.isRedHerring ? 'Yes' : 'No'
            ].filter(Boolean);
        });
        
        // Combine headers and rows
        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        // Create a download
        downloadFile(csv, getScenarioFilename('csv'), 'text/csv');
    }
    
    /**
     * Export injects to a detailed CSV file
     * @param {Array} injects - Array of injects to export
     * @param {boolean} includeExpectedActions - Whether to include expected actions
     */
    function exportDetailedCSV(injects, includeExpectedActions) {
        // Define CSV headers
        const headers = [
            'ID',
            'Title',
            'Phase',
            'Time',
            'Type',
            'Category',
            'Sender',
            'Recipient',
            'Content',
            'Business Impact',
            'Technical Details',
            includeExpectedActions ? 'Expected Actions' : null,
            'MITRE Techniques',
            'Red Herring',
            'Comments'
        ].filter(Boolean);
        
        // Create CSV rows
        const rows = injects.map(inject => {
            return [
                inject.id,
                inject.title,
                PHASES[inject.phase]?.name || inject.phase,
                inject.timestamp,
                inject.type,
                inject.category,
                inject.sender,
                inject.recipient,
                `"${cleanForCSV(inject.content)}"`,
                inject.businessImpact ? `"${cleanForCSV(inject.businessImpact)}"` : '',
                inject.technicalDetails ? `"${cleanForCSV(inject.technicalDetails)}"` : '',
                includeExpectedActions ? `"${inject.expectedActions ? cleanForCSV(inject.expectedActions.join('; ')) : ''}"` : null,
                inject.mitreTechniques ? inject.mitreTechniques.join('; ') : '',
                inject.isRedHerring ? 'Yes' : 'No',
                ''  // Empty comments column for facilitator notes
            ].filter(Boolean);
        });
        
        // Combine headers and rows
        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        // Create a download
        downloadFile(csv, getScenarioFilename('detailed.csv'), 'text/csv');
    }
    
    /**
     * Export injects to a printable HTML document
     * @param {Array} injects - Array of injects to export
     * @param {boolean} includeExpectedActions - Whether to include expected actions
     */
    function exportPrintable(injects, includeExpectedActions) {
        // Create a new HTML document
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${getScenarioTitle()} - Exercise Injects</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    
                    h1, h2, h3, h4 {
                        margin-top: 0;
                    }
                    
                    .scenario-info {
                        margin-bottom: 30px;
                        padding: 20px;
                        background-color: #f5f5f5;
                        border-radius: 5px;
                    }
                    
                    .inject {
                        margin-bottom: 30px;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        page-break-inside: avoid;
                    }
                    
                    .inject-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .inject-id {
                        font-weight: bold;
                        color: #666;
                    }
                    
                    .inject-time {
                        color: #666;
                    }
                    
                    .inject-title {
                        font-size: 1.2em;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    
                    .inject-metadata {
                        margin-bottom: 15px;
                        padding: 10px;
                        background-color: #f5f5f5;
                        border-radius: 3px;
                    }
                    
                    .inject-content {
                        white-space: pre-wrap;
                        margin-bottom: 15px;
                        padding: 10px;
                        background-color: #fff;
                        border: 1px solid #eee;
                        border-radius: 3px;
                    }
                    
                    .inject-business-impact {
                        margin-top: 10px;
                        margin-bottom: 10px;
                        padding: 10px;
                        background-color: #e1f5fe;
                        border-radius: 3px;
                    }
                    
                    .inject-expected-actions {
                        margin-top: 10px;
                        padding: 10px;
                        background-color: #f0f4c3;
                        border-radius: 3px;
                    }
                    
                    .red-herring {
                        background-color: #ffebee;
                    }
                    
                    .red-herring-tag {
                        display: inline-block;
                        padding: 2px 8px;
                        background-color: #f44336;
                        color: white;
                        border-radius: 3px;
                        font-size: 0.8em;
                        margin-left: 10px;
                    }
                    
                    .phase-header {
                        margin-top: 40px;
                        margin-bottom: 20px;
                        padding: 10px;
                        background-color: #e0f2f1;
                        border-left: 5px solid #26a69a;
                    }
                    
                    @media print {
                        body {
                            font-size: 12pt;
                        }
                        
                        .no-print {
                            display: none;
                        }
                        
                        .inject {
                            border: 1px solid #999;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="scenario-info">
                    <h1>${getScenarioTitle()}</h1>
                    <p>
                        <strong>Scenario:</strong> ${APP_STATE.scenario.params.attackType} by ${APP_STATE.scenario.params.threatActor}<br>
                        <strong>Organization:</strong> ${APP_STATE.scenario.params.organizationSector} (${APP_STATE.scenario.params.organizationSize})<br>
                        <strong>Difficulty:</strong> ${APP_STATE.scenario.params.difficulty || 'Moderate'}<br>
                        <strong>Phases:</strong> ${injects.map(i => i.phase).filter((v, i, a) => a.indexOf(v) === i).map(p => PHASES[p]?.name || p).join(', ')}
                    </p>
                    ${APP_STATE.scenario.params.summary ? `<p><strong>Summary:</strong> ${APP_STATE.scenario.params.summary}</p>` : ''}
                </div>
                
                <div class="no-print">
                    <p><strong>Note:</strong> This document is formatted for printing. Use your browser's print function to create a PDF or paper copy.</p>
                    <button onclick="window.print()">Print Document</button>
                </div>
                
                <div class="injects">
                    ${renderPrintableInjects(injects, includeExpectedActions)}
                </div>
            </body>
            </html>
        `;
        
        // Open a new window with the HTML content
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
    }
    
    /**
     * Render printable injects HTML
     * @param {Array} injects - Array of injects to render
     * @param {boolean} includeExpectedActions - Whether to include expected actions
     * @returns {string} - HTML for the injects
     */
    function renderPrintableInjects(injects, includeExpectedActions) {
        // Group injects by phase
        const injectsByPhase = {};
        
        injects.forEach(inject => {
            if (!injectsByPhase[inject.phase]) {
                injectsByPhase[inject.phase] = [];
            }
            
            injectsByPhase[inject.phase].push(inject);
        });
        
        // Render each phase
        let html = '';
        
        // Define phase order
        const phaseOrder = ['identification', 'containment', 'eradication', 'recovery', 'hardening'];
        
        // Render phases in order
        phaseOrder.forEach(phase => {
            if (injectsByPhase[phase]) {
                // Add phase header
                html += `
                    <div class="phase-header">
                        <h2>${PHASES[phase]?.name || phase} Phase</h2>
                        <p>${PHASES[phase]?.description || ''}</p>
                    </div>
                `;
                
                // Render injects for this phase
                injectsByPhase[phase].forEach(inject => {
                    html += `
                        <div class="inject ${inject.isRedHerring ? 'red-herring' : ''}">
                            <div class="inject-header">
                                <div class="inject-id">${inject.id}</div>
                                <div class="inject-time">${inject.timestamp}</div>
                            </div>
                            
                            <div class="inject-title">
                                ${inject.title}
                                ${inject.isRedHerring ? '<span class="red-herring-tag">Red Herring</span>' : ''}
                            </div>
                            
                            <div class="inject-metadata">
                                <strong>Type:</strong> ${inject.type} | 
                                <strong>From:</strong> ${inject.sender} | 
                                <strong>To:</strong> ${inject.recipient}
                            </div>
                            
                            <div class="inject-content">
                                ${formatContent(inject.content)}
                            </div>
                            
                            ${inject.businessImpact ? `
                                <div class="inject-business-impact">
                                    <strong>Business Impact:</strong><br>
                                    ${inject.businessImpact}
                                </div>
                            ` : ''}
                            
                            ${includeExpectedActions && inject.expectedActions && inject.expectedActions.length > 0 ? `
                                <div class="inject-expected-actions">
                                    <strong>Expected Actions:</strong>
                                    <ul>
                                        ${inject.expectedActions.map(action => `<li>${action}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    `;
                });
            }
        });
        
        return html;
    }
    
    /**
     * Format content for HTML display
     * @param {string} content - The content to format
     * @returns {string} - Formatted content
     */
    function formatContent(content) {
        if (!content) return '';
        
        // Replace newlines with <br> tags
        return content.replace(/\n/g, '<br>');
    }
    
    /**
     * Clean a string for CSV output
     * @param {string} str - The string to clean
     * @returns {string} - Cleaned string
     */
    function cleanForCSV(str) {
        if (!str) return '';
        
        // Remove quotes or double them
        return str.replace(/"/g, '""');
    }
    
    /**
     * Get a filename for the scenario export
     * @param {string} extension - The file extension
     * @returns {string} - The filename
     */
    function getScenarioFilename(extension) {
        const title = getScenarioTitle();
        const date = new Date().toISOString().split('T')[0];
        
        return `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${date}.${extension}`;
    }
    
    /**
     * Get the scenario title
     * @returns {string} - The scenario title
     */
    function getScenarioTitle() {
        return APP_STATE.scenario.params.title || 
            `${APP_STATE.scenario.params.attackType} Scenario - ${APP_STATE.scenario.params.organizationSector}`;
    }
    
    /**
     * Download a file
     * @param {string} content - The file content
     * @param {string} filename - The filename
     * @param {string} contentType - The content type
     */
    function downloadFile(content, filename, contentType) {
        // Create a blob
        const blob = new Blob([content], { type: contentType });
        
        // Create a link
        const link = document.createElement('a');
        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        
        // Click the link
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(link.href), 100);
        
        showMessage(`Exported scenario as ${filename}`, 'success');
    }
    
    // Public API
    return {
        init,
        getExportModalContent,
        performExport
    };
})();