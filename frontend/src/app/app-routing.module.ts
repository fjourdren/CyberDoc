import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FilesPageComponent } from './pages/files-page/files-page.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';

const routes: Routes = [
  { path: 'files/:dirID', component: FilesPageComponent },
  { path: 'error', component: ErrorPageComponent },
  { path: '**', component: NotFoundPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
