import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Post } from 'src/app/classes/post';

import { ApiService } from 'src/app/services/api.service';
import { CognitoService } from 'src/app/services/cognito.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private cognitoService: CognitoService,
    private router: Router
  ) {}

  public postParams = new Post();

  public async sendPost() {
    const user = await this.cognitoService.getUser();
    this.postParams.author = user.username;
    this.postParams.comments = [];
    console.log(this.postParams);
    this.apiService.createPost(this.postParams).then((result) => {
      this.router.navigate(['/home']);
    });
  }

  ngOnInit(): void {}
}
