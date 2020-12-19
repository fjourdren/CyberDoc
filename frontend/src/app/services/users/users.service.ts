import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { FileTag } from 'src/app/models/files-api-models';
import { User, Device } from 'src/app/models/users-api-models';
import { environment } from 'src/environments/environment';
import { SHA3 } from 'sha3';
import { Base64 } from 'js-base64';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private _userUpdated$ = new EventEmitter<User>();

  constructor(private httpClient: HttpClient) {}

  getActiveUser() {
    return JSON.parse(
      localStorage.getItem(environment.userLocalStorageKey),
    ) as User;
  }

  register(userObj: User, password: string) {
    return this.httpClient.post<void>(`${environment.apiBaseURL}/users`, {
      email: userObj.email,
      firstname: userObj.firstname,
      lastname: userObj.lastname,
      role: userObj.role,
      password,
    });
  }

  addTag(tag: FileTag) {
    return this.httpClient.post<void>(
      `${environment.apiBaseURL}/user-tags`,
      {
        name: tag.name,
        color: tag.hexColor,
      },
      { withCredentials: true },
    );
  }

  editTag(tag: FileTag) {
    return this.httpClient.patch<void>(
      `${environment.apiBaseURL}/user-tags/${tag._id}`,
      {
        name: tag.name,
        color: tag.hexColor,
      },
      { withCredentials: true },
    );
  }

  removeTag(tag: FileTag) {
    return this.httpClient.delete<void>(
      `${environment.apiBaseURL}/user-tags/${tag._id}`,
      {
        withCredentials: true,
      },
    );
  }

  refreshActiveUser(): Observable<User> {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/users/profile`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          this._setUser(response.user);
          return response.user;
        }),
      );
  }

  updateProfile(
    firstName: string,
    lastName: string,
    newEmail: string,
    currentPassword: string | undefined /*required only if email is changed*/,
  ) {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/users/profile`,
        {
          email: newEmail,
          firstname: firstName,
          lastname: lastName,
          currentPassword,
        },
        { withCredentials: true },
      )
      .pipe(mergeMap(() => this.refreshActiveUser()));
  }

  updatePassword(
    password: string,
    xAuthTokenArray: string[],
  ): Observable<void> {
    const options = {
      withCredentials: true,
      headers: {
        'x-auth-token': Base64.encode(
          xAuthTokenArray[0] +
            '\t' +
            xAuthTokenArray[1] +
            '\t' +
            xAuthTokenArray[2],
        ),
      },
    };

    return this.httpClient.post<any>(
      `${environment.apiBaseURL}/users/profile`,
      {
        password,
      },
      options,
    );
  }

  updateTwoFactor(
    twoFactorApp: boolean,
    twoFactorSms: boolean,
    secret: string,
    phoneNumber: string,
    xAuthTokenArray: string[],
  ): Observable<void> {
    const options = { withCredentials: true };
    if (xAuthTokenArray && xAuthTokenArray.length === 3) {
      options['headers'] = {
        'x-auth-token': Base64.encode(
          xAuthTokenArray[0] +
            '\t' +
            xAuthTokenArray[1] +
            '\t' +
            xAuthTokenArray[2],
        ),
      };
    } else if (xAuthTokenArray && xAuthTokenArray.length === 1) {
      options['headers'] = {
        'x-auth-token': Base64.encode(xAuthTokenArray[0]),
      };
    }
    return this.httpClient.post<any>(
      `${environment.apiBaseURL}/users/profile`,
      {
        twoFactorApp,
        twoFactorSms,
        secret,
        phoneNumber,
      },
      options,
    );
  }

  login(email: string, password: string) {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/auth/login`,
        {
          username: email,
          password,
        },
        { withCredentials: true },
      )
      .pipe(mergeMap(() => this.refreshActiveUser()));
  }

  validatePassword(password: string): Observable<boolean> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/auth/validatepassword`,
        {
          password,
        },
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          return response.success;
        }),
      );
  }

  recoverPassword(email: string): Observable<void> {
    return this.httpClient.post<any>(
      `${environment.apiBaseURL}/auth/forgottenPassword`,
      {
        email,
      },
    );
  }

  resetPassword(
    resetPasswordJWTToken: string,
    password: string,
  ): Observable<void> {
    console.warn('Authorization', `Bearer ${resetPasswordJWTToken}`);
    return this.httpClient.post<any>(
      `${environment.apiBaseURL}/users/profile`,
      {
        password,
      },
      {
        headers: {
          Authorization: `Bearer ${resetPasswordJWTToken}`,
        },
        withCredentials: true,
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchExistingUser(email: string): Observable<User> {
    return null;
  }

  logout(): Observable<void> {
    return of(null).pipe(
      map(() => {
        this._setUser(null);
      }),
    );
  }

  deleteAccount(xAuthTokenArray: string[]): Observable<void> {
    return this.httpClient.delete<any>(
      `${environment.apiBaseURL}/users/profile`,
      {
        headers: {
          'x-auth-token': Base64.encode(
            xAuthTokenArray[0] +
              '\t' +
              xAuthTokenArray[1] +
              '\t' +
              xAuthTokenArray[2],
          ),
        },
        withCredentials: true,
      },
    );
  }

  userUpdated(): Observable<User> {
    return this._userUpdated$.asObservable();
  }

  getUserDevices(): Observable<Device[]> {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/users/devices`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          return response.devices;
        }),
      );
  }

  renameUserDevice(oldName: string, name: string): Observable<void> {
    return this.httpClient.patch<any>(
      `${environment.apiBaseURL}/users/devices/${oldName}`,
      { name },
      { withCredentials: true },
    );
  }

  createUserDevice(
    name: string,
    browser: string,
    OS: string,
  ): Observable<void> {
    return this.httpClient.post<any>(
      `${environment.apiBaseURL}/users/devices`,
      { name, browser, OS },
      { withCredentials: true },
    );
  }

  exportRecoveryKey(): Observable<string> {
    return this.httpClient.get(`${environment.apiBaseURL}/users/keys`, {
      responseType: 'text',
      withCredentials: true,
    });
  }

  importRecoveryKey(
    email: string,
    password: string,
    file: File,
    resetPasswordJWTToken: string,
  ) {
    const hash = new SHA3(512); //FIXME constant keySize
    hash.update(email + password);

    const formData = new FormData();
    formData.set('upfile', file);
    formData.set('user_hash', hash.digest('hex').substring(0, 32));
    return this.httpClient.post<void>(
      `${environment.apiBaseURL}/users/keys`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${resetPasswordJWTToken}`,
        },
        withCredentials: true,
      },
    );
  }

  getDataExportURL(): string {
    return `${environment.apiBaseURL}/users/exportData`;
  }

  private _setUser(user: User) {
    localStorage.setItem(environment.userLocalStorageKey, JSON.stringify(user));
    if (user) {
      this._userUpdated$.emit(user);
    }
  }
}
