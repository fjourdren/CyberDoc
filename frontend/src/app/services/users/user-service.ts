import { Observable } from 'rxjs';
import { FileTag } from 'src/app/models/files-api-models';
import { User } from 'src/app/models/users-api-models';

export interface UserService {
    getActiveUser(): User;
    getJwtToken(): string;

    refreshActiveUser(): Observable<User>;

    addTag(tag: FileTag): Observable<void>;
    editTag(tag: FileTag): Observable<void>;
    removeTag(tag: FileTag): Observable<void>;

    register(user: User, password: string): Observable<User>;
    updateProfile(firstName: string, lastName: string, newEmail: string, oldEmail: string): Observable<void>;
    updatePassword(oldPassword: string, newPassword: string, email: string)
    login(email: string, password: string): Observable<User>;
    logout(): Observable<void>;
    deleteAccount(): Observable<void>;

    userUpdated(): Observable<User>;
}