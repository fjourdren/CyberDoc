import { requireNonNull } from "../helpers/DataValidation";

import ITag, { Tag, TagSchema } from "../models/Tag";
import IUser, { User } from "../models/User";
import IFile, {File} from "../models/File";
import FileService from "./FileService";

class TagService {
    // create a tag
    public static async create(user: IUser, name: string, color: string): Promise<ITag> {
        // check that both variable aren't null
        requireNonNull(name);
        requireNonNull(color);

        // create tag object
        const newTag: ITag = new Tag();
        newTag.name  = name;
        newTag.color = color;

        // add tag to user
        user.tags.push(newTag);

        // save the user
        requireNonNull(await user.save());
        return newTag;
    }

    // edit a tag
    public static async edit(user: IUser, tag: ITag, newName: string, newColor: string): Promise<void> {
        // generate updater string
        let updateString: {} = {};
    
        if(newName)
            updateString = Object.assign({}, { 'tags.$.name': 'updated item2' });
        if(newColor)
            updateString = Object.assign(updateString, { 'tags.$.value': 'two updated' });


        // update mondo data
        await User.updateMany({ _id: user._id, 'tags._id': tag._id }, { '$set': updateString });
        await File.updateMany({ owner_id: user._id, 'tags._id': tag._id }, { '$set': updateString });
    }

    // delete a tag
    public static async delete(user: IUser, tagId: string): Promise<IUser> {
        // non null check
        requireNonNull(tagId);

        // delete tag from all files
        await File.update({}, { $pull: {'tags._id': tagId }}).exec();

        // remove tag
        return requireNonNull(await User.update( {'_id': user._id }, { $pull: {'tags._id': tagId }}).exec());
    }

    // add a tag to a file
    public static async addToFile(file: IFile, tag: ITag): Promise<IFile> {
        file.tags.push(tag);
        return requireNonNull(await file.save());
    }

    // remove a tag from a file
    public static async removeFromFile(file: IFile, tagId: string): Promise<IFile> {
        return requireNonNull(await File.update( {'_id': file._id }, { $pull: {'tags._id': tagId }}).exec());
    }
}

export default TagService;