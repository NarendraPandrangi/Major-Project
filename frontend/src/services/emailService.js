import emailjs from '@emailjs/browser';

/**
 * Email Service Configuration
 * Handles separate EmailJS services for different email types
 */

// Welcome/Registration Email Configuration
const WELCOME_CONFIG = {
    serviceId: import.meta.env.VITE_EMAILJS_WELCOME_SERVICE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_WELCOME_PUBLIC_KEY,
    templates: {
        registration: import.meta.env.VITE_EMAILJS_TEMPLATE_REGISTRATION,
    }
};

// Dispute Notifications Email Configuration
const DISPUTE_CONFIG = {
    serviceId: import.meta.env.VITE_EMAILJS_DISPUTE_SERVICE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_DISPUTE_PUBLIC_KEY,
    templates: {
        disputeFiled: import.meta.env.VITE_EMAILJS_TEMPLATE_DISPUTE_FILED,
        confirmation: import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRMATION,
        accepted: import.meta.env.VITE_EMAILJS_TEMPLATE_ACCEPTED,
        rejected: import.meta.env.VITE_EMAILJS_TEMPLATE_REJECTED,
    }
};

/**
 * Initialize EmailJS with the appropriate public key
 * @param {string} publicKey - The public key to initialize with
 */
const initializeEmailJS = (publicKey) => {
    emailjs.init(publicKey);
};

/**
 * Send welcome email after successful registration
 * @param {Object} params - Email parameters
 * @param {string} params.to_email - Recipient email address
 * @param {string} params.to_name - Recipient name
 * @param {string} params.user_id - User ID (optional)
 * @returns {Promise} EmailJS send promise
 */
export const sendWelcomeEmail = async ({ to_email, to_name, user_id }) => {
    try {
        console.log('=== WELCOME EMAIL DEBUG ===');
        console.log('Environment variables:', {
            serviceId: WELCOME_CONFIG.serviceId,
            publicKey: WELCOME_CONFIG.publicKey ? '***SET***' : 'MISSING',
            templateId: WELCOME_CONFIG.templates.registration
        });

        if (!WELCOME_CONFIG.serviceId || !WELCOME_CONFIG.publicKey || !WELCOME_CONFIG.templates.registration) {
            console.error('❌ Welcome email configuration incomplete!', {
                serviceId: WELCOME_CONFIG.serviceId,
                publicKey: WELCOME_CONFIG.publicKey,
                templateId: WELCOME_CONFIG.templates.registration
            });
            return { success: false, error: 'Email service not configured' };
        }

        // Initialize with welcome service public key
        console.log('Initializing EmailJS with welcome service...');
        initializeEmailJS(WELCOME_CONFIG.publicKey);

        // Use standard EmailJS variable names
        const templateParams = {
            name: to_name,              // Your template uses {{name}}
            to_name: to_name,           // Backup
            to_email: to_email,         // Your template uses {{to_email}}
            user_name: to_name,
            user_email: to_email,
            user_id: user_id || 'N/A',
            registration_date: new Date().toLocaleDateString(),
            message: `Welcome to AI Dispute Resolver! Your account has been created successfully.`
        };

        console.log('Sending welcome email with params:', {
            serviceId: WELCOME_CONFIG.serviceId,
            templateId: WELCOME_CONFIG.templates.registration,
            to_email,
            to_name,
            templateParams
        });

        const response = await emailjs.send(
            WELCOME_CONFIG.serviceId,
            WELCOME_CONFIG.templates.registration,
            templateParams
        );

        console.log('✅ Welcome email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Failed to send welcome email:', error);
        console.error('Error details:', {
            message: error.message,
            text: error.text,
            status: error.status
        });
        return { success: false, error: error.message || 'Failed to send welcome email' };
    }
};

/**
 * Send dispute filed notification email
 * @param {Object} params - Email parameters
 * @param {string} params.to_email - Recipient email address
 * @param {string} params.to_name - Recipient name
 * @param {string} params.dispute_id - Dispute ID
 * @param {string} params.dispute_title - Dispute title
 * @param {string} params.category - Dispute category
 * @returns {Promise} EmailJS send promise
 */
export const sendDisputeFiledEmail = async ({ to_email, to_name, dispute_id, dispute_title, category, message, action }) => {
    try {
        // Initialize with dispute service public key
        initializeEmailJS(DISPUTE_CONFIG.publicKey);

        const msg = message || "A new dispute has been filed against you. Please review the details and respond.";
        const act = action || "View Dispute Details";

        const templateParams = {
            to_email,
            to_name,
            dispute_id,
            dispute_title,
            category,
            filed_date: new Date().toLocaleDateString(),

            // Send multiple variations of message/action to match potential template variables
            message: msg,
            message_body: msg,
            body: msg,
            content: msg,

            action: act,
            action_text: act,
            action_label: act,
            btn_text: act,

            title: "New Dispute Filed",
            intro: "You have a new dispute case update."
        };

        console.log('Sending dispute filed email:', { recipient: to_email, message: msg });

        const response = await emailjs.send(
            DISPUTE_CONFIG.serviceId,
            DISPUTE_CONFIG.templates.disputeFiled,
            templateParams
        );

        console.log('Dispute filed email sent successfully');
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send dispute filed email:', error);
        return { success: false, error: error.message || 'Failed to send dispute notification' };
    }
};

