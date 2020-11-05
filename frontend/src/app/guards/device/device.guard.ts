import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Device } from 'src/app/models/users-api-models';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import {UAParser} from 'ua-parser-js';

@Injectable({
  providedIn: 'root'
})
export class DeviceGuard implements CanActivate {
  constructor(private userServiceProvider: UserServiceProvider,
    private router: Router) {
    }

    private device: Device;
    private resultat: Device[];
    
    
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.userServiceProvider.default().getUserDevices().toPromise().then(result => {  
        const parser = new UAParser();
        this.resultat= result;
        
        for(this.device of result){
          const OS=parser.getDevice().model+" "+parser.getOS().name;
          if(this.device.OS===OS && this.device.browser===parser.getBrowser().name){
            return this.router.parseUrl('/files');
          }
        }
        return true;
      });

    
  }
  
}
