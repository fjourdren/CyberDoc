import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RealTwoFactorService } from './real-twofactor-service';
import { MockTwoFactorService } from './mock-twofactor-service';
import { TwoFactorService } from './twofactor-service';

const DEFAULT_USER_SERVICE_PROVIDER_NAME = "real";

@Injectable({
    providedIn: 'root'
})
export class TwoFactorServiceProvider {
    private _instances = new Map<string, TwoFactorService>();

    constructor(private httpClient: HttpClient){}

    default(): TwoFactorService {
        return this.get(DEFAULT_USER_SERVICE_PROVIDER_NAME);
    }

    get(providerName: string): TwoFactorService {
        if (!this._instances.has(providerName)){
            this._instances.set(providerName, this._createInstance(providerName));
        }
        return this._instances.get(providerName);
    }

    private _createInstance(providerName: string){
        switch (providerName){
            case "mock":
                return new MockTwoFactorService();
            case "real":
                return new RealTwoFactorService(this.httpClient);
            default:
                throw new Error(`Unknown UserService provider : ${providerName}`);
        }
    }
}