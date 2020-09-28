import { Request, Response, NextFunction } from "express";

class ErrorCatcherMiddleware {

    // catch all errors, log and reply to the client
    public static async run(req: Request, res: Response, next: NextFunction) {
        // TODO
        
        next();
    }
}

export default ErrorCatcherMiddleware;