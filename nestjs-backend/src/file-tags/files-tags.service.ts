import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileTag } from 'src/schemas/file-tag.schema';
import { File, FileDocument } from 'src/schemas/file.schema';

@Injectable()
export class FilesTagsService {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<FileDocument>,
  ) {}

  async addTagToFile(file: File, tag: FileTag): Promise<File> {
    file.tags.push(tag);
    return await new this.fileModel(file).save();
  }

  async removeTagFromFile(file: File, tag: FileTag) {
    file.tags = file.tags.filter((item) => item._id !== tag._id);
    return await new this.fileModel(file).save();
  }
}
