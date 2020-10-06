import { Request, Response, NextFunction } from "express";

import { Role } from '../models/User';
import HttpCodes from "../helpers/HttpCodes";
import UserService from "../services/UserService";

class UserMiddleware {

    public static hasRoles(rolesNeeded: Role[]) {
        return function(req: Request, res: Response, next: NextFunction): void {
            try {
                if(UserService.hasRoles(rolesNeeded, res.locals.APP_JWT_TOKEN.user.role)) {
                    next();
                } else {
                    res.status(HttpCodes.UNAUTHORIZED);
                    res.json({
                        success: false,
                        msg: "Your role isn't allowed"
                    });
                }
            } catch(err) {
                next(err);
            }
        }
    }
}

export default UserMiddleware;