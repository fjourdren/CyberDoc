import { Request, Response, NextFunction } from "express";

import AuthService from "../services/AuthService";

class JWTTokenExtractMiddleware {

    public static async run(req: Request, res: Response, next: NextFunction): Promise<void> {
        // read JWT token extract and validate it and save it in a variable insade request object
        if(req.headers && req.headers.authorization) {
            const authHeaderArray: string[] = (req.headers.authorization as string).split(" ");
            const jwtToken: string = authHeaderArray[1];

            const decoded: string[] = await AuthService.validateToken(jwtToken);

            if(decoded) {
                res.locals.APP_JWT_TOKEN     = decoded;
                res.locals.APP_RAW_JWT_TOKEN = jwtToken;
            }
        }
        
        next(); // next for non authenticated
    }
}

export default JWTTokenExtractMiddleware;