import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    templates: {
        registration: import.meta.env.VITE_EMAILJS_TEMPLATE_REGISTRATION,
        disputeFiled: import.meta.env.VITE_EMAILJS_TEMPLATE_DISPUTE_FILED,
        confirmation: import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRMATION,
        accepted: import.meta.env.VITE_EMAILJS_TEMPLATE_ACCEPTED,
        rejected: import.meta.env.VITE_EMAILJS_TEMPLATE_REJECTED,
    }
};

// Initialize EmailJS
if (EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
}

/**
 * Send welcome email after registration
 */
export const sendRegistrationEmail = async (userEmail, username) => {
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templates.registration) {
        console.warn('EmailJS not configured for registration emails');
        return { success: false, error: 'EmailJS not configured' };
    }

    try {
        const templateParams = {
            to_email: userEmail,
            to_name: username,
            user_name: username,
        };

        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templates.registration,
            templateParams
        );

        console.log('Registration email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send registration email:', error);
        return { success: false, error };
    }
};

/**
 * Send email to defendant when a dispute is filed against them
 */
export const sendDisputeFiledEmail = async (defendantEmail, disputeData) => {
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templates.disputeFiled) {
        console.warn('EmailJS not configured for dispute filed emails');
        return { success: false, error: 'EmailJS not configured' };
    }

    try {
        const templateParams = {
            to_email: defendantEmail,
            dispute_title: disputeData.title,
            plaintiff_email: disputeData.plaintiffEmail,
            category: disputeData.category,
            dispute_link: `${window.location.origin}/dispute/${disputeData.id}`,
        };

        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templates.disputeFiled,
            templateParams
        );

        console.log('Dispute filed email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send dispute filed email:', error);
        return { success: false, error };
    }
};

/**
 * Send confirmation email to plaintiff after filing a dispute
 */
export const sendDisputeConfirmationEmail = async (plaintiffEmail, disputeData) => {
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templates.confirmation) {
        console.warn('EmailJS not configured for confirmation emails');
        return { success: false, error: 'EmailJS not configured' };
    }

    try {
        const templateParams = {
            to_email: plaintiffEmail,
            dispute_title: disputeData.title,
            defendant_email: disputeData.defendantEmail,
            category: disputeData.category,
            dispute_link: `${window.location.origin}/dispute/${disputeData.id}`,
        };

        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templates.confirmation,
            templateParams
        );

        console.log('Dispute confirmation email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send dispute confirmation email:', error);
        return { success: false, error };
    }
};

/**
 * Send email when dispute is accepted
 */
export const sendDisputeAcceptedEmail = async (plaintiffEmail, disputeData) => {
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templates.accepted) {
        console.warn('EmailJS not configured for accepted emails');
        return { success: false, error: 'EmailJS not configured' };
    }

    try {
        const templateParams = {
            to_email: plaintiffEmail,
            dispute_title: disputeData.title,
            defendant_email: disputeData.defendantEmail,
            dispute_link: `${window.location.origin}/dispute/${disputeData.id}`,
        };

        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templates.accepted,
            templateParams
        );

        console.log('Dispute accepted email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send dispute accepted email:', error);
        return { success: false, error };
    }
};

/**
 * Send email when dispute is rejected
 */
export const sendDisputeRejectedEmail = async (plaintiffEmail, disputeData) => {
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templates.rejected) {
        console.warn('EmailJS not configured for rejected emails');
        return { success: false, error: 'EmailJS not configured' };
    }

    try {
        const templateParams = {
            to_email: plaintiffEmail,
            dispute_title: disputeData.title,
            defendant_email: disputeData.defendantEmail,
            dispute_link: `${window.location.origin}/dispute/${disputeData.id}`,
        };

        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templates.rejected,
            templateParams
        );

        console.log('Dispute rejected email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send dispute rejected email:', error);
        return { success: false, error };
    }
};

export default {
    sendRegistrationEmail,
    sendDisputeFiledEmail,
    sendDisputeConfirmationEmail,
    sendDisputeAcceptedEmail,
    sendDisputeRejectedEmail,
};
