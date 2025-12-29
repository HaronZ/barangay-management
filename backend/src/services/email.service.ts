import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialize Resend client if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email configuration
const getFromEmail = () => {
    // Resend requires a verified domain or uses their default
    if (resend) {
        // Use Resend's default sending domain if no custom domain is set
        return process.env.EMAIL_FROM || 'Barangay Management <onboarding@resend.dev>';
    }
    return process.env.SMTP_FROM || 'Barangay Management <noreply@barangay.gov.ph>';
};

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

// Log email provider on startup
if (resend) {
    console.log('📧 Email Provider: Resend');
    console.log(`   From: ${getFromEmail()}`);
} else if (process.env.SMTP_HOST) {
    console.log('📧 Email Provider: SMTP');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
} else {
    console.log('⚠️ No email provider configured - emails will be logged to console');
}

// Create SMTP transporter (fallback if Resend not available)
const createSMTPTransporter = () => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS?.replace(/\s/g, '');

    if (smtpHost && smtpUser && smtpPass) {
        return nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });
    }
    return null;
};

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

// Send email using Resend or SMTP
const sendEmail = async (to: string, subject: string, html: string, text: string) => {
    const from = getFromEmail();

    // Try Resend first
    if (resend) {
        try {
            console.log(`📧 Sending email via Resend to ${to}...`);
            const { data, error } = await resend.emails.send({
                from,
                to,
                subject,
                html,
                text,
            });

            if (error) {
                console.error('❌ Resend error:', error);
                throw new Error(error.message);
            }

            console.log(`✅ Email sent via Resend to ${to}`);
            console.log(`   ID: ${data?.id}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send email via Resend:', error);
            throw error;
        }
    }

    // Fallback to SMTP
    const transporter = createSMTPTransporter();
    if (transporter) {
        try {
            console.log(`📧 Sending email via SMTP to ${to}...`);
            const info = await transporter.sendMail({ from, to, subject, html, text });
            console.log(`✅ Email sent via SMTP to ${to}`);
            console.log(`   Message ID: ${info.messageId}`);
            return true;
        } catch (error: unknown) {
            const err = error as Error & { code?: string };
            console.error('❌ SMTP error:', err.message);
            throw error;
        }
    }

    // Development fallback: log to console
    console.log('\n========================================');
    console.log('📧 EMAIL (Development Mode)');
    console.log('========================================');
    console.log(`To: ${to}`);
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
