import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { Router } from '@angular/router';

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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly BASE_URL: string = 'http://localhost:4000/api/v1/auth';
  readonly httpClient = inject(HttpClient);
  readonly router = inject(Router);

  currentUser: WritableSignal<User | null> = signal<User | null>(null);
  token: WritableSignal<string | null> = signal<string | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      this.currentUser.set(JSON.parse(storedUser));
      this.token.set(storedToken);
    }
  }

  register(registerData: RegisterData): Observable<AuthResponse> {
    return this.httpClient
      .post<AuthResponse>(`${this.BASE_URL}/register`, registerData, {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
      })
      .pipe(tap((authResponse) => this.handleAuthSuccess(authResponse)));
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.httpClient
      .post<AuthResponse>(`${this.BASE_URL}/login`, credentials, {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
      })
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  private handleAuthSuccess(response: AuthResponse) {
    this.currentUser.set(response.data.user);
    this.token.set(response.token);

    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.token);

    this.router.navigate(['/chat']);
  }
}
