import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { User, CognitoService } from '../../services/cognito.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loading: boolean;
  user: User;

  constructor(private router: Router, private cognitoService: CognitoService) {
    this.loading = false;
    this.user = {} as User;
  }

  public login(): void {
    this.loading = true;
    this.cognitoService
      .signIn(this.user)
      .then(() => {
        this.loading = false;
        this.router.navigate(['/']);
      })
      .catch(() => {
        this.loading = false;
      });
  }
}
