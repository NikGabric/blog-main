import { Component, OnInit } from '@angular/core';
import { Route, Router, ActivatedRoute } from '@angular/router';
import { Post } from 'src/app/classes/post';

import { ApiService } from 'src/app/services/api.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { API, Auth } from 'aws-amplify';

const apiName = 'blogApi';
const apiPath = '/posts';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.scss'],
})
export class EditPostComponent implements OnInit {
  constructor(
    public route: ActivatedRoute,
    public cognitoService: CognitoService
  ) {
    this.post = new Post();
    this.postId = this.route.snapshot.paramMap.get('postId');
    this.postTitle = this.route.snapshot.paramMap.get('postTitle');
    this.apiPathWithId = apiPath + '/' + this.postTitle + '/' + this.postId;
    this.postDataAvailable = false;
    this.allowComments = false;

    this.postParams = new Post();
    this.oldPostTitle = '';
  }

  // Data for getting post from DB
  public post: Post;
  private postId: string | null;
  private postTitle: string | null;
  private apiPathWithId: string;
  public postDataAvailable: boolean;
  public allowComments: boolean;

  public postParams: Post;
  private oldPostTitle: string;

  private async getPostData(): Promise<void> {
    var token: string | null;
    try {
      token = (await Auth.currentSession()).getIdToken().getJwtToken();
    } catch (e) {
      token = null;
    }
    const reqOptions = {
      Authorization: token,
    };

    await API.get(apiName, this.apiPathWithId, reqOptions)
      .then((result) => {
        this.postParams = JSON.parse(result.body);
        this.oldPostTitle = this.postParams.title;
        this.postParams.title = this.postParams.title.replaceAll('POST#', '');
        this.postDataAvailable = true;
        console.log(this.postParams.title);
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
  }

  public async editPost(): Promise<void> {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const user = await this.cognitoService.getUser();
    // this.postParams.title = 'POST#' + this.postParams.title;
    this.postParams.author = user.username;
    this.postParams.comments = [];
    this.postParams.id = this.postId;

    const reqOptions = {
      Authorization: token,
      body: { ...this.postParams, oldPostTitle: this.oldPostTitle },
    };

    console.log(reqOptions);

    // API.post(apiName, apiPath, reqOptions)
    //   .then((result) => {
    //     console.log(result);
    //     this.postParams = new Post();
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    API.put(apiName, apiPath, reqOptions)
      .then((result) => {
        console.log(JSON.parse(result.body));
      })
      .catch((err) => {
        console.log(err);
      });
  }

  ngOnInit(): void {
    this.getPostData();
  }
}
