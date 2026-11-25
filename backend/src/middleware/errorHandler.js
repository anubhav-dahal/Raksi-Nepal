import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

// Every error response has the same shape:
// { "error": { "code": "NOT_FOUND", "message": "...", "details": [...] } }

export const notFound = (req, _res, next) => {
    next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
    let error = err;

    if (err instanceof mongoose.Error.CastError) {
        error = ApiError.badRequest(`Invalid ${err.path}`);
    } else if (err instanceof mongoose.Error.ValidationError) {
        const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
        error = ApiError.badRequest('Validation failed', details);
    } else if (err?.code === 11000) {
        error = ApiError.conflict('A record with this value already exists', err.keyValue);
    } else if (err?.type === 'entity.parse.failed') {
        error = ApiError.badRequest('Request body is not valid JSON');
    }

    if (!(error instanceof ApiError)) {
        console.error(err);
        error = new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong');
    }

    const body = { error: { code: error.code, message: error.message } };
    if (error.details) body.error.details = error.details;
    if (env.NODE_ENV === 'development' && error.status === 500) body.error.stack = err.stack;

    res.status(error.status).json(body);
};
