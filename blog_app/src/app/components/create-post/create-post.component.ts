import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/classes/post';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  constructor() {}

  public postParams = new Post();

  public sendPost() {
    console.log(this.postParams);
  }

  ngOnInit(): void {}
}
