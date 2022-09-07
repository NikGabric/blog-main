import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from '../app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './components/auth/auth.component';
import { HomepageComponent } from './components/homepage/homepage.component';

@NgModule({
  declarations: [AppComponent, AuthComponent, HomepageComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    /* configure App with AmplifyAuthenticatorModule */
    AmplifyAuthenticatorModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
