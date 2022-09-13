import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/classes/post';
import { API, Auth } from 'aws-amplify';
import { Router, ActivatedRoute } from '@angular/router';

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
    this.post = new Post();
    this.apiPathWithTitle = apiPath + '/' + this.postId;
  }

  public post: Post;
  private postId: string | null;
  private apiPathWithTitle: string;

  private async getPostData(): Promise<{}> {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const reqOptions = {
      Authorization: token,
    };
    const id = this.route.snapshot.paramMap.get('postId');

    console.log(this.apiPathWithTitle);

    API.get(apiName, this.apiPathWithTitle, reqOptions)
      .then((result) => {
        console.log(result);
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
