/**
 * Setup Module for Northwave Resilience Scenario Builder
 * Handles the initial setup phase of scenario creation
 */

const setupModule = (function() {
    // MITRE ATT&CK Techniques
    const MITRE_TECHNIQUES = [
        { id: 'T1566', name: 'Phishing', description: 'Spearphishing Attachment, Spearphishing Link, Spearphishing via Service' },
        { id: 'T1078', name: 'Valid Accounts', description: 'Default Accounts, Domain Accounts, Local Accounts, Cloud Accounts' },
        { id: 'T1486', name: 'Data Encrypted for Impact', description: 'Encrypting files to disrupt business operations' },
        { id: 'T1087', name: 'Account Discovery', description: 'Local Account, Domain Account, Email Account, Cloud Account' },
        { id: 'T1059', name: 'Command and Scripting Interpreter', description: 'PowerShell, AppleScript, Windows Command Shell, Unix Shell, etc.' },
        { id: 'T1027', name: 'Obfuscated Files or Information', description: 'Software Packing, Steganography, etc.' },
        { id: 'T1110', name: 'Brute Force', description: 'Password Guessing, Password Cracking, Password Spraying' },
        { id: 'T1018', name: 'Remote System Discovery', description: 'Discovering remote systems on a network' },
        { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', description: 'Exfiltration over unencrypted/obfuscated non-C2 protocol' },
        { id: 'T1071', name: 'Application Layer Protocol', description: 'Web Protocols, DNS, Mail Protocols' },
        { id: 'T1082', name: 'System Information Discovery', description: 'Obtaining detailed information about the operating system and hardware' },
        { id: 'T1021', name: 'Remote Services', description: 'SSH, VNC, RDP, SMB/Windows Admin Shares' },
        { id: 'T1083', name: 'File and Directory Discovery', description: 'Enumerate files and directories to find interesting information' },
        { id: 'T1112', name: 'Modify Registry', description: 'Add, modify, or remove registry keys/values for persistence' },
        { id: 'T1136', name: 'Create Account', description: 'Local Account, Domain Account, Cloud Account' },
        { id: 'T1078', name: 'Valid Accounts', description: 'Using legitimate credentials to gain initial access' },
        { id: 'T1569', name: 'System Services', description: 'Service Execution, SSH Authorized Keys' },
        { id: 'T1562', name: 'Impair Defenses', description: 'Disable/Modify Tools, Disable Windows Event Logging, etc.' },
        { id: 'T1053', name: 'Scheduled Task/Job', description: 'At, Cron, Scheduled Task, Systemd Timers' },
        { id: 'T1547', name: 'Boot or Logon Autostart Execution', description: 'Registry Run Keys, Startup Folder, etc.' }
    ];
    
    // Industry-specific business processes
    const BUSINESS_PROCESSES = {
        'Financial': [
            'Payment Processing',
            'Transaction Clearing',
            'Loan Origination',
            'Fraud Detection',
            'Customer Onboarding',
            'Regulatory Reporting',
            'Trading Operations',
            'Asset Management'
        ],
        'Healthcare': [
            'Patient Registration',
            'Medical Records Management',
            'Clinical Documentation',
            'Medication Management',
            'Billing & Claims Processing',
            'Lab Results Processing',
            'Appointment Scheduling',
            'Care Coordination'
        ],
        'Retail': [
            'Inventory Management',
            'Point of Sale',
            'Order Fulfillment',
            'Customer Loyalty Programs',
            'Supply Chain Management',
            'Pricing & Promotions',
            'Returns Processing',
            'E-commerce Platform'
        ],
        'Manufacturing': [
            'Production Planning',
            'Supply Chain Management',
            'Quality Control',
            'Inventory Management',
            'Equipment Maintenance',
            'Order Management',
            'Distribution',
            'Product Design'
        ],
        'Government': [
            'Citizen Services',
            'Records Management',
            'Benefits Administration',
            'Regulatory Compliance',
            'Emergency Services',
            'Public Safety',
            'Tax Processing',
            'Procurement'
        ],
        'Technology': [
            'Software Development',
            'Customer Support',
            'Product Deployment',
            'System Monitoring',
            'Data Analytics',
            'User Authentication',
            'Billing & Subscription',
            'Cloud Services'
        ],
        'Energy': [
            'Energy Distribution',
            'Grid Management',
            'Customer Billing',
            'Usage Monitoring',
            'Regulatory Compliance',
            'Facility Management',
            'Trading Operations',
            'Field Service Operations'
        ],
        'Education': [
            'Student Registration',
            'Course Management',
            'Grade Processing',
            'Financial Aid',
            'Campus Operations',
            'Learning Management',
            'Research Administration',
            'Alumni Relations'
        ],
        'Transportation': [
            'Booking & Reservations',
            'Fleet Management',
            'Scheduling & Dispatch',
            'Route Optimization',
            'Cargo Tracking',
            'Crew Management',
            'Maintenance Operations',
            'Safety Compliance'
        ]
    };
    
    /**
     * Initialize the setup module
     */
    function init() {
        console.log('Setup Module initialized');
    }
    
    /**
     * Initialize the setup phase
     */
    function initPhase() {
        console.log('Setup Phase initialized');
        
        // Initialize MITRE ATT&CK techniques
        initMitreTechniques();
        
        // Set up form event listeners
        setupFormListeners();
        
        // Set initial values for range elements
        updateRangeValues();
        
        // Register events for business processes
        document.getElementById('org-sector').addEventListener('change', updateBusinessProcesses);
    }
    
    /**
     * Initialize MITRE ATT&CK techniques list
     */
    function initMitreTechniques() {
        const container = document.getElementById('mitre-techniques');
        
        // Clear existing content
        container.innerHTML = '';
        
        // Add each technique
        MITRE_TECHNIQUES.forEach(technique => {
            const item = document.createElement('div');
            item.className = 'mitre-technique';
            
            item.innerHTML = `
                <div class="mitre-info">
                    <span class="mitre-id">${technique.id}</span>
                    <span class="mitre-name">${technique.name}</span>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="setupModule.addMitreTechnique('${technique.id}', '${technique.name}')">
                    <i class="fas fa-plus"></i> Add
                </button>
            `;
            
            container.appendChild(item);
        });
        
        // Setup search functionality
        document.getElementById('mitre-search').addEventListener('input', event => {
            const searchTerm = event.target.value.toLowerCase();
            
            // Filter techniques based on search term
            document.querySelectorAll('.mitre-technique').forEach(element => {
                const id = element.querySelector('.mitre-id').textContent.toLowerCase();
                const name = element.querySelector('.mitre-name').textContent.toLowerCase();
                
                if (id.includes(searchTerm) || name.includes(searchTerm)) {
                    element.style.display = '';
                } else {
                    element.style.display = 'none';
                }
            });
        });
    }
    
    /**
     * Set up form event listeners
     */
    function setupFormListeners() {
        // Form submission
        document.getElementById('setup-form').addEventListener('submit', event => {
            event.preventDefault();
            processSetupForm();
        });
        
        // Range input updates
        document.querySelectorAll('input[type="range"]').forEach(input => {
            input.addEventListener('input', updateRangeValues);
        });
        
        // Reset form button
        document.getElementById('reset-form-btn').addEventListener('click', resetForm);
    }
    
    /**
     * Update range display values
     */
    function updateRangeValues() {
        // Update injects per phase value
        const injectsInput = document.getElementById('injects-per-phase');
        const injectsValue = document.getElementById('injects-value');
        if (injectsInput && injectsValue) {
            injectsValue.textContent = injectsInput.value;
        }
        
        // Update red herrings value
        const herringsInput = document.getElementById('red-herrings');
        const herringsValue = document.getElementById('herrings-value');
        if (herringsInput && herringsValue) {
            herringsValue.textContent = herringsInput.value;
        }
        
        // Update technical/business ratio value
        const ratioInput = document.getElementById('tech-business-ratio');
        const ratioValue = document.getElementById('ratio-value');
        if (ratioInput && ratioValue) {
            const techPercent = ratioInput.value;
            const businessPercent = 100 - techPercent;
            ratioValue.textContent = `${techPercent}% Technical / ${businessPercent}% Business`;
        }
    }
    
    /**
     * Update business processes based on selected industry
     */
    function updateBusinessProcesses() {
        const sector = document.getElementById('org-sector').value;
        const container = document.getElementById('business-processes');
        
        // Clear existing content
        container.innerHTML = '';
        
        // If no sector selected, return
        if (!sector || !BUSINESS_PROCESSES[sector]) {
            return;
        }
        
        // Add business processes for the selected sector
        BUSINESS_PROCESSES[sector].forEach(process => {
            const label = document.createElement('label');
            
            label.innerHTML = `
                <input type="checkbox" name="business-process" value="${process}"> ${process}
            `;
            
            container.appendChild(label);
        });
    }
    
    /**
     * Add a MITRE technique to the selected list
     * @param {string} id - Technique ID
     * @param {string} name - Technique name
     */
    function addMitreTechnique(id, name) {
        const container = document.getElementById('selected-techniques');
        
        // Check if technique is already selected
        if (document.querySelector(`.tag[data-id="${id}"]`)) {
            return;
        }
        
        // Create tag element
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.setAttribute('data-id', id);
        tag.setAttribute('data-name', name);
        
        tag.innerHTML = `
            <span>${id}: ${name}</span>
            <i class="fas fa-times" onclick="setupModule.removeMitreTechnique('${id}')"></i>
        `;
        
        container.appendChild(tag);
    }
    
    /**
     * Remove a MITRE technique from the selected list
     * @param {string} id - Technique ID to remove
     */
    function removeMitreTechnique(id) {
        const tag = document.querySelector(`.tag[data-id="${id}"]`);
        if (tag) {
            tag.remove();
        }
    }
    
    /**
     * Process the setup form submission
     */
    async function processSetupForm() {
        try {
            // Show loading message
            showLoading('Processing scenario parameters...');
            
            // Validate form
            if (!validateForm()) {
                hideLoading();
                return;
            }
            
            // Collect form data
            const scenarioParams = collectFormData();
            
            // Save parameters to application state
            APP_STATE.scenario.params = scenarioParams;
            
            // Generate scenario background using API
            const scenarioBackground = await apiModule.generateScenarioBackground(scenarioParams);
            
            // Merge background with parameters
            Object.assign(APP_STATE.scenario.params, scenarioBackground);
            
            // Update scenario summary in sidebar
            updateScenarioSummary();
            
            // Mark setup phase as completed
            APP_STATE.scenario.phases.setup = true;
            
            // Add the "completed" class to the setup phase item
            document.querySelector('.phase-item[data-phase="setup"]').classList.add('completed');
            
            // Navigate to the first included phase
            const firstPhase = scenarioParams.phases[0];
            navigateToPhase(firstPhase);
            
            hideLoading();
        } catch (error) {
            console.error('Error processing setup form:', error);
            hideLoading();
            showMessage(`Failed to process scenario parameters: ${error.message}`, 'error');
        }
    }
    
    /**
     * Validate the setup form
     * @returns {boolean} - Whether the form is valid
     */
    function validateForm() {
        // Check required fields
        const requiredFields = [
            'org-sector',
            'org-size',
            'threat-actor',
            'attack-vector',
            'attack-type'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value) {
                field.classList.add('invalid');
                isValid = false;
            } else {
                field.classList.remove('invalid');
            }
        });
        
        // Check if at least one team is selected
        const irtSelected = document.querySelector('.team-option[data-team="irt"]').classList.contains('selected');
        const cmtSelected = document.querySelector('.team-option[data-team="cmt"]').classList.contains('selected');
        
        if (!irtSelected && !cmtSelected) {
            showMessage('Please select at least one team to train.', 'warning');
            isValid = false;
        }
        
        // Check if at least one phase is selected
        const phasesSelected = document.querySelectorAll('input[name="phases"]:checked').length > 0;
        
        if (!phasesSelected) {
            showMessage('Please select at least one incident response phase.', 'warning');
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Collect form data
     * @returns {Object} - Collected form data
     */
    function collectFormData() {
        // Basic organization information
        const organizationSector = document.getElementById('org-sector').value;
        const organizationSize = document.getElementById('org-size').value;
        
        // Get selected business processes
        const businessProcesses = Array.from(
            document.querySelectorAll('input[name="business-process"]:checked')
        ).map(input => input.value);
        
        // Get selected regulatory requirements
        const regulatoryRequirements = Array.from(
            document.querySelectorAll('input[name="regulatory"]:checked')
        ).map(input => input.value);
        
        // Geographic reach
        const geographicReach = document.getElementById('org-geo').value;
        
        // Technical infrastructure
        const environment = Array.from(
            document.querySelectorAll('input[name="environment"]:checked')
        ).map(input => input.value);
        
        // Security controls
        const securityControls = Array.from(
            document.querySelectorAll('input[name="security"]:checked')
        ).map(input => input.value);
        
        // Backup strategy
        const backupStrategy = document.getElementById('backup-strategy').value;
        
        // Teams
        const teams = [];
        if (document.querySelector('.team-option[data-team="irt"]').classList.contains('selected')) {
            teams.push('irt');
        }
        if (document.querySelector('.team-option[data-team="cmt"]').classList.contains('selected')) {
            teams.push('cmt');
        }
        
        // Technical expertise
        const technicalExpertise = document.getElementById('tech-expertise').value;
        
        // Exercise experience
        const exerciseExperience = document.getElementById('exercise-experience').value;
        
        // Threat information
        const threatActor = document.getElementById('threat-actor').value;
        const attackVector = document.getElementById('attack-vector').value;
        const attackType = document.getElementById('attack-type').value;
        const attackMotivation = document.getElementById('attack-motivation').value;
        
        // MITRE techniques
        const mitreTechniques = Array.from(
            document.querySelectorAll('#selected-techniques .tag')
        ).map(tag => ({
            id: tag.getAttribute('data-id'),
            name: tag.getAttribute('data-name')
        }));
        
        // Exercise structure
        const incidentTimeline = document.getElementById('incident-timeline').value;
        
        // Selected phases
        const phases = Array.from(
            document.querySelectorAll('input[name="phases"]:checked')
        ).map(input => input.value.toLowerCase());
        
        // Ensure phases are in the correct order
        const orderedPhases = ['identification', 'containment', 'eradication', 'recovery', 'hardening']
            .filter(phase => phases.includes(phase));
        
        // Number of injects per phase
        const injectsPerPhase = parseInt(document.getElementById('injects-per-phase').value);
        
        // Number of red herrings
        const redHerrings = parseInt(document.getElementById('red-herrings').value);
        
        // Difficulty level
        const difficulty = document.getElementById('difficulty').value;
        
        // Effect management
        const techBusinessRatio = document.getElementById('tech-business-ratio').value;
        const mediaPressure = document.getElementById('media-pressure').value;
        const regulatoryInvolvement = document.getElementById('regulatory-involvement').value;
        const executiveInvolvement = document.getElementById('executive-involvement').value;
        const customerImpact = document.getElementById('customer-impact').value;
        
        // Business impact areas
        const businessImpactAreas = Array.from(
            document.querySelectorAll('input[name="impact-areas"]:checked')
        ).map(input => input.value);
        
        return {
            organizationSector,
            organizationSize,
            businessProcesses,
            regulatoryRequirements,
            geographicReach,
            environment,
            securityControls,
            backupStrategy,
            teams,
            technicalExpertise,
            exerciseExperience,
            threatActor,
            attackVector,
            attackType,
            attackMotivation,
            mitreTechniques,
            incidentTimeline,
            phases: orderedPhases,
            injectsPerPhase,
            redHerrings,
            difficulty,
            techBusinessRatio,
            mediaPressure,
            regulatoryInvolvement,
            executiveInvolvement,
            customerImpact,
            businessImpactAreas
        };
    }
    
    /**
     * Reset the form
     */
    function resetForm() {
        if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            document.getElementById('setup-form').reset();
            
            // Reset team selections
            document.querySelectorAll('.team-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Clear selected MITRE techniques
            document.getElementById('selected-techniques').innerHTML = '';
            
            // Update business processes
            updateBusinessProcesses();
            
            // Update range values
            updateRangeValues();
        }
    }
    
    /**
     * Load saved scenario parameters
     * @param {Object} params - Saved parameters
     */
    function loadSavedParameters(params) {
        if (!params) return;
        
        try {
            // Basic organization information
            if (params.organizationSector) document.getElementById('org-sector').value = params.organizationSector;
            if (params.organizationSize) document.getElementById('org-size').value = params.organizationSize;
            
            // Update business processes based on sector
            updateBusinessProcesses();
            
            // Select business processes
            if (params.businessProcesses) {
                params.businessProcesses.forEach(process => {
                    const checkbox = document.querySelector(`input[name="business-process"][value="${process}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            // Select regulatory requirements
            if (params.regulatoryRequirements) {
                params.regulatoryRequirements.forEach(reg => {
                    const checkbox = document.querySelector(`input[name="regulatory"][value="${reg}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            // Geographic reach
            if (params.geographicReach) document.getElementById('org-geo').value = params.geographicReach;
            
            // Environment
            if (params.environment) {
                document.querySelectorAll('input[name="environment"]').forEach(checkbox => {
                    checkbox.checked = params.environment.includes(checkbox.value);
                });
            }
            
            // Security controls
            if (params.securityControls) {
                document.querySelectorAll('input[name="security"]').forEach(checkbox => {
                    checkbox.checked = params.securityControls.includes(checkbox.value);
                });
            }
            
            // Backup strategy
            if (params.backupStrategy) document.getElementById('backup-strategy').value = params.backupStrategy;
            
            // Teams
            if (params.teams) {
                if (params.teams.includes('irt')) {
                    document.querySelector('.team-option[data-team="irt"]').classList.add('selected');
                }
                if (params.teams.includes('cmt')) {
                    document.querySelector('.team-option[data-team="cmt"]').classList.add('selected');
                }
            }
            
            // Technical expertise
            if (params.technicalExpertise) document.getElementById('tech-expertise').value = params.technicalExpertise;
            
            // Exercise experience
            if (params.exerciseExperience) document.getElementById('exercise-experience').value = params.exerciseExperience;
            
            // Threat information
            if (params.threatActor) document.getElementById('threat-actor').value = params.threatActor;
            if (params.attackVector) document.getElementById('attack-vector').value = params.attackVector;
            if (params.attackType) document.getElementById('attack-type').value = params.attackType;
            if (params.attackMotivation) document.getElementById('attack-motivation').value = params.attackMotivation;
            
            // MITRE techniques
            if (params.mitreTechniques) {
                params.mitreTechniques.forEach(technique => {
                    addMitreTechnique(technique.id, technique.name);
                });
            }
            
            // Exercise structure
            if (params.incidentTimeline) document.getElementById('incident-timeline').value = params.incidentTimeline;
            
            // Phases
            if (params.phases) {
                document.querySelectorAll('input[name="phases"]').forEach(checkbox => {
                    checkbox.checked = params.phases.includes(checkbox.value.toLowerCase());
                });
            }
            
            // Injects per phase
            if (params.injectsPerPhase) document.getElementById('injects-per-phase').value = params.injectsPerPhase;
            
            // Red herrings
            if (params.redHerrings) document.getElementById('red-herrings').value = params.redHerrings;
            
            // Difficulty
            if (params.difficulty) document.getElementById('difficulty').value = params.difficulty;
            
            // Effect management
            if (params.techBusinessRatio) document.getElementById('tech-business-ratio').value = params.techBusinessRatio;
            if (params.mediaPressure) document.getElementById('media-pressure').value = params.mediaPressure;
            if (params.regulatoryInvolvement) document.getElementById('regulatory-involvement').value = params.regulatoryInvolvement;
            if (params.executiveInvolvement) document.getElementById('executive-involvement').value = params.executiveInvolvement;
            if (params.customerImpact) document.getElementById('customer-impact').value = params.customerImpact;
            
            // Business impact areas
            if (params.businessImpactAreas) {
                document.querySelectorAll('input[name="impact-areas"]').forEach(checkbox => {
                    checkbox.checked = params.businessImpactAreas.includes(checkbox.value);
                });
            }
            
            // Update range values
            updateRangeValues();
        } catch (error) {
            console.error('Error loading saved parameters:', error);
            showMessage('Failed to load saved parameters.', 'error');
        }
    }
    
    // Public API
    return {
        init,
        initPhase,
        addMitreTechnique,
        removeMitreTechnique,
        updateBusinessProcesses,
        loadSavedParameters
    };
})();