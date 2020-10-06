import { NextFunction, Request, Response } from 'express';
import { requireNonNull } from '../helpers/DataValidation';

import HttpCodes from '../helpers/HttpCodes'

import AuthService from '../services/AuthService';

import IUser, { Role } from '../models/User';

class AuthController {

    // register controller
    public static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { firstname, lastname, email, password, role } = req.body;

            const user: IUser = requireNonNull(await AuthService.signup(firstname, lastname, email, password, role));
            res.status(HttpCodes.CREATED);
            res.json({
                success: true,
                msg: "Successful registration",
                user: user
            });
        } catch(err) {
            next(err);
        }
    }


    // login controller
    public static async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;

            const jwttoken: string = requireNonNull(await AuthService.login(email, password));
            
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Authentication token generated",
                token: jwttoken
            });
        } catch(err) {
            next(err);
        }
    }


    // forgotten password controller
    /*public static forgottenPassword(req: Request, res: Response) {
        // TODO
    }*/
}

export default AuthController;