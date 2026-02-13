import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  // read token from localstorage
  const token = localStorage.getItem('token');
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  let authRequest = req;
  if (token && !isAuthRequest) {
    // set jwt token to authorization request header
    authRequest = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  }
  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};
