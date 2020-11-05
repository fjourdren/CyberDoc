import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {UserServiceProvider} from 'src/app/services/users/user-service-provider';

@Injectable({
    providedIn: 'root'
})
export class TwoFactorGuard implements CanActivate {
    constructor(private userServiceProvider: UserServiceProvider,
                private router: Router) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (!this.userServiceProvider.default().getActiveUser()) return false;

        if (this.userServiceProvider.default().getActiveUser().twoFactorApp ||
            this.userServiceProvider.default().getActiveUser().twoFactorSms ||
            this.userServiceProvider.default().getActiveUser().twoFactorEmail) {
                return true;
        } else {
            return this.router.parseUrl('/two-factor-register');
        }
    }
}
