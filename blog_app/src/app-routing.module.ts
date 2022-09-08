import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './app/components/auth/auth.component';
import { CreatePostComponent } from './app/components/create-post/create-post.component';
import { HomepageComponent } from './app/components/homepage/homepage.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'home', component: HomepageComponent },
  { path: 'login', component: AuthComponent },
  { path: 'create-post', component: CreatePostComponent },
  // { path: 'post', component: CreatePostComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
