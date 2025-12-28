import nodemailer from 'nodemailer';

// Configure email transporter
const createTransporter = () => {
    // Check if SMTP settings are configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Fallback: Log emails to console (for development)
    return null;
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const transporter = createTransporter();

    const emailContent = {
        from: process.env.SMTP_FROM || 'Barangay Management <noreply@barangay.gov.ph>',
        to: email,
        subject: 'Password Reset Request - Barangay Management System',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Barangay Management System</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                    <h2 style="color: #1f2937;">Password Reset Request</h2>
                    <p style="color: #4b5563; line-height: 1.6;">
                        You have requested to reset your password. Click the button below to create a new password:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: #22c55e; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        This link will expire in <strong>1 hour</strong>.
                    </p>
                    <p style="color: #6b7280; font-size: 14px;">
                        If you didn't request this, please ignore this email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        Barangay Management System © ${new Date().getFullYear()}
                    </p>
                </div>
            </div>
        `,
        text: `
            Password Reset Request
            
            You have requested to reset your password.
            
            Click this link to reset your password: ${resetUrl}
            
            This link will expire in 1 hour.
            
            If you didn't request this, please ignore this email.
        `,
    };

    if (transporter) {
        await transporter.sendMail(emailContent);
        console.log(`📧 Password reset email sent to ${email}`);
    } else {
        // Development fallback: log to console
        console.log('\n========================================');
        console.log('📧 PASSWORD RESET EMAIL (Development Mode)');
        console.log('========================================');
        console.log(`To: ${email}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log('========================================\n');
    }

    return true;
};

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const transporter = createTransporter();

    const emailContent = {
        from: process.env.SMTP_FROM || 'Barangay Management <noreply@barangay.gov.ph>',
        to: email,
        subject: 'Verify Your Email - Barangay Management System',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Barangay Management System</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                    <h2 style="color: #1f2937;">Welcome! Verify Your Email</h2>
                    <p style="color: #4b5563; line-height: 1.6;">
                        Thank you for registering! Please click the button below to verify your email address and activate your account:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}" 
                           style="background: #22c55e; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Verify Email
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        This link will expire in <strong>24 hours</strong>.
                    </p>
                    <p style="color: #6b7280; font-size: 14px;">
                        If you didn't create an account, please ignore this email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        Barangay Management System © ${new Date().getFullYear()}
                    </p>
                </div>
            </div>
        `,
        text: `
            Welcome! Verify Your Email
            
            Thank you for registering! Please click this link to verify your email address:
            
            ${verifyUrl}
            
            This link will expire in 24 hours.
            
            If you didn't create an account, please ignore this email.
        `,
    };

    if (transporter) {
        await transporter.sendMail(emailContent);
        console.log(`📧 Verification email sent to ${email}`);
    } else {
        // Development fallback: log to console
        console.log('\n========================================');
        console.log('📧 VERIFICATION EMAIL (Development Mode)');
        console.log('========================================');
        console.log(`To: ${email}`);
        console.log(`Verify URL: ${verifyUrl}`);
        console.log('========================================\n');
    }

    return true;
};
