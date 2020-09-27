import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DrivePageComponent } from './pages/drive-page/drive-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';

const routes: Routes = [
  { path: 'drive/:dirID', component: DrivePageComponent },
  { path: '**', component: NotFoundPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
