import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  const destroyRef: DestroyRef = inject(DestroyRef);
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        
      }

      return throwError(() => error);
    })
  );
};
