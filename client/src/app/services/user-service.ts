import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth-service';

interface UserDataResponse {
  users: User[]
}

interface UsersResponse {
  status: string;
  data: UserDataResponse
}

export type UserProfileResponse = {
  status: string;
  data: {
    user: User;
  }
}

export type ChangeAvatarResponse = {
  status: string;
  data: {
    avatar: string;
  }
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  BASE_URL: string = 'http://localhost:4000/api/v1/users';
  private readonly httpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);

  getAllUsers(): Observable<UsersResponse> {
    return this.httpClient.get<UsersResponse>(this.BASE_URL);
  }

  getCurrentUserProfile(): Observable<UserProfileResponse> {
    return this.httpClient.get<UserProfileResponse>(`${this.BASE_URL}/me/profile`)
      .pipe(
        tap(response => {
          if (response.status === 'success') {
            const userProfile = response.data.user;
            this.authService.currentUser.set(userProfile);
            localStorage.setItem('user', JSON.stringify(userProfile));
          }
        })
      )
  }

  changeUserAvatar(formData: FormData): Observable<ChangeAvatarResponse> {
    return this.httpClient.post<ChangeAvatarResponse>(`${this.BASE_URL}/me/avatar`, formData);
  }
}

