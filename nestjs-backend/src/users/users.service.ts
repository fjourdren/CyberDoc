import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';

export const COLUMNS_TO_KEEP_FOR_USER = ["_id", "firstname", "lastname", "email", "directory_id", "tags"];

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async prepareUserForOutput(user: User) {
        const result = COLUMNS_TO_KEEP_FOR_USER.reduce((r, key) => {
            r[key] = user[key];
            return r;
        }, {});
        return result;
    }

    async findOneByEmail(email: string): Promise<User | undefined> {
        return this.userModel.findOne({ email }).exec();
    }

    async findOneByID(id: string): Promise<User | undefined> {
        return this.userModel.findOne({ _id: id }).exec();
    }
}