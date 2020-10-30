import { Request, Response, NextFunction } from "express";

import HttpCodes from '../helpers/HttpCodes';
import HTTPError from "../helpers/HTTPError";

class AuthMiddleware {

    public static isAuthenticate(req: Request, res: Response, next: NextFunction): void {
        try {
            // if user is disconnected, we send an error
            if(res.locals.APP_JWT_TOKEN != undefined && res.locals.APP_JWT_TOKEN.user != undefined) {
                // otherwise we continue the route execution
                next();
            } else {
                throw new HTTPError(HttpCodes.UNAUTHORIZED, "Action only accesible to auth users");
            }
        } catch(err) {
            next(err);
        }
    }


    public static isntAuthenticate(req: Request, res: Response, next: NextFunction): void {
        try {
            // if user is connected, we send an error
            if(res.locals.APP_JWT_TOKEN == undefined || res.locals.APP_JWT_TOKEN.user == undefined) {
                // otherwise we continue the route execution
                next();
            } else {
                throw new HTTPError(HttpCodes.UNAUTHORIZED, "Action only accesible to unauth users");
            }
        } catch(err) {
            next(err);
        }
    }


    // custom middleware only for forgottenPassword or twoFactor, allow user to use POST /profile to change data about him only with a forgottenPassword token
    public static isAuthenticateOrEditToken(req: Request, res: Response, next: NextFunction): void {
        try {
            // if user is disconnected, we send an error
            if(res.locals.APP_JWT_TOKEN != undefined && (res.locals.APP_JWT_TOKEN.user != undefined || res.locals.APP_JWT_TOKEN.email != undefined)) {
                // otherwise we continue the route execution
                next();
            } else {
                throw new HTTPError(HttpCodes.UNAUTHORIZED, "Action only accesible to auth users");
            }
        } catch(err) {
            next(err);
        }
    }
}

export default AuthMiddleware;