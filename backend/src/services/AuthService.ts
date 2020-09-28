import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireNonNull } from '../helpers/DataValidation';

import {IUser, User} from "../models/User";

class AuthService {

    // register service
    public static async signup(firstname: string, lastname: string, email: string, password: string): Promise<IUser> {
        let newUser: IUser = new User();
        
        // build object
        newUser.firstname = firstname;
        newUser.lastname  = lastname;
        newUser.email     = email;
        newUser.password  = password;

        return requireNonNull(await newUser.save());
    }

    // login service
    public static async login(email: string, password: string): Promise<string> {
        let user: IUser = requireNonNull(await User.findOne({ email: email }));

        let passwordIsValid = bcrypt.compareSync(password, user?.password!);

        if(!passwordIsValid)
            throw new Error("Invalid credentials");

        var jwttoken = jwt.sign({ user }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        return jwttoken;
    }

    // forgotten password service
    public static forgottenPassword() {
        // TODO
    }

    // validate that the token is correct
    public static async validateToken(jwtToken: string): Promise<any> {
        return jwt.verify(jwtToken, process.env.JWT_SECRET);
    }
}

export default AuthService;