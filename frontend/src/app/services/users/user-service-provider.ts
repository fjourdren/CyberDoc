import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MockUserService } from './mock-user-service';
import { RealUserService } from './real-user-service';
import { UserService } from './user-service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserServiceProvider {
    private _instances = new Map<string, UserService>();

    constructor(private httpClient: HttpClient, private cookieService: CookieService){}

    default(): UserService {
        return this.get(environment.defaultUserServiceName);
    }

    get(providerName: string): UserService {
        if (!this._instances.has(providerName)){
            this._instances.set(providerName, this._createInstance(providerName));
        }
        return this._instances.get(providerName);
    }

    private _createInstance(providerName: string){
        switch (providerName){
            case "mock":
                return new MockUserService();
            case "real":
                return new RealUserService(this.httpClient, this.cookieService);
            default:
                throw new Error(`Unknown UserService provider : ${providerName}`);
        }
    }
}