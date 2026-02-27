import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { User } from '../models/user.model';
import { SocketService } from './socket-service';
import { AuthResponse, LoginCredentials } from './auth-service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly baseUrl: string = 'http://localhost:4000/api/v1/auth';
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly socketService: SocketService = inject(SocketService);
  private readonly router: Router = inject(Router);

  private state: WritableSignal<AuthState> = signal<AuthState>({
    user: null,
    token: null,
    isLoading: false,
    errorMessage: null,
  });

  user = computed(() => this.state().user);
  token = computed(() => this.state().token);
  isLoading = computed(() => this.state().isLoading);
  errorMessage = computed(() => this.state().errorMessage);
  isAuthenticated = computed(() => !!this.state().token);
  userName = computed(() => this.state().user?.username ?? 'Guest');

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.updateState({ isLoading: true, errorMessage: null });
    return this.httpClient.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        const { status, token, data } = response;
        if (status === 'success') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(data.user));
          this.updateState({ token, user: data.user, isLoading: false });

          this.socketService.connect(token);
          this.socketService.emit('user:login', { userId: data.user._id });
          this.router.navigate(['/chat']);
        }
      }),
      catchError((error) => this.handleError(error)),
    );
  }
  handleError(error: any) {
    const msg = error.error?.message;
    this.updateState({ errorMessage: msg, isLoading: false });
    return throwError(() => error);
  }

  private updateState(partialState: Partial<AuthState>): void {
    this.state.update((currentState) => ({
      ...currentState,
      ...partialState,
    }));
  }
}
