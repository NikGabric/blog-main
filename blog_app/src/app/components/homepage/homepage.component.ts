import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/classes/post';
import { API, Auth } from 'aws-amplify';

const apiName = 'blogApi';
const apiPath = '/posts';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  constructor() {
    this.loading = true;
  }

  public posts: Post[] = [];
  public postsToDisplay: Post[] = [];
  public enableShowMoreBtn: boolean = true;
  public loading: boolean;

  public showMore(): void {
    let newLength = this.postsToDisplay.length + 3;
    if (newLength >= this.posts.length) {
      newLength = this.posts.length;
      this.enableShowMoreBtn = false;
    }
    this.postsToDisplay = this.posts.slice(0, newLength);
  }

  public async getAllPosts(): Promise<void> {
    var token: string | null;
    try {
      token = (await Auth.currentSession()).getIdToken().getJwtToken();
    } catch (e) {
      token = null;
    }
    const reqOptions = {
      Authorization: token,
    };

    API.get(apiName, apiPath, reqOptions)
      .then((result) => {
        this.posts = JSON.parse(result.body);
        console.log('Posts: ', this.posts);
        this.postsToDisplay = this.posts.slice(0, 3);
        this.loading = false;
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
  }

  async ngOnInit(): Promise<void> {
    // if (this.posts.length <= 3) this.enableShowMoreBtn = false;
    this.getAllPosts();
  }
}
