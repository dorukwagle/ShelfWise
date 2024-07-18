import { Request, Response, NextFunction } from 'express';
import logger from "../startup/logging";

const routesLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(req.route);
    next();
}

export default routesLogger;