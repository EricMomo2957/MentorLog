import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logAction } from '../utils/logger';
import { sendOTPEmail } from '../utils/mailer';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role, 
                full_name: user.full_name
            }, 
            JWT_SECRET, 
            { expiresIn: '7d' } 
        );

        await logAction(user.id, 'LOGIN', 'Authentication', `${user.full_name} (${user.role}) logged in`);

        res.status(200).json({ 
            success: true,
            token, 
            user: { 
                id: user.id, 
                role: user.role, 
                name: user.full_name,
                profile_pic: user.profile_pic || null
            } 
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Login failed' });
    }
};

export const sendRegistrationOTP = async (req: Request, res: Response) => {
    const { 
        full_name, 
        member_title,
        first_name,
        middle_name,
        last_name,
        id_number,
        email, 
        phone,
        date_of_birth,
        age,
        gender,
        civil_status,
        address,
        school_name,
        student_id,
        course,
        year_level,
        it_position,
        password, 
        role, 
        adminCode 
    } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        const [existingUser]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        if (role === 'admin') {
            if (!adminCode) {
                return res.status(400).json({ message: "Admin Reference Code is required." });
            }

            const [rows]: any = await pool.query(
                'SELECT * FROM admin_codes WHERE code = ? AND is_used = FALSE',
                [adminCode]
            );

            if (rows.length === 0) {
                return res.status(400).json({ message: "Invalid or already used Admin Code." });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let computedFullName = full_name;
        if (!computedFullName && (first_name || last_name)) {
            computedFullName = `${first_name || ''} ${middle_name ? middle_name + ' ' : ''}${last_name || ''}`.trim();
        }

        const payload = {
            member_title,
            first_name,
            middle_name,
            last_name,
            id_number,
            full_name: computedFullName || email,
            email,
            phone,
            date_of_birth,
            age,
            gender,
            civil_status,
            address,
            school_name,
            student_id: student_id || id_number,
            course,
            year_level,
            it_position,
            hashedPassword,
            role: role || 'student',
            adminCode: role === 'admin' ? adminCode : null
        };

        // Ensure email_verifications table exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS email_verifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp_code VARCHAR(10) NOT NULL,
                payload TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 10 minutes expiration
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const expiresAtFormatted = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

        // Delete any prior OTPs for this email
        await pool.query('DELETE FROM email_verifications WHERE email = ?', [email]);

        // Save new OTP
        await pool.query(
            'INSERT INTO email_verifications (email, otp_code, payload, expires_at) VALUES (?, ?, ?, ?)',
            [email, otpCode, JSON.stringify(payload), expiresAtFormatted]
        );

        // Send OTP email
        await sendOTPEmail(email, otpCode, computedFullName || email);

        res.status(200).json({ 
            success: true, 
            message: 'Verification code sent to your email. Please check your inbox or spam folder.' 
        });

    } catch (error) {
        console.error("Send OTP Error:", error);
        res.status(500).json({ message: 'Error sending verification code.' });
    }
};

export const verifyRegistrationOTP = async (req: Request, res: Response) => {
    const { email, otpCode } = req.body;

    try {
        if (!email || !otpCode) {
            return res.status(400).json({ message: 'Email and 6-digit code are required.' });
        }

        const [records]: any = await pool.query(
            'SELECT * FROM email_verifications WHERE email = ? ORDER BY id DESC LIMIT 1',
            [email]
        );

        if (records.length === 0) {
            return res.status(400).json({ message: 'No verification request found for this email.' });
        }

        const record = records[0];

        if (record.otp_code !== otpCode.trim()) {
            return res.status(400).json({ message: 'Incorrect 6-digit verification code. Please try again.' });
        }

        // Timezone-independent 10-minute expiration check (600,000 ms)
        const elapsedMs = Date.now() - new Date(record.created_at).getTime();
        if (elapsedMs > 10 * 60 * 1000) {
            return res.status(400).json({ message: 'Verification code has expired. Please click Resend Code.' });
        }

        const payload = JSON.parse(record.payload);

        // Perform user creation in database
        const [result]: any = await pool.query(
            `INSERT INTO users (
                member_title, first_name, middle_name, last_name, id_number,
                full_name, email, phone, date_of_birth, age, gender, civil_status,
                address, school_name, student_id, course, year_level, it_position, password, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                payload.member_title || null,
                payload.first_name || null,
                payload.middle_name || null,
                payload.last_name || null,
                payload.id_number || null,
                payload.full_name || payload.email,
                payload.email,
                payload.phone || null,
                payload.date_of_birth || null,
                payload.age || null,
                payload.gender || null,
                payload.civil_status || null,
                payload.address || null,
                payload.school_name || null,
                payload.student_id || null,
                payload.course || null,
                payload.year_level || null,
                payload.it_position || null,
                payload.hashedPassword,
                payload.role || 'student'
            ]
        );

        if (payload.role === 'admin' && payload.adminCode) {
            await pool.query(
                'UPDATE admin_codes SET is_used = TRUE WHERE code = ?', 
                [payload.adminCode]
            );
        }

        // Log audit trail
        await logAction(
            result.insertId || null, 
            'CREATE', 
            'Authentication', 
            `New account verified and registered: ${payload.full_name || payload.email} (${payload.role || 'student'})`
        );

        // Delete used verification record
        await pool.query('DELETE FROM email_verifications WHERE email = ?', [email]);

        res.status(201).json({ 
            success: true, 
            message: 'Email verified successfully! Your account is now active.' 
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: 'Error verifying code and creating account.' });
    }
};

export const resendRegistrationOTP = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        const [records]: any = await pool.query(
            'SELECT * FROM email_verifications WHERE email = ? ORDER BY id DESC LIMIT 1',
            [email]
        );

        if (records.length === 0) {
            return res.status(400).json({ message: 'No registration session found for this email.' });
        }

        const record = records[0];
        const payload = JSON.parse(record.payload);

        const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

        await pool.query(
            'UPDATE email_verifications SET otp_code = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newOtpCode, record.id]
        );

        await sendOTPEmail(email, newOtpCode, payload.full_name || email);

        res.status(200).json({ 
            success: true, 
            message: 'A new 6-digit code has been sent to your email.' 
        });

    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ message: 'Error resending verification code.' });
    }
};

export const register = async (req: Request, res: Response) => {
    const { 
        full_name, 
        member_title,
        first_name,
        middle_name,
        last_name,
        id_number,
        email, 
        phone,
        date_of_birth,
        age,
        gender,
        civil_status,
        address,
        school_name,
        student_id,
        course,
        year_level,
        it_position,
        password, 
        role, 
        adminCode 
    } = req.body;

    try {
        const [existingUser]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (role === 'admin') {
            if (!adminCode) {
                return res.status(400).json({ message: "Admin Reference Code is required." });
            }

            const [rows]: any = await pool.query(
                'SELECT * FROM admin_codes WHERE code = ? AND is_used = FALSE',
                [adminCode]
            );

            if (rows.length === 0) {
                return res.status(400).json({ message: "Invalid or already used Admin Code." });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let computedFullName = full_name;
        if (!computedFullName && (first_name || last_name)) {
            computedFullName = `${first_name || ''} ${middle_name ? middle_name + ' ' : ''}${last_name || ''}`.trim();
        }

        const finalStudentId = student_id || id_number || null;
        const finalIdNumber = id_number || student_id || null;

        const [result]: any = await pool.query(
            `INSERT INTO users (
                member_title, first_name, middle_name, last_name, id_number,
                full_name, email, phone, date_of_birth, age, gender, civil_status,
                address, school_name, student_id, course, year_level, it_position, password, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                member_title || null,
                first_name || null,
                middle_name || null,
                last_name || null,
                finalIdNumber,
                computedFullName || email,
                email,
                phone || null,
                date_of_birth || null,
                age || null,
                gender || null,
                civil_status || null,
                address || null,
                school_name || null,
                finalStudentId,
                course || null,
                year_level || null,
                it_position || null,
                hashedPassword,
                role || 'student'
            ]
        );

        if (role === 'admin' && adminCode) {
            await pool.query(
                'UPDATE admin_codes SET is_used = TRUE WHERE code = ?', 
                [adminCode]
            );
        }

        await logAction(result.insertId || null, 'CREATE', 'Authentication', `New account registered: ${computedFullName || email} (${role || 'student'})`);

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

export const sendPasswordResetOTP = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        const [users]: any = await pool.query('SELECT id, full_name FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'No registered user account found with this email.' });
        }

        const user = users[0];

        // Ensure email_verifications table exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS email_verifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp_code VARCHAR(10) NOT NULL,
                payload TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any prior OTPs for this email
        await pool.query('DELETE FROM email_verifications WHERE email = ?', [email]);

        // Insert new reset OTP
        await pool.query(
            'INSERT INTO email_verifications (email, otp_code, payload, expires_at) VALUES (?, ?, ?, NOW() + INTERVAL 10 MINUTE)',
            [email, otpCode, JSON.stringify({ reset: true, userId: user.id })]
        );

        // Send OTP email
        await sendOTPEmail(email, otpCode, user.full_name || email);

        res.status(200).json({ 
            success: true, 
            message: 'A 6-digit password reset code has been sent to your email.' 
        });

    } catch (error) {
        console.error("Send Reset OTP Error:", error);
        res.status(500).json({ message: 'Error sending password reset verification code.' });
    }
};

export const verifyPasswordResetOTP = async (req: Request, res: Response) => {
    const { email, otpCode } = req.body;

    try {
        if (!email || !otpCode) {
            return res.status(400).json({ message: 'Email and 6-digit code are required.' });
        }

        const [records]: any = await pool.query(
            'SELECT * FROM email_verifications WHERE email = ? ORDER BY id DESC LIMIT 1',
            [email]
        );

        if (records.length === 0) {
            return res.status(400).json({ message: 'No password reset request found for this email.' });
        }

        const record = records[0];

        if (record.otp_code !== otpCode.trim()) {
            return res.status(400).json({ message: 'Incorrect 6-digit code. Please check your email and try again.' });
        }

        const elapsedMs = Date.now() - new Date(record.created_at).getTime();
        if (elapsedMs > 10 * 60 * 1000) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Verification code confirmed. You may now set your new password.' 
        });

    } catch (error) {
        console.error("Verify Reset OTP Error:", error);
        res.status(500).json({ message: 'Error verifying reset code.' });
    }
};

