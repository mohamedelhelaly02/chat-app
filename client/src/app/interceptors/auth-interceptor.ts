import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { SocketService } from '../services/socket-service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const socketService = inject(SocketService);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const isAuthRequest =
    req.url.includes('/login') || req.url.includes('/register') || req.url.includes('/refresh');

  let authRequest = req.clone({
    withCredentials: true,
  });

  if (token && !isAuthRequest) {
    authRequest = authRequest.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authRequest).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (req.url.includes('/refresh')) {
          handleLogout(authService, socketService, router);
          return throwError(() => error);
        }

        return authService.refresh().pipe(
          switchMap((response: any) => {
            const newAccessToken = response.accessToken;

            localStorage.setItem('token', newAccessToken);
            authService.token.set(newAccessToken);

            const retryRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${newAccessToken}` },
              withCredentials: true,
            });

            return next(retryRequest);
          }),
          catchError((refreshError) => {
            handleLogout(authService, socketService, router);
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};

function handleLogout(authService: any, socketService: any, router: any) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  authService.currentUser.set(null);
  authService.token.set(null);
  socketService.disconnect();
  router.navigate(['/login']);
}
