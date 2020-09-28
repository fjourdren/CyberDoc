import { IUser, User, Role } from "../models/User";

import { requireNonNull } from "../helpers/DataValidation";

class UserService {
    
    // verify that a role is in a list
    public static hasRoles(rolesNeeded: Role[], role: Role): boolean {
        return rolesNeeded.includes(role);
    }

    // profile service
    public static async profile(userId: string): Promise<IUser> {
        return requireNonNull(await User.findById(userId).exec());
    }


    // delete user account service
    public static async delete(_id: string): Promise<IUser> {
        return requireNonNull(await User.findByIdAndDelete(_id).exec());
    }
}

export default UserService;