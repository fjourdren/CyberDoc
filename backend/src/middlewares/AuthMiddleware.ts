import { Request, Response, NextFunction } from "express";

class AuthMiddleware {

    public static test(req: Request, res: Response, next: NextFunction): any {
        console.log("test");
        next();
    }

}

export default AuthMiddleware;