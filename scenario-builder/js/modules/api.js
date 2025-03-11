/**
 * API Module for Northwave Resilience Scenario Builder
 * Handles Azure OpenAI API integration
 */

const apiModule = (function() {
    // Private variables
    let cachedResponses = {};
    
    /**
     * Initialize the API module
     */
    function init() {
        console.log('API Module initialized');
        
        // Load API settings from localStorage if available
        loadApiSettings();
    }
    
    /**
     * Load API settings from localStorage
     */
    function loadApiSettings() {
        const apiKey = localStorage.getItem('nw_api_key');
        const endpoint = localStorage.getItem('nw_api_endpoint');
        const deployment = localStorage.getItem('nw_api_deployment');
        const apiVersion = localStorage.getItem('nw_api_version');
        
        if (apiKey) {
            document.getElementById('api-key').value = apiKey;
        }
        
        if (endpoint) {
            document.getElementById('api-endpoint').value = endpoint;
        }
        
        if (deployment) {
            document.getElementById('api-deployment').value = deployment;
        }
        
        if (apiVersion) {
            document.getElementById('api-version').value = apiVersion;
        }
    }
    
    /**
     * Test connection to Azure OpenAI API
     * @returns {Promise<Object>} - Result of the test
     */
    async function testConnection() {
        try {
            // Get API settings
            const settings = getApiSettings();
            
            // Validate settings
            if (!validateApiSettings(settings)) {
                return { success: false, error: 'Missing API settings' };
            }
            
            // Create a simple test prompt
            const prompt = "This is a test message to verify the API connection. Please respond with 'Connection successful!' if you can read this message.";
            
            // Send test request
            const response = await sendRequest(prompt, {
                systemPrompt: "You are a helpful assistant. Respond only with 'Connection successful!' to verify connectivity.",
                maxTokens: 20,
                temperature: 0.1
            });
            
            // Check if response contains success message
            if (response.includes('Connection successful')) {
                return { success: true };
            } else {
                return { success: false, error: 'Unexpected response from API' };
            }
        } catch (error) {
            console.error('API connection test error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Generate scenario parameters based on user input
     * @param {Object} setupParams - User-defined setup parameters
     * @returns {Promise<Object>} - Generated scenario details
     */
    async function generateScenarioBackground(setupParams) {
        try {
            // Generate cache key for this request
            const cacheKey = `scenario_background_${JSON.stringify(setupParams)}`;
            
            // Check if we have a cached response
            if (cachedResponses[cacheKey]) {
                return cachedResponses[cacheKey];
            }
            
            // Build the prompt
            const prompt = buildScenarioBackgroundPrompt(setupParams);
            
            // Build system prompt
            const systemPrompt = `
                You are an expert cybersecurity and crisis management scenario builder.
                You create realistic and detailed incident response scenarios for training.
                You focus on creating logically consistent scenarios with clear business impact.
                Provide output in the exact JSON format requested, with no explanations outside the JSON.
            `;
            
            // Send the request
            const response = await sendRequest(prompt, {
                systemPrompt,
                maxTokens: 2000,
                temperature: 0.7
            });
            
            // Parse the JSON response
            const scenarioBackground = parseJsonResponse(response);
            
            // Cache the response
            cachedResponses[cacheKey] = scenarioBackground;
            
            return scenarioBackground;
        } catch (error) {
            console.error('Error generating scenario background:', error);
            throw new Error(`Failed to generate scenario background: ${error.message}`);
        }
    }
    
    /**
     * Generate injects for a specific phase
     * @param {string} phase - The phase to generate injects for
     * @param {Object} scenarioParams - The scenario parameters
     * @param {Array} existingInjects - Any existing injects to consider
     * @param {number} count - Number of injects to generate
     * @returns {Promise<Array>} - The generated injects
     */
    async function generatePhaseInjects(phase, scenarioParams, existingInjects = [], count = 7) {
        try {
            // Generate cache key for this request
            const cacheKey = `${phase}_injects_${JSON.stringify(scenarioParams)}_${count}_${existingInjects.length}`;
            
            // Check if we have a cached response
            if (cachedResponses[cacheKey]) {
                return cachedResponses[cacheKey];
            }
            
            // Build the prompt
            const prompt = buildPhaseInjectsPrompt(phase, scenarioParams, existingInjects, count);
            
            // Build system prompt specific to the phase
            const systemPrompt = getSystemPromptForPhase(phase);
            
            // Send the request
            const response = await sendRequest(prompt, {
                systemPrompt,
                maxTokens: 3500,
                temperature: 0.7,
                responseFormat: { type: "json_object" }
            });
            
            // Parse the JSON response
            const injects = parseJsonResponse(response);
            
            // Add additional metadata and standardize format
            const processedInjects = processInjects(injects, phase);
            
            // Cache the response
            cachedResponses[cacheKey] = processedInjects;
            
            return processedInjects;
        } catch (error) {
            console.error(`Error generating ${phase} phase injects:`, error);
            throw new Error(`Failed to generate ${phase} phase injects: ${error.message}`);
        }
    }
    
    /**
     * Generate a single custom inject
     * @param {string} injectType - The type of inject to generate
     * @param {string} phase - The current phase
     * @param {Object} scenarioParams - The scenario parameters
     * @param {Array} existingInjects - Existing injects for context
     * @returns {Promise<Object>} - The generated inject
     */
    async function generateCustomInject(injectType, phase, scenarioParams, existingInjects = []) {
        try {
            // Build the prompt
            const prompt = buildCustomInjectPrompt(injectType, phase, scenarioParams, existingInjects);
            
            // Build system prompt
            const systemPrompt = `
                You are an expert cybersecurity and crisis management scenario builder.
                You are generating a single realistic ${injectType} inject for the ${phase} phase of an incident response exercise.
                Provide detailed, realistic content suitable for professional incident response training.
                Focus on realism and include all necessary details that would be present in a real ${injectType}.
                Output must be in the exact JSON format requested, with no explanations outside the JSON.
            `;
            
            // Send the request
            const response = await sendRequest(prompt, {
                systemPrompt,
                maxTokens: 1500,
                temperature: 0.7,
                responseFormat: { type: "json_object" }
            });
            
            // Parse the JSON response
            const inject = parseJsonResponse(response);
            
            // Add additional metadata and standardize format
            return processInject(inject, phase);
        } catch (error) {
            console.error(`Error generating custom ${injectType} inject:`, error);
            throw new Error(`Failed to generate ${injectType} inject: ${error.message}`);
        }
    }
    
    /**
     * Build a prompt for generating scenario background
     * @param {Object} params - The scenario parameters
     * @returns {string} - The prompt
     */
    function buildScenarioBackgroundPrompt(params) {
        return `
            Generate a detailed incident response scenario background based on the following parameters:
            
            Organization:
            - Industry/Sector: ${params.organizationSector}
            - Size: ${params.organizationSize}
            - Critical Business Processes: ${params.businessProcesses.join(', ')}
            - Regulatory Requirements: ${params.regulatoryRequirements.join(', ')}
            - Geographic Reach: ${params.geographicReach}
            
            Technical Infrastructure:
            - Environment: ${params.environment.join(', ')}
            - Security Controls: ${params.securityControls.join(', ')}
            - Backup Strategy: ${params.backupStrategy}
            
            Teams:
            - Incident Response Team: ${params.teams.includes('irt') ? 'Yes' : 'No'}
            - Crisis Management Team: ${params.teams.includes('cmt') ? 'Yes' : 'No'}
            - Technical Expertise: ${params.technicalExpertise}
            
            Threat:
            - Threat Actor: ${params.threatActor}
            - Attack Vector: ${params.attackVector}
            - Attack Type: ${params.attackType}
            - Attack Motivation: ${params.attackMotivation}
            
            Exercise Structure:
            - Timeline: ${params.incidentTimeline}
            - Phases: ${params.phases.join(', ')}
            - Difficulty: ${params.difficulty}
            
            Effect Management:
            - Technical vs Business Ratio: ${params.techBusinessRatio}
            - Media Pressure: ${params.mediaPressure}
            - Regulatory Involvement: ${params.regulatoryInvolvement}
            - Executive Involvement: ${params.executiveInvolvement}
            - Customer Impact: ${params.customerImpact}
            - Business Impact Areas: ${params.businessImpactAreas.join(', ')}
            
            MITRE ATT&CK Techniques:
            ${params.mitreTechniques.map(t => `- ${t.id}: ${t.name}`).join('\n')}
            
            Create a detailed scenario background with the following components in JSON format:
            
            {
                "title": "Descriptive scenario title",
                "summary": "Brief summary of the incident (1-2 paragraphs)",
                "threatActorProfile": {
                    "name": "Name of the threat actor",
                    "motivation": "Primary motivation",
                    "capabilities": "Technical capabilities",
                    "tactics": "Typical tactics used"
                },
                "initialCompromise": {
                    "vector": "How the attacker initially gained access",
                    "timeline": "When the initial access occurred",
                    "indicators": "Initial indicators of compromise"
                },
                "businessContext": {
                    "criticality": "Importance of affected systems",
                    "potentialImpact": "Potential business impact",
                    "stakeholders": "Key stakeholders concerned"
                },
                "objectives": [
                    "Training objective 1",
                    "Training objective 2",
                    "Training objective 3"
                ]
            }
            
            Focus on creating a realistic and engaging scenario that will challenge both technical and management teams.
        `;
    }
    
    /**
     * Build a prompt for generating phase-specific injects
     * @param {string} phase - The phase to generate injects for
     * @param {Object} params - The scenario parameters
     * @param {Array} existingInjects - Existing injects for context
     * @param {number} count - Number of injects to generate
     * @returns {string} - The prompt
     */
    function buildPhaseInjectsPrompt(phase, params, existingInjects, count) {
        let contextInjects = '';
        
        if (existingInjects && existingInjects.length > 0) {
            contextInjects = `
                Previous injects:
                ${existingInjects.map((inject, index) => 
                    `${index + 1}. [${inject.id}] ${inject.type} - ${inject.title} (${inject.category})`
                ).join('\n')}
            `;
        }
        
        const phaseSpecificGuidance = getPhaseSpecificPromptGuidance(phase);
        
        return `
            Generate ${count} realistic injects for the ${phase} phase of an incident response exercise based on the following scenario:
            
            SCENARIO BACKGROUND:
            Title: ${params.title}
            Summary: ${params.summary}
            Attack Type: ${params.attackType}
            Threat Actor: ${params.threatActor} - ${params.threatActorProfile.motivation}
            Initial Compromise: ${params.initialCompromise.vector}
            
            TECHNICAL CONTEXT:
            Organization: ${params.organizationSector} (${params.organizationSize})
            Environment: ${params.environment.join(', ')}
            Security Controls: ${params.securityControls.join(', ')}
            
            BUSINESS CONTEXT:
            Critical Processes: ${params.businessProcesses.join(', ')}
            Regulatory Requirements: ${params.regulatoryRequirements.join(', ')}
            Business Impact Areas: ${params.businessImpactAreas.join(', ')}
            Media Pressure: ${params.mediaPressure}
            Customer Impact: ${params.customerImpact}
            
            TEAMS BEING TRAINED:
            ${params.teams.includes('irt') ? '- Incident Response Team (Technical focus)' : ''}
            ${params.teams.includes('cmt') ? '- Crisis Management Team (Business/effect management focus)' : ''}
            Technical Expertise Level: ${params.technicalExpertise}
            
            MITRE ATT&CK Techniques:
            ${params.mitreTechniques.map(t => `- ${t.id}: ${t.name}`).join('\n')}
            
            RATIO CONFIGURATION:
            Technical vs Business Effect Ratio: ${params.techBusinessRatio}
            
            ${contextInjects}
            
            ${phaseSpecificGuidance}
            
            Create ${count} detailed and realistic injects in the following JSON format:
            
            {
                "injects": [
                    {
                        "id": "String (e.g., I001, I002, etc.)",
                        "title": "Brief descriptive title",
                        "type": "Type of inject (Email, Alert, Report, Media, etc.)",
                        "category": "technical or business",
                        "sender": "Source of the inject",
                        "recipient": "Intended recipient(s)",
                        "timestamp": "Relative timestamp (e.g., Day 1 - 10:30)",
                        "content": "Detailed content of the inject - Be realistic and detailed",
                        "attachments": ["Optional list of attachment descriptions"],
                        "businessImpact": "Description of business impact (if applicable)",
                        "technicalDetails": "Technical details relevant to the inject",
                        "expectedActions": ["List of expected actions from the team"],
                        "isRedHerring": boolean (true/false),
                        "mitreTechniques": ["Any relevant MITRE technique IDs"]
                    }
                ]
            }
            
            Ensure injects are logically connected and tell a coherent story about the incident progression.
            Make the content realistic, detailed, and consistent with real-world examples.
            Include realistic technical details like IP addresses, file names, paths, etc. where appropriate.
            Balance between technical and business injects according to the specified ratio.
            Include both immediate technical issues and secondary business effects for a comprehensive exercise.
        `;
    }
    
    /**
     * Build a prompt for generating a custom inject
     * @param {string} injectType - The type of inject to generate
     * @param {string} phase - Current phase
     * @param {Object} params - Scenario parameters
     * @param {Array} existingInjects - Existing injects for context
     * @returns {string} - The prompt
     */
    function buildCustomInjectPrompt(injectType, phase, params, existingInjects) {
        let contextInjects = '';
        
        if (existingInjects && existingInjects.length > 0) {
            // Limit to the last 5 injects for context
            const recentInjects = existingInjects.slice(-5);
            
            contextInjects = `
                Recent injects:
                ${recentInjects.map((inject, index) => 
                    `${index + 1}. [${inject.id}] ${inject.type} - ${inject.title} (${inject.category})`
                ).join('\n')}
            `;
        }
        
        // Find the event type details
        let eventTypeDetails = {};
        
        Object.keys(EVENT_TYPES).forEach(category => {
            const found = EVENT_TYPES[category].find(type => type.id === injectType);
            if (found) {
                eventTypeDetails = found;
            }
        });
        
        return `
            Generate a realistic ${eventTypeDetails.name} inject for the ${phase} phase of an incident response exercise.
            
            INJECT TYPE: ${eventTypeDetails.name}
            Description: ${eventTypeDetails.description}
            Category: ${eventTypeDetails.category}
            
            SCENARIO BACKGROUND:
            Title: ${params.title}
            Summary: ${params.summary}
            Attack Type: ${params.attackType}
            Threat Actor: ${params.threatActor}
            
            CONTEXT:
            Current Phase: ${phase}
            Organization: ${params.organizationSector} (${params.organizationSize})
            
            ${contextInjects}
            
            Create a single detailed and realistic inject in the following JSON format:
            
            {
                "id": "Generate a new unique ID",
                "title": "Brief descriptive title",
                "type": "${eventTypeDetails.name}",
                "category": "${eventTypeDetails.category === 'technical' ? 'technical' : 'business'}",
                "sender": "Source of the inject (be specific)",
                "recipient": "Intended recipient(s)",
                "timestamp": "Relative timestamp (e.g., Day 1 - 11:45)",
                "content": "Detailed content of the inject - Be realistic and detailed. Include all formatting, signatures, headers, etc. that would appear in a real ${eventTypeDetails.name}.",
                "attachments": ["Optional list of attachment descriptions"],
                "businessImpact": "Description of business impact (if applicable)",
                "technicalDetails": "Technical details relevant to the inject",
                "expectedActions": ["List of expected actions from the team"],
                "isRedHerring": false,
                "mitreTechniques": ["Any relevant MITRE technique IDs"]
            }
            
            Make the content extremely realistic with proper formatting, headers, signatures, and technical details.
            The content should be detailed enough to be used in a professional incident response exercise.
            Ensure the inject fits logically with the existing injects and current phase of the incident.
        `;
    }
    
    /**
     * Get phase-specific prompt guidance
     * @param {string} phase - The phase
     * @returns {string} - Phase-specific guidance
     */
    function getPhaseSpecificPromptGuidance(phase) {
        switch (phase) {
            case 'identification':
                return `
                    IDENTIFICATION PHASE SPECIFICS:
                    This phase focuses on the initial detection and recognition of the incident.
                    
                    Inject types to include:
                    - Security alerts from monitoring systems
                    - Suspicious emails or phishing attempts
                    - User reports of unusual system behavior
                    - Log entries showing suspicious activity
                    - Initial business impact notifications
                    
                    For technical injects, focus on:
                    - Initial indicators of compromise
                    - Suspicious activity patterns
                    - Early warning signs
                    - Security tool alerts
                    
                    For business injects, focus on:
                    - Initial reports of business disruption
                    - Early customer complaints
                    - Initial inquiries from stakeholders
                    - First signs of operational impact
                    
                    The injects should provide enough information to identify that an incident is occurring,
                    but not necessarily reveal the full scope or nature of the attack immediately.
                `;
                
            case 'containment':
                return `
                    CONTAINMENT PHASE SPECIFICS:
                    This phase focuses on limiting the damage of the incident and preventing further spread.
                    
                    Inject types to include:
                    - Additional technical findings from investigation
                    - Escalating alerts as the attack progresses
                    - Reports of spreading impact
                    - Management inquiries about containment options
                    - Stakeholder communications needs
                    
                    For technical injects, focus on:
                    - Evidence of lateral movement
                    - Additional compromised systems
                    - Technical options for isolation or containment
                    - Forensic findings
                    
                    For business injects, focus on:
                    - Growing business impact
                    - Decision points for business continuity
                    - Communications with stakeholders
                    - Legal and regulatory considerations
                    - Media inquiries or initial public awareness
                    
                    The injects should present escalating challenges and require decisions about
                    isolating systems, blocking traffic, or implementing other containment measures.
                `;
                
            case 'eradication':
                return `
                    ERADICATION PHASE SPECIFICS:
                    This phase focuses on removing the threat from the environment.
                    
                    Inject types to include:
                    - Forensic analysis results
                    - Malware/threat removal options
                    - Verification of eradication efforts
                    - Continued business impacts
                    - Stakeholder pressure for resolution
                    
                    For technical injects, focus on:
                    - Root cause findings
                    - Malware analysis results
                    - Complete compromise assessment
                    - Removal techniques and challenges
                    - Verification of complete removal
                    
                    For business injects, focus on:
                    - Extended business impacts
                    - Resource requirements and constraints
                    - Business workarounds under development
                    - Stakeholder/customer communications
                    - Management decision points
                    
                    The injects should present findings about the full extent of the compromise and
                    challenges in completely removing the threat from the environment.
                `;
                
            case 'recovery':
                return `
                    RECOVERY PHASE SPECIFICS:
                    This phase focuses on restoring systems to normal operation.
                    
                    Inject types to include:
                    - Restoration plans and priorities
                    - Testing and verification of recovered systems
                    - Challenges during restoration
                    - Business resumption planning
                    - External communications about recovery
                    
                    For technical injects, focus on:
                    - System restoration procedures
                    - Data recovery options
                    - Verification testing results
                    - Technical challenges during recovery
                    - Monitoring for re-infection
                    
                    For business injects, focus on:
                    - Business process restoration priorities
                    - Customer/partner communications
                    - Service level recovery tracking
                    - Financial impact assessments
                    - Reputation management
                    
                    The injects should present realistic challenges in restoring operations while
                    maintaining security and managing stakeholder expectations.
                `;
                
            case 'hardening':
                return `
                    HARDENING PHASE SPECIFICS:
                    This phase focuses on implementing lessons learned and improving security posture.
                    
                    Inject types to include:
                    - Post-incident analysis findings
                    - Recommendations for security improvements
                    - Organizational learning opportunities
                    - Long-term recovery planning
                    - Regulatory or compliance follow-up
                    
                    For technical injects, focus on:
                    - Specific security vulnerabilities identified
                    - Technical control improvement options
                    - Security architecture recommendations
                    - Monitoring enhancements
                    - Technical policy updates
                    
                    For business injects, focus on:
                    - Process improvement opportunities
                    - Business continuity enhancements
                    - Communication protocol improvements
                    - Training and awareness needs
                    - Governance or oversight changes
                    
                    The injects should help the teams identify concrete actions to improve overall
                    resilience and prevent similar incidents in the future.
                `;
                
            default:
                return '';
        }
    }
    
    /**
     * Get a system prompt specific to a phase
     * @param {string} phase - The phase
     * @returns {string} - The system prompt
     */
    function getSystemPromptForPhase(phase) {
        const basePrompt = `
            You are an expert cybersecurity and crisis management scenario builder.
            You create realistic and detailed incident response scenarios for training.
            You focus on creating logically consistent scenarios with clear business impact.
            Provide output in the exact JSON format requested, with no explanations outside the JSON.
        `;
        
        switch (phase) {
            case 'identification':
                return `${basePrompt}
                    For the identification phase, create realistic detection artifacts that would
                    appear in the early stages of an incident. Include realistic technical details
                    such as IP addresses, timestamps, file paths, and user accounts. Focus on
                    initial indicators of compromise that would trigger an investigation.
                `;
                
            case 'containment':
                return `${basePrompt}
                    For the containment phase, focus on the escalating nature of the incident,
                    with evidence of lateral movement and spreading impact. Create realistic
                    artifacts showing the decisions teams must make to isolate affected systems
                    and prevent further damage. Include business impact considerations.
                `;
                
            case 'eradication':
                return `${basePrompt}
                    For the eradication phase, create detailed forensic findings and technical
                    details that would help teams understand the full extent of the compromise.
                    Focus on the challenges of completely removing the threat and verifying the
                    environment is clean. Include business continuity considerations.
                `;
                
            case 'recovery':
                return `${basePrompt}
                    For the recovery phase, focus on the process of restoring systems to normal
                    operation. Create realistic challenges related to data restoration, verification,
                    and business process resumption. Include stakeholder communications and
                    business impact updates.
                `;
                
            case 'hardening':
                return `${basePrompt}
                    For the hardening phase, focus on post-incident analysis and security improvements.
                    Create realistic findings and recommendations that would emerge from a detailed
                    investigation. Include both technical controls and process improvements.
                `;
                
            default:
                return basePrompt;
        }
    }
    
    /**
     * Process the injects returned from the API
     * @param {Object} response - The API response
     * @param {string} phase - The current phase
     * @returns {Array} - Processed injects
     */
    function processInjects(response, phase) {
        if (!response || !response.injects || !Array.isArray(response.injects)) {
            console.error('Invalid response format from API:', response);
            throw new Error('Invalid response format from API');
        }
        
        return response.injects.map(inject => processInject(inject, phase));
    }
    
    /**
     * Process a single inject
     * @param {Object} inject - The inject to process
     * @param {string} phase - The current phase
     * @returns {Object} - Processed inject
     */
    function processInject(inject, phase) {
        // Generate a proper ID if not provided
        if (!inject.id) {
            inject.id = generateInjectId(phase);
        }
        
        // Ensure required fields exist
        return {
            id: inject.id,
            title: inject.title || `${inject.type} Inject`,
            type: inject.type || 'Generic',
            category: inject.category || 'technical',
            phase: phase,
            sender: inject.sender || 'System',
            recipient: inject.recipient || 'Incident Response Team',
            timestamp: inject.timestamp || 'Day 1 - 00:00',
            content: inject.content || 'No content provided',
            attachments: inject.attachments || [],
            businessImpact: inject.businessImpact || null,
            technicalDetails: inject.technicalDetails || null,
            expectedActions: inject.expectedActions || [],
            isRedHerring: !!inject.isRedHerring,
            mitreTechniques: inject.mitreTechniques || []
        };
    }
    
    /**
     * Generate a unique inject ID
     * @param {string} phase - The current phase
     * @returns {string} - A unique ID
     */
    function generateInjectId(phase) {
        const phasePrefix = phase.charAt(0).toUpperCase();
        const existingInjects = APP_STATE.scenario.injects.filter(i => i.phase === phase);
        const nextNumber = existingInjects.length + 1;
        
        return `${phasePrefix}${String(nextNumber).padStart(3, '0')}`;
    }
    
    /**
     * Send a request to the Azure OpenAI API
     * @param {string} prompt - The prompt to send
     * @param {Object} options - Request options
     * @returns {Promise<string>} - The API response
     */
    async function sendRequest(prompt, options = {}) {
        try {
            // Get API settings
            const settings = getApiSettings();
            
            // Validate settings
            if (!validateApiSettings(settings)) {
                throw new Error('Missing API settings. Please configure the Azure OpenAI API settings.');
            }
            
            // Prepare the request data
            const requestData = {
                messages: [
                    { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: options.maxTokens || 2000,
                temperature: options.temperature || 0.7,
                top_p: options.top_p || 0.95,
                frequency_penalty: options.frequencyPenalty || 0,
                presence_penalty: options.presencePenalty || 0,
                stop: options.stop || null
            };
            
            // Add response format if specified
            if (options.responseFormat) {
                requestData.response_format = options.responseFormat;
            }
            
            // Ensure the endpoint has no trailing slash
            const endpoint = settings.endpoint.replace(/\/+$/, '');
            
            // Construct the API URL
            const url = `${endpoint}/openai/deployments/${settings.deployment}/chat/completions?api-version=${settings.apiVersion}`;
            
            // Send the request
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': settings.apiKey
                },
                body: JSON.stringify(requestData)
            });
            
            // Handle error responses
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Azure OpenAI API Error Response:', errorText);
                
                // Provide better error messages based on status code
                switch (response.status) {
                    case 400:
                        throw new Error(`Bad request: The API request was invalid. ${errorText}`);
                    case 401:
                        throw new Error('Authentication error: Your API key is invalid or has expired.');
                    case 403:
                        throw new Error('Authorization error: You do not have permission to use this deployment.');
                    case 404:
                        throw new Error('Resource not found: Check your endpoint URL and deployment name.');
                    case 429:
                        throw new Error('Rate limit exceeded: You have sent too many requests. Please try again later.');
                    case 500:
                    case 501:
                    case 502:
                    case 503:
                        throw new Error(`Server error (${response.status}): Azure OpenAI service is experiencing issues. Please try again later.`);
                    default:
                        throw new Error(`Azure OpenAI API error (${response.status}): ${errorText}`);
                }
            }
            
            // Parse and return the response
            const result = await response.json();
            
            if (result.choices && result.choices.length > 0) {
                return result.choices[0].message.content;
            } else {
                throw new Error('No content found in API response');
            }
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    /**
     * Get the API settings
     * @returns {Object} - API settings
     */
    function getApiSettings() {
        return {
            apiKey: document.getElementById('api-key').value,
            endpoint: document.getElementById('api-endpoint').value,
            deployment: document.getElementById('api-deployment').value,
            apiVersion: document.getElementById('api-version').value || '2023-05-15'
        };
    }
    
    /**
     * Validate the API settings
     * @param {Object} settings - The settings to validate
     * @returns {boolean} - Whether the settings are valid
     */
    function validateApiSettings(settings) {
        return (
            settings.apiKey &&
            settings.endpoint &&
            settings.deployment &&
            settings.apiVersion
        );
    }
    
    /**
     * Parse a JSON response from the API
     * @param {string} response - The response to parse
     * @returns {Object} - Parsed JSON
     */
    function parseJsonResponse(response) {
        try {
            // First try direct parsing
            return JSON.parse(response);
        } catch (initialError) {
            console.warn('Initial JSON parse failed:', initialError.message);
            
            try {
                // Try to extract JSON by finding { } brackets
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                
                // If we get here, we couldn't find valid JSON
                throw new Error('Could not extract valid JSON from response');
            } catch (extractError) {
                console.error('Failed to parse API response as JSON:', response);
                throw new Error('Invalid JSON in API response. Please try again.');
            }
        }
    }
    
    /**
     * Clear the response cache
     */
    function clearCache() {
        cachedResponses = {};
    }
    
    // Public API
    return {
        init,
        testConnection,
        generateScenarioBackground,
        generatePhaseInjects,
        generateCustomInject,
        clearCache
    };
})();