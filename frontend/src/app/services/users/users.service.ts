import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { FileTag } from 'src/app/models/files-api-models';
import { Session, User } from 'src/app/models/users-api-models';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogComponent } from 'src/app/components/global/loading-dialog/loading-dialog.component';

declare let Stripe: any;

const FORCE_USER_REFRESH_URL_HASH = 'forceUserRefresh';
export const DEFAULT_THEME = 'indigo-pink';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private _userUpdated$ = new EventEmitter<User>();
  private stripe: any;

  constructor(private httpClient: HttpClient, private dialog: MatDialog) {
    this.stripe = Stripe(environment.stripePublicKey);
  }

  getActiveUser() {
    return JSON.parse(
      localStorage.getItem(environment.userLocalStorageKey),
    ) as User;
  }

  register(userObj: User, password: string) {
    return this.httpClient.post<void>(`${environment.apiBaseURL}/users`, {
      email: userObj.email.toLowerCase(),
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
          this.setTheme(response.user.theme);
          return response.user;
        }),
      );
  }

  setTheme(theme: string) {
    if (theme !== localStorage.getItem('theme')) {
      localStorage.setItem('theme', theme);
      this.dialog.open(LoadingDialogComponent, {
        width: '96px',
        height: '96px',
      });
      location.reload();
    }
  }

  updateProfile(
    firstName: string | undefined,
    lastName: string | undefined,
    newEmail: string | undefined,
    theme: string | undefined,
    currentPassword: string | undefined,
    newPassword: string | undefined,
    phoneNumber: string | undefined,
  ) {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/users/profile`,
        {
          email: newEmail,
          firstname: firstName,
          lastname: lastName,
          currentPassword,
          newPassword,
          theme,
          phoneNumber,
        },
        { withCredentials: true },
      )
      .pipe(mergeMap(() => this.refreshActiveUser()));
  }

  updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Observable<void> {
    const options = {
      withCredentials: true,
    };

    return this.httpClient.post<any>(
      `${environment.apiBaseURL}/users/profile`,
      {
        currentPassword,
        newPassword,
      },
      options,
    );
  }

  enableTwoFactor(type: string, twoFactorToken: string): Observable<void> {
    const options = { withCredentials: true };
    return this.httpClient.post<any>(
      `${environment.apiBaseURL}/two-factor-auth/enable`,
      {
        type,
        twoFactorToken,
      },
      options,
    );
  }

  disableTwoFactor(type: string, twoFactorToken: string): Observable<void> {
    const options = { withCredentials: true };
    return this.httpClient.post<any>(
      `${environment.apiBaseURL}/two-factor-auth/disable`,
      {
        type,
        twoFactorToken,
      },
      options,
    );
  }

  login(email: string, password: string): any {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/auth/login`,
        {
          username: email.toLowerCase(),
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

  logout(): Observable<void> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        map(() => {
          this._setUser(null);
        }),
      );
  }

  getActiveSessions() {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/auth/active-sessions`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          return response.sessions as Session[];
        }),
      );
  }

  terminateSession(hashedJWT: string) {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/auth/terminate-session`,
        { hashedJWT },
        {
          withCredentials: true,
        },
      )
      .pipe(
        map(() => {
          return null;
        }),
      );
  }

  deleteAccount(): Observable<void> {
    return this.httpClient.delete<any>(
      `${environment.apiBaseURL}/users/profile`,
      {
        withCredentials: true,
      },
    );
  }

  userUpdated(): Observable<User> {
    if (location.hash === `#${FORCE_USER_REFRESH_URL_HASH}`) {
      location.hash = '';
      this.refreshActiveUser()
        .toPromise()
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .then(() => {});
    }

    return this._userUpdated$.asObservable();
  }

  getDataExportURL(): string {
    return `${environment.apiBaseURL}/users/exportData`;
  }

  goToStripeCustomPortal() {
    this.httpClient
      .get<any>(`${environment.apiBaseURL}/billing/customer-portal-url`, {
        withCredentials: true,
      })
      .toPromise()
      .then((response) => response.customerPortalURL as string)
      .then((customerPortalURL) => location.replace(customerPortalURL));
  }

  setupSubscription(planId: string) {
    this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/billing/create-checkout-session`,
        {
          planId,
        },
        {
          withCredentials: true,
        },
      )
      .toPromise()
      .then((response) => response.sessionId as string)
      .then((sessionId) => this.stripe.redirectToCheckout({ sessionId }));
  }

  _setUser(user: User) {
    localStorage.setItem(environment.userLocalStorageKey, JSON.stringify(user));
    if (user) {
      this._userUpdated$.emit(user);
    }
  }
}
