import { requireNonNull } from "../helpers/DataValidation";

import ITag, { Tag } from "../models/Tag";
import IUser, { User } from "../models/User";
import IFile, {File} from "../models/File";
import HTTPError from "../helpers/HTTPError";
import HttpCodes from "../helpers/HttpCodes";

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

        // update the user
        requireNonNull(await User.update({ _id: user._id }, {$set: {tags: user.tags}}));
        return newTag;
    }

    // edit a tag
    public static async edit(user: IUser, tag: ITag, newName: string, newColor: string): Promise<void> {
        // generate updater string
        let updateString: Record<string, unknown> = {};
    
        if(newName)
            updateString = Object.assign({}, { 'tags.$.name': newName });
        if(newColor)
            updateString = Object.assign(updateString, { 'tags.$.color': newColor });

        // update mondo data
        await User.updateMany({ _id: user._id, 'tags._id': tag._id }, { '$set': updateString });
        await File.updateMany({ owner_id: user._id, 'tags._id': tag._id }, { '$set': updateString });
    }

    // delete a tag
    public static async delete(user: IUser, tagId: string): Promise<IUser> {
        // non null check
        requireNonNull(tagId);

        // delete tag from all files
        await File.update({}, { $pull: { "tags": { "_id": tagId }} }, {'multi': true}).exec();

        // remove tag
        return requireNonNull(await User.update( {'_id': user._id }, { $pull: { "tags": { "_id": tagId }} }, {'multi': true}).exec());
    }

    // add a tag to a file
    public static async addToFile(file: IFile, tag: ITag): Promise<IFile> {
        const tags: ITag[] = file.tags;

        // check that the file doesn't already have the tag
        for(let i = 0; i < tags.length; i++)
            if(tags[i]._id == tag._id)
                throw new HTTPError(HttpCodes.BAD_REQUEST, "The file already has this tag")

        // add to tag list
        file.tags.push(tag);

        // update tag list
        return requireNonNull(await File.update({ _id: file._id }, {$set: {tags: file.tags}}).exec());
    }

    // remove a tag from a file
    public static async removeFromFile(file: IFile, tagId: string): Promise<IFile> {
        return requireNonNull(await File.update( {'_id': file._id }, { $pull: { "tags": { "_id": tagId }} }).exec());
    }
}

export default TagService;