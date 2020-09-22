import { Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import UserService from '../services/UserService';

class UserController {
    public static profile(req: Request, res: Response) {

        UserService.profile(res.locals.APP_JWT_TOKEN.user._id).then((user) => {
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Success",
                user: user
            });
        }).catch((err) => {
            res.status(HttpCodes.BAD_REQUEST);
            res.json({
                success: false,
                msg: "Your user profile isn't valid"
            });
        });
    }

    /*public static settings(req: Request, res: Response) {
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
    }*/
}

export default UserController;