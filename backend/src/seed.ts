import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import connectDB from './config/db';

dotenv.config();

const seedAdmin = async () => {
    await connectDB();

    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin';

    const userExists = await User.findOne({ email: adminEmail });

    if (userExists) {
        console.log('Admin user already exists');
        process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await User.create({
        name: 'Admin User',
        email: adminEmail,
        passwordHash,
        role: 'admin',
    });

    console.log('Admin user created');
    process.exit();
};

seedAdmin();
