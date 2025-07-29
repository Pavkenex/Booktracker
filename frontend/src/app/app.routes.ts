import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'books',
    loadComponent: () => import('./components/book/book-catalog/book-catalog.component').then(m => m.BookCatalogComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'books/:id',
    loadComponent: () => import('./components/book/book-details/book-details.component').then(m => m.BookDetailsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'library',
    loadComponent: () => import('./components/library/personal-library/personal-library.component').then(m => m.PersonalLibraryComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];