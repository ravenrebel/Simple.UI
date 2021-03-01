import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {LoginData} from '../../models/authentication/login-data';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginData = new LoginData();
  loginFormGroup: FormGroup;
  hide = true;
  loading = false;

  constructor(private authService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.createForm();
  }

  login(): void {
    if (this.loginFormGroup.valid) {
      this.loading = true;
      this.loginData = this.loginFormGroup.value;
      this.authService.authenticate(this.loginData)
        .subscribe(
          (userInfo) => {
            console.log('User is logged in');
            console.log(userInfo);
            // noinspection JSIgnoredPromiseFromCall
            this.router.navigate(['/home']);
          },
          error => {
            this.loading = false;
          }
        );
    }
  }

  private createForm(): void {
    this.loginFormGroup = new FormGroup({
      password: new FormControl('', [Validators.required]),
      login: new FormControl('', [Validators.required]),
    });
  }
}
