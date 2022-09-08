import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './app/components/auth/auth.component';
import { CreatePostComponent } from './app/components/create-post/create-post.component';
import { HomepageComponent } from './app/components/homepage/homepage.component';
import { PostDetailsComponent } from './app/components/post-details/post-details.component';

const routes: Routes = [
  { path: 'post-details/:postTitle', component: PostDetailsComponent },
  { path: 'create-post', component: CreatePostComponent },
  { path: 'login', component: AuthComponent },
  { path: 'home', component: HomepageComponent },
  { path: '', component: HomepageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
