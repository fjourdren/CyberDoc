//from swagger file users.yml

export class FileTag {
    public id;
    public name: string;
    public hexColor: string;
}

export class User {
    public _id: string;
    public firstname: string;
    public lastname: string;
    public email: string;
    public updated_at: string;
    public created_at: string;
    public role: string;
    public rootDirectoryID: string;
    public fileTags: FileTag[];
}