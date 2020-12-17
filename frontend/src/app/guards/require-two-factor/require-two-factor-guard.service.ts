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
export class RequireTwoFactorGuard implements CanActivate {
  constructor(private usersService: UsersService, private router: Router) {}

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
    //TODO
    if (!this.usersService.getActiveUser()) return false;

    if (
      !this.usersService.getActiveUser().twoFactorApp &&
      !this.usersService.getActiveUser().twoFactorSms
    ) {
      return true;
    } else {
      return this.router.parseUrl('/files');
    }
  }
}
