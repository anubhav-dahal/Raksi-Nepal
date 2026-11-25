import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { PHONE_PATTERN } from '../utils/phone.js';

export const ROLES = ['customer', 'admin', 'rider'];

export { PHONE_PATTERN };

const addressSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        phone: { type: String, required: true, match: PHONE_PATTERN },
        address: { type: String, required: true, trim: true, maxlength: 200 },
        landmark: { type: String, trim: true, maxlength: 120, default: '' },
        note: { type: String, trim: true, maxlength: 200, default: '' },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        phone: { type: String, required: true, unique: true, match: PHONE_PATTERN },
        email: { type: String, trim: true, lowercase: true, maxlength: 120 },
        // Never returned by queries unless asked for with .select('+passwordHash').
        passwordHash: { type: String, required: true, select: false },
        role: { type: String, enum: ROLES, default: 'customer' },
        // Pre-fills the checkout form next time.
        lastAddress: { type: addressSchema, default: null },
        // Expo push tokens of the user's devices (status-change notifications).
        pushTokens: { type: [String], default: [], select: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });

userSchema.methods.checkPassword = function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 10);

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.passwordHash;
        return ret;
    },
});

export const User = mongoose.model('User', userSchema);
export { addressSchema };
