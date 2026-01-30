import emailjs from '@emailjs/browser';

class EmailJSService {
    constructor() {
        this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
        this.templates = {
            disputeFiled: import.meta.env.VITE_EMAILJS_TEMPLATE_DISPUTE_FILED,
            confirmation: import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRMATION,
            accepted: import.meta.env.VITE_EMAILJS_TEMPLATE_ACCEPTED,
            rejected: import.meta.env.VITE_EMAILJS_TEMPLATE_REJECTED,
        };

        // Initialize EmailJS with public key
        if (this.publicKey) {
            emailjs.init(this.publicKey);
        }
    }

    /**
     * Send email notification when dispute is filed
     */
    async sendDisputeFiledNotification(params) {
        const {
            to_email,
            dispute_title,
            plaintiff_email,
            category,
            dispute_id
        } = params;

        try {
            const templateParams = {
                to_email,
                dispute_title,
                plaintiff_email,
                category,
                dispute_link: `${window.location.origin}/dispute/${dispute_id}`,
            };

            const response = await emailjs.send(
                this.serviceId,
                this.templates.disputeFiled,
                templateParams
            );

            console.log('Dispute filed email sent successfully:', response);
            return { success: true, response };
        } catch (error) {
            console.error('Failed to send dispute filed email:', error);
            return { success: false, error };
        }
    }

    /**
     * Send confirmation email to plaintiff
     */
    async sendDisputeFiledConfirmation(params) {
        const {
            to_email,
            dispute_title,
            defendant_email,
            category,
            dispute_id
        } = params;

        try {
            const templateParams = {
                to_email,
                dispute_title,
                defendant_email,
                category,
                dispute_link: `${window.location.origin}/dispute/${dispute_id}`,
            };

            const response = await emailjs.send(
                this.serviceId,
                this.templates.confirmation,
                templateParams
            );

            console.log('Confirmation email sent successfully:', response);
            return { success: true, response };
        } catch (error) {
            console.error('Failed to send confirmation email:', error);
            return { success: false, error };
        }
    }

    /**
     * Send email when dispute is accepted
     */
    async sendDisputeAcceptedNotification(params) {
        const {
            to_email,
            dispute_title,
            defendant_email,
            dispute_id
        } = params;

        try {
            const templateParams = {
                to_email,
                dispute_title,
                defendant_email,
                dispute_link: `${window.location.origin}/dispute/${dispute_id}`,
            };

            const response = await emailjs.send(
                this.serviceId,
                this.templates.accepted,
                templateParams
            );

            console.log('Dispute accepted email sent successfully:', response);
            return { success: true, response };
        } catch (error) {
            console.error('Failed to send dispute accepted email:', error);
            return { success: false, error };
        }
    }

    /**
     * Send email when dispute is rejected
     */
    async sendDisputeRejectedNotification(params) {
        const {
            to_email,
            dispute_title,
            defendant_email,
            dispute_id
        } = params;

        try {
            const templateParams = {
                to_email,
                dispute_title,
                defendant_email,
                dispute_link: `${window.location.origin}/dispute/${dispute_id}`,
            };

            const response = await emailjs.send(
                this.serviceId,
                this.templates.rejected,
                templateParams
            );

            console.log('Dispute rejected email sent successfully:', response);
            return { success: true, response };
        } catch (error) {
            console.error('Failed to send dispute rejected email:', error);
            return { success: false, error };
        }
    }

    /**
     * Check if EmailJS is configured
     */
    isConfigured() {
        return !!(this.serviceId && this.publicKey && this.templates.disputeFiled);
    }
}

// Export singleton instance
export const emailJSService = new EmailJSService();
