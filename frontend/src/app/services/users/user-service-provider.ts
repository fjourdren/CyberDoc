import { Injectable } from '@angular/core';
import { MockUserService } from './mock-user-service';
import { UserService } from './user-service';

const DEFAULT_USER_SERVICE_PROVIDER_NAME = "mock";

@Injectable({
    providedIn: 'root'
})
export class UserServiceProvider {
    private _instances = new Map<string, UserService>();

    constructor(){}

    default(): UserService {
        return this.get(DEFAULT_USER_SERVICE_PROVIDER_NAME);
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
            default:
                throw new Error(`Unknown UserService provider : ${providerName}`);
        }
    }
}