import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { UAParser } from 'ua-parser-js';

@Injectable({
  providedIn: 'root'
})
export class DeviceGuard implements CanActivate {
  constructor(private userServiceProvider: UserServiceProvider,
    private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.userServiceProvider.default().getActiveUser()) return false;

    return this.userServiceProvider.default().getUserDevices().toPromise().then(devices => {
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
