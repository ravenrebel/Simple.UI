import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {RegisterData} from '../../models/authentication/register-data';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {UserService} from '../../../user-profiles/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerData = new RegisterData();
  emailFormControl = new FormControl('', [
    Validators.required, Validators.email,
    Validators.maxLength(256)
  ]);
  userNameFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^[a-zA-Z0-9_]{0,}'),
    Validators.maxLength(256)
  ]);
  registerFormGroup: FormGroup;
  hide = true;
  loading = false;

  constructor(private authService: AuthenticationService,
              private userService: UserService,
              private router: Router,
              private toastr: ToastrService) {}

  ngOnInit(): void {
    this.createForm();
  }

  register(): void {
    if (this.registerFormGroup.valid) {
      this.loading = true;
      this.registerData = this.registerFormGroup.value;
      this.registerFormGroup.disable();
      this.authService.register(this.registerData)
        .subscribe((userInfo) => {
            console.log('User is logged in');
            this.toastr.success('Welcome ' + userInfo.user.userName, 'Account created!');
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
    this.emailFormControl.valueChanges.subscribe(x => {
      if (this.emailFormControl.valid) {
        this.userService.emailExists(x).subscribe(res => {
          if (res) { this.emailFormControl.setErrors({taken: true}); }
        });
      }
    });

    this.userNameFormControl.valueChanges.subscribe(v => {
        if (this.userNameFormControl.valid) {
          this.userService.usernameExists(v).subscribe(res => {
            if (res) { this.userNameFormControl.setErrors({taken: true}); }
          });
        }
      });

    this.registerFormGroup = new FormGroup({
      email: this.emailFormControl,
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(256),
        Validators.pattern('^(?=.*[a-z])(?=.*\\d).{0,}$')
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.maxLength(256)
      ]),
      firstName: new FormControl('', [
        Validators.required,
        Validators.maxLength(256)
      ]),
      userName: this.userNameFormControl
      });
  }
}
