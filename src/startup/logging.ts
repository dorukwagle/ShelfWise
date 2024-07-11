import { Logger, createLogger, format, transports } from "winston";

const { combine, timestamp, json, metadata, errors } = format;

const logger: Logger = createLogger({
    format: combine(errors({ stack: true }), metadata(), timestamp(), json()),
    transports: [
        new transports.File({ filename: "logs/logfile.log" }),
        new transports.Console(),
    ],
    handleExceptions: true,
    handleRejections: true
});

export default logger;