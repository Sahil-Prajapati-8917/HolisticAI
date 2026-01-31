import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'hr', 'recruiter'],
        default: 'recruiter',
    },
    refreshToken: {
        type: String,
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
