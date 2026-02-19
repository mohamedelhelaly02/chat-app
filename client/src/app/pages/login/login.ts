import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { HttpErrorResponse } from '@angular/common/http';
import { SocketService } from '../../services/socket-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly socketService = inject(SocketService);

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  showPassword = signal(false);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);

        console.log('Login successful, emitting userLoggedIn event');

        console.log('Current user ID:', this.authService.currentUser()?._id);

        this.socketService.emit('user:login', { userId: this.authService.currentUser()?._id });

      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'Failed to login. Please check your credentials and try again.',
        );
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }
}
