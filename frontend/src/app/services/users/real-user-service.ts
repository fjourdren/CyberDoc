import {HttpClient} from '@angular/common/http';
import {EventEmitter} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {FileTag} from 'src/app/models/files-api-models';
import {Device, User} from 'src/app/models/users-api-models';
import {UserService} from './user-service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {CookieService} from 'ngx-cookie-service';
import {environment} from 'src/environments/environment';
import { Base64 } from 'js-base64';

export class RealUserService implements UserService {

    private _userUpdated$ = new EventEmitter<User>();
    private _jwtHelper = new JwtHelperService();

    constructor(private httpClient: HttpClient, private cookieService: CookieService) {
    }

    getActiveUser(): User {
        if (!this.getJwtToken()) {
            return undefined;
        } else if (this._jwtHelper.isTokenExpired(this.getJwtToken())) {
            return undefined;
        } else {
            // FIXME
            return JSON.parse(localStorage.getItem('real_user')) as User;
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
            this.cookieService.set(
                environment.authCookieName,
                response.token,
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
        }, {withCredentials: true}).pipe(map(() => {
            return null;
        }));
    }

    editTag(tag: FileTag): Observable<void> {
        return this.httpClient.patch<any>(`${environment.apiBaseURL}/users/tags/${tag._id}`, {
            name: tag.name,
            color: tag.hexColor,
        }, {withCredentials: true}).pipe(map(() => {
            return null;
        }));
    }

    removeTag(tag: FileTag): Observable<void> {
        return this.httpClient.delete<any>(`${environment.apiBaseURL}/users/tags/${tag._id}`, {withCredentials: true}).pipe(map(() => {
            return null;
        }));
    }

    refreshActiveUser(): Observable<User> {
        return this.httpClient.get<any>(`${environment.apiBaseURL}/users/profile`, {withCredentials: true}).pipe(map(response => {
            this._setUser(response.user);
            return response.user;
        }));
    }

    updateProfile(firstName: string, lastName: string, newEmail: string, xAuthTokenArray: string[]): Observable<void> {
        let options: object;
        if (xAuthTokenArray !== null) {
            options = {
                headers: {
                    'x-auth-token': Base64.encode(xAuthTokenArray[0] + '\t' + xAuthTokenArray[1] + '\t' + xAuthTokenArray[2])
                },
                withCredentials: true
            };
        } else {
            options = {
                withCredentials: true
            };
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
        return this.httpClient.post<any>(`${environment.apiBaseURL}/users/profile`, {
            password
        }, {
            headers: {
                'x-auth-token': Base64.encode(xAuthTokenArray[0] + '\t' + xAuthTokenArray[1] + '\t' + xAuthTokenArray[2])
            },
            withCredentials: true
        }).pipe(map(response => {
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
        let options: object;
        if (xAuthTokenArray !== null) { // Already 2FA registered
            if (xAuthTokenArray.length === 1) { // Add 2FA
                options = {
                    headers: {
                        'x-auth-token': Base64.encode(xAuthTokenArray[0])
                    },
                    withCredentials: true
                };
            } else if (xAuthTokenArray.length === 3) { // Remove 2FA
                options = {
                    headers: {
                        'x-auth-token': Base64.encode(xAuthTokenArray[0] + '\t' + xAuthTokenArray[1] + '\t' + xAuthTokenArray[2])
                    },
                    withCredentials: true
                };
            }
        } else { // First time 2FA registering
            options = {
                withCredentials: true
            };
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
            this.cookieService.set(
                environment.authCookieName,
                response.token,
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
        }, {withCredentials: true}).pipe(map(response => {
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
        }).pipe(map(() => {
        }));
    }

    searchExistingUser(email: string): Observable<User> {
        return null;
    }

    logout(): Observable<void> {
        return of(null).pipe(map(() => {
            this.cookieService.delete(environment.authCookieName);
            this._setUser(null);
        }));
    }

    deleteAccount(xAuthTokenArray: string[]): Observable<void> {
        return this.httpClient.delete<any>(`${environment.apiBaseURL}/users/profile`, {
            headers: {
                'x-auth-token': Base64.encode(xAuthTokenArray[0] + '\t' + xAuthTokenArray[1] + '\t' + xAuthTokenArray[2])
            },
            withCredentials: true
        }).pipe(map(() => {
            this.logout();
        }));
    }

    userUpdated(): Observable<User> {
        return this._userUpdated$.asObservable();
    }

    getUserDevices(): Observable<Device[]> {
        return this.httpClient.get<any>(`${environment.apiBaseURL}/users/devices`, {withCredentials: true}).pipe(map(response => {
            return response.devices;
        }));
    }

    renameUserDevice(oldName: string, name: string): Observable<void> {
        return this.httpClient.patch<any>(`${environment.apiBaseURL}/users/devices/${oldName}`, {name},
            {withCredentials: true}).pipe(map(() => {
        }));
    }

    createUserDevice(name: string, browser: string, OS: string): Observable<void> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/users/devices`, {
            name,
            browser,
            OS
        }, {withCredentials: true}).pipe(map(() => {
        }));
    }


    private _setUser(user: User): void {
        localStorage.setItem('real_user', JSON.stringify(user));
        if (user) {
            this._userUpdated$.emit(user);
        }
    }
}