/**
 * Send dispute confirmation email
 * @param {Object} params - Email parameters
 * @returns {Promise} EmailJS send promise
 */
export const sendDisputeConfirmationEmail = async (params) => {
    try {
        initializeEmailJS(DISPUTE_CONFIG.publicKey);

        const msg = params.message || "Your dispute has been successfully filed. We have notified the defendant.";
        const act = params.action || "View Dispute Details";

        const templateParams = {
            ...params,
            message: msg,
            message_body: msg,
            body: msg,
            content: msg,

            action: act,
            action_text: act,
            action_label: act,
            btn_text: act,

            title: "Dispute Filed Successfully",
            intro: "We have received your dispute filing."
        };

        const response = await emailjs.send(
            DISPUTE_CONFIG.serviceId,
            DISPUTE_CONFIG.templates.confirmation,
            templateParams
        );

        console.log('Dispute confirmation email sent successfully');
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send dispute confirmation email:', error);
        return { success: false, error: error.message || 'Failed to send confirmation email' };
    }
};

/**
 * Send dispute accepted notification email
 * @param {Object} params - Email parameters
 * @returns {Promise} EmailJS send promise
 */
export const sendDisputeAcceptedEmail = async (params) => {
    try {
        initializeEmailJS(DISPUTE_CONFIG.publicKey);

        const msg = params.message || "The defendant has accepted your dispute claim. You can now proceed to the resolution phase.";
        const act = params.action || "Start Negotiation";

        const templateParams = {
            ...params,
            message: msg,
            message_body: msg,
            body: msg,
            content: msg,

            action: act,
            action_text: act,
            action_label: act,
            btn_text: act,

            title: "Dispute Accepted",
            intro: "Good news! The defendant has accepted the dispute."
        };

        const response = await emailjs.send(
            DISPUTE_CONFIG.serviceId,
            DISPUTE_CONFIG.templates.accepted,
            templateParams
        );

        console.log('Dispute accepted email sent successfully');
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send dispute accepted email:', error);
        return { success: false, error: error.message || 'Failed to send acceptance notification' };
    }
};

/**
 * Send dispute rejected notification email
 * @param {Object} params - Email parameters
 * @returns {Promise} EmailJS send promise
 */
export const sendDisputeRejectedEmail = async (params) => {
    try {
        initializeEmailJS(DISPUTE_CONFIG.publicKey);

        const msg = params.message || "The defendant has rejected your dispute claim.";
        const act = params.action || "View Details";

        const templateParams = {
            ...params,
            message: msg,
            message_body: msg,
            body: msg,
            content: msg,

            action: act,
            action_text: act,
            action_label: act,
            btn_text: act,

            title: "Dispute Rejected",
            intro: "The defendant has rejected the dispute claim."
        };

        const response = await emailjs.send(
            DISPUTE_CONFIG.serviceId,
            DISPUTE_CONFIG.templates.rejected,
            templateParams
        );

        console.log('Dispute rejected email sent successfully');
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send dispute rejected email:', error);
        return { success: false, error: error.message || 'Failed to send rejection notification' };
    }
};

/**
 * Validate email service configuration
 * @returns {Object} Validation result with missing configurations
 */
export const validateEmailConfig = () => {
    const missing = [];

    // Check welcome config
    if (!WELCOME_CONFIG.serviceId) missing.push('VITE_EMAILJS_WELCOME_SERVICE_ID');
    if (!WELCOME_CONFIG.publicKey) missing.push('VITE_EMAILJS_WELCOME_PUBLIC_KEY');
    if (!WELCOME_CONFIG.templates.registration) missing.push('VITE_EMAILJS_TEMPLATE_REGISTRATION');

    // Check dispute config
    if (!DISPUTE_CONFIG.serviceId) missing.push('VITE_EMAILJS_DISPUTE_SERVICE_ID');
    if (!DISPUTE_CONFIG.publicKey) missing.push('VITE_EMAILJS_DISPUTE_PUBLIC_KEY');

    return {
        isValid: missing.length === 0,
        missing,
        welcomeConfig: WELCOME_CONFIG,
        disputeConfig: DISPUTE_CONFIG
    };
};
