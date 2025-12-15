import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize, errors } = format;

const upperCaseLevel = format((info) => {
    info.level = info.level.toUpperCase();
    return info;
});

const logFormat = printf(({ timestamp, level, message, stack }) => {
    return stack 
        ? `${timestamp} [${level}]: ${message}\nStack: ${stack}`
        : `${timestamp} [${level}]: ${message}` ;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        upperCaseLevel(),
        colorize({ level: true }),
        logFormat,
    ),
    transports: [
        new transports.Console(),
    ]
})

export default logger;