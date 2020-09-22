import {IUser, User, Role} from "../models/User";

class UserService {
    public static hasRoles(rolesNeeded: Role[], role: Role): boolean {
        return rolesNeeded.includes(role);
    }

    // profile service
    public static profile(userId: string): Promise<IUser> {
        return new Promise((resolve, reject) => {
            User.findOne({_id: userId}).exec(function(err, user) {
                if(err || user == undefined) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });
    }

}

export default UserService;