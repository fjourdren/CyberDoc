import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PasswordRecoveryPageComponent } from './pages/password-recovery-page/password-recovery-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { TwoFactorLoginPageComponent } from './pages/two-factor-login-page/two-factor-login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { LogoutPageComponent } from './pages/logout-page/logout-page.component';
import { FilesPageComponent } from './pages/files-page/files-page.component';
import { SettingsProfilePageComponent } from './pages/settings-profile-page/settings-profile-page.component';
import { SettingsSecurityPageComponent } from './pages/settings-security-page/settings-security-page.component';
import { LoggedInGuard } from './guards/logged-in/logged-in.guard';
import { LoggedOutGuard } from './guards/logged-out/logged-out.guard';
import { AuthorizedGuard } from './guards/authorized/authorized-guard.service';
import { UnauthorizedGuard } from './guards/unauthorized/unauthorized-guard.service';
import { ExportRecoveryKeyPageComponent } from './pages/export-recovery-key-page/export-recovery-key-page.component';
import { FilePreviewPageComponent } from './pages/file-preview-page/file-preview-page.component';
import { SetupBillingPageComponent } from './pages/setup-billing-page/setup-billing-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'files', pathMatch: 'full' },
  {
    path: 'preview/:fileID',
    component: FilePreviewPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard],
  },
  {
    path: 'setup-billing',
    component: SetupBillingPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard],
  },
  {
    path: 'files-search/:searchParams',
    component: FilesPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard],
  },
  {
    path: 'files/:dirID',
    component: FilesPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard],
  },
  {
    path: 'files',
    component: FilesPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard],
  },
  {
    path: 'shared-with-me',
    component: FilesPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard],
  },
  {
    path: 'bin',
    component: FilesPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard],
  },
  {
    path: 'generateRecoveryCodes',
    component: FilesPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard],
  },

  {
    path: 'logout',
    component: LogoutPageComponent,
    canActivate: [LoggedInGuard],
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [LoggedOutGuard],
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [LoggedOutGuard],
  },
  {
    path: 'forgottenpassword',
    component: PasswordRecoveryPageComponent,
    canActivate: [LoggedOutGuard],
  },
  {
    path: 'passwordReset',
    component: ResetPasswordPageComponent,
    canActivate: [LoggedOutGuard],
  },
  {
    path: 'export-recovery-key',
    component: ExportRecoveryKeyPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard],
  },
  {
    path: 'two-factor',
    component: TwoFactorLoginPageComponent,
    canActivate: [LoggedInGuard, UnauthorizedGuard],
  },
  { path: 'settings', redirectTo: 'settings/profile', pathMatch: 'full' },
  {
    path: 'settings/profile',
    component: SettingsProfilePageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard],
  },
  {
    path: 'settings/security',
    component: SettingsSecurityPageComponent,
    canActivate: [LoggedInGuard, AuthorizedGuard],
  },

  { path: '**', component: NotFoundPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
