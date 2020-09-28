import { Request, Response, NextFunction } from "express";

import HttpCodes from '../helpers/HttpCodes';

class AuthMiddleware {

    public static isAuthenticate(req: Request, res: Response, next: NextFunction): any {
        // if user is disconnected, we send an error
        if(res.locals.APP_JWT_TOKEN != undefined) {
            // otherwise we continue the route execution
            next();
        } else {
            res.status(HttpCodes.UNAUTHORIZED);
            res.json({
                success: false,
                msg: "Action only accesible to unauth users"
            });
        }
    }


    public static isntAuthenticate(req: Request, res: Response, next: NextFunction): any {
        // if user is connected, we send an error
        if(res.locals.APP_JWT_TOKEN == undefined) {
            // otherwise we continue the route execution
            next();
        } else {
            res.status(HttpCodes.UNAUTHORIZED);
            res.json({
                success: false,
                msg: "Action only accesible to unauth users"
            });
        }
    }
}

export default AuthMiddleware;