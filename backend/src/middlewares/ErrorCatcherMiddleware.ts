import { Request, Response, NextFunction } from "express";

import { logger } from "../helpers/Log";
import HttpCodes from "../helpers/HttpCodes";
import HTTPError from "../helpers/HTTPError";

class ErrorCatcherMiddleware {

    // log errors
    public static async logErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): Promise<void> {
        logger.error(err.stack);
        next(err);
    }

    // catch all errors and reply to the client
    public static async clientErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): Promise<void> {
        let httpcode: number    = HttpCodes.INTERNAL_ERROR
        let httpmessage = "An error occured"
    
        const errHttp: HTTPError = err as HTTPError;
        if(errHttp.statusCode) {
            httpcode    = errHttp.statusCode;
        }
        if(errHttp.message) {
            httpmessage = errHttp.message;
        }

        // reply error
        res.status(httpcode);
        res.json({
            success: false,
            msg: httpmessage
        });

        next();
    }

}

export default ErrorCatcherMiddleware;