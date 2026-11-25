import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const UPLOAD_DIR =
    env.UPLOAD_DIR ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// One image in the "image" field: JPG, PNG or WebP up to 5 MB, saved under a random name.
export const uploadImage = multer({
    storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => cb(null, `${crypto.randomBytes(12).toString('hex')}${TYPES[file.mimetype]}`),
    }),
    limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
    fileFilter: (_req, file, cb) =>
        TYPES[file.mimetype] ? cb(null, true) : cb(ApiError.badRequest('Use a JPG, PNG or WebP image')),
}).single('image');

// multer errors (too large, etc.) as our JSON errors.
export const handleUpload = (req, res, next) =>
    uploadImage(req, res, (err) => {
        if (!err) return next();
        if (err instanceof multer.MulterError) {
            return next(ApiError.badRequest(err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller' : err.message));
        }
        next(err);
    });
