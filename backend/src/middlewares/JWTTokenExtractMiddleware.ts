import { Request, Response, NextFunction } from "express";

import AuthService from "../services/AuthService";

class JWTTokenExtractMiddleware {

    public static async run(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // read JWT token extract and validate it and save it in a variable insade request object
            if (req.cookies && req.cookies["access_token"]) {
                const jwtToken: string = req.cookies["access_token"];
                const decoded: string[] = await AuthService.validateToken(jwtToken);

                if (decoded) {
                    res.locals.APP_JWT_TOKEN = decoded;
                    res.locals.APP_RAW_JWT_TOKEN = jwtToken;
                }
            }

            next();
        } catch (err) {
            next(err);
        }
    }
}

export default JWTTokenExtractMiddleware;