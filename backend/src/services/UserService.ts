import { IUser, User, Role } from "../models/User";

import { requireNonNull } from "../helpers/DataValidation";

import AuthService from "./AuthService";

class UserService {
    
    // verify that a role is in a list
    public static hasRoles(rolesNeeded: Role[], role: Role): boolean {
        return rolesNeeded.includes(role);
    }

    // profile service
    public static async profile(userId: string): Promise<IUser> {
        return requireNonNull(await User.findById(userId).exec());
    }

    // profile update
    public static async updateProfile(user_id: string, firstname: string, lastname: string, email: string, password: string): Promise<Record<string, IUser | string>> {
        let user = requireNonNull(await User.findById(user_id).exec());
        user.firstname = firstname;
        user.lastname = lastname;
        user.email = email;
        user.password = password;
        user = requireNonNull(await user.save());

        const newToken = AuthService.generateJWTToken(user);

        return { "user": user, "newToken": newToken };
    }

    // delete user account service
    public static async delete(_id: string): Promise<IUser> {
        return requireNonNull(await User.findByIdAndDelete(_id).exec());
    }
}

export default UserService;