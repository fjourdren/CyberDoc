import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Guid from 'guid';

import {File, FileType, IFile} from "../models/File";
import {IUser, Role, User} from "../models/User";

import {requireNonNull} from '../helpers/DataValidation';
import HttpCodes from '../helpers/HttpCodes';
import HTTPError from '../helpers/HTTPError';
import Mailer from '../helpers/Mailer';
import TwoFactorAuthService from './TwoFactorAuthService';

class AuthService {

    // generate a JWT token
    public static generateJWTToken(user: IUser, authorized: boolean): string {
        return jwt.sign({user, authorized: authorized}, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });
    }

    // register service
    public static async signup(firstname: string, lastname: string, email: string, password: string, role: Role): Promise<string> {
        // build object
        const newUser: IUser = new User();
        newUser._id = Guid.raw()
        newUser.firstname = firstname;
        newUser.lastname = lastname;
        newUser.email = email;
        newUser.password = password;
        newUser.role = role;
        newUser.twoFactorApp = false;
        newUser.twoFactorSms = false;

        // build user's root directory
        const root_user_dir: IFile = new File();
        root_user_dir._id = Guid.raw();
        root_user_dir.type = FileType.DIRECTORY;
        root_user_dir.mimetype = "application/x-dir"
        root_user_dir.name = "My safebox";
        root_user_dir.owner_id = newUser._id;
        root_user_dir.tags = [];

        newUser.directory_id = root_user_dir._id;
        try {
            requireNonNull(await newUser.save());

            // Check if user has received invitations to collaborate on files
            const files = await File.find({sharedWithPending: newUser.email}).exec();
            for (const file of files){
                await File.update({_id: file._id}, {$pull:  {"sharedWithPending": newUser.email}});
                console.log('[Debug] ' + newUser.email + ' removed from sharedWithPending (' + file.name + ')')
                file.sharedWith.push(newUser._id);
                await file.save();
                console.log('[Debug] ' + newUser.email + ' added to sharedWith (' + file.name + ')');
            }
        } catch (e) {
            const error: Error = e;
            if (error.message.indexOf("expected `email` to be unique.") !== -1) {
                requireNonNull(null, 409, "Another account with this mail already exists");
            } else {
                throw e;
            }
        }

        requireNonNull(await root_user_dir.save());
        return AuthService.generateJWTToken(newUser, true);
    }

    // login service
    public static async login(email: string, password: string): Promise<string> {
        const user: IUser = requireNonNull(await User.findOne({email: email.toLowerCase()}).exec(), HttpCodes.UNAUTHORIZED, "Invalid credentials");

        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid)
            throw new HTTPError(HttpCodes.UNAUTHORIZED, "Invalid credentials");

        return AuthService.generateJWTToken(user, false); // Need to 2FA anyway
    }

    // isPasswordValid ?
    public static async isPasswordValid(email: string, password: string): Promise<boolean> {
        const user: IUser = requireNonNull(await User.findOne({email: email}).exec(), HttpCodes.UNAUTHORIZED, "Invalid user");

        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid)
            throw new HTTPError(HttpCodes.UNAUTHORIZED, "Incorrect password");

        return isPasswordValid;
    }

    // forgotten password service
    public static async forgottenPassword(email: string): Promise<void> {
        requireNonNull(await User.findOne({email: email.toLowerCase()}).exec());

        const token: string = jwt.sign({email}, process.env.JWT_SECRET, {
            expiresIn: 36000 // 10 hours
        });

        const url: string = process.env.APP_FRONTEND_URL + "/passwordReset?token=" + token;

        //await Mailer.sendTextEmail(email, process.env.SENDGRID_MAIL_FROM, "hello", "hello", "hello");
        await Mailer.sendTemplateEmail(email, process.env.SENDGRID_MAIL_FROM, process.env.SENDGRID_TEMPLATE_FORGOTTEN_PASSWORD, {url: url});
    }

    // validate that the token is correct
    public static validateToken(jwtToken: string): string[] {
        return jwt.verify(jwtToken, process.env.JWT_SECRET) as string[];
    }
}

export default AuthService;
