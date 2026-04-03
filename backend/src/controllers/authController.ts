import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // --- UPDATED TOKEN LOGIC (7 DAY EXPIRATION) ---
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            (process.env.JWT_SECRET as string) || 'secretkey', 
            { expiresIn: '7d' } 
        );

        // Send response to frontend
        res.status(200).json({ 
            token, 
            id: user.id, 
            role: user.role, 
            full_name: user.full_name 
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// =================== Registration controller =======================

export const register = async (req: Request, res: Response) => {
    const { full_name, email, password, role } = req.body;

    try {
        // 1. Check if the user already exists
        const [existingUser]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash the password (using 10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert into database
        await pool.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, role || 'student']
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Error registering user' });
    }
};