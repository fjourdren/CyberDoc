import {IUser, User} from "../models/User";

class UserService {

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