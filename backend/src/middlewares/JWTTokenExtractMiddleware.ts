import { Request, Response, NextFunction } from "express";

import AuthService from "../services/AuthService";

class JWTTokenExtractMiddleware {

    public static run(req: Request, res: Response, next: NextFunction): any {
        // read JWT token extract and validate it and save it in a variable insade request object
        if(req.headers && req.headers.authorization) {
            let authHeaderArray: string[] = (req.headers.authorization as string).split(" ");
            let jwtToken: string = authHeaderArray[1];

            AuthService.validateToken(jwtToken).then((decoded) => {
                res.locals.APP_JWT_TOKEN     = decoded;
                res.locals.APP_RAW_JWT_TOKEN = jwtToken;
                next(); // next for valid token
            }).catch((err) => {
                next(); // next for unvalid token
            });
        } else {
            next(); // next for non authenticated
        }
    }

}

export default JWTTokenExtractMiddleware;