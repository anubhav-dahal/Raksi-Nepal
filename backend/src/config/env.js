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
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment configuration:');
    for (const issue of parsed.error.issues) {
        console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
}

export const env = parsed.data;
