import { Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { IUser, User, UserSchema } from '../models/User';
import AuthService from '../services/AuthService';

class AuthController {

    // register controller
    public static signup(req: Request, res: Response) {
        let { firstname, lastname, email, password } = req.body;

        AuthService.signup(firstname, lastname, email, password).then((user) => {
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Successful registration",
                user: user
            });
        }).catch((error) => {
            res.status(HttpCodes.BAD_REQUEST);
            res.json({
                success: false,
                msg: error
            });
        });        
    }


    // login controller
    public static signIn(req: Request, res: Response) {
        let { email, password } = req.body;

        AuthService.login(email, password).then((jwttoken) => {
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Authentication token generated",
                token: jwttoken
            });
        }).catch((error) => {
            res.status(HttpCodes.BAD_REQUEST);
            res.json({
                success: false,
                msg: error
            });
        });
    }


    // forgotten password controller
    public static forgottenPassword(req: Request, res: Response) {
        
    }


    // refresh token controller
    public static renewToken(req: Request, res: Response) {
        
    }
}

export default AuthController;