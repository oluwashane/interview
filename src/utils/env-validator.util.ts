import { z } from 'zod'

const envSchema = z.object({
    PORT: z.string().default("3000").transform((value) => Number(value)),
    MONGODB_URI: z.string().url(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
})

export function validateEnvironment() {
    const parseResult = envSchema.safeParse(process.env)

    if (!parseResult.success) {
        console.error('Invalid environment variables:', parseResult.error.errors);
    process.exit(1);
    }
}