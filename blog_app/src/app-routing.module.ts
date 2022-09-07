import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './app/components/auth/auth.component';
import { HomepageComponent } from './app/components/homepage/homepage.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: AuthComponent },
  //   { path: 'login', component: AuthComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
