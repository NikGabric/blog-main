import { Component, OnInit } from '@angular/core';
import { User, CognitoService } from '../../services/cognito.service';

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

  constructor(private cognitoService: CognitoService) {
    this.loading = false;
    this.user = {} as User;
    this.password2 = '';
    this.passError = false;
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

  ngOnInit(): void {}
}
