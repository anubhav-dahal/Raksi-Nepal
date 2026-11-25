import { ApiError } from '../utils/ApiError.js';

// Validates req.params / req.query / req.body against zod schemas.
// Parsed (coerced) values are stored on req.valid, because Express 5
// makes req.query read-only.
export const validate = (schemas) => (req, _res, next) => {
    req.valid = {};

    for (const part of ['params', 'query', 'body']) {
        if (!schemas[part]) continue;

        const result = schemas[part].safeParse(req[part] ?? {});
        if (!result.success) {
            const details = result.error.issues.map((issue) => ({
                field: [part, ...issue.path].join('.'),
                message: issue.message,
            }));
            throw ApiError.badRequest('Validation failed', details);
        }
        req.valid[part] = result.data;
    }

    next();
};
