import {Observable} from 'rxjs';
import {FileTag} from 'src/app/models/files-api-models';
import {Device, User} from 'src/app/models/users-api-models';

export interface UserService {
    getActiveUser(): User;

    getJwtToken(): string;

    refreshActiveUser(): Observable<User>;

    addTag(tag: FileTag): Observable<void>;

    editTag(tag: FileTag): Observable<void>;

    removeTag(tag: FileTag): Observable<void>;

    register(user: User, password: string, fileId: string): Observable<any>;

    updateProfile(firstName: string, lastName: string, newEmail: string, xAuthTokenArray: string): Observable<void>;

    recoverPassword(email: string): Observable<void>;

    resetPassword(resetPasswordJWTToken: string, password: string): Observable<void>;

    searchExistingUser(email: string): Observable<User>;

    updatePassword(password: string, appOrSms: 'app' | 'sms', token: string): Observable<void>;

    updateTwoFactor(twoFactorApp: boolean, twoFactorSms: boolean, secret: string | undefined, phoneNumber: string | undefined,
                    xAuthTokenArray: string | undefined): Observable<void>;

    login(email: string, password: string): Observable<any>;

    validatePassword(password: string): Observable<boolean>;

    logout(): Observable<void>;

    deleteAccount(xAuthTokenArray: string): Observable<void>;

    userUpdated(): Observable<User>;

    getUserDevices(): Observable<Device[]>;

    renameUserDevice(oldName: string, name: string): Observable<void>;

    createUserDevice(name: string, browser: string, OS: string): Observable<void>;

}
