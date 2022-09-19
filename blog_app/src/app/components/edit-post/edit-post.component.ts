import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Post } from 'src/app/classes/post';

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
    public cognitoService: CognitoService,
    private router: Router
  ) {
    this.post = new Post();
    this.postId = this.route.snapshot.paramMap.get('postId');
    this.postTitle = this.route.snapshot.paramMap.get('postTitle');
    this.apiPathWithId =
      apiPath + '/post/' + this.postTitle + '/' + this.postId;
    this.postDataAvailable = false;

    this.postParams = new Post();
    this.oldPostTitle = '';
    this.fieldEmpty = false;
  }

  // Data for getting post from DB
  public post: Post;
  private postId: string | null;
  private postTitle: string | null;
  private apiPathWithId: string;
  public postDataAvailable: boolean;

  public postParams: Post;
  private oldPostTitle: string;
  public fieldEmpty: boolean;

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
        this.post = JSON.parse(result.body);
        this.oldPostTitle = this.postParams.title;
        this.postDataAvailable = true;
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
  }

  public async editPost(): Promise<void> {
    if (
      this.postParams.postTitle === undefined ||
      this.postParams.content === undefined ||
      this.postParams.postTitle === '' ||
      this.postParams.content === ''
    ) {
      this.fieldEmpty = true;
      return;
    }

    var token: string | null;
    var user: any;
    try {
      token = (await Auth.currentSession()).getIdToken().getJwtToken();
      user = await this.cognitoService.getUser();
    } catch (e) {
      token = null;
      user = null;
    }

    this.postParams.author = user.username;
    this.postParams.comments = [];
    this.postParams.id = this.postId;

    const reqOptions = {
      Authorization: token,
      body: {
        ...this.postParams,
        oldPostTitle: this.oldPostTitle.replace('POST#', ''),
        authorId: this.post.userId,
      },
    };

    const apiPathUpdatePost = apiPath + '/editPost';

    API.put(apiName, apiPathUpdatePost, reqOptions)
      .then((result) => {
        this.router.navigate(['/']);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  ngOnInit(): void {
    this.getPostData();
  }
}
