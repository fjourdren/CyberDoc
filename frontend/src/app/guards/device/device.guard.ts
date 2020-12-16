import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UsersService } from 'src/app/services/users/users.service';
import { UAParser } from 'ua-parser-js';

@Injectable({
  providedIn: 'root',
})
export class DeviceGuard implements CanActivate {
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
    if (!this.usersService.getActiveUser()) return false;

    return this.usersService
      .getUserDevices()
      .toPromise()
      .then((devices) => {
        const parser = new UAParser();
        let os = parser.getOS().name;
        if (parser.getDevice().model) {
          os = `${parser.getDevice().model} ${os}`;
        }

        for (const device of devices) {
          if (device.OS === os && device.browser === parser.getBrowser().name) {
            return this.router.parseUrl('/files');
          }
        }
        return true;
      });
  }
}
