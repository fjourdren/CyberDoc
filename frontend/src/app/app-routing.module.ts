import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';

import { FilesPageComponent } from './pages/files-page/files-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { LogoutPageComponent } from './pages/logout-page/logout-page.component';
import { SettingsProfilePageComponent } from './pages/settings-profile-page/settings-profile-page.component';
import { SettingsSecurityPageComponent } from './pages/settings-security-page/settings-security-page.component';

import { AuthComponent } from './components/auth/auth/auth.component';
import { FormulaireComponent } from './components/auth/formulaire/formulaire.component';

const routes: Routes = [
  { path: 'files/:dirID', component: FilesPageComponent, canActivate: [AuthGuard] },
  { path: 'files', component: FilesPageComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'files', pathMatch: 'full' },
  { path: 'logout', component: LogoutPageComponent, canActivate: [AuthGuard] },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: FormulaireComponent },
  { path: 'settings', component: SettingsProfilePageComponent, canActivate: [AuthGuard] },
  { path: 'settings/profile', component: SettingsProfilePageComponent, canActivate: [AuthGuard] },
  { path: 'settings/security', component: SettingsSecurityPageComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
