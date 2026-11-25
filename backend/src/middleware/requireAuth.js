import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/UserModel.js';
import { ApiError } from '../utils/ApiError.js';

export const signToken = (user) =>
    jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

// Requires "Authorization: Bearer <token>". Sets req.user (the User document).
export const requireAuth = async (req, _res, next) => {
    const header = req.get('authorization') ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized();

    let payload;
    try {
        payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
        throw ApiError.unauthorized('Session expired, please log in again');
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized('Session expired, please log in again');

    req.user = user;
    next();
};

// Use after requireAuth: requireRole('admin') or requireRole('admin', 'rider').
export const requireRole =
    (...roles) =>
    (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) throw ApiError.forbidden();
        next();
    };
