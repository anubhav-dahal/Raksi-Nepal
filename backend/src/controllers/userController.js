import { z } from 'zod';
import { signToken } from '../middleware/requireAuth.js';
import { PHONE_PATTERN, User } from '../models/UserModel.js';
import { ApiError } from '../utils/ApiError.js';

const phone = z.string().trim().regex(PHONE_PATTERN, 'must be a 10-digit mobile number starting with 97 or 98');
const password = z.string().min(8, 'must be at least 8 characters').max(72);

export const registerSchema = {
    body: z.object({
        name: z.string().trim().min(2).max(80),
        phone,
        email: z.email().optional().or(z.literal('').transform(() => undefined)),
        password,
    }),
};

export const loginSchema = {
    body: z.object({ phone, password: z.string().min(1).max(72) }),
};

const authResponse = (user) => ({ data: { token: signToken(user), user } });

// POST /api/users/register
export const register = async (req, res) => {
    const { name, phone, email, password } = req.valid.body;

    if (await User.exists({ phone })) {
        throw ApiError.conflict('An account with this phone number already exists');
    }

    const user = await User.create({ name, phone, email, passwordHash: await User.hashPassword(password) });
    res.status(201).json(authResponse(user));
};

// POST /api/users/login
// Same message for unknown phone and wrong password, so it doesn't reveal which accounts exist.
export const login = async (req, res) => {
    const { phone, password } = req.valid.body;
    const user = await User.findOne({ phone }).select('+passwordHash');

    if (!user || !user.isActive || !(await user.checkPassword(password))) {
        throw ApiError.unauthorized('Incorrect phone number or password');
    }

    res.json(authResponse(user));
};

// GET /api/users/me
export const me = (req, res) => {
    res.json({ data: req.user });
};

export const pushTokenSchema = {
    body: z.object({ token: z.string().regex(/^Expo(nent)?PushToken\[[^\]]+\]$/, 'not an Expo push token') }),
};

// POST /api/users/me/push-token   (keeps the last 5 devices)
export const savePushToken = async (req, res) => {
    await User.updateOne({ _id: req.user._id }, { $pull: { pushTokens: req.valid.body.token } });
    await User.updateOne(
        { _id: req.user._id },
        { $push: { pushTokens: { $each: [req.valid.body.token], $slice: -5 } } }
    );
    res.status(204).end();
};

// DELETE /api/users/me/push-token   (on logout)
export const removePushToken = async (req, res) => {
    await User.updateOne({ _id: req.user._id }, { $pull: { pushTokens: req.valid.body.token } });
    res.status(204).end();
};
