import winston from 'winston';
import path from 'path';
import fs from 'fs';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = path.join(process.cwd(), 'logs');
fs.mkdirSync(logDir, { recursive: true });

class Logger {
    private static instance: winston.Logger;

    private constructor() { }
    
    public static getInstance(): winston.Logger {
        if (!Logger.instance) {
            const logFormat = winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                winston.format.json()
            )

            const consoleTransport = new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
                        let msg = `${timestamp} [${level}]: ${message} `;
                        const metaStr = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
                        return msg + metaStr ;
                    })
                )
            })

            const errorTransport = new DailyRotateFile({
                filename: path.join(logDir, 'error-%DATE%.log'),
                datePattern: 'YYY-MM-DD',
                level: 'error',
                format: logFormat,
                maxSize: '20m',
                maxFiles: '14d'
            })

            const combinedTransport = new DailyRotateFile({
                filename: path.join(logDir, 'combined-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                format: logFormat,
                maxSize: '20m',
                maxFiles: '14d'
            })

            //Logger starts here
            Logger.instance = winston.createLogger({
                level: process.env.LOG_LEVEL || 'info',
                format: logFormat,
                transports: [
                    consoleTransport,
                    errorTransport,
                    combinedTransport
                ],
                exceptionHandlers: [
                    new winston.transports.File({
                        filename: path.join(logDir, 'exceptions.log')
                    })
                ],
                rejectionHandlers: [
                    new winston.transports.File({
                        filename: path.join(logDir, 'rejections.log')
                    })
                ]
            })
        }

        return Logger.instance
    }

    public static getChildLogger(context: string): winston.Logger {
        return this.getInstance().child({ context })
    }
}

export default Logger