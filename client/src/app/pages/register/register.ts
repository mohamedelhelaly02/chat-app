import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { HttpErrorResponse } from '@angular/common/http';
import { SocketService } from '../../services/socket-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly socketService = inject(SocketService);

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  showPassword = signal(false);

  registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.authService.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);

        this.socketService.emit('user:registered', { userId: this.authService.currentUser()?._id });

      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'An error occurred during registration. Please try again.',
        );
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }
}
