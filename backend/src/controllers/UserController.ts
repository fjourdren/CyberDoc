import { Request, Response } from 'express';
import { userInfo } from 'os';

import HttpCodes from '../helpers/HttpCodes'
import { logger } from '../helpers/Log';
import IUser from '../models/User';
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
            logger.error(err);

            res.status(HttpCodes.INTERNAL_ERROR);
            res.json({
                success: false,
                msg: "Your user profile isn't valid"
            });
        });
    }

    public static settings(req: Request, res: Response) {
        const user_id = res.locals.APP_JWT_TOKEN.user._id;

        const { firstname, lastname, email, password } = req.body;

        UserService.updateProfile(user_id, firstname, lastname, email, password).then((output) => {
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Profile updated",
                user: output.user,
                token: output.newToken
            });
        }).catch((err) => {
            logger.error(err);

            res.status(HttpCodes.INTERNAL_ERROR);
            res.json({
                success: false,
                msg: "Profile can't be updated",
            });
        });
    }

    public static delete(req: Request, res: Response) {
        UserService.delete(res.locals.APP_JWT_TOKEN.user._id).then(() => {
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "User deleted",
            });
        }).catch((err) => {
            logger.error(err);

            res.status(HttpCodes.INTERNAL_ERROR);
            res.json({
                success: false,
                msg: "User can't be deleted",
            });
        });
        
    }
}

export default UserController;