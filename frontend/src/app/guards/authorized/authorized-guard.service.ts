import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UsersService } from 'src/app/services/users/users.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorizedGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
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
      this.usersService.getActiveUser() != undefined,
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
