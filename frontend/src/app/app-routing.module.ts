import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { TwoFactorPageComponent } from './pages/two-factor-page/two-factor-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { LogoutPageComponent } from './pages/logout-page/logout-page.component';
import { FilesPageComponent } from './pages/files-page/files-page.component';
import { SettingsProfilePageComponent } from './pages/settings-profile-page/settings-profile-page.component';
import { SettingsSecurityPageComponent } from './pages/settings-security-page/settings-security-page.component';
import { LoggedInGuard } from './guards/logged-in/logged-in.guard';
import { LoggedOutGuard } from './guards/logged-out/logged-out.guard';
import {TwoFactorRegisterPageComponent} from "./pages/two-factor-register-page/two-factor-register-page.component";
import {TwoFactorGuard} from "./guards/two-factor/two-factor.guard";


const routes: Routes = [

  { path: '', redirectTo: 'files', pathMatch: 'full' },
  { path: 'files-search/:searchParams', component: FilesPageComponent, canActivate: [LoggedInGuard, TwoFactorGuard] },
  { path: 'files/:dirID', component: FilesPageComponent, canActivate: [LoggedInGuard, TwoFactorGuard] },
  { path: 'files', component: FilesPageComponent, canActivate: [LoggedInGuard, TwoFactorGuard] },

  { path: 'logout', component: LogoutPageComponent, canActivate: [LoggedInGuard] },
  { path: 'login', component: LoginPageComponent, canActivate: [LoggedOutGuard] },
  { path: 'register', component: RegisterPageComponent, canActivate: [LoggedOutGuard] },
  { path: 'two-factor', component: TwoFactorPageComponent, canActivate: [LoggedInGuard, TwoFactorGuard] },
  { path: 'two-factor-register', component: TwoFactorRegisterPageComponent, canActivate: [LoggedInGuard], canDeactivate: [TwoFactorGuard] },

  { path: 'settings', redirectTo: 'settings/profile', pathMatch: 'full' },
  { path: 'settings/profile', component: SettingsProfilePageComponent, canActivate: [LoggedInGuard, TwoFactorGuard] },
  { path: 'settings/security', component: SettingsSecurityPageComponent, canActivate: [LoggedInGuard, TwoFactorGuard] },

  { path: '**', component: NotFoundPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
