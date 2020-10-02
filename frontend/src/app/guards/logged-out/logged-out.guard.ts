import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

@Injectable({
  providedIn: 'root'
})
export class LoggedOutGuard implements CanActivate {

  constructor(private userServiceProvider: UserServiceProvider) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (!this.userServiceProvider.default().getActiveUser()) {
      return true;
    } else {
      return this.userServiceProvider.default().logout().toPromise().then(() => true).catch((err) => {
        //TODO better error management
        console.error(err);
        return true;
      });
    }
  }

}
