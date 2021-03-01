import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import {LoginComponent} from './core/components/login/login.component';
import {RegisterComponent} from './core/components/register/register.component';
import {PublicComponent} from './core/components/layouts/public/public.component';
import {SecureComponent} from './core/components/layouts/secure/secure.component';
import {AuthenticationGuard} from './shared/guards/authentication.guard';
import {NoAuthenticationGuard} from './shared/guards/no-authentication.guard';
import {NotFoundComponent} from './core/components/not-found/not-found.component';
import {HomeComponent} from './news-board/components/home/home.component';
import {UnauthorizedComponent} from './core/components/unauthorized/unauthorized.component';


export const PUBLIC_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];

export const SECURE_ROUTES: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home', component: HomeComponent,
  },
  {
    path: 'people',
    loadChildren: () => import('./user-profiles/user-profiles.module').then(m => m.UserProfilesModule)
  },
  {
    path: 'chats',
    loadChildren: () => import('./chats/chats.module').then(m => m.ChatsModule)
  }
];

const APP_ROUTES: Routes = [
  {
    path: '',
    component: SecureComponent,
    canActivate: [AuthenticationGuard],
    data: { title: 'Secure Views' },
    children: SECURE_ROUTES
  },
  {
    path: '',
    component: PublicComponent,
    canActivate: [NoAuthenticationGuard],
    data: { title: 'Public Views' },
    children: PUBLIC_ROUTES
  },
  { path: 'unauthorized', component: UnauthorizedComponent},
  { path: '**', redirectTo: 'not-found' },
  { path: 'not-found', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES, { preloadingStrategy: PreloadAllModules, initialNavigation: 'enabled' }), HttpClientModule],
  exports: [RouterModule]
})

export class AppRoutingModule {}
