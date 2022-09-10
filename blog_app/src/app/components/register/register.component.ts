import { Component, OnInit } from '@angular/core';
import { User, CognitoService } from '../../services/cognito.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  loading: boolean;
  user: User;
  password2: string;
  passError: boolean;
  isConfirm: boolean;

  constructor(private router: Router, private cognitoService: CognitoService) {
    this.loading = false;
    this.user = {} as User;
    this.password2 = '';
    this.passError = false;
    this.isConfirm = false;
  }

  public register(): void {
    this.loading = true;
    this.passError = false;

    if (!this.checkPasswordRequirements()) {
      this.passError = true;
      return;
    }

    console.log(this.user);
    this.cognitoService
      .signUp(this.user)
      .then(() => {
        this.loading = false;
        this.isConfirm = true;
      })
      .catch(() => {
        this.loading = false;
      });
  }

  private checkPasswordRequirements(): boolean {
    if (this.user.password.length < 8) {
      return false;
    }
    return true;
  }

  public confirmSignUp(): void {
    this.loading = true;
    this.cognitoService
      .confirmSignUp(this.user)
      .then(() => {
        this.router.navigate(['/signIn']);
      })
      .catch(() => {
        this.loading = false;
      });
  }

  ngOnInit(): void {}
}
