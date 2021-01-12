import { File, ShareMode } from '../schemas/file.schema';
import { User } from '../schemas/user.schema';

export class FileAcl {
  static NONE = 0;
  static READ = 1;
  static WRITE = 2;
  static OWNER = 3;

  static getAvailableAccess(file: File, user: User) {
    let availableAccess = 0;
    if (file.owner_id === user._id) {
      availableAccess = FileAcl.OWNER;
    } else if (file.sharedWith.includes(user._id)) {
      availableAccess =
        file.shareMode === ShareMode.READWRITE ? FileAcl.WRITE : FileAcl.READ;
    }

    return availableAccess;
  }
}
