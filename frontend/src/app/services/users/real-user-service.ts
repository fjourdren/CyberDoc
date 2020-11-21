import { HttpClient } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileTag } from 'src/app/models/files-api-models';
import { User, Device } from 'src/app/models/users-api-models';
import { UserService } from './user-service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { environment } from "src/environments/environment";
import { SHA3 } from 'sha3';
import { Base64 } from 'js-base64';
import { Gtag } from 'angular-gtag';

export class RealUserService implements UserService {

    private _userUpdated$ = new EventEmitter<User>();
    private _jwtHelper = new JwtHelperService();

    constructor(private httpClient: HttpClient,
        private cookieService: CookieService,
        private gtag: Gtag) {
    }

    getActiveUser(): User {
        if (!this.getJwtToken()) {
            return undefined;
        } else if (this._jwtHelper.isTokenExpired(this.getJwtToken())) {
            return undefined;
        } else {
            return JSON.parse(localStorage.getItem(environment.userLocalStorageKey)) as User;
        }
    }

    getJwtToken(): string {
        return this.cookieService.get(environment.authCookieName);
    }

    register(user: User, password: string, fileId: string): Observable<any> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/auth/signup`, {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            password
        }).pipe(map(response => {

            //JwtToken Cookie
            this.cookieService.set(
                environment.authCookieName,
                response.token,
                this._jwtHelper.getTokenExpirationDate(response.token),
                '/',
                environment.authCookieDomain);

            //UserHash Cookie
            const hash = new SHA3(512); //FIXME constant keySize
            hash.update(user.email + password);
            this.cookieService.set(
                environment.userHashCookieName,
                hash.digest('hex').substring(0, 32),
                this._jwtHelper.getTokenExpirationDate(response.token),
                '/',
                environment.authCookieDomain);
            this._setUser(this._jwtHelper.decodeToken(response.token).user);
            return response;
        }));
    }

    addTag(tag: FileTag): Observable<void> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/users/tags`, {
            name: tag.name,
            color: tag.hexColor,
        }, { withCredentials: true }).pipe(map(() => {
            return null;
        }));
    }

    editTag(tag: FileTag): Observable<void> {
        return this.httpClient.patch<any>(`${environment.apiBaseURL}/users/tags/${tag._id}`, {
            name: tag.name,
            color: tag.hexColor,
        }, { withCredentials: true }).pipe(map(() => {
            return null;
        }));
    }

    removeTag(tag: FileTag): Observable<void> {
        return this.httpClient.delete<any>(`${environment.apiBaseURL}/users/tags/${tag._id}`, { withCredentials: true }).pipe(map(() => {
            return null;
        }));
    }

    refreshActiveUser(): Observable<User> {
        return this.httpClient.get<any>(`${environment.apiBaseURL}/users/profile`, { withCredentials: true }).pipe(map(response => {
            this._setUser(response.user);
            return response.user;
        }));
    }


    updateProfile(firstName: string, lastName: string, newEmail: string, xAuthTokenArray: string[]): Observable<void> {
        let options = { withCredentials: true };
        if (xAuthTokenArray) {
            options["headers"] = { 'x-auth-token': Base64.encode(xAuthTokenArray[0] + '\t' + xAuthTokenArray[1] + '\t' + xAuthTokenArray[2]) }
        }

        return this.httpClient.post<any>(`${environment.apiBaseURL}/users/profile`, {
            email: newEmail,
            firstname: firstName,
            lastname: lastName
        }, options).pipe(map(response => {
            this.cookieService.set(
                environment.authCookieName,
                response.token,
                this._jwtHelper.getTokenExpirationDate(response.token),
                '/',
                environment.authCookieDomain);
            this._setUser(this._jwtHelper.decodeToken(response.token).user);
        }));
    }

    updatePassword(password: string, xAuthTokenArray: string[]): Observable<void> {
        const options = {
            withCredentials: true,
            headers: { 'x-auth-token': Base64.encode(xAuthTokenArray[0] + '\t' + xAuthTokenArray[1] + '\t' + xAuthTokenArray[2]) }
        };

        return this.httpClient.post<any>(`${environment.apiBaseURL}/users/profile`, {
            password
        }, options).pipe(map(response => {
            this.cookieService.set(
                environment.authCookieName,
                response.token,
                this._jwtHelper.getTokenExpirationDate(response.token),
                '/',
                environment.authCookieDomain);
            this._setUser(this._jwtHelper.decodeToken(response.token).user);
        }));
    }

    updateTwoFactor(twoFactorApp: boolean, twoFactorSms: boolean, secret: string, phoneNumber: string,
        xAuthTokenArray: string[]): Observable<void> {
        const options = { withCredentials: true };
        if (xAuthTokenArray && xAuthTokenArray.length === 3) {
            options["headers"] = { 'x-auth-token': Base64.encode(xAuthTokenArray[0] + '\t' + xAuthTokenArray[1] + '\t' + xAuthTokenArray[2]) };
        } else if (xAuthTokenArray && xAuthTokenArray.length === 1) {
            options["headers"] = { 'x-auth-token': Base64.encode(xAuthTokenArray[0]) };
        }
        return this.httpClient.post<any>(`${environment.apiBaseURL}/users/profile`, {
            twoFactorApp,
            twoFactorSms,
            secret,
            phoneNumber
        }, options).pipe(map(response => {
            this.cookieService.set(
                environment.authCookieName,
                response.token,
                this._jwtHelper.getTokenExpirationDate(response.token),
                '/',
                environment.authCookieDomain);
            this._setUser(this._jwtHelper.decodeToken(response.token).user);
        }));
    }

    login(email: string, password: string): Observable<any> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/auth/signin`, {
            email,
            password
        }).pipe(map(response => {
            //JwtToken Cookie
            this.cookieService.set(
                environment.authCookieName,
                response.token,
                this._jwtHelper.getTokenExpirationDate(response.token),
                '/',
                environment.authCookieDomain);

            //UserHash Cookie
            const hash = new SHA3(512); //FIXME constant keySize
            hash.update(email + password);
            this.cookieService.set(
                environment.userHashCookieName,
                hash.digest('hex').substring(0, 32),
                this._jwtHelper.getTokenExpirationDate(response.token),
                '/',
                environment.authCookieDomain);

            this._setUser(this._jwtHelper.decodeToken(response.token).user);
            return response.token;
        }));
    }

    validatePassword(password: string): Observable<boolean> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/auth/validatepassword`, {
            password
        }, { withCredentials: true }).pipe(map(response => {
            return response.success;
        }));
    }

    recoverPassword(email: string): Observable<void> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/auth/forgottenPassword`, {
            email
        }).pipe(map(() => {
        }));
    }

    resetPassword(resetPasswordJWTToken: string, password: string): Observable<void> {
        console.warn('Authorization', `Bearer ${resetPasswordJWTToken}`);
        return this.httpClient.post<any>(`${environment.apiBaseURL}/users/profile`, {
            password
        }, {
            headers: {
                Authorization: `Bearer ${resetPasswordJWTToken}`
            },
            withCredentials: true
        }).pipe(map(response => {
            this.cookieService.delete(environment.authCookieName);
            this.cookieService.delete(environment.userHashCookieName);
        }));
    }

    searchExistingUser(email: string): Observable<User> {
        return null;
    }

    logout(): Observable<void> {
        return of(null).pipe(map(() => {
            this.cookieService.delete(environment.authCookieName);
            this.cookieService.delete(environment.userHashCookieName);
            this._setUser(null);
        }));
    }

    deleteAccount(xAuthTokenArray: string[]): Observable<void> {
        return this.httpClient.delete<any>(`${environment.apiBaseURL}/users/profile`, {
            headers: {
                'x-auth-token': Base64.encode(xAuthTokenArray[0] + '\t' + xAuthTokenArray[1] + '\t' + xAuthTokenArray[2])
            },
            withCredentials: true
        }).pipe(map(() => { }));
    }

    userUpdated(): Observable<User> {
        return this._userUpdated$.asObservable();
    }

    getUserDevices(): Observable<Device[]> {
        return this.httpClient.get<any>(`${environment.apiBaseURL}/users/devices`, { withCredentials: true }).pipe(map(response => {
            return response.devices;
        }));
    }

    renameUserDevice(oldName: string, name: string): Observable<void> {
        return this.httpClient.patch<any>(`${environment.apiBaseURL}/users/devices/${oldName}`, { name }, { withCredentials: true }).pipe(map(response => { }));
    }

    createUserDevice(name: string, browser: string, OS: string): Observable<void> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/users/devices`, { name, browser, OS }, { withCredentials: true }).pipe(map(response => { }));
    }

    exportRecoveryKey(): Observable<string> {
        return this.httpClient.get(`${environment.apiBaseURL}/users/keys`, { responseType: "text", withCredentials: true });
    }

    importRecoveryKey(email: string, password: string, file: File, resetPasswordJWTToken: string): Observable<void> {
        const hash = new SHA3(512); //FIXME constant keySize
        hash.update(email + password);

        const formData = new FormData();
        formData.set("upfile", file);
        formData.set("user_hash", hash.digest('hex').substring(0, 32));
        return this.httpClient.post(`${environment.apiBaseURL}/users/keys`, formData, {
            headers: {
                "Authorization": `Bearer ${resetPasswordJWTToken}`,
            },
            withCredentials: true
        }).pipe(map(() => {
            this.cookieService.delete(environment.authCookieName);
            this.cookieService.delete(environment.userHashCookieName);
        }));
    }

    getDataExportURL(): string {
        return `${environment.apiBaseURL}/users/exportData`;
    }

    private _setUser(user: User) {
        const oldUser = this.getActiveUser();
        localStorage.setItem(environment.userLocalStorageKey, JSON.stringify(user));
        if (user) {
            this._userUpdated$.emit(user);
        }

        if (environment.gaTrackingID && user && !oldUser) {
            this.gtag.event("user_login", {
                userID: user._id,
                userEmail: user.email
            });
        } else if (environment.gaTrackingID && !user && oldUser) {
            this.gtag.event("user_logout", {
                userID: oldUser._id,
                userEmail: oldUser.email
            });
        }
    }
}
