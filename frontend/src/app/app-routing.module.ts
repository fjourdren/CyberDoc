import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainScreenComponent } from './main-screen/main-screen.component';

const routes: Routes = [
  { path: 'drive/:dirID', component: MainScreenComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
