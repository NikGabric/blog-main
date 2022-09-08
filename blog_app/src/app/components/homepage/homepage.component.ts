import { Component, OnInit } from '@angular/core';
import Amplify, { API } from 'aws-amplify';
import { Post } from 'src/app/classes/post';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  constructor() {}

  public posts: Post[] = [
    {
      title: 'Test title 1',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      author: 'Test author 1',
    },
    {
      title: 'Test title 2',
      content: 'Test Content Y',
      author: 'Test author 1',
    },
    {
      title: 'Test title 42',
      content: 'Test Content X',
      author: 'Test author 2',
    },
    {
      title: 'Test title 1',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      author: 'Test author 1',
    },
    {
      title: 'Test title 2',
      content: 'Test Content Y',
      author: 'Test author 1',
    },
    {
      title: 'Test title 42',
      content: 'Test Content X',
      author: 'Test author 2',
    },
    {
      title: 'Test title 1',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      author: 'Test author 1',
    },
    {
      title: 'Test title 2',
      content: 'Test Content Y',
      author: 'Test author 1',
    },
    {
      title: 'Test title 42',
      content: 'Test Content X',
      author: 'Test author 2',
    },
  ];

  public postsToDisplay: Post[] = this.posts.slice(0, 3);
  public enableShowMoreBtn: boolean = true;

  public showMore() {
    let newLength = this.postsToDisplay.length + 3;

    if (newLength >= this.posts.length) {
      newLength = this.posts.length;
      this.enableShowMoreBtn = false;
    }
    this.postsToDisplay = this.posts.slice(0, newLength);
  }

  ngOnInit(): void {
    if (this.posts.length <= 3) this.enableShowMoreBtn = false;
  }
}
