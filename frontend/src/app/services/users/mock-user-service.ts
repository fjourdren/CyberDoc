import { UserService } from './user-service';

import { Observable, of } from 'rxjs';
import { User } from 'src/app/models/users-api-models';
import { delay, map } from 'rxjs/operators';
import { EventEmitter } from '@angular/core';
import { FileTag } from 'src/app/models/files-api-models';
import { HttpErrorResponse } from '@angular/common/http';

const LOCALSTORAGE_KEY = "auth-token";
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InJvbGUiOiJjb2xsYWJvcmF0ZXIiLCJ1cGRhdGVkX2F0IjoiMjAyMC0wOS0yMlQxMTozMToyMC43MTRaIiwiY3JlYXRlZF9hdCI6IjIwMjAtMDktMjJUMTE6MzA6NTQuNTU2WiIsIl9pZCI6IjY1YWY4OGUwLTRkNmYtODBkYS0xY2FiLTZlZjVkYjJjNzE5ZSIsImZpcnN0bmFtZSI6IkZsYXZpZW4iLCJsYXN0bmFtZSI6IkpPVVJEUkVOIiwiZW1haWwiOiJmbGF2aWVuLmpvdXJkcmVuQGdtYWlsLmNvbSJ9LCJpYXQiOjE2MDA3NzQyODMsImV4cCI6MTYwMDg2MDY4M30.kHhr6DWSg1ZLkmBFH5FTLbDtTpoX9HGKv0ewmUkQFK8";
const DELAY = 500;
let nextID = 0;
const USER: User = {
    "role": "owner",
    "updated_at": "2020-09-22T11:31:20.714Z",
    "created_at": "2020-09-22T11:30:54.556Z",
    "_id": "65af88e0-4d6f-80da-1cab-6ef5db2c719e",
    "firstname": "Flavien",
    "lastname": "JOURDREN",
    "email": "flavien.jourdren@gmail.com",
    "rootDirectoryID": "root",
    "fileTags": [
        {
            "id": "65af88e0-4d6f-80da-1cab-6ef5db2c7188",
            "name": "TODO",
            "hexColor": "#FF0000"
        },
        {
            "id": "65af88e0-4d6f-80da-1cab-6ef5db2c7177",
            "name": "In progress",
            "hexColor": "#00FF00"
        },
        {
            "id": "65af88e0-4d6f-80da-1cab-6ef5db2c7199",
            "name": "In test",
            "hexColor": "#0000FF"
        },
        {
            "id": "65af88e0-4d6f-80da-1cab-6ef5db2c7166",
            "name": "Done",
            "hexColor": "#cccccc"
        },
    ]
}

export class MockUserService implements UserService {
    private _users = new Map<string, User>(); //email -> user
    private _passwords = new Map<string, string>(); //email -> password
    private _userUpdated$ = new EventEmitter<User>();

    constructor() {
        localStorage.setItem(LOCALSTORAGE_KEY, JWT_TOKEN);
        this._load();
    }

    userUpdated(): Observable<User> {
        return this._userUpdated$.asObservable();
    }

    getJwtToken(): string {
        return localStorage.getItem(LOCALSTORAGE_KEY);
    }

    getActiveUser(): User {
        return this._getUser();
    }

    register(user: User, password: string): Observable<User> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            if (this.getActiveUser()) {
                this._throw403("already logged in");
            }

            if (this._users.has(user.email)) {
                throw new HttpErrorResponse({
                    error: "already existing user",
                    statusText: 'CONFLICT',
                    status: 409,
                    url: '/fake-url'
                });
            }

            user._id = `${nextID++}`;
            user.rootDirectoryID = "other.root";
            user.created_at = new Date().toISOString();
            user.updated_at = new Date().toISOString();

            this._users.set(user.email, user);
            this._passwords.set(user.email, password);
            this._setUser(null);
            this._save();
            return user;
        }));
    }

    updateProfile(firstName: string, lastName: string, newEmail: string, oldEmail: string) {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            if (!this.getActiveUser()) {
                this._throw403("already logged in");
            }

            const user = this._users.get(oldEmail);
            const pass = this._passwords.get(oldEmail);
            user.firstname = firstName;
            user.lastname = lastName;
            user.email = newEmail;
            this._users.delete(oldEmail);
            this._passwords.delete(oldEmail);
            this._users.set(newEmail, user);
            this._passwords.set(newEmail, pass);
            this._save();
            this._setUser(user);
        }));
    }

    updateTags(tags: FileTag[]) {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            if (!this.getActiveUser()) {
                this._throw403("already logged in");
            }

            const user = this.getActiveUser();
            user.fileTags = tags;
            this._users.set(user.email, user);
            this._save();
            this._setUser(user);
        }));
    }

    updatePassword(oldPassword: string, newPassword: string, email: string) {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            if (!this.getActiveUser()) {
                this._throw403("already logged in");
            }

            const pass = this._passwords.get(email);
            if (pass !== oldPassword) {
                this._throw403("wrong password");
            }

            this._passwords.set(email, newPassword);
            this._save();
        }));
    }

    login(email: string, password: string): Observable<User> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            if (this.getActiveUser()) {
                this._throw403("already logged in");
            }

            for (const user of this._users.values()) {
                if (user.email === email) {
                    const pass = this._passwords.get(email);
                    if (pass !== password) {
                        this._throw404("wrong email or password");
                    }
                    this._setUser(user);
                    this._save();
                    return user;
                }
            }

            this._throw404("wrong email or password");
        }));
    }

    logout(): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            if (!this.getActiveUser()) {
                this._throw403("already logged in");
            }

            this._setUser(null);
            this._save();
        }));
    }

    deleteAccount(): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            if (!this.getActiveUser()) {
                this._throw403("already logged in");
            }

            const user = this.getActiveUser();
            this._users.delete(user.email);
            this._passwords.delete(user.email);
            this._setUser(null);
            this._save();
        }));
    }

    private _getUser(): User {
        const val = JSON.parse(localStorage.getItem("__currentUser"));
        if (val === "null") {
            return null;
        } else {
            return val as User;
        }
    }

    private _setUser(user: User) {
        if (user) {
            localStorage.setItem("__currentUser", JSON.stringify(user));
        } else {
            localStorage.setItem("__currentUser", JSON.stringify("null"));
        }
        this._userUpdated$.emit(user);
    }

    private _save() {
        localStorage.setItem("__users", JSON.stringify(Array.from(this._users.entries())))
        localStorage.setItem("__passwords", JSON.stringify(Array.from(this._passwords.entries())))
    }

    private _load() {
        this._users = new Map(JSON.parse(localStorage.getItem("__users")));
        this._passwords = new Map(JSON.parse(localStorage.getItem("__passwords")));

        if (!this._users || this._users.size === 0) {
            this._users = new Map();
            this._passwords = new Map();
            this._users.set(USER.email, USER);
            this._passwords.set(USER.email, "Chb44xw@@Q");
            this._save();
        }
    }

    private _throw404(error: string){
        throw new HttpErrorResponse({
            error: error,
            statusText: 'NOT FOUND',
            status: 404,
            url: '/fake-url'
        });
    }

    private _throw403(error: string){
        throw new HttpErrorResponse({
            error: error,
            statusText: 'FORBIDDEN',
            status: 403,
            url: '/fake-url'
        });
    }

}
