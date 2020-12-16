import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { UAParser } from 'ua-parser-js';

@Injectable({
  providedIn: 'root',
})
export class DeviceCheckGuard implements CanActivate {
  constructor(
    private userServiceProvider: UserServiceProvider,
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
    if (!this.userServiceProvider.default().getActiveUser()) return false;

    return this.userServiceProvider
      .default()
      .getUserDevices()
      .toPromise()
      .then((devices) => {
        const parser = new UAParser();
        for (const device of devices) {
          let os = parser.getOS().name;
          if (parser.getDevice().model) {
            os = `${parser.getDevice().model} ${os}`;
          }

          if (device.OS === os && device.browser === parser.getBrowser().name) {
            return true;
          }
        }
        return this.router.parseUrl('/device');
      });
  }
}
