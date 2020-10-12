//from swagger file users.yml

import { FileTag } from './files-api-models';

export class User {
    public _id: string;
    public firstname: string;
    public lastname: string;
    public email: string;
    public phone_number: string;
    public authy_id: string;
    public updated_at: string;
    public created_at: string;
    public role: string;
    public directory_id: string;
    public tags: FileTag[];
}