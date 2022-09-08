import { Component } from '@angular/core';
import { AuthenticatorService } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';

import aws_exports from '../aws-exports';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public authenticator: AuthenticatorService) {
    Amplify.configure(aws_exports);
  }

  public logout() {
    this.authenticator.signOut();
  }

  public isLoggedIn() {
    if (this.authenticator.user == undefined) return false;
    else return true;
  }

  title = 'blog_app';
}
