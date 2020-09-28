import { Observable } from 'rxjs';
import { User } from 'src/app/models/users-api-models';

export interface UserService {
    getActiveUser(): User;
    getJwtToken(): string;
    register(user: User): Observable<User>;
    login(email: string, password: string): Observable<User>;
    logout(): Observable<void>;
    deleteAccount(): Observable<void>;
}