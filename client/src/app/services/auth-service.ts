import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { SocketService } from './socket-service';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface UserData {
  user: User;
}

interface AuthResponse {
  status: string;
  token: string;
  data: UserData;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LogoutResponse {
  status: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly BASE_URL: string = 'http://localhost:4000/api/v1/auth';
  readonly httpClient = inject(HttpClient);
  readonly router = inject(Router);
  private readonly socketService: SocketService = inject(SocketService);

  currentUser: WritableSignal<User | null> = signal<User | null>(null);
  token: WritableSignal<string | null> = signal<string | null>(null);

  isAuthenticated = computed(() => !!this.currentUser() && !!this.token());
  userName = computed(() => this.currentUser()?.username ?? 'Guest');

  register(registerData: RegisterData): Observable<any> {
    return this.httpClient
      .post<any>(`${this.BASE_URL}/register`, registerData, {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
      })
      .pipe(tap(() => this.handleRegisterSuccess()));
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.httpClient
      .post<AuthResponse>(`${this.BASE_URL}/login`, credentials, {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
      })
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  logout(): Observable<LogoutResponse> {
    return this.httpClient
      .post<LogoutResponse>(`${this.BASE_URL}/logout`, null, { withCredentials: true })
      .pipe(tap(() => this.router.navigate(['/login'])));
  }

  refresh(): Observable<{ accessToken: string }> {
    return this.httpClient.post<{ accessToken: string }>(`${this.BASE_URL}/refresh`, null, {
      withCredentials: true,
    });
  }

  private handleRegisterSuccess(): void {
    this.router.navigate(['/login']);
  }

  private async handleAuthSuccess(response: AuthResponse) {
    this.currentUser.set(response.data.user);

    this.token.set(response.token);

    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.token);

    await this.socketService.connect(response.token);

    this.socketService.emit('user:login', { userId: response.data.user._id });

    this.router.navigate(['/chat']);
  }
}