export const resetPasswordWithOTP = async (req: Request, res: Response) => {
    const { email, otpCode, newPassword } = req.body;

    try {
        if (!email || !otpCode || !newPassword) {
            return res.status(400).json({ message: 'Email, verification code, and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        const [records]: any = await pool.query(
            'SELECT * FROM email_verifications WHERE email = ? ORDER BY id DESC LIMIT 1',
            [email]
        );

        if (records.length === 0) {
            return res.status(400).json({ message: 'No active password reset session found for this email.' });
        }

        const record = records[0];

        if (record.otp_code !== otpCode.trim()) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        const elapsedMs = Date.now() - new Date(record.created_at).getTime();
        if (elapsedMs > 10 * 60 * 1000) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new reset code.' });
        }

        const [users]: any = await pool.query('SELECT id, full_name FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

        // Delete used verification OTP
        await pool.query('DELETE FROM email_verifications WHERE email = ?', [email]);

        // Log audit action
        await logAction(
            user.id, 
            'UPDATE', 
            'Password Security', 
            `Password reset successfully via email OTP verification for ${user.full_name || email}`
        );

        res.status(200).json({ 
            success: true, 
            message: 'Your password has been updated successfully! You can now log in with your new password.' 
        });

    } catch (error) {
        console.error("Reset Password With OTP Error:", error);
        res.status(500).json({ message: 'Error resetting password.' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const [users]: any = await pool.query('SELECT id, full_name FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'No account found with this email.' });
        }

        const student = users[0];

        await pool.query(
            'INSERT INTO password_resets (full_name, email, status) VALUES (?, ?, ?)',
            [student.full_name, email, 'pending']
        );

        await logAction(student.id, 'CREATE', 'Password Security', `Filed password reset recovery ticket for ${email}`);

        res.status(200).json({ 
            success: true, 
            message: 'Request sent! An admin will review your account access shortly.' 
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
        full_name?: string;
    };
    file?: any;
}

export const getProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id || req.query.user_id;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const [rows]: any = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = rows[0];
        delete user.password;
        res.status(200).json({
            success: true,
            user,
            ...user
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id || req.body.user_id || req.body.id;
    const { 
        full_name, 
        member_title,
        first_name,
        middle_name,
        last_name,
        id_number,
        email, 
        phone, 
        date_of_birth,
        age,
        gender,
        civil_status,
        address,
        school_name,
        student_id, 
        course, 
        year_level, 
        it_position,
        current_password, 
        new_password 
    } = req.body;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        let profilePicUrl = undefined;
        if (req.file) {
            profilePicUrl = `/uploads/profiles/${req.file.filename}`;
        }

        if (new_password) {
            if (current_password) {
                const [rows]: any = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
                if (rows.length > 0) {
                    const isMatch = await bcrypt.compare(current_password, rows[0].password);
                    if (!isMatch) {
                        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
                    }
                }
            }
            const hashedPassword = await bcrypt.hash(new_password, 10);
            await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        }

        let computedFullName = full_name;
        if (!computedFullName && (first_name || last_name)) {
            computedFullName = `${first_name || ''} ${middle_name ? middle_name + ' ' : ''}${last_name || ''}`.trim();
        }

        await pool.query(
            `UPDATE users 
             SET full_name = COALESCE(?, full_name), 
                 member_title = COALESCE(?, member_title),
                 first_name = COALESCE(?, first_name),
                 middle_name = COALESCE(?, middle_name),
                 last_name = COALESCE(?, last_name),
                 id_number = COALESCE(?, id_number),
                 email = COALESCE(?, email), 
                 phone = COALESCE(?, phone), 
                 date_of_birth = COALESCE(?, date_of_birth),
                 age = COALESCE(?, age),
                 gender = COALESCE(?, gender),
                 civil_status = COALESCE(?, civil_status),
                 address = COALESCE(?, address),
                 school_name = COALESCE(?, school_name),
                 student_id = COALESCE(?, student_id), 
                 course = COALESCE(?, course), 
                 year_level = COALESCE(?, year_level),
                 it_position = COALESCE(?, it_position),
                 profile_pic = COALESCE(?, profile_pic)
             WHERE id = ?`,
            [
                computedFullName !== undefined ? computedFullName : null, 
                member_title !== undefined ? member_title : null,
                first_name !== undefined ? first_name : null,
                middle_name !== undefined ? middle_name : null,
                last_name !== undefined ? last_name : null,
                id_number !== undefined ? id_number : null,
                email !== undefined ? email : null, 
                phone !== undefined ? phone : null, 
                date_of_birth !== undefined ? date_of_birth : null,
                age !== undefined ? age : null,
                gender !== undefined ? gender : null,
                civil_status !== undefined ? civil_status : null,
                address !== undefined ? address : null,
                school_name !== undefined ? school_name : null,
                student_id !== undefined ? student_id : null, 
                course !== undefined ? course : null, 
                year_level !== undefined ? year_level : null, 
                it_position !== undefined ? it_position : null,
                profilePicUrl !== undefined ? profilePicUrl : null, 
                userId
            ]
        );

        await logAction(userId, 'UPDATE', 'User Profile', `Updated profile credentials`);

        res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully',
            profile_pic: profilePicUrl
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
};