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
export class UnauthorizedGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private twoFactorService: TwoFactorService,
    private router: Router,
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
    if (activeUser) {
      // Case "No 2FA configured"
      if (
        !activeUser.twoFactorApp &&
        !activeUser.twoFactorSms &&
        !activeUser.twoFactorEmail
      ) {
        return this.router.parseUrl('/files');
      } else {
        // Case at least 1 2FA configured
        return this.twoFactorService
          .isTwoFactorAuthorized()
          .toPromise()
          .then((res) => {
            if (res) {
              return this.router.parseUrl('/files');
            } else {
              return true;
            }
          });
      }
    }
  }
}
