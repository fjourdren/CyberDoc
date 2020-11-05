import {NextFunction, Request, Response} from 'express';
import {requireNonNull} from '../helpers/DataValidation';

import HttpCodes from '../helpers/HttpCodes'

import AuthService from '../services/AuthService';

import IUser from '../models/User';
import CryptoHelper from '../helpers/CryptoHelper';
import NodeRSA from 'node-rsa';

class AuthController {

    // register controller
    public static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {firstname, lastname, email, password, role} = req.body;

            const user_hash = CryptoHelper.prepareUser_hash(CryptoHelper.sha3(email+password));

            /*const genaes: string = CryptoHelper.generateAES();
            console.log(CryptoHelper.decryptAES(genaes, CryptoHelper.encryptAES(genaes, "AZERTY")))
            
            console.log(CryptoHelper.decryptAES(user_hash, CryptoHelper.encryptAES(user_hash, "AZERTY")))
            const rsa: NodeRSA = CryptoHelper.generateRSAKeys();

            const enc_pri: string = CryptoHelper.encryptAES(user_hash, rsa.exportKey("private"));
            const de_pri: string = CryptoHelper.decryptAES(user_hash, enc_pri);

            const pub: NodeRSA = new NodeRSA().importKey(rsa.exportKey("public"), "public");
            const pri: NodeRSA = new NodeRSA().importKey(de_pri, "private");
            console.log(CryptoHelper.decryptRSA(pri, CryptoHelper.encryptRSA(pub, "AZERTY")))
            return;*/

            const jwtToken = requireNonNull(await AuthService.signup(user_hash, firstname, lastname, email, password, role));
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