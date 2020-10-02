import { UserService } from './user-service';

import { Observable, of } from 'rxjs';
import { User } from 'src/app/models/users-api-models';
import { delay } from 'rxjs/operators';

const LOCALSTORAGE_KEY = "auth-token";
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InJvbGUiOiJjb2xsYWJvcmF0ZXIiLCJ1cGRhdGVkX2F0IjoiMjAyMC0wOS0yMlQxMTozMToyMC43MTRaIiwiY3JlYXRlZF9hdCI6IjIwMjAtMDktMjJUMTE6MzA6NTQuNTU2WiIsIl9pZCI6IjY1YWY4OGUwLTRkNmYtODBkYS0xY2FiLTZlZjVkYjJjNzE5ZSIsImZpcnN0bmFtZSI6IkZsYXZpZW4iLCJsYXN0bmFtZSI6IkpPVVJEUkVOIiwiZW1haWwiOiJmbGF2aWVuLmpvdXJkcmVuQGdtYWlsLmNvbSJ9LCJpYXQiOjE2MDA3NzQyODMsImV4cCI6MTYwMDg2MDY4M30.kHhr6DWSg1ZLkmBFH5FTLbDtTpoX9HGKv0ewmUkQFK8";
const DELAY = 500;
const USER: User = {
    "role": "owner",
    "updated_at": "2020-09-22T11:31:20.714Z",
    "created_at": "2020-09-22T11:30:54.556Z",
    "_id": "65af88e0-4d6f-80da-1cab-6ef5db2c719e",
    "firstname": "Flavien",
    "lastname": "JOURDREN",
    "email": "flavien.jourdren@gmail.com",
    "rootDirectoryID": "root",
}

export class MockUserService implements UserService {
    private _activeUser: User;
    private _users = new Map<string, User>(); //email -> user

    constructor() {
        localStorage.setItem(LOCALSTORAGE_KEY, JWT_TOKEN);
        this._users.set(USER.email, USER);
        if (localStorage.getItem("__currentUser") == undefined) {
            localStorage.setItem("__currentUser", JSON.stringify(USER));
        }
        this._activeUser = USER;
    }

    getJwtToken(): string {
        return localStorage.getItem(LOCALSTORAGE_KEY);
    }

    getActiveUser(): User {
        const val = JSON.parse(localStorage.getItem("__currentUser"));
        if (val === "null") {
            return null;
        } else {
            return val as User;
        }
    }

    register(user: User): Observable<User> {
        if (this._users.has(user.email)) {
            throw new Error("409 already existing user");
        }

        this._users.set(user.email, user);
        return of(user).pipe(delay(DELAY));
    }

    updateProfile(firstName: string, lastName: string, newEmail: string, oldEmail: string) {
        if (!this._activeUser) {
            throw new Error("403 not logged in");
        }

        const user = this._users.get(oldEmail);
        if (user) { 
            user.firstname = firstName;
            user.lastname = lastName;
            user.email = newEmail;
            this._users.delete(oldEmail);
            this._users.set(newEmail, user);
            localStorage.setItem("__currentUser", JSON.stringify(user))
            return of(null).pipe(delay(DELAY));
        } else throw new Error("Account doesn't exist");
    }

    updatePassword(oldPassword: string, newPassword: string, email: string) {
        if (!this._activeUser) {
            throw new Error("403 not logged in");
        }

        const user = this._users.get(email);
        if (user != undefined) { 
            // TODO : Changer le mdp
            return of(null).pipe(delay(DELAY));
        } else throw new Error("Account doesn't exist");
    }

    login(email: string, password: string): Observable<User> {
        for (const user of this._users.values()) {
            if (user.email === email) {
                return of(user).pipe(delay(DELAY));
            }
        }
        throw new Error("404 not found");
    }

    logout(): Observable<void> {
        localStorage.setItem("__currentUser", JSON.stringify("null"));
        return of(null).pipe(delay(DELAY));
    }

    deleteAccount(): Observable<void> {
        if (!this._activeUser) {
            throw new Error("403 not logged in");
        }

        this._users.delete(this._activeUser.email);
        this._activeUser = null;
        return of(null).pipe(delay(DELAY)).pipe();
    }
}