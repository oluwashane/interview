import dotenv from 'dotenv';
import path from 'path';
import { TypeOf, z } from 'zod'
import Logger from './logger.config';

const logger = Logger.getChildLogger('EnvironmentCOnfig');

const environmentSchema = z.object({
    PORT: z.string().default("3000").transform((value) => Number(value)),
    MONGODB_URI: z.string(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly']).default('info'),
    API_PREFIX: z.string().default('/api/v1')

})

class EnvironmentConfig {
    private static instance: EnvironmentConfig;
    private config: z.infer<typeof environmentSchema>

    private constructor() {
        this.loadEnvirnomentVariables()
        this.config = this.validateConfig()

    }

    public static getInstance(): EnvironmentConfig {
        if (!EnvironmentConfig.instance) {
            EnvironmentConfig.instance = new EnvironmentConfig();
        }
        return EnvironmentConfig.instance
    }

    private loadEnvirnomentVariables() {
        const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
        const envPath = path.resolve(process.cwd(), envFile);

        dotenv.config({
            path: envPath
        })

        logger.info(`Loaded environment variables from ${envFile}`)
    }

    private validateConfig() {
        try {
            return environmentSchema.parse(process.env)
        } catch (error) {
            logger.error('Invalid enironment configuration', error);
            process.exit(1)
        }
    }

    public get(key: keyof z.infer<typeof environmentSchema>) {
        return this.config[key]
    }

    public isDevelopment(): boolean {
        return this.config.NODE_ENV === 'development'
    }

    public isProduction(): boolean {
        return this.config.NODE_ENV === 'production'
    }
}

export default EnvironmentConfig.getInstance()