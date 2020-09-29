import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Guid from 'guid';

import { IFile, File, FileType } from "../models/File";
import { IUser, User } from "../models/User";

import { requireNonNull } from '../helpers/DataValidation';

class AuthService {

    // generate a JWT token
    public static generateJWTToken(user: IUser) {
        return jwt.sign({ user }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });
    }

    // register service
    public static async signup(firstname: string, lastname: string, email: string, password: string): Promise<IUser> {
        let newUser: IUser = new User();
        
        // build object
        newUser._id       = Guid.raw()
        newUser.firstname = firstname;
        newUser.lastname  = lastname;
        newUser.email     = email;
        newUser.password  = password;

        // build user's root directory
        let root_user_dir: IFile = new File();
        root_user_dir._id = Guid.raw();
        root_user_dir.type = FileType.DIRECTORY;
        root_user_dir.name = newUser._id;
        root_user_dir.owner_id = newUser._id;

        newUser.directory_id = root_user_dir._id;
        requireNonNull(await root_user_dir.save());
        return requireNonNull(await newUser.save());
    }

    // login service
    public static async login(email: string, password: string): Promise<string> {
        const user: IUser = requireNonNull(await User.findOne({ email: email }));

        const passwordIsValid = bcrypt.compareSync(password, user?.password!);

        if(!passwordIsValid)
            throw new Error("Invalid credentials");

        const jwttoken = AuthService.generateJWTToken(user);

        return jwttoken;
    }

    // forgotten password service
    public static forgottenPassword() {
        // TODO
    }

    // validate that the token is correct
    public static validateToken(jwtToken: string): any {
        return jwt.verify(jwtToken, process.env.JWT_SECRET);
    }
}

export default AuthService;