import { Observable } from 'rxjs';
import { FileTag } from 'src/app/models/files-api-models';
import { User, Device } from 'src/app/models/users-api-models';

export interface UserService {
    getActiveUser(): User;
    getJwtToken(): string;

    refreshActiveUser(): Observable<User>;

    addTag(tag: FileTag): Observable<void>;
    editTag(tag: FileTag): Observable<void>;
    removeTag(tag: FileTag): Observable<void>;

    register(user: User, password: string, fileId: string): Observable<any>;
    updateProfile(firstName: string, lastName: string, newEmail: string, oldEmail: string): Observable<void>;
  
    recoverPassword(email: string): Observable<void>;
    resetPassword(resetPasswordJWTToken: string, email: string, password): Observable<void>;
    searchExistingUser(email: string): Observable<User>;

    updatePassword(oldPassword: string, newPassword: string, email: string): Observable<void>;
    updatePhoneNumber(phoneNumber: string): Observable<void>;
    updateSecret(secret: string): Observable<void>;
    updateTwoFactor(twoFactorApp: boolean, twoFactorSms: boolean): Observable<void>;
    login(email: string, password: string): Observable<any>;
    validatePassword(password: string): Observable<boolean>;

    updatePassword(password: string, email: string): Observable<void>;

    logout(): Observable<void>;
    deleteAccount(): Observable<void>;

    userUpdated(): Observable<User>;
    getUserDevices(): Observable<Device[]>;
    renameUserDevice(oldName: string,name: string): Observable<void>;
    createUserDevice(name: string, browser: string, OS: string): Observable<void>;
    
}
