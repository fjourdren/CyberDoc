import Guid from 'guid';
import * as u from '../../models/User';
import { IFile, File, FileType } from '../../models/File'

// ---------------- User Mocked
// user_1
let user: u.IUser = new u.User();
user._id       = "01010101-0101-0101-0101-010101010101"
user.firstname = "test";
user.lastname  = "fromFulgen";
user.email     = "test.fromFulgen@gmail.com";
user.password  = "password123PASSWORD@!?";
user.role      = u.Role.COLLABORATOR;

user.phoneNumber = "+33660571778";
user.secret = "JL5QH7CTHVIFXWU6S4TREV7BTMXCMTYK";
user.twoFactorApp = false;
user.twoFactorSms = false;

let root_user_dir: IFile = new File();
root_user_dir._id = Guid.raw();
root_user_dir.type = FileType.DIRECTORY;
root_user_dir.mimetype = "application/x-dir"
root_user_dir.name = "My safebox";
root_user_dir.owner_id = user._id;
root_user_dir.tags = [];

user.directory_id = root_user_dir._id;

// user_2
let user_2: u.IUser = new u.User();
user_2._id       = "02020202-0202-0202-0202-020202020202"
user_2.firstname = "test_2";
user_2.lastname  = "fromFulgen_2";
user_2.email     = "test_2.fromFulgen@gmail.com";
user_2.password  = "password123PASSWORD@!?";
user_2.role      = u.Role.COLLABORATOR;

user_2.phoneNumber = "+33660571700";
user_2.secret = "000QH7CTHVIFXWU6S4TREV7BTMXCMTYK";
user_2.twoFactorApp = false;
user_2.twoFactorSms = false;

let root_user_dir_2: IFile = new File();
root_user_dir_2._id = Guid.raw();
root_user_dir_2.type = FileType.DIRECTORY;
root_user_dir_2.mimetype = "application/x-dir"
root_user_dir_2.name = "My safebox";
root_user_dir_2.owner_id = user_2._id;
root_user_dir_2.tags = [];

user_2.directory_id = root_user_dir_2._id;
let mockClass = {};

export default mockClass = {
    "User": user,
    "User_2": user_2
} 
