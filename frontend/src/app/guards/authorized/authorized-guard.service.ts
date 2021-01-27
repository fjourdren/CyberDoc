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
import { TwoFactorService } from '../../services/twofactor/twofactor.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorizedGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly twoFactorService: TwoFactorService,
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
    const activeUser = this.usersService.getActiveUser();
    // Case "No 2FA configured"
    if (
      !activeUser.twoFactorApp &&
      !activeUser.twoFactorSms &&
      !activeUser.twoFactorEmail
    ) {
      return true;
    } else {
      // Case at least 1 2FA configured
      return this.twoFactorService
        .isTwoFactorAuthorized()
        .toPromise()
        .then(() => {
          return true;
        })
        .catch(() => {
          return this.router.parseUrl('/two-factor');
        });
    }
  }
}
