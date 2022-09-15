import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Comment } from 'src/app/classes/comment';

import { CognitoService } from 'src/app/services/cognito.service';
import { API, Auth } from 'aws-amplify';

const apiName = 'blogApi';
const apiPath = '/posts';

@Component({
  selector: 'app-edit-comment',
  templateUrl: './edit-comment.component.html',
  styleUrls: ['./edit-comment.component.scss'],
})
export class EditCommentComponent implements OnInit {
  constructor(
    public route: ActivatedRoute,
    public cognitoService: CognitoService,
    private router: Router
  ) {
    this.postId = this.route.snapshot.paramMap.get('postId');
    this.commentId = this.route.snapshot.paramMap.get('commentId');
    this.commentParams = new Comment();
  }

  // Data for getting comment from DB
  private postId: string | null;
  private commentId: string | null;
  public commentParams: Comment;

  private async getCommentData(): Promise<void> {
    var token: string | null;
    try {
      token = (await Auth.currentSession()).getIdToken().getJwtToken();
    } catch (e) {
      token = null;
    }
    const reqOptions = {
      Authorization: token,
    };

    const apiPathComment =
      apiPath + '/comment/' + this.postId + '/' + this.commentId;

    await API.get(apiName, apiPathComment, reqOptions)
      .then((result) => {
        this.commentParams = JSON.parse(result.body)[0];
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
  }

  public async editComment(): Promise<void> {
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
      body: {
        id: this.commentParams.id,
        title: this.commentParams.title,
        content: this.commentParams.content,
        userId: this.commentParams.userId,
      },
    };

    const apiPathCommentEdit = apiPath + '/editComment';

    API.put(apiName, apiPathCommentEdit, reqOptions)
      .then((result) => {
        this.router.navigate(['/']);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  ngOnInit(): void {
    this.getCommentData();
  }
}
