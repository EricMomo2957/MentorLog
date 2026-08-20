import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logAction } from '../utils/logger';

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

export const register = async (req: Request, res: Response) => {
    const { full_name, email, password, role, adminCode } = req.body;

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

        const [result]: any = await pool.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, role || 'student']
        );

        if (role === 'admin' && adminCode) {
            await pool.query(
                'UPDATE admin_codes SET is_used = TRUE WHERE code = ?', 
                [adminCode]
            );
        }

        await logAction(result.insertId || null, 'CREATE', 'Authentication', `New account registered: ${full_name} (${role || 'student'})`);

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Error registering user' });
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
            'SELECT id, full_name, email, role, phone, student_id, course, year_level, profile_pic, ojt_hours_required, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = rows[0];
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
    const { full_name, email, phone, student_id, course, year_level, current_password, new_password } = req.body;

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

        await pool.query(
            `UPDATE users 
             SET full_name = COALESCE(?, full_name), 
                 email = COALESCE(?, email), 
                 phone = COALESCE(?, phone), 
                 student_id = COALESCE(?, student_id), 
                 course = COALESCE(?, course), 
                 year_level = COALESCE(?, year_level),
                 profile_pic = COALESCE(?, profile_pic)
             WHERE id = ?`,
            [
                full_name !== undefined ? full_name : null, 
                email !== undefined ? email : null, 
                phone !== undefined ? phone : null, 
                student_id !== undefined ? student_id : null, 
                course !== undefined ? course : null, 
                year_level !== undefined ? year_level : null, 
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