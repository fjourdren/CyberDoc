import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from "express";

import HttpCodes from '../helpers/HttpCodes';

class DocumentMiddleware {

    public static todo(req: Request, res: Response, next: NextFunction): any {
        next();
    }

}

export default DocumentMiddleware;