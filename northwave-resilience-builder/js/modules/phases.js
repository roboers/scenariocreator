/**
 * Phases Module for Northwave Resilience Scenario Builder
 * Handles the phase-specific functionality
 */

const phasesModule = (function() {
    /**
     * Initialize the phases module
     */
    function init() {
        console.log('Phases Module initialized');
    }
    
    /**
     * Initialize a specific phase
     * @param {string} phaseId - The ID of the phase to initialize
     */
    function initPhase(phaseId) {
        console.log(`Initializing ${phaseId} phase`);
        
        // Update the phase content
        updatePhaseContent(phaseId);
        
        // Set up event listeners
        setupPhaseEventListeners(phaseId);
        
        // Initialize custom event buttons
        initCustomEventButtons(phaseId);
        
        // Initialize the phase with existing injects if available
        if (APP_STATE.scenario.phases[phaseId]) {
            renderExistingInjects(phaseId);
        }
    }
    
    /**
     * Update the phase content with phase-specific information
     * @param {string} phaseId - The ID of the phase
     */
    function updatePhaseContent(phaseId) {
        // Update phase title and description
        const phaseHeader = document.querySelector('.phase-header h2');
        const phaseDescription = document.querySelector('.phase-header p');
        
        if (phaseHeader && PHASES[phaseId]) {
            phaseHeader.textContent = `${PHASES[phaseId].name} Phase`;
        }
        
        if (phaseDescription && PHASES[phaseId]) {
            phaseDescription.textContent = PHASES[phaseId].description;
        }
        
        // Update inject balance display
        updateInjectBalance(phaseId);
        
        // Update phase navigation buttons
        updatePhaseNavigation(phaseId);
    }
    
    /**
     * Set up event listeners for the phase
     * @param {string} phaseId - The ID of the phase
     */
    function setupPhaseEventListeners(phaseId) {
        // Add custom inject button
        const addInjectBtn = document.getElementById('add-inject-btn');
        if (addInjectBtn) {
            addInjectBtn.addEventListener('click', () => {
                showAddInjectModal(phaseId);
            });
        }
        
        // Generate injects button
        const generateInjectsBtn = document.getElementById('generate-injects-btn');
        if (generateInjectsBtn) {
            generateInjectsBtn.addEventListener('click', () => {
                generateInjects(phaseId);
            });
        }
        
        // Previous phase button
        const previousPhaseBtn = document.getElementById('previous-phase-btn');
        if (previousPhaseBtn) {
            previousPhaseBtn.addEventListener('click', () => {
                navigateToPreviousPhase();
            });
        }
        
        // Next phase button
        const nextPhaseBtn = document.getElementById('next-phase-btn');
        if (nextPhaseBtn) {
            nextPhaseBtn.addEventListener('click', () => {
                navigateToNextPhase(phaseId);
            });
        }
    }
    
    /**
     * Initialize custom event buttons
     * @param {string} phaseId - The ID of the phase
     */
    function initCustomEventButtons(phaseId) {
        const container = document.querySelector('.event-buttons');
        if (!container) return;
        
        // Clear existing buttons
        container.innerHTML = '';
        
        // Get relevant event types based on the phase
        const relevantEvents = getRelevantEventsForPhase(phaseId);
        
        // Create buttons for each event type
        relevantEvents.forEach(event => {
            const button = document.createElement('div');
            button.className = `event-button ${event.category}`;
            button.setAttribute('data-event-id', event.id);
            
            button.innerHTML = `
                <div class="event-icon"><i class="${event.icon}"></i></div>
                <div class="event-name">${event.name}</div>
            `;
            
            button.addEventListener('click', () => {
                generateCustomInject(event.id, phaseId);
            });
            
            container.appendChild(button);
        });
    }
    
    /**
     * Get relevant event types for a phase
     * @param {string} phaseId - The ID of the phase
     * @returns {Array} - Array of relevant event types
     */
    function getRelevantEventsForPhase(phaseId) {
        // Start with a base set of events suitable for all phases
        const baseEvents = [
            ...EVENT_TYPES.technical.slice(0, 3),
            ...EVENT_TYPES.business.slice(0, 3),
            ...EVENT_TYPES.effect.slice(0, 3)
        ];
        
        // Add phase-specific events
        switch (phaseId) {
            case 'identification':
                return [
                    ...EVENT_TYPES.technical.filter(e => ['phishing', 'security-alert', 'user-report', 'system-log'].includes(e.id)),
                    ...EVENT_TYPES.business.filter(e => ['business-impact', 'customer-impact'].includes(e.id)),
                    ...EVENT_TYPES.effect.filter(e => ['red-herring'].includes(e.id))
                ];
                
            case 'containment':
                return [
                    ...EVENT_TYPES.technical.filter(e => ['security-alert', 'malware-detection', 'system-log'].includes(e.id)),
                    ...EVENT_TYPES.business.filter(e => ['business-impact', 'media-inquiry', 'executive-update'].includes(e.id)),
                    ...EVENT_TYPES.effect.filter(e => ['workaround', 'workforce', 'communication'].includes(e.id))
                ];
                
            case 'eradication':
                return [
                    ...EVENT_TYPES.technical.filter(e => ['security-alert', 'malware-detection'].includes(e.id)),
                    ...EVENT_TYPES.business.filter(e => ['business-impact', 'regulatory-notification'].includes(e.id)),
                    ...EVENT_TYPES.effect.filter(e => ['workaround', 'communication', 'red-herring'].includes(e.id))
                ];
                
            case 'recovery':
                return [
                    ...EVENT_TYPES.technical.filter(e => ['system-log', 'user-report'].includes(e.id)),
                    ...EVENT_TYPES.business.filter(e => ['business-impact', 'executive-update', 'customer-impact'].includes(e.id)),
                    ...EVENT_TYPES.effect.filter(e => ['recovery-action', 'communication', 'workforce'].includes(e.id))
                ];
                
            case 'hardening':
                return [
                    ...EVENT_TYPES.technical.filter(e => ['security-alert', 'system-log'].includes(e.id)),
                    ...EVENT_TYPES.business.filter(e => ['executive-update', 'regulatory-notification'].includes(e.id)),
                    ...EVENT_TYPES.effect.filter(e => ['recovery-action', 'communication'].includes(e.id))
                ];
                
            default:
                return baseEvents;
        }
    }
    
    /**
     * Show the modal for adding a custom inject
     * @param {string} phaseId - The ID of the phase
     */
    function showAddInjectModal(phaseId) {
        const modalTitle = 'Add Custom Inject';
        
        // Create the modal content
        const content = document.createElement('div');
        content.className = 'add-inject-modal';
        
        content.innerHTML = `
            <form id="add-inject-form">
                <div class="form-group">
                    <label for="inject-title">Title</label>
                    <input type="text" id="inject-title" required placeholder="Enter a descriptive title">
                </div>
                
                <div class="form-group">
                    <label for="inject-type">Type</label>
                    <select id="inject-type" required>
                        <option value="">Select Type</option>
                        <optgroup label="Technical">
                            ${EVENT_TYPES.technical.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
                        </optgroup>
                        <optgroup label="Business">
                            ${EVENT_TYPES.business.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
                        </optgroup>
                        <optgroup label="Effect Management">
                            ${EVENT_TYPES.effect.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
                        </optgroup>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="inject-sender">Sender</label>
                        <input type="text" id="inject-sender" required placeholder="Who is sending this?">
                    </div>
                    
                    <div class="form-group">
                        <label for="inject-recipient">Recipient</label>
                        <input type="text" id="inject-recipient" required placeholder="Who is receiving this?">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="inject-content">Content</label>
                    <textarea id="inject-content" rows="8" required placeholder="Enter the detailed content of this inject"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="inject-business-impact">Business Impact (optional)</label>
                    <textarea id="inject-business-impact" rows="3" placeholder="Describe any business impact"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="inject-expected-actions">Expected Actions (optional)</label>
                    <textarea id="inject-expected-actions" rows="3" placeholder="List expected actions from the team"></textarea>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="inject-red-herring"> 
                        Mark as Red Herring
                    </label>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Inject</button>
                </div>
            </form>
        `;
        
        // Show the modal
        showModal(modalTitle, content);
        
        // Set up form submission
        content.querySelector('#add-inject-form').addEventListener('submit', event => {
            event.preventDefault();
            
            // Collect form data
            const injectData = {
                title: document.getElementById('inject-title').value,
                type: getEventNameById(document.getElementById('inject-type').value),
                category: getEventCategoryById(document.getElementById('inject-type').value),
                sender: document.getElementById('inject-sender').value,
                recipient: document.getElementById('inject-recipient').value,
                content: document.getElementById('inject-content').value,
                businessImpact: document.getElementById('inject-business-impact').value || null,
                expectedActions: document.getElementById('inject-expected-actions').value ? 
                    document.getElementById('inject-expected-actions').value.split('\n').filter(line => line.trim()) : [],
                isRedHerring: document.getElementById('inject-red-herring').checked
            };
            
            // Add the inject
            addCustomInject(injectData, phaseId);
            
            // Close the modal
            closeModal();
        });
    }
    
    /**
     * Get event name by ID
     * @param {string} id - Event ID
     * @returns {string} - Event name
     */
    function getEventNameById(id) {
        let name = '';
        
        Object.keys(EVENT_TYPES).forEach(category => {
            const event = EVENT_TYPES[category].find(e => e.id === id);
            if (event) {
                name = event.name;
            }
        });
        
        return name;
    }
    
    /**
     * Get event category by ID
     * @param {string} id - Event ID
     * @returns {string} - Event category (technical, business, effect)
     */
    function getEventCategoryById(id) {
        let category = '';
        
        if (EVENT_TYPES.technical.some(e => e.id === id)) {
            category = 'technical';
        } else if (EVENT_TYPES.business.some(e => e.id === id)) {
            category = 'business';
        } else if (EVENT_TYPES.effect.some(e => e.id === id)) {
            category = 'effect';
        }
        
        return category;
    }
    
    /**
     * Add a custom inject
     * @param {Object} injectData - The inject data
     * @param {string} phaseId - The ID of the phase
     */
    function addCustomInject(injectData, phaseId) {
        // Create a timestamp based on existing injects
        const timestamp = generateNextTimestamp(phaseId);
        
        // Generate an ID
        const id = generateInjectId(phaseId);
        
        // Create the inject
        const inject = {
            id,
            title: injectData.title,
            type: injectData.type,
            category: injectData.category,
            phase: phaseId,
            sender: injectData.sender,
            recipient: injectData.recipient,
            timestamp,
            content: injectData.content,
            attachments: [],
            businessImpact: injectData.businessImpact,
            technicalDetails: null,
            expectedActions: injectData.expectedActions,
            isRedHerring: injectData.isRedHerring,
            mitreTechniques: []
        };
        
        // Add to application state
        if (!APP_STATE.scenario.injects) {
            APP_STATE.scenario.injects = [];
        }
        
        APP_STATE.scenario.injects.push(inject);
        
        // Mark phase as having injects
        APP_STATE.scenario.phases[phaseId] = true;
        
        // Update the phase UI
        updatePhaseContent(phaseId);
        
        // Render the inject
        renderInject(inject);
        
        // Update timeline
        updateTimeline(phaseId);
    }
    
    /**
     * Generate the next timestamp based on existing injects
     * @param {string} phaseId - The ID of the phase
     * @returns {string} - Formatted timestamp
     */
    function generateNextTimestamp(phaseId) {
        // Get existing injects for this phase
        const phaseInjects = APP_STATE.scenario.injects ? 
            APP_STATE.scenario.injects.filter(inject => inject.phase === phaseId) : [];
        
        // Find the day number for this phase
        const phaseOrder = ['identification', 'containment', 'eradication', 'recovery', 'hardening'];
        const dayNumber = phaseOrder.indexOf(phaseId) + 1;
        
        // If no injects yet, start at 09:00
        if (phaseInjects.length === 0) {
            return `Day ${dayNumber} - 09:00`;
        }
        
        // Parse the last timestamp
        const lastTimestamp = phaseInjects[phaseInjects.length - 1].timestamp;
        const [, timeString] = lastTimestamp.split(' - ');
        const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
        
        // Add 30 minutes
        let newHours = hours;
        let newMinutes = minutes + 30;
        
        if (newMinutes >= 60) {
            newMinutes -= 60;
            newHours += 1;
        }
        
        // Format the new timestamp
        return `Day ${dayNumber} - ${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    }
    
    /**
     * Generate a unique inject ID
     * @param {string} phaseId - The ID of the phase
     * @returns {string} - Unique ID
     */
    function generateInjectId(phaseId) {
        // Get prefix based on phase
        const prefixMap = {
            'identification': 'IDN',
            'containment': 'CNT',
            'eradication': 'ERA',
            'recovery': 'REC',
            'hardening': 'HDN'
        };
        
        const prefix = prefixMap[phaseId] || 'INJ';
        
        // Get existing injects for this phase
        const phaseInjects = APP_STATE.scenario.injects ? 
            APP_STATE.scenario.injects.filter(inject => inject.phase === phaseId) : [];
        
        // Create sequential number
        const number = phaseInjects.length + 1;
        
        return `${prefix}${String(number).padStart(3, '0')}`;
    }
    
    /**
     * Generate injects for a phase
     * @param {string} phaseId - The ID of the phase
     */
    async function generateInjects(phaseId) {
        try {
            // Show loading message
            showLoading(`Generating ${PHASES[phaseId].name} phase injects...`);
            
            // Validate API settings
            if (!APP_STATE.apiSettings.apiKey) {
                hideLoading();
                showMessage('Please configure API settings before generating injects.', 'warning');
                return;
            }
            
            // Get count from scenario parameters
            const count = APP_STATE.scenario.params.injectsPerPhase || 7;
            
            // Get existing injects as context
            const existingInjects = APP_STATE.scenario.injects || [];
            
            // Generate the injects using the API
            const injects = await apiModule.generatePhaseInjects(
                phaseId,
                APP_STATE.scenario.params,
                existingInjects,
                count
            );
            
            // Add phase information to each inject
            injects.forEach(inject => {
                inject.phase = phaseId;
            });
            
            // Add to application state
            if (!APP_STATE.scenario.injects) {
                APP_STATE.scenario.injects = [];
            }
            
            // Remove any existing injects for this phase
            APP_STATE.scenario.injects = APP_STATE.scenario.injects.filter(inject => inject.phase !== phaseId);
            
            // Add new injects
            APP_STATE.scenario.injects = [...APP_STATE.scenario.injects, ...injects];
            
            // Sort injects by timestamp
            APP_STATE.scenario.injects.sort((a, b) => {
                // Sort by day first
                const dayA = parseInt(a.timestamp.split(' - ')[0].replace('Day ', ''));
                const dayB = parseInt(b.timestamp.split(' - ')[0].replace('Day ', ''));
                
                if (dayA !== dayB) {
                    return dayA - dayB;
                }
                
                // Then by time
                const timeA = a.timestamp.split(' - ')[1];
                const timeB = b.timestamp.split(' - ')[1];
                
                return timeA.localeCompare(timeB);
            });
            
            // Mark phase as having injects
            APP_STATE.scenario.phases[phaseId] = true;
            
            // Update the phase UI
            updatePhaseContent(phaseId);
            
            // Render the injects
            renderInjects(injects);
            
            // Update timeline
            updateTimeline(phaseId);
            
            // Mark the phase as completed in the sidebar
            document.querySelector(`.phase-item[data-phase="${phaseId}"]`).classList.add('completed');
            
            hideLoading();
            
            showMessage(`Successfully generated ${injects.length} injects for the ${PHASES[phaseId].name} phase.`, 'success');
        } catch (error) {
            console.error(`Error generating ${phaseId} injects:`, error);
            hideLoading();
            showMessage(`Failed to generate injects: ${error.message}`, 'error');
        }
    }
    
    /**
     * Generate a custom inject using the API
     * @param {string} injectTypeId - The ID of the inject type
     * @param {string} phaseId - The ID of the phase
     */
    async function generateCustomInject(injectTypeId, phaseId) {
        try {
            // Find the event details
            let eventDetails = null;
            
            Object.keys(EVENT_TYPES).forEach(category => {
                const found = EVENT_TYPES[category].find(e => e.id === injectTypeId);
                if (found) {
                    eventDetails = found;
                }
            });
            
            if (!eventDetails) {
                showMessage('Invalid event type.', 'error');
                return;
            }
            
            // Show loading message
            showLoading(`Generating ${eventDetails.name} inject...`);
            
            // Validate API settings
            if (!APP_STATE.apiSettings.apiKey) {
                hideLoading();
                showMessage('Please configure API settings before generating injects.', 'warning');
                return;
            }
            
            // Get existing injects as context
            const existingInjects = APP_STATE.scenario.injects || [];
            
            // Generate the inject using the API
            const inject = await apiModule.generateCustomInject(
                injectTypeId,
                phaseId,
                APP_STATE.scenario.params,
                existingInjects
            );
            
            // Add phase information
            inject.phase = phaseId;
            
            // Add to application state
            if (!APP_STATE.scenario.injects) {
                APP_STATE.scenario.injects = [];
            }
            
            APP_STATE.scenario.injects.push(inject);
            
            // Sort injects by timestamp
            APP_STATE.scenario.injects.sort((a, b) => {
                // Sort by day first
                const dayA = parseInt(a.timestamp.split(' - ')[0].replace('Day ', ''));
                const dayB = parseInt(b.timestamp.split(' - ')[0].replace('Day ', ''));
                
                if (dayA !== dayB) {
                    return dayA - dayB;
                }
                
                // Then by time
                const timeA = a.timestamp.split(' - ')[1];
                const timeB = b.timestamp.split(' - ')[1];
                
                return timeA.localeCompare(timeB);
            });
            
            // Mark phase as having injects
            APP_STATE.scenario.phases[phaseId] = true;
            
            // Update the phase UI
            updatePhaseContent(phaseId);
            
            // Render the inject
            renderInject(inject);
            
            // Update timeline
            updateTimeline(phaseId);
            
            hideLoading();
            
            showMessage(`Successfully generated ${eventDetails.name} inject.`, 'success');
        } catch (error) {
            console.error(`Error generating custom inject:`, error);
            hideLoading();
            showMessage(`Failed to generate inject: ${error.message}`, 'error');
        }
    }
    
    /**
     * Render existing injects for a phase
     * @param {string} phaseId - The ID of the phase
     */
    function renderExistingInjects(phaseId) {
        // Get injects for this phase
        const injects = APP_STATE.scenario.injects ? 
            APP_STATE.scenario.injects.filter(inject => inject.phase === phaseId) : [];
        
        // Render the injects
        renderInjects(injects);
        
        // Update timeline
        updateTimeline(phaseId);
    }
    
    /**
     * Render multiple injects
     * @param {Array} injects - Array of injects to render
     */
    function renderInjects(injects) {
        // Get the injects container
        const container = document.querySelector('.injects-container');
        
        // Clear existing injects
        container.innerHTML = '';
        
        // Render each inject
        injects.forEach(inject => {
            renderInject(inject, false);
        });
    }
    
    /**
     * Render a single inject
     * @param {Object} inject - The inject to render
     * @param {boolean} append - Whether to append or replace
     */
    function renderInject(inject, append = true) {
        // Get the injects container
        const container = document.querySelector('.injects-container');
        
        // If not appending, clear existing injects
        if (!append) {
            container.innerHTML = '';
        }
        
        // Create inject element
        const injectElement = document.createElement('div');
        injectElement.className = 'inject-item';
        injectElement.setAttribute('data-id', inject.id);
        injectElement.setAttribute('data-category', inject.category);
        
        // Determine the appropriate class for the type indicator
        let typeIndicatorClass = 'technical';
        if (inject.category === 'business') {
            typeIndicatorClass = 'business';
        } else if (inject.isRedHerring) {
            typeIndicatorClass = 'red-herring';
        }
        
        // Create the inner HTML
        injectElement.innerHTML = `
            <div class="inject-type-indicator ${typeIndicatorClass}"></div>
            <div class="inject-header">
                <div class="inject-title">
                    ${inject.isRedHerring ? '<span class="badge red-herring">Red Herring</span>' : ''}
                    ${inject.title}
                </div>
                <div class="inject-time">
                    <i class="fas fa-clock"></i> ${inject.timestamp}
                </div>
            </div>
            <div class="inject-content">
                <div class="inject-metadata">
                    <div class="metadata-item">
                        <div class="metadata-label">Type:</div>
                        <div class="metadata-value">${inject.type}</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">From:</div>
                        <div class="metadata-value">${inject.sender}</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">To:</div>
                        <div class="metadata-value">${inject.recipient}</div>
                    </div>
                </div>
                <div class="inject-message">
                    ${formatInjectContent(inject.content)}
                </div>
                ${inject.businessImpact ? `
                    <div class="inject-business-impact">
                        <div class="impact-header">Business Impact:</div>
                        <div class="impact-content">${inject.businessImpact}</div>
                    </div>
                ` : ''}
                ${inject.expectedActions && inject.expectedActions.length > 0 ? `
                    <div class="inject-expected-actions">
                        <div class="actions-header">Expected Actions:</div>
                        <ul class="actions-list">
                            ${inject.expectedActions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
            <div class="inject-actions">
                <button class="btn btn-secondary btn-sm" onclick="phasesModule.editInject('${inject.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-secondary btn-sm" onclick="phasesModule.copyInject('${inject.id}')">
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button class="btn btn-danger btn-sm" onclick="phasesModule.deleteInject('${inject.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        // Append to container
        container.appendChild(injectElement);
    }
    
    /**
     * Format inject content with proper line breaks
     * @param {string} content - The content to format
     * @returns {string} - Formatted content
     */
    function formatInjectContent(content) {
        if (!content) return '';
        
        // Replace newlines with <br> tags
        return content.replace(/\n/g, '<br>');
    }
    
    /**
     * Update the timeline visualization
     * @param {string} phaseId - The ID of the phase
     */
    function updateTimeline(phaseId) {
        // Get the timeline container
        const timeline = document.querySelector('.timeline');
        
        // Clear existing timeline markers
        timeline.innerHTML = '';
        
        // Get injects for this phase
        const injects = APP_STATE.scenario.injects ? 
            APP_STATE.scenario.injects.filter(inject => inject.phase === phaseId) : [];
        
        if (injects.length === 0) {
            return;
        }
        
        // Create timeline markers
        injects.forEach((inject, index) => {
            // Calculate position as percentage
            const position = (index / (injects.length - 1)) * 100;
            
            // Create marker element
            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            marker.style.left = `${position}%`;
            marker.setAttribute('data-id', inject.id);
            
            // Add appropriate class based on category
            if (inject.category === 'technical') {
                marker.classList.add('technical');
            } else if (inject.category === 'business') {
                marker.classList.add('business');
            }
            
            if (inject.isRedHerring) {
                marker.classList.add('red-herring');
            }
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'timeline-marker-tooltip';
            tooltip.textContent = `${inject.type} - ${inject.timestamp}`;
            
            marker.appendChild(tooltip);
            
            // Add click event to scroll to inject
            marker.addEventListener('click', () => {
                scrollToInject(inject.id);
            });
            
            timeline.appendChild(marker);
        });
    }
    
    /**
     * Scroll to a specific inject
     * @param {string} injectId - The ID of the inject
     */
    function scrollToInject(injectId) {
        const injectElement = document.querySelector(`.inject-item[data-id="${injectId}"]`);
        
        if (injectElement) {
            injectElement.scrollIntoView({ behavior: 'smooth' });
            
            // Highlight the inject briefly
            injectElement.classList.add('highlight');
            
            setTimeout(() => {
                injectElement.classList.remove('highlight');
            }, 2000);
        }
    }
    
    /**
     * Update the inject balance display
     * @param {string} phaseId - The ID of the phase
     */
    function updateInjectBalance(phaseId) {
        // Get the balance indicators
        const technicalCount = document.querySelector('.balance-item:nth-child(1) .balance-count');
        const businessCount = document.querySelector('.balance-item:nth-child(2) .balance-count');
        
        if (!technicalCount || !businessCount) {
            return;
        }
        
        // Get injects for this phase
        const injects = APP_STATE.scenario.injects ? 
            APP_STATE.scenario.injects.filter(inject => inject.phase === phaseId) : [];
        
        // Count technical and business injects
        const technical = injects.filter(inject => inject.category === 'technical').length;
        const business = injects.filter(inject => inject.category === 'business' || inject.category === 'effect').length;
        
        // Update the counts
        technicalCount.textContent = technical;
        businessCount.textContent = business;
    }
    
    /**
     * Update phase navigation buttons
     * @param {string} phaseId - The ID of the phase
     */
    function updatePhaseNavigation(phaseId) {
        const prevButton = document.getElementById('previous-phase-btn');
        const nextButton = document.getElementById('next-phase-btn');
        
        if (!prevButton || !nextButton) {
            return;
        }
        
        // Determine the previous and next phases
        const phaseOrder = ['setup', 'identification', 'containment', 'eradication', 'recovery', 'hardening'];
        const currentIndex = phaseOrder.indexOf(phaseId);
        
        // Update previous button
        if (currentIndex > 0) {
            const prevPhase = phaseOrder[currentIndex - 1];
            prevButton.innerHTML = `<i class="fas fa-arrow-left"></i> ${PHASES[prevPhase]?.name || 'Previous'} Phase`;
            prevButton.removeAttribute('disabled');
        } else {
            prevButton.innerHTML = `<i class="fas fa-arrow-left"></i> Previous Phase`;
            prevButton.setAttribute('disabled', 'disabled');
        }
        
        // Update next button
        if (currentIndex < phaseOrder.length - 1) {
            const nextPhase = phaseOrder[currentIndex + 1];
            
            // Only enable next button if current phase is completed or next phase is already started
            if (APP_STATE.scenario.phases[phaseId] || APP_STATE.scenario.phases[nextPhase]) {
                nextButton.innerHTML = `${PHASES[nextPhase]?.name || 'Next'} Phase <i class="fas fa-arrow-right"></i>`;
                nextButton.removeAttribute('disabled');
            } else {
                nextButton.innerHTML = `Next Phase <i class="fas fa-arrow-right"></i>`;
                nextButton.setAttribute('disabled', 'disabled');
            }
        } else {
            nextButton.innerHTML = `Next Phase <i class="fas fa-arrow-right"></i>`;
            nextButton.setAttribute('disabled', 'disabled');
        }
    }
    
    /**
     * Navigate to the next phase
     * @param {string} currentPhaseId - The current phase ID
     */
    function navigateToNextPhase(currentPhaseId) {
        const phaseOrder = ['setup', 'identification', 'containment', 'eradication', 'recovery', 'hardening'];
        const currentIndex = phaseOrder.indexOf(currentPhaseId);
        
        if (currentIndex < phaseOrder.length - 1) {
            const nextPhase = phaseOrder[currentIndex + 1];
            
            // Only navigate if current phase is completed or next phase is already started
            if (APP_STATE.scenario.phases[currentPhaseId] || APP_STATE.scenario.phases[nextPhase]) {
                navigateToPhase(nextPhase);
            }
        }
    }
    
    /**
     * Edit an inject
     * @param {string} injectId - The ID of the inject to edit
     */
    function editInject(injectId) {
        // Find the inject
        const inject = APP_STATE.scenario.injects.find(inject => inject.id === injectId);
        
        if (!inject) {
            showMessage('Inject not found.', 'error');
            return;
        }
        
        // Create the modal content
        const content = document.createElement('div');
        content.className = 'edit-inject-modal';
        
        content.innerHTML = `
            <form id="edit-inject-form">
                <div class="form-group">
                    <label for="edit-inject-title">Title</label>
                    <input type="text" id="edit-inject-title" required value="${inject.title}">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-inject-sender">Sender</label>
                        <input type="text" id="edit-inject-sender" required value="${inject.sender}">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-inject-recipient">Recipient</label>
                        <input type="text" id="edit-inject-recipient" required value="${inject.recipient}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-inject-timestamp">Timestamp</label>
                    <input type="text" id="edit-inject-timestamp" required value="${inject.timestamp}">
                </div>
                
                <div class="form-group">
                    <label for="edit-inject-content">Content</label>
                    <textarea id="edit-inject-content" rows="8" required>${inject.content}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-inject-business-impact">Business Impact (optional)</label>
                    <textarea id="edit-inject-business-impact" rows="3">${inject.businessImpact || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-inject-expected-actions">Expected Actions (one per line)</label>
                    <textarea id="edit-inject-expected-actions" rows="3">${(inject.expectedActions || []).join('\n')}</textarea>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-inject-red-herring" ${inject.isRedHerring ? 'checked' : ''}> 
                        Mark as Red Herring
                    </label>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        `;
        
        // Show the modal
        showModal(`Edit Inject: ${inject.id}`, content);
        
        // Set up form submission
        content.querySelector('#edit-inject-form').addEventListener('submit', event => {
            event.preventDefault();
            
            // Update the inject
            inject.title = document.getElementById('edit-inject-title').value;
            inject.sender = document.getElementById('edit-inject-sender').value;
            inject.recipient = document.getElementById('edit-inject-recipient').value;
            inject.timestamp = document.getElementById('edit-inject-timestamp').value;
            inject.content = document.getElementById('edit-inject-content').value;
            inject.businessImpact = document.getElementById('edit-inject-business-impact').value || null;
            inject.expectedActions = document.getElementById('edit-inject-expected-actions').value ? 
                document.getElementById('edit-inject-expected-actions').value.split('\n').filter(line => line.trim()) : [];
            inject.isRedHerring = document.getElementById('edit-inject-red-herring').checked;
            
            // Re-render the inject
            const injectElement = document.querySelector(`.inject-item[data-id="${inject.id}"]`);
            if (injectElement) {
                injectElement.remove();
            }
            
            renderInject(inject);
            
            // Update timeline
            updateTimeline(inject.phase);
            
            // Update inject balance
            updateInjectBalance(inject.phase);
            
            // Close the modal
            closeModal();
            
            showMessage('Inject updated successfully.', 'success');
        });
    }
    
    /**
     * Copy an inject's content to clipboard
     * @param {string} injectId - The ID of the inject to copy
     */
    function copyInject(injectId) {
        // Find the inject
        const inject = APP_STATE.scenario.injects.find(inject => inject.id === injectId);
        
        if (!inject) {
            showMessage('Inject not found.', 'error');
            return;
        }
        
        // Create a formatted string
        const content = `
        ${inject.title}
        
        From: ${inject.sender}
        To: ${inject.recipient}
        Time: ${inject.timestamp}
        
        ${inject.content}
        
        ${inject.businessImpact ? `\nBusiness Impact:\n${inject.businessImpact}` : ''}
        
        ${inject.expectedActions && inject.expectedActions.length > 0 ? `\nExpected Actions:\n${inject.expectedActions.join('\n')}` : ''}
        `.trim();
        
        // Copy to clipboard
        navigator.clipboard.writeText(content)
            .then(() => {
                showMessage('Inject content copied to clipboard.', 'success');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                showMessage('Failed to copy inject content.', 'error');
            });
    }
    
    /**
     * Delete an inject
     * @param {string} injectId - The ID of the inject to delete
     */
    function deleteInject(injectId) {
        if (confirm('Are you sure you want to delete this inject? This action cannot be undone.')) {
            // Find the inject
            const inject = APP_STATE.scenario.injects.find(inject => inject.id === injectId);
            
            if (!inject) {
                showMessage('Inject not found.', 'error');
                return;
            }
            
            const phaseId = inject.phase;
            
            // Remove from application state
            APP_STATE.scenario.injects = APP_STATE.scenario.injects.filter(inject => inject.id !== injectId);
            
            // Remove from DOM
            const injectElement = document.querySelector(`.inject-item[data-id="${injectId}"]`);
            if (injectElement) {
                injectElement.remove();
            }
            
            // Check if phase still has injects
            const phaseInjects = APP_STATE.scenario.injects.filter(inject => inject.phase === phaseId);
            if (phaseInjects.length === 0) {
                APP_STATE.scenario.phases[phaseId] = false;
            }
            
            // Update timeline
            updateTimeline(phaseId);
            
            // Update inject balance
            updateInjectBalance(phaseId);
            
            showMessage('Inject deleted successfully.', 'success');
        }
    }
    
    // Public API
    return {
        init,
        initPhase,
        editInject,
        copyInject,
        deleteInject
    };
})();