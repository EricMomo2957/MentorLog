import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const sendOTPEmail = async (email: string, otpCode: string, fullName: string): Promise<boolean> => {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.SMTP_FROM || 'no-reply@mentorlog.com';

    // Always log OTP to server console for quick dev testing
    console.log(`\n==================================================`);
    console.log(`🔐 [MENTORLOG OTP VERIFICATION]`);
    console.log(`Recipient : ${fullName} (${email})`);
    console.log(`OTP Code  : >>> ${otpCode} <<<`);
    console.log(`Expires In: 10 Minutes`);
    console.log(`==================================================\n`);

    if (!smtpUser || !smtpPass) {
        console.log(`ℹ️ [Mailer] SMTP_USER or SMTP_PASS not defined in .env. Falling back to console OTP logging.`);
        return true;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const htmlContent = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 40px 20px; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                    <div style="display: inline-block; padding: 16px; background-color: rgba(16, 185, 129, 0.1); border-radius: 50%; margin-bottom: 20px;">
                        <span style="font-size: 32px;">🛡️</span>
                    </div>
                    <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin-bottom: 8px;">Verify Your Email</h2>
                    <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
                        Hello <strong style="color: #ffffff;">${fullName}</strong>,<br/>
                        Use the 6-digit verification code below to complete your MentorLog intern registration.
                    </p>
                    <div style="background-color: #020617; border: 2px border #10b981; border-radius: 14px; padding: 20px; margin-bottom: 24px; letter-spacing: 12px; font-size: 36px; font-weight: 900; color: #10b981;">
                        ${otpCode}
                    </div>
                    <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
                        This code will expire in <strong>10 minutes</strong>. If you did not request this code, please ignore this email.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
                    <p style="color: #475569; font-size: 11px;">
                        © ${new Date().getFullYear()} MentorLog Internship Management Platform. All rights reserved.
                    </p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"MentorLog Security" <${fromEmail}>`,
            to: email,
            subject: `${otpCode} is your MentorLog Email Verification Code`,
            html: htmlContent
        });

        console.log(`✅ [Mailer] Verification email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ [Mailer Error] Failed to send email via SMTP:`, error);
        return false;
    }
};
