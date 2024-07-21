import { Request, Response, NextFunction } from 'express';
import logger from "../startup/logging";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.name === "SyntaxError") return res.json({ error: "Invalid JSON data" });

    logger.error(err.message, {stack: err.stack});
    return res.status(500).json({
       error: "This is our fault. Something went wrong.!!!",
    });
}

export default errorHandler;