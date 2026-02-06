import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';

interface UserDataResponse {
  users: User[]
}

interface UsersResponse {
  status: string;
  data: UserDataResponse
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly BASE_URL: string = 'http://localhost:4000/api/v1/users';
  private readonly httpClient = inject(HttpClient);

  getAllUsers(): Observable<UsersResponse> {
    return this.httpClient.get<UsersResponse>(this.BASE_URL);
  }
}

