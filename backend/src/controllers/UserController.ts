import { Request, Response } from 'express';

import jwt from 'jsonwebtoken'

import HttpCodes from '../helpers/HttpCodes'
import IUser, { User } from '../models/User';

class UserController {
    public static profile(req: Request, res: Response) {
        let authHeaderArray: any = (req.headers.authorization as string).split(" ");
        let jwtToken: string = authHeaderArray[1];

        let decodedUser: any = jwt.verify(jwtToken, process.env.JWT_SECRET) as any;

        User.findOne({_id: decodedUser._id}).exec(function(err, user) {
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: user
            });
        });
    }

    public static settings(req: Request, res: Response) {
        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "",
            user: "test"
        });
    }

    public static delete(req: Request, res: Response) {
        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "",
            user: "test"
        });
    }
}

export default UserController;