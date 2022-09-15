import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './app/components/login/login.component';
import { CreatePostComponent } from './app/components/create-post/create-post.component';
import { HomepageComponent } from './app/components/homepage/homepage.component';
import { PostDetailsComponent } from './app/components/post-details/post-details.component';
import { RegisterComponent } from './app/components/register/register.component';
import { EditPostComponent } from './app/components/edit-post/edit-post.component';
import { EditCommentComponent } from './app/components/edit-comment/edit-comment.component';

const routes: Routes = [
  { path: 'post-details/:postTitle/:postId', component: PostDetailsComponent },
  { path: 'edit-post/:postTitle/:postId', component: EditPostComponent },
  {
    path: 'edit-comment/:postId/:commentId',
    component: EditCommentComponent,
  },
  { path: 'create-post', component: CreatePostComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomepageComponent },
  { path: '', component: HomepageComponent },
  { path: '**', component: HomepageComponent }, //wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
