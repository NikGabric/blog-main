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
  constructor(private cognitoService: CognitoService, private router: Router) {
    this.fieldEmpty = false;
    this.charErr = false;
  }

  public postParams = new Post();
  public fieldEmpty: boolean;
  public charErr: boolean;

  public async createPost(): Promise<void> {
    if (
      this.postParams.title === undefined ||
      this.postParams.content === undefined
    ) {
      this.fieldEmpty = true;
      return;
    } else if (
      this.postParams.title.includes('/') ||
      this.postParams.title.includes('#') ||
      this.postParams.title.includes('%')
    ) {
      this.charErr = true;
      return;
    } else {
      this.fieldEmpty = false;
    }

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
