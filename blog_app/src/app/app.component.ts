import { Component, OnInit } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { Router } from '@angular/router';

import aws_exports from '../aws-exports';

import { CognitoService } from './services/cognito.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean;

  constructor(private router: Router, private cognitoService: CognitoService) {
    Amplify.configure(aws_exports);
    this.isAuthenticated = false;
  }

  public ngOnInit(): void {
    this.cognitoService.isAuthenticated().then((success: boolean) => {
      this.isAuthenticated = success;
    });
  }

  public logout(): void {
    this.cognitoService.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
