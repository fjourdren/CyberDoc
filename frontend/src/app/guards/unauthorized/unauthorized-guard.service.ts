import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {UserServiceProvider} from 'src/app/services/users/user-service-provider';
import {JwtHelperService} from '@auth0/angular-jwt';

@Injectable({
    providedIn: 'root'
})
export class UnauthorizedGuard implements CanActivate {
    private jwtHelper = new JwtHelperService();

    constructor(private userServiceProvider: UserServiceProvider,
                private router: Router) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (this.userServiceProvider.default().getJwtToken() &&
            this.jwtHelper.decodeToken(this.userServiceProvider.default().getJwtToken()).authorized === false) {
            return true;
        } else {
            return this.router.parseUrl('/files');
        }
    }
}
