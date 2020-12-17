import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';
import { FileTag } from 'src/schemas/file-tag.schema';
import { File, FileDocument } from 'src/schemas/file.schema';

@Injectable()
export class UsersTagsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(File.name) private readonly fileModel: Model<FileDocument>,
  ) {}

  async createTag(
    mongoSession: ClientSession,
    user: User,
    name: string,
    hexColor: string,
  ): Promise<FileTag> {
    const newTag = new FileTag();
    newTag._id = uuidv4();
    newTag.name = name;
    newTag.hexColor = hexColor;

    user.tags.push(newTag);
    await new this.userModel(user).save({ session: mongoSession });
    return newTag;
  }

  async updateTag(
    mongoSession: ClientSession,
    user: User,
    tagID: string,
    name: string,
    hexColor: string,
  ): Promise<FileTag> {
    const tag = user.tags.find((tag) => tag._id === tagID);
    if (!tag) throw new NotFoundException('Unknown tag');

    tag.name = name;
    tag.hexColor = hexColor;
    user.tags = user.tags.map((value) => (value._id === tagID ? tag : value));
    await new this.userModel(user).save({ session: mongoSession });

    await this.fileModel
      .updateMany(
        {
          owner_id: user._id,
          'tags._id': tag._id,
        },
        {
          $set: {
            'tags.$.name': name,
            'tags.$.hexColor': hexColor,
          },
        },
      )
      .session(mongoSession);

    return tag;
  }

  async deleteTag(
    mongoSession: ClientSession,
    user: User,
    tagID: string,
  ): Promise<void> {
    const tag = user.tags.find((tag) => tag._id === tagID);
    if (!tag) throw new NotFoundException('Unknown tag');

    await this.fileModel
      .updateMany({}, { $pull: { tags: { _id: tagID } } }, { multi: true })
      .session(mongoSession)
      .exec();
    await this.userModel
      .updateMany(
        { _id: user._id },
        { $pull: { tags: { _id: tagID } } },
        { multi: true },
      )
      .session(mongoSession)
      .exec();
  }
}
