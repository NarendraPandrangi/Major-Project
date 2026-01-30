import { validateEmailConfig } from './services/emailService';

// Run validation on app load
const emailConfig = validateEmailConfig();

console.log('=== EMAIL SERVICE CONFIGURATION ===');
console.log('Configuration Valid:', emailConfig.isValid);

if (!emailConfig.isValid) {
    console.error('❌ Missing email configuration:', emailConfig.missing);
} else {
    console.log('✅ All email configuration present');
}

console.log('\nWelcome Service Config:', {
    serviceId: emailConfig.welcomeConfig.serviceId,
    publicKey: emailConfig.welcomeConfig.publicKey ? '***SET***' : 'MISSING',
    templateId: emailConfig.welcomeConfig.templates.registration
});

console.log('\nDispute Service Config:', {
    serviceId: emailConfig.disputeConfig.serviceId,
    publicKey: emailConfig.disputeConfig.publicKey ? '***SET***' : 'MISSING',
    templates: Object.keys(emailConfig.disputeConfig.templates)
});

console.log('===================================\n');

export default emailConfig;
