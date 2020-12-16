import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

@Injectable({
  providedIn: 'root',
})
export class AuthorizedGuard implements CanActivate {
  constructor(
    private readonly userServiceProvider: UserServiceProvider,
    private readonly router: Router,
  ) {}

  canActivate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    route: ActivatedRouteSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    //TODO replace Promise.resolve
    const isTwoFactorAuthOKPromise = Promise.resolve(
      this.userServiceProvider.default().getActiveUser() != undefined,
    );
    return isTwoFactorAuthOKPromise.then((isTwoFactorAuthOK) => {
      if (isTwoFactorAuthOK) {
        return true;
      } else {
        return this.router.parseUrl('/two-factor');
      }
    });
  }
}
