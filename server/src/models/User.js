import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    // --- From Registration Form ---
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    gender: { 
        type: String, 
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        required: true 
    },
    dob: { type: Date, required: true },

    // --- System Assigned ---
    role: {
        type: String,
        enum: ['buyer', 'seller', 'admin'],
        default: 'buyer',
    },
    emailVerified: { type: Boolean, default: false },
    
    // --- Financial Fields ---
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    totalCommissionEarned: {
        type: Number,
        default: 0,
        min: 0
    },

}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

// Middleware: Hash password before saving the user document
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method: Compare entered password with the hashed password in the DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
