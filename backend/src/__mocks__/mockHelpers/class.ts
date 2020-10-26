import Guid from 'guid';
import * as u from '../../models/User';
import{ IFile, File, FileType } from '../../models/File'

// ---------------- User Mocked
let user: u.IUser = new u.User();
user._id       = Guid.raw()
user.firstname = "test";
user.lastname  = "fromFulgen";
user.email     = "test.fromFulgen@gmail.com";
user.password  = "password123PASSWORD@!?";
user.role      = u.Role.COLLABORATER;

let root_user_dir: IFile = new File();
root_user_dir._id = Guid.raw();
root_user_dir.type = FileType.DIRECTORY;
root_user_dir.mimetype = "application/x-dir"
root_user_dir.name = "My safebox";
root_user_dir.owner_id = user._id;
root_user_dir.tags = [];

let mockClass = {};

export default  mockClass = {
    "User": user
} 
