import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateTokens = (id: string, role: string) => {
    const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET || 'default_secret_key', {
        expiresIn: '15m',
    });

    // Refresh token with longer expiry
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            passwordHash,
            role: role || 'recruiter',
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check for static credentials first
        const staticEmail = process.env.STATIC_EMAIL;
        const staticPassword = process.env.STATIC_PASSWORD;
        const staticName = process.env.STATIC_NAME;
        const staticRole = process.env.STATIC_ROLE;

        if (email === staticEmail && password === staticPassword) {
            // Static password authentication successful
            const { accessToken, refreshToken } = generateTokens('static-user', staticRole || 'admin');

            // Send refresh token in HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return res.json({
                _id: 'static-user',
                name: staticName || 'System Administrator',
                email: staticEmail,
                role: staticRole || 'admin',
                accessToken,
            });
        }

        // Fall back to database authentication
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

            // Save refresh token to database
            user.refreshToken = refreshToken;
            await user.save();

            // Send refresh token in HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            const user = await User.findOne({ refreshToken });
            if (user) {
                user.refreshToken = undefined;
                await user.save();
            }
        }
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Not authorized, no refresh token' });
    }

    try {
        const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret');
        
        // Check if this is a static user
        if (decoded.id === 'static-user') {
            // Generate new tokens for static user
            const { accessToken, refreshToken: newRefreshToken } = generateTokens('static-user', process.env.STATIC_ROLE || 'admin');

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.json({ accessToken });
        }

        // Handle database users
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Not authorized, invalid refresh token' });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.role);

        // Update refresh token in DB
        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken });
    } catch (error) {
        console.error('Refresh Error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
