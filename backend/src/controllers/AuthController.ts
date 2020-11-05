import {NextFunction, Request, Response} from 'express';
import {requireNonNull} from '../helpers/DataValidation';

import HttpCodes from '../helpers/HttpCodes'

import AuthService from '../services/AuthService';
import HTTPError from '../helpers/HTTPError';
import TwoFactorAuthService from '../services/TwoFactorAuthService';

class AuthController {

    // register controller
    public static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {firstname, lastname, email, password, role} = req.body;

            const jwtToken = requireNonNull(await AuthService.signup(firstname, lastname, email, password, role));
            res.status(HttpCodes.CREATED);
            res.json({
                success: true,
                msg: "Successful registration",
                token: jwtToken
            });
        } catch (err) {
            next(err);
        }
    }


    // login controller
    public static async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email, password} = req.body;

            const jwttoken: string = requireNonNull(await AuthService.login(email, password));

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Authentication token generated",
                token: jwttoken
            });
        } catch (err) {
            next(err);
        }
    }

    // isPasswordValid ?
    public static async validatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {password} = req.body;
            await AuthService.isPasswordValid(res.locals.APP_JWT_TOKEN.user.email, password);
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Correct password"
            });
        } catch (err) {
            next(err);
        }
    }

    // forgotten password controller
    public static async forgottenPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email} = req.body;

            requireNonNull(email);

            // use try catch to not say to the user if an account exist with this email or not
            await AuthService.forgottenPassword(email);

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "An email to change your password has been sent"
            });
        } catch (err) {
            next(err);
        }
    }
}

export default AuthController;
