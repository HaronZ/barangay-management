import sgMail from '@sendgrid/mail';

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('📧 Email Provider: SendGrid');
    console.log(`   From: ${process.env.EMAIL_FROM || 'Not configured'}`);
} else {
    console.log('⚠️ SENDGRID_API_KEY not configured - emails will be logged to console');
}

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';
const getFromEmail = () => process.env.EMAIL_FROM || 'noreply@example.com';

// HTML Templates
const createEmailTemplate = (title: string, content: string, buttonText: string, buttonUrl: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Barangay Management System</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937;">${title}</h2>
            <p style="color: #4b5563; line-height: 1.6;">${content}</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${buttonUrl}" 
                   style="background: #22c55e; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 6px; font-weight: bold;">
                    ${buttonText}
                </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                Barangay Management System © ${new Date().getFullYear()}
            </p>
        </div>
    </div>
`;

// Send email using SendGrid
const sendEmail = async (to: string, subject: string, html: string, text: string) => {
    const from = getFromEmail();

    if (process.env.SENDGRID_API_KEY) {
        try {
            console.log(`📧 Sending email via SendGrid to ${to}...`);

            const msg = {
                to,
                from,
                subject,
                text,
                html,
            };

            const response = await sgMail.send(msg);
            console.log(`✅ Email sent via SendGrid to ${to}`);
            console.log(`   Status: ${response[0].statusCode}`);
            return true;
        } catch (error: unknown) {
            const err = error as Error & { response?: { body?: unknown } };
            console.error('❌ SendGrid error:', err.message);
            if (err.response?.body) {
                console.error('   Response:', JSON.stringify(err.response.body));
            }
            throw error;
        }
    }

    // Development fallback: log to console
    console.log('\n========================================');
    console.log('📧 EMAIL (Development Mode)');
    console.log('========================================');
    console.log(`To: ${to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${subject}`);
    console.log('========================================\n');
    return true;
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
    const resetUrl = `${getFrontendUrl()}/reset-password?token=${resetToken}`;

    const html = createEmailTemplate(
        'Password Reset Request',
        'You have requested to reset your password. Click the button below to create a new password. This link will expire in <strong>1 hour</strong>. If you didn\'t request this, please ignore this email.',
        'Reset Password',
        resetUrl
    );

    const text = `
Password Reset Request

You have requested to reset your password.

Click this link to reset your password: ${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
    `.trim();

    return sendEmail(email, 'Password Reset Request - Barangay Management System', html, text);
};

// Send verification email
export const sendVerificationEmail = async (email: string, verificationToken: string) => {
    const verifyUrl = `${getFrontendUrl()}/verify-email?token=${verificationToken}`;

    const html = createEmailTemplate(
        'Welcome! Verify Your Email',
        'Thank you for registering! Please click the button below to verify your email address and activate your account. This link will expire in <strong>24 hours</strong>. If you didn\'t create an account, please ignore this email.',
        'Verify Email',
        verifyUrl
    );

    const text = `
Welcome! Verify Your Email

Thank you for registering! Please click this link to verify your email address:

${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.
    `.trim();

    return sendEmail(email, 'Verify Your Email - Barangay Management System', html, text);
};
