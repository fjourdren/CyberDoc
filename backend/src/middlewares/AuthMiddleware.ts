import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from "express";

import HttpCodes from '../helpers/HttpCodes';

class AuthMiddleware {

    private static requestIsConnected(req: Request): boolean {
        // read JWT token if it has been sent and validate it
        if(req.headers.authorization) {
            let authHeaderArray: string[] = (req.headers.authorization as string).split(" ");
            let jwtToken: string = authHeaderArray[1];

            try {
                var decoded = jwt.verify(jwtToken, process.env.JWT_SECRET as string);
                if(decoded != undefined) {
                    return true;
                }
            } catch(err) {
                return false;
            }
        }

        return false;
    }

    public static isAuthenticate(req: Request, res: Response, next: NextFunction): any {
        // if user is disconnected, we send an error
        if(AuthMiddleware.requestIsConnected(req)) {
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
        if(!AuthMiddleware.requestIsConnected(req)) {
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