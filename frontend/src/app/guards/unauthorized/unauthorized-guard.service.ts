import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UsersService } from 'src/app/services/users/users.service';

@Injectable({
  providedIn: 'root',
})
export class UnauthorizedGuard implements CanActivate {
  private jwtHelper = new JwtHelperService();

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
    if (
      this.usersService.getJwtToken() &&
      this.jwtHelper.decodeToken(this.usersService.getJwtToken()).authorized ===
        false
    ) {
      return true;
    } else {
      return this.router.parseUrl('/files');
    }
  }
}
