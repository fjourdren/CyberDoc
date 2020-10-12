import { HttpClient } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { FileTag } from 'src/app/models/files-api-models';
import { User } from 'src/app/models/users-api-models';
import { UserService } from './user-service';
import { JwtHelperService } from "@auth0/angular-jwt";
import { CookieService } from 'ngx-cookie-service';

const BASE_URL = "http://localhost:3000/v1";
const JWT_COOKIE_NAME = "access_token";
const LOCALSTORAGE_USER_KEY = "real_user";

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
            //FIXME
            return JSON.parse(localStorage.getItem("real_user")) as User;
        }
    }

    getJwtToken(): string {
        return this.cookieService.get(JWT_COOKIE_NAME);
    }

    register(user: User, password: string): Observable<User> {
        return this.httpClient.post<any>(`${BASE_URL}/auth/signup`, {
            "email": user.email,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "role": user.role,
            "password": password
        }).pipe(map(response => {
            return response.user as User;
        }));
    }

    addTag(tag: FileTag): Observable<void> {
        return this.httpClient.post<any>(`${BASE_URL}/users/tags`, {
            "name": tag.name,
            "color": tag.hexColor,
        }, { withCredentials: true }).pipe(map(response => {
            return null;
        }));
    }

    editTag(tag: FileTag): Observable<void> {
        return this.httpClient.patch<any>(`${BASE_URL}/users/tags/${tag._id}`, {
            "name": tag.name,
            "color": tag.hexColor,
        }, { withCredentials: true }).pipe(map(response => {
            return null;
        }));
    }

    removeTag(tag: FileTag): Observable<void> {
        return this.httpClient.delete<any>(`${BASE_URL}/users/tags/${tag._id}`, { withCredentials: true }).pipe(map(response => {
            return null;
        }));
    }

    refreshActiveUser(): Observable<User> {
        return this.httpClient.get<any>(`${BASE_URL}/users/profile`, { withCredentials: true }).pipe(map(response => {
            this._setUser(response.user);
            return response.user;
        }));
    }

    updateProfile(firstName: string, lastName: string, newEmail: string, oldEmail: string): Observable<void> {
        throw new Error('Method not implemented.');
    }

    updatePassword(oldPassword: string, newPassword: string, email: string) {
        throw new Error('Method not implemented.');
    }

    login(email: string, password: string): Observable<User> {
        return this.httpClient.post<any>(`${BASE_URL}/auth/signin`, {
            "email": email,
            "password": password
        }).pipe(map(response => {
            this._userUpdated$.emit();
            this.cookieService.set(JWT_COOKIE_NAME, response.token, this._jwtHelper.getTokenExpirationDate(response.token));
            this._setUser(this._jwtHelper.decodeToken(response.token).user);
            return this.getActiveUser();
        }));
    }

    logout(): Observable<void> {
        return of(null).pipe(map(() => {
            this.cookieService.delete(JWT_COOKIE_NAME);
            this._setUser(null);
        }))
    }

    deleteAccount(): Observable<void> {
        return this.httpClient.delete<any>(`${BASE_URL}/users/profile`, { withCredentials: true })
            .pipe(map(response => {
                this.cookieService.delete(JWT_COOKIE_NAME);
                this._setUser(null);
            }));
    }

    userUpdated(): Observable<User> {
        return this._userUpdated$.asObservable();
    }

    private _setUser(user: User) {
        localStorage.setItem("real_user", JSON.stringify(user));
        this._userUpdated$.emit(user);
    }

}