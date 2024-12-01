import dotenv from 'dotenv';
import path from 'path';

class EnvironmentConfig {
    private static instance: EnvironmentConfig;

    private constructor() {
        this.loadEnvirnomentVariables()
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
    }

    public get(key: string, defaultValue?: string): string {
        const value = process.env[key] || defaultValue;

        if (value === undefined) {
            throw new Error(`Environment variable ${key} is not set`)
        }

        return value
    }


    public getNumber(key: string, defaultValue?: number): number {
        const value = this.get(key);
        const parsedValue = Number(value);

        if (isNaN(parsedValue)) {
            if (defaultValue !== undefined) return defaultValue;
            throw new Error(`Environment variable ${key} is not a number`)
        }

        return parsedValue
    }

    public getBoolean(key: string, defaultValue = false): boolean {
        const value = this.get(key);
        return value.toLowerCase() === 'true' || value === '1' || (defaultValue && !value);
    }
}

export default EnvironmentConfig.getInstance()