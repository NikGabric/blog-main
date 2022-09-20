import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { API, Auth } from 'aws-amplify';
import { Comment } from 'src/app/classes/comment';
import { CognitoService } from 'src/app/services/cognito.service';

const apiName = 'blogApi';
const apiPath = '/posts';

@Component({
  selector: 'app-comment-on-comment',
  templateUrl: './comment-on-comment.component.html',
  styleUrls: ['./comment-on-comment.component.scss'],
})
export class CommentOnCommentComponent implements OnInit {
  constructor(
    public route: ActivatedRoute,
    public cognitoService: CognitoService,
    private location: Location
  ) {
    this.commentParams = new Comment();
    this.fieldEmpty = false;

    this.postId = this.route.snapshot.paramMap.get('postId');
    this.parentId = this.route.snapshot.paramMap.get('commentId');

    this.commentParams.upvoterIds = [];
    this.commentParams.downvoterIds = [];
  }

  ngOnInit(): void {}

  public commentParams: Comment;
  public fieldEmpty: boolean;
  private postId: string | null;
  private parentId: string | null;

  public async submitComment(): Promise<void> {
    console.log(this.commentParams.content);
    if (
      this.commentParams.content === '' ||
      this.commentParams.content === undefined
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

    if (this.parentId) {
      this.commentParams.parent = 'COMMENT#' + this.parentId;
    } else {
      return;
    }
    // if (this.postId) {
    //   this.commentParams.id = this.postId;
    // } else {
    //   return;
    // }
    this.commentParams.author = user.username;
    this.commentParams.userId = user.attributes.sub;

    const reqOptions = {
      Authorization: token,
      body: this.commentParams,
    };

    const apiPathCommentCreation = apiPath + '/comment/' + this.postId;
    // console.log(reqOptions);

    API.post(apiName, apiPathCommentCreation, reqOptions)
      .then((result) => {
        this.commentParams = new Comment();
        this.location.back();
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
