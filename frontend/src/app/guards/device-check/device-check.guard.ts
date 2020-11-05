import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Device } from 'src/app/models/users-api-models';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { UAParser } from 'ua-parser-js';

@Injectable({
  providedIn: 'root'
})
export class DeviceCheckGuard implements CanActivate {

  constructor(private userServiceProvider: UserServiceProvider,
    private router: Router) {
    }

    device: Device;
    resultat: Device[];
    //parser = new UAParser();

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      return this.userServiceProvider.default().getUserDevices().toPromise().then(result => {  
        this.resultat= result;
        const parser = new UAParser();
        for(this.device of result){
          const OS=parser.getDevice().model+" "+parser.getOS().name;
          if(this.device.OS===OS && this.device.browser===parser.getBrowser().name){
            return true;
          }
        }
        return this.router.parseUrl('/device');
      });
  }

  
  
}
