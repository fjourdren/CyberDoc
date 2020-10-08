import { Request, Response, NextFunction } from "express";

import HttpCodes from '../helpers/HttpCodes';
import HTTPError from "../helpers/HTTPError";
import TwoFactorAuthService from "../services/TwoFactorAuthService";

class TwoFactorAuthMiddleware {
    public static isTwoFactorActivated(req: Request, res: Response, next: NextFunction): void {
        try {
            next();
            // if authy_id doesn't exist => throw an error
            // if(TwoFactorAuthService.idExists(req.authy_id) ) {
            //     // otherwise we continue the route execution
            //     next();
            // } else {
            //     throw new HTTPError(HttpCodes.UNAUTHORIZED, "Action only accesible to 2FA registered users");
            // }
        } catch(err) {
            next(err);
        }
    }

    public static isntTwoFactorActivated(req: Request, res: Response, next: NextFunction): void {
        try {
            next();
            // if authy_id does exist => throw an error
            // if(!TwoFactorAuthService.idExists(req.authy_id) ) {
            //     // otherwise we continue the route execution
            //     next();
            // } else {
            //     throw new HTTPError(HttpCodes.UNAUTHORIZED, "Action only accesible to 2FA unregistered users");
            // }
        } catch(err) {
            next(err);
        }
    }
}

export default TwoFactorAuthMiddleware;