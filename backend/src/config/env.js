import { z } from 'zod';

// Validate environment once at startup so a missing variable fails fast
// instead of breaking a request later.
const schema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    // "memory" starts an in-memory MongoDB (dev only); otherwise a mongodb:// or mongodb+srv:// URI.
    MONGO_URI: z.string().min(1).default('memory'),
    CORS_ORIGIN: z.string().default('*'),
    SEED_ON_START: z
        .enum(['true', 'false'])
        .default('true')
        .transform((v) => v === 'true'),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    // Flat delivery fee in whole NPR (area-based fees are Phase 7).
    DELIVERY_FEE: z.coerce.number().int().min(0).default(100),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment configuration:');
    for (const issue of parsed.error.issues) {
        console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
}

if (parsed.data.NODE_ENV === 'production' && parsed.data.JWT_SECRET.startsWith('change-me')) {
    console.error('JWT_SECRET is still the example value. Set a long random secret.');
    process.exit(1);
}

export const env = parsed.data;
