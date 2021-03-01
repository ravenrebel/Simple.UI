import {NgModule, Optional, SkipSelf} from '@angular/core';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ModuleImportGuard } from '../shared/guards/module-import.guard';
import { PublicComponent } from './components/layouts/public/public.component';
import { HeaderComponent } from './components/header/header.component';
import { SecureComponent } from './components/layouts/secure/secure.component';
import { SharedModule } from '../shared/shared.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RestoreSessionDialogComponent } from './components/restore-session-dialog/restore-session-dialog.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    PublicComponent,
    HeaderComponent,
    SecureComponent,
    NotFoundComponent,
    RestoreSessionDialogComponent,
    UnauthorizedComponent,
  ],
    imports: [
        SharedModule,
        MatSidenavModule,
        MatSlideToggleModule,
    ],
})

export class CoreModule extends ModuleImportGuard {

  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    super(parentModule);
  }

}
