import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/classes/post';
import { API, Auth } from 'aws-amplify';
import { ActivatedRoute } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { Comment } from 'src/app/classes/comment';

const apiName = 'blogApi';
const apiPath = '/posts';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss'],
})
export class PostDetailsComponent implements OnInit {
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

    this.commentParams = new Comment();

    this.comments = [];
    this.commentDataAvailable = false;

    this.allowEdit = false;

    this.loading = true;
  }

  public loading: boolean;

  // Data for getting post from DB
  public post: Post;
  private postId: string | null;
  private postTitle: string | null;
  private apiPathWithId: string;
  public postDataAvailable: boolean;
  public allowComments: boolean;

  // Data for commenting
  public commentParams: Comment;

  // Data for showing comments
  public comments: Comment[];
  public commentDataAvailable: boolean;

  // Data for edit/delete post
  public allowEdit: boolean;

  private async getPostData(): Promise<void> {
    var token: string | null;
    var user: any;
    try {
      token = (await Auth.currentSession()).getIdToken().getJwtToken();
      user = await this.cognitoService.getUser();
    } catch (e) {
      token = null;
      user = null;
    }
    const reqOptions = {
      Authorization: token,
    };

    await API.get(apiName, this.apiPathWithId, reqOptions)
      .then((result) => {
        this.post = JSON.parse(result.body);
        this.postDataAvailable = true;
        this.loading = false;
        if (this.post.userId === user.id) this.allowEdit = true;
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
  }

  public async commentOnPost(): Promise<void> {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const commenter = await this.cognitoService.getUser();
    this.commentParams.author = commenter.username;
    this.commentParams.userId = commenter.attributes.sub;
    this.commentParams.upvotes = 0;
    this.commentParams.downvotes = 0;
    const reqOptions = {
      Authorization: token,
      body: this.commentParams,
    };
    const apiPathCommentCreation = apiPath + '/comment/' + this.postId;

    API.post(apiName, apiPathCommentCreation, reqOptions)
      .then((result) => {
        console.log(result);
        this.commentParams = new Comment();
        this.commentDataAvailable = true;
        this.getComments();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  private async getComments(): Promise<void> {
    var token: string | null;
    try {
      token = (await Auth.currentSession()).getIdToken().getJwtToken();
    } catch (e) {
      token = null;
    }
    const reqOptions = {
      Authorization: token,
    };

    const apiPathComents = apiPath + '/comments/' + this.postId;

    await API.get(apiName, apiPathComents, reqOptions)
      .then((result) => {
        this.comments = JSON.parse(result.body);
        this.commentDataAvailable = true;
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
  }

  public async deletePost(): Promise<void> {
    const apiPathDelete = apiPath + '/' + this.postId;
    console.log(apiPathDelete);

    await API.del(apiName, apiPathDelete, {})
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async ngOnInit(): Promise<void> {
    this.allowComments = await this.cognitoService.isAuthenticated();
    this.getPostData().then(() => {
      this.getComments();
    });
  }
}
