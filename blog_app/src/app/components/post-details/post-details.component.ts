import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/classes/post';
import { API, Auth } from 'aws-amplify';
import { ActivatedRoute, Router } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { Comment } from 'src/app/classes/comment';
import { User } from 'src/app/classes/user';

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
    public router: Router,
    public cognitoService: CognitoService
  ) {
    this.post = new Post();
    this.postId = this.route.snapshot.paramMap.get('postId');
    this.postTitle = this.route.snapshot.paramMap.get('postTitle');
    this.apiPathWithId =
      apiPath + '/post/' + this.postTitle + '/' + this.postId;
    this.postDataAvailable = false;
    this.allowComments = false;

    this.commentParams = new Comment();
    this.allowPostEdit = false;

    this.comments = [];
    this.commentDataAvailable = false;
    this.commentEmpty = false;

    this.sortedComments = [];

    this.loading = true;
  }

  public loading: boolean;
  public allowPostEdit: boolean;

  // Data for getting post from DB
  public post: Post;
  public postId: string | null;
  private postTitle: string | null;
  private apiPathWithId: string;
  public postDataAvailable: boolean;
  public allowComments: boolean;

  // Data for commenting
  public commentParams: Comment;

  // Data for showing comments
  public comments: Comment[];
  public commentDataAvailable: boolean;
  public commentEmpty: boolean;

  public sortedComments: Comment[];

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
        if (user != null && user.attributes.sub === this.post.userId)
          this.allowPostEdit = true;
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
  }

  public async commentOnPost(): Promise<void> {
    if (this.commentParams.content === undefined) {
      this.commentEmpty = true;
      return;
    } else {
      this.commentEmpty = false;
    }

    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const commenter = await this.cognitoService.getUser();
    this.commentParams.author = commenter.username;
    this.commentParams.userId = commenter.attributes.sub;
    this.commentParams.upvoterIds = [];
    this.commentParams.downvoterIds = [];
    this.commentParams.parent = 'post';
    const reqOptions = {
      Authorization: token,
      body: this.commentParams,
    };
    const apiPathCommentCreation = apiPath + '/comment/' + this.postId;

    API.post(apiName, apiPathCommentCreation, reqOptions)
      .then((result) => {
        this.commentParams = new Comment();
        this.commentDataAvailable = true;
        this.getComments();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  private async getComments(): Promise<void> {
    this.sortedComments = [];
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

    const apiPathComents = apiPath + '/comments/' + this.postId;

    await API.get(apiName, apiPathComents, reqOptions)
      .then((result) => {
        this.comments = JSON.parse(result.body).sort(
          (objA: Comment, objB: Comment) =>
            objB.upvoterIds.length - objA.upvoterIds.length
        );

        this.comments.forEach((comment) => {
          if (user != null && user.attributes.sub === comment.userId) {
            comment.allowEdit = true;
            comment.allowDelete = true;
          } else if (user != null && user.attributes.sub === this.post.userId) {
            comment.allowDelete = true;
          }
        });

        this.sortComments(this.comments);
        this.commentDataAvailable = true;
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
  }

  private sortComments(
    tempComments: Comment[]
    // parentId: string,
    // index: number
  ): void {
    var finalComments: Comment[];
    finalComments = [];

    tempComments.forEach((comment) => {
      if (comment.parent === 'post') {
        comment.level = 0;
        finalComments.push(comment);
      }
    });

    for (var i = 0; i < finalComments.length; i++) {
      var parentId = finalComments[i].title;
      for (var j = 0; j < tempComments.length; j++) {
        var el = tempComments[j];
        if (el.parent === parentId) {
          el.level = finalComments[i].level + 30;
          finalComments.splice(i + 1, 0, el);
          //   i++;
        }
      }
    }

    this.sortedComments = finalComments;

    // console.log(parentId);
    // console.log(index);
    // if (tempComments.length <= index) return;

    // var com1 = tempComments[index];
    // console.log(com1.content);

    // if (com1.parent === parentId) {
    //   console.log('push');
    //   this.sortedComments.push(com1);
    //   tempComments[index].parent = 'nope';
    //   index = 0;
    //   parentId = com1.title;
    //   this.sortComments(tempComments, parentId, index);
    // } else {
    //   index += 1;
    //   this.sortComments(tempComments, parentId, index);
    // }
  }

  public async deletePost(): Promise<void> {
    const apiPathDelete =
      apiPath + '/deletePost/' + this.postId + '/' + this.postTitle;
    var token: string | null;
    try {
      token = (await Auth.currentSession()).getIdToken().getJwtToken();
    } catch (e) {
      token = null;
    }
    const reqOptions = {
      Authorization: token,
      body: { userId: this.post.userId },
    };

    await API.del(apiName, apiPathDelete, reqOptions)
      .then((result) => {
        this.router.navigate(['/']);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public async upvote(commentId: string): Promise<void> {
    var token: string | null;
    try {
      token = (await Auth.currentSession()).getIdToken().getJwtToken();
    } catch (e) {
      token = null;
    }

    const reqOptions = {
      Authorization: token,
      body: {
        id: this.postId,
        title: commentId,
      },
    };

    const apiPathUpvote = apiPath + '/upvoteComment';

    API.put(apiName, apiPathUpvote, reqOptions)
      .then((result) => {
        location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public async downvote(commentId: string): Promise<void> {
    var token: string | null;
    try {
      token = (await Auth.currentSession()).getIdToken().getJwtToken();
    } catch (e) {
      token = null;
    }

    const reqOptions = {
      Authorization: token,
      body: {
        id: this.postId,
        title: commentId,
      },
    };

    const apiPathDownpvote = apiPath + '/downvoteComment';

    API.put(apiName, apiPathDownpvote, reqOptions)
      .then((result) => {
        location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public async deleteComment(
    commentId: string,
    commentUserId: string
  ): Promise<void> {
    const apiPathDeleteComment = apiPath + '/deleteComment';
    var token: string | null;
    try {
      token = (await Auth.currentSession()).getIdToken().getJwtToken();
    } catch (e) {
      token = null;
    }
    const reqOptions = {
      Authorization: token,
      body: {
        // userId: commentUserId,
        postId: this.postId,
        commentId: commentId.replace('COMMENT#', ''),
        postTitle: this.post.title.replace('POST#', ''),
      },
    };

    await API.del(apiName, apiPathDeleteComment, reqOptions)
      .then((result) => {
        location.reload();
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
