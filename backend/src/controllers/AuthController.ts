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

    // isPasswordAndTwoFactorValid ?
    public static async isPasswordAndTwoFactorValid(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // get the token from header
            const tokenBase64 = req.header('x-auth-token'); // password:appOrSms:token2FA
            if (!tokenBase64) {
                throw new HTTPError(HttpCodes.UNAUTHORIZED, 'No X-Auth-Token : authorization denied');
            }
            const decryptedToken = new Buffer(tokenBase64, 'base64').toString('ascii').split(':');
            if(decryptedToken.length != 3) {
                throw new HTTPError(HttpCodes.BAD_REQUEST, 'Bad x-auth-token');
            }
            if(decryptedToken[2].length != 6) {
                throw new HTTPError(HttpCodes.BAD_REQUEST, 'Token size is equal to 6');
            }
            await AuthService.isPasswordValid(res.locals.APP_JWT_TOKEN.user.email, decryptedToken[0]);

            switch(decryptedToken[1]) {
                case 'app':
                    await TwoFactorAuthService.verifyTokenGeneratedByApp(res.locals.APP_JWT_TOKEN.user.email, decryptedToken[2]);
                    break;
                case 'sms':
                    await TwoFactorAuthService.verifySMSToken(res.locals.APP_JWT_TOKEN.user.email, decryptedToken[2]);
                    break;
                default:
                    throw new HTTPError(HttpCodes.BAD_REQUEST, "appOrSms should be equal to app or sms")
                    break;
            }

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Correct password & 2FA token"
            });
        } catch (err) {
            if (err.code && err.status === 429) {
                next(new HTTPError(HttpCodes.TOO_MANY_REQUESTS, 'Max check attempts reached'));
            } else {
                next(err);
            }
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
