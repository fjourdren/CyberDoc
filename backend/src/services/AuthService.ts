import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {IUser, User} from "../models/User";

class AuthService {

    // register service
    public static signup(firstname: string, lastname: string, email: string, password: string) {
        return new Promise((resolve, reject) => {
            let newUser: IUser = new User();
            
            // build object
            newUser.firstname = firstname;
            newUser.lastname  = lastname;
            newUser.email     = email;
            newUser.password  = password;


            // save object in database
            newUser.save().then((out) => {
                resolve(out);
            }).catch((err) => {
                // rewrite value by moongoose message
                if(err.message != undefined)
                    err = err.message;

                reject(err);
            });
        });
    }


    // login service
    public static login(email: string, password: string) {
        return new Promise((resolve, reject) => { 
            User.findOne({ email: email }).then((user) => {
                if(user == undefined)
                    reject("Invalid credentials");

                let passwordIsValid = bcrypt.compareSync(password, user?.password!);

                if(!passwordIsValid)
                    reject("Invalid credentials");

                var jwttoken = jwt.sign({ user }, process.env.JWT_SECRET, {
                    expiresIn: 86400 // 24 hours
                });

                resolve(jwttoken);
            }).catch((err) => {
                reject(err);
            });
        });
    }


    // forgotten password service
    public static forgottenPassword() {
        
    }


    // refresh token service
    public static renewToken() {
        
    }

}

export default AuthService;