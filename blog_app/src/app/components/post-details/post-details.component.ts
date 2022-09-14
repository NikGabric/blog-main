import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/classes/post';
import { API, Auth } from 'aws-amplify';
import { Router, ActivatedRoute } from '@angular/router';
import { JsonPipe } from '@angular/common';

const apiName = 'blogApi';
const apiPath = '/posts';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss'],
})
export class PostDetailsComponent implements OnInit {
  constructor(private router: Router, public route: ActivatedRoute) {
    this.postId = this.route.snapshot.paramMap.get('postId');
    this.postTitle = this.route.snapshot.paramMap.get('postTitle');
    this.post = new Post();
    this.apiPathWithId = apiPath + '/' + this.postTitle + '/' + this.postId;
  }

  public post: Post;
  private postId: string | null;
  private postTitle: string | null;
  private apiPathWithId: string;

  private async getPostData(): Promise<{}> {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const reqOptions = {
      Authorization: token,
    };

    console.log(this.apiPathWithId);

    await API.get(apiName, this.apiPathWithId, reqOptions)
      .then((result) => {
        this.post = JSON.parse(result.body);
        console.log(this.post);
      })
      .catch((err) => {
        console.log('Error: ', err);
      });

    return {};
  }

  ngOnInit(): void {
    this.getPostData();
  }
}
