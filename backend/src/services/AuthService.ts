import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Guid from 'guid';

import { IFile, File, FileType } from "../models/File";
import { IUser, User, Role } from "../models/User";

import { requireNonNull } from '../helpers/DataValidation';
import HttpCodes from '../helpers/HttpCodes';
import HTTPError from '../helpers/HTTPError';
import Mailler from '../helpers/Mailler';

class AuthService {

    // generate a JWT token
    public static generateJWTToken(user: IUser): string {
        return jwt.sign({ user }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });
    }

    // register service
    public static async signup(firstname: string, lastname: string, email: string, password: string, role: Role): Promise<IUser> {
        // build object
        const newUser: IUser = new User();
        newUser._id       = Guid.raw()
        newUser.firstname = firstname;
        newUser.lastname  = lastname;
        newUser.email     = email;
        newUser.password  = password;
        newUser.role      = role;

        // build user's root directory
        const root_user_dir: IFile = new File();
        root_user_dir._id = Guid.raw();
        root_user_dir.type = FileType.DIRECTORY;
        root_user_dir.mimetype = "application/x-dir"
        root_user_dir.name = "Root";
        root_user_dir.owner_id = newUser._id;
        root_user_dir.tags = [];

        newUser.directory_id = root_user_dir._id;
        requireNonNull(await root_user_dir.save());
        return requireNonNull(await newUser.save());
    }

    // login service
    public static async login(email: string, password: string): Promise<string> {
        const user: IUser = requireNonNull(await User.findOne({ email: email }).exec());

        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if(!passwordIsValid)
            throw new HTTPError(HttpCodes.UNAUTHORIZED, "Invalid credentials");

        const jwttoken = AuthService.generateJWTToken(user);

        return jwttoken;
    }

    // forgotten password service
    public static async forgottenPassword(email: string): Promise<void> {
        requireNonNull(await User.findOne({ email: email }).exec());
        
        const token: string = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: 36000 // 10 hours
        });

        const url: string = process.env.APP_FRONTEND_URL + "/forgottenpassword?token=" + token;

        Mailler.sendTemplateEmail(email, process.env.APP_MAIL_FROM, "TEMPLATEID", { url: url })
    }

    // validate that the token is correct
    public static validateToken(jwtToken: string): string[] {
        return jwt.verify(jwtToken, process.env.JWT_SECRET) as string[];
    }
}

export default AuthService;