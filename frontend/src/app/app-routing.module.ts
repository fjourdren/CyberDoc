import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { LogoutPageComponent } from './pages/logout-page/logout-page.component';
import { FilesPageComponent } from './pages/files-page/files-page.component';
import { SettingsProfilePageComponent } from './pages/settings-profile-page/settings-profile-page.component';
import { SettingsSecurityPageComponent } from './pages/settings-security-page/settings-security-page.component';
import { LoggedInGuard } from './guards/logged-in/logged-in.guard';
import { LoggedOutGuard } from './guards/logged-out/logged-out.guard';


const routes: Routes = [

  { path: '', redirectTo: 'files', pathMatch: 'full' },
  { path: 'files-search/:searchParams', component: FilesPageComponent, canActivate: [LoggedInGuard] },
  { path: 'files/:dirID', component: FilesPageComponent, canActivate: [LoggedInGuard] },
  { path: 'files', component: FilesPageComponent, canActivate: [LoggedInGuard] },

  { path: 'logout', component: LogoutPageComponent, canActivate: [LoggedInGuard] },
  { path: 'login', component: LoginPageComponent, canActivate: [LoggedOutGuard] },
  { path: 'register', component: RegisterPageComponent, canActivate: [LoggedOutGuard] },

  { path: 'settings', redirectTo: 'settings/profile', pathMatch: 'full' },
  { path: 'settings/profile', component: SettingsProfilePageComponent, canActivate: [LoggedInGuard] },
  { path: 'settings/security', component: SettingsSecurityPageComponent, canActivate: [LoggedInGuard] },

  { path: '**', component: NotFoundPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
