import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // 1. Database user lookup
        const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];

        // 2. Password comparison
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. UPDATED TOKEN LOGIC
        // We now include full_name in the payload so the Protect Middleware can read it
        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role, 
                full_name: user.full_name // Added for request identity
            }, 
            JWT_SECRET, 
            { expiresIn: '7d' } 
        );

        // 4. Send unified response to frontend
        res.status(200).json({ 
            success: true,
            token, 
            user: { 
                id: user.id, 
                role: user.role, 
                name: user.full_name 
            } 
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Login failed' });
    }
};

// =================== Registration controller =======================

export const register = async (req: Request, res: Response) => {
    // 1. Extract adminCode from req.body alongside other details
    const { full_name, email, password, role, adminCode } = req.body;

    try {
        // 2. Check if the user already exists
        const [existingUser]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. ADMIN CODE VALIDATION BLOCK
        if (role === 'admin') {
            if (!adminCode) {
                return res.status(400).json({ message: "Admin Reference Code is required." });
            }

            // Check if code exists and hasn't been used
            const [rows]: any = await pool.query(
                'SELECT * FROM admin_codes WHERE code = ? AND is_used = FALSE',
                [adminCode]
            );

            if (rows.length === 0) {
                return res.status(400).json({ message: "Invalid or already used Admin Code." });
            }
        }

        // 4. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Insert into database
        await pool.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, role || 'student']
        );

        // 6. CONSUME THE CODE (Mark as used)
        // Only run this if the registration was successful and the user is an admin
        if (role === 'admin' && adminCode) {
            await pool.query(
                'UPDATE admin_codes SET is_used = TRUE WHERE code = ?', 
                [adminCode]
            );
        }

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        // 1. Check if the student exists
        const [users]: any = await pool.query('SELECT full_name FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'No account found with this email.' });
        }

        const studentName = users[0].full_name;

        // 2. SAVE the request to the new database table for the Admin
        await pool.query(
            'INSERT INTO password_resets (full_name, email, status) VALUES (?, ?, ?)',
            [studentName, email, 'pending']
        );

        res.status(200).json({ 
            success: true, 
            message: 'Request sent! An admin will review your account access shortly.' 
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};