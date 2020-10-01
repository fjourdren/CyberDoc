import { Observable } from 'rxjs';
import { User } from 'src/app/models/users-api-models';

export interface UserService {
    getActiveUser(): User;
    getJwtToken(): string;
    register(user: User): Observable<User>;
    updateProfile(firstName: string, lastName: string, newEmail: string, oldEmail: string): Observable<void>;
    updatePassword(oldPassword: string, newPassword: string, email: string)
    login(email: string, password: string): Observable<User>;
    logout(): Observable<void>;
    deleteAccount(): Observable<void>;
}