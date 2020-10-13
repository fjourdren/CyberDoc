import { Request, Response, NextFunction } from "express";

import AuthService from "../services/AuthService";

class JWTTokenExtractMiddleware {

    public static run(req: Request, res: Response, next: NextFunction): void {
        try {
            // read token from cookie
            if (req.cookies && req.cookies["access_token"]) {
                const jwtToken: string = req.cookies["access_token"];
                const decoded: string[] = AuthService.validateToken(jwtToken);

                if(decoded) {
                    res.locals.APP_JWT_TOKEN     = decoded;
                    res.locals.APP_RAW_JWT_TOKEN = jwtToken;
                }
            } else if(req.headers && req.headers.authorization) { // read JWT token extract and validate it and save it in a variable insade request object
                const authHeaderArray: string[] = (req.headers.authorization as string).split(" ");
                const jwtToken: string = authHeaderArray[1];

                const decoded: string[] = AuthService.validateToken(jwtToken);

                if(decoded) {
                    res.locals.APP_JWT_TOKEN     = decoded;
                    res.locals.APP_RAW_JWT_TOKEN = jwtToken;
                }
            }

            next();
        } catch(err) {
            next(err);
        }
    }
}

export default JWTTokenExtractMiddleware;