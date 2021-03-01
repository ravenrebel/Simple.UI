import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LoginData} from '../../models/authentication/login-data';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-restore-session-dialog',
  templateUrl: './restore-session-dialog.component.html',
  styleUrls: ['./restore-session-dialog.component.scss']
})
export class RestoreSessionDialogComponent implements OnInit {

  loginData = new LoginData();
  loginFormGroup: FormGroup;
  hide = true;
  loading = false;

  constructor(private authService: AuthenticationService,
              private router: Router,
              private route: ActivatedRoute,
              private dialogRef: MatDialogRef<RestoreSessionDialogComponent>) { }

  ngOnInit(): void {
    this.createForm();
  }

  logout(): void {
    this.authService.logout();
    console.log('User is logged out');
    this.dialogRef.disableClose = false;
    this.dialogRef.close();
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/login']);
  }

  login(): void {
    if (this.loginFormGroup.valid) {
      this.loading = true;
      this.loginData.password = this.loginFormGroup.get('password').value;
      this.loginData.login = this.authService.getCurrentUserValue()?.userName;
      const currentRoute = this.router.url;
      this.authService.authenticate(this.loginData)
        .subscribe(
          (userInfo) => {
            // refresh
            const currentRouteUrl = this.router.routerState.snapshot.url;
            console.log(currentRouteUrl);
            this.router.navigate(['/unauthorized']).then(() => {
              this.dialogRef.disableClose = false;
              this.dialogRef.close();
              // noinspection JSIgnoredPromiseFromCall
              this.router.navigate([currentRouteUrl]);

              console.log('User is logged in');
              console.log(userInfo);
            });
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
    });
  }
}
