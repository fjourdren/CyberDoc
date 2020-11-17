import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {PasswordRecoveryPageComponent} from './pages/password-recovery-page/password-recovery-page.component';
import {ResetPasswordPageComponent} from './pages/reset-password-page/reset-password-page.component';
import {NotFoundPageComponent} from './pages/not-found-page/not-found-page.component';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {TwoFactorLoginPageComponent} from './pages/two-factor-login-page/two-factor-login-page.component';
import {RegisterPageComponent} from './pages/register-page/register-page.component';
import {LogoutPageComponent} from './pages/logout-page/logout-page.component';
import {FilesPageComponent} from './pages/files-page/files-page.component';
import {SettingsProfilePageComponent} from './pages/settings-profile-page/settings-profile-page.component';
import {SettingsSecurityPageComponent} from './pages/settings-security-page/settings-security-page.component';
import {LoggedInGuard} from './guards/logged-in/logged-in.guard';
import {LoggedOutGuard} from './guards/logged-out/logged-out.guard';
import {TwoFactorRegisterPageComponent} from './pages/two-factor-register-page/two-factor-register-page.component';
import {AuthorizedGuard} from './guards/authorized/authorized-guard.service';
import {TwoFactorGuard} from './guards/two-factor/two-factor-guard.service';
import {UnauthorizedGuard} from './guards/unauthorized/unauthorized-guard.service';
import {RequireTwoFactorGuard} from './guards/require-two-factor/require-two-factor-guard.service';
import { DevicePageComponent } from './pages/device-page/device-page.component';
import { DeviceGuard } from './guards/device/device.guard';
import { DeviceCheckGuard } from './guards/device-check/device-check.guard';
import { ExportRecoveryKeyPageComponent } from './pages/export-recovery-key-page/export-recovery-key-page.component';
import { RequireRecoveryKeyDownloadedGuard } from './guards/require-recovery-key-downloaded/require-recovery-key-downloaded.guard';


const routes: Routes = [

  {path: '', redirectTo: 'files', pathMatch: 'full'},
  {
    path: 'files-search/:searchParams',
    component: FilesPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard, TwoFactorGuard, RequireRecoveryKeyDownloadedGuard/*, DeviceCheckGuard*/]
  },
  {path: 'files/:dirID', component: FilesPageComponent, canActivate: [LoggedInGuard, AuthorizedGuard, TwoFactorGuard, RequireRecoveryKeyDownloadedGuard/*, DeviceCheckGuard*/]},
  {path: 'generateRecoveryCodes', component: FilesPageComponent, canActivate: [LoggedInGuard, AuthorizedGuard, TwoFactorGuard, RequireRecoveryKeyDownloadedGuard/*, DeviceCheckGuard*/]},
  {path: 'files', component: FilesPageComponent, canActivate: [LoggedInGuard, AuthorizedGuard, TwoFactorGuard, RequireRecoveryKeyDownloadedGuard/*, DeviceCheckGuard*/]},
  {path: 'shared-with-me', component: FilesPageComponent, canActivate: [LoggedInGuard, AuthorizedGuard, TwoFactorGuard, RequireRecoveryKeyDownloadedGuard/*, DeviceCheckGuard*/]},

  { path: 'logout', component: LogoutPageComponent, canActivate: [LoggedInGuard] },
  { path: 'login', component: LoginPageComponent, canActivate: [LoggedOutGuard] },
  { path: 'register', component: RegisterPageComponent, canActivate: [LoggedOutGuard] },
  { path: 'forgottenpassword', component: PasswordRecoveryPageComponent, canActivate: [LoggedOutGuard] },
  { path: 'passwordReset', component: ResetPasswordPageComponent, canActivate: [LoggedOutGuard] },
  { path: 'export-recovery-key', component: ExportRecoveryKeyPageComponent, canActivate: [/*LoggedInGuard, AuthorizedGuard, TwoFactorGuard*/] },
  { path: 'device', component: DevicePageComponent, canActivate: [LoggedInGuard, TwoFactorGuard/*, DeviceGuard*/] },
  {
    path: 'two-factor-register',
    component: TwoFactorRegisterPageComponent,
    canActivate: [LoggedInGuard, RequireTwoFactorGuard]
  },
  {
    path: 'two-factor',
    component: TwoFactorLoginPageComponent,
    canActivate: [LoggedInGuard, TwoFactorGuard, UnauthorizedGuard]
  },
  {path: 'settings', redirectTo: 'settings/profile', pathMatch: 'full'},
  {
    path: 'settings/profile',
    component: SettingsProfilePageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard, TwoFactorGuard, RequireRecoveryKeyDownloadedGuard/*, DeviceCheckGuard*/]
  },
  {
    path: 'settings/security',
    component: SettingsSecurityPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard, TwoFactorGuard, RequireRecoveryKeyDownloadedGuard/*, DeviceCheckGuard*/]
  },

  {path: '**', component: NotFoundPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
