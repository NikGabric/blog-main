import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Post } from 'src/app/classes/post';

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
  constructor(private cognitoService: CognitoService, private router: Router) {}

  public postParams = new Post();

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
        this.postParams = new Post();
        this.router.navigate(['/']);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  ngOnInit(): void {}
}
