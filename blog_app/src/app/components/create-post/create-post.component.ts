import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Post } from 'src/app/classes/post';

import { ApiService } from 'src/app/services/api.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { API, Auth } from 'aws-amplify';

const apiName = 'blogApi';
const apiPath = '/posts';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private cognitoService: CognitoService,
    private router: Router
  ) {}

  public postParams = new Post();

  //   public async sendPost() {
  //     const user = await this.cognitoService.getUser();
  //     this.postParams.author = user.username;
  //     this.postParams.comments = [];
  //     console.log(this.postParams);
  //     this.apiService.createPost(this.postParams).then((result) => {
  //       this.router.navigate(['/home']);
  //     });
  //   }

  public async createPost(): Promise<void> {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const user = await this.cognitoService.getUser();
    this.postParams.postTitle = this.postParams.title;
    this.postParams.author = user.username;
    this.postParams.comments = [];

    const reqOptions = {
      Authorization: token,
      body: this.postParams,
    };

    const apiPathPost = apiPath + '/post';

    API.post(apiName, apiPathPost, reqOptions)
      .then((result) => {
        console.log(result);
        this.postParams = new Post();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  ngOnInit(): void {}
}
