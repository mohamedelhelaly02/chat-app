import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const isAuthRequest = req.url.includes('/login') || req.url.includes('/register');
  let authRequest = req;
  if (token && !isAuthRequest) {
    authRequest = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  }
  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
