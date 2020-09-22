import {IUser, User, Role} from "../models/User";

class UserService {
    
    // verify that a role is in a list
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


    // delete user account service
    public static delete(_id: string): Promise<IUser> {
        return new Promise((resolve, reject) => {
            // check that the user exist and delete it (check also that the delete has been correctly been done)
            User.findOneAndRemove({ _id: _id }).exec(function(err, userDeleted) {
                // catch other errors
                if (err) {
                    let errorValue: any = err;

                    // rewrite value by moongoose message
                    if(err.message != undefined)
                        errorValue = err.message;

                    reject(errorValue);
                }

                // check if user has been deleted
                if (!userDeleted) {
                    reject("User not found");
                }

                resolve();
            });

            User.findByIdAndDelete(_id, function(err) {
                if(err) {
                    // rewrite value by moongoose message
                    if(err.message != undefined)
                        err = err.message;
                    
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

}

export default UserService;