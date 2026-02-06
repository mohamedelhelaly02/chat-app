import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth-service';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;
  readonly fb = inject(FormBuilder);
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  readonly authService: AuthService = inject(AuthService);
  rememberMe = signal<boolean>(false);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update((value) => !value);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      this.authService.login(this.loginForm.value as any).subscribe({
        error: (e: HttpErrorResponse) => {
          console.error(e);
          this.isLoading.set(false);
          this.errorMessage.set(e.error);
        },
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);

    if (control?.hasError('required')) {
      return 'هذا الحقل مطلوب';
    }
    if (control?.hasError('email')) {
      return 'البريد الإلكتروني غير صالح';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `يجب أن يكون ${minLength} أحرف على الأقل`;
    }

    return '';
  }

  toggleRememberMe() {
    this.rememberMe.update((value) => !value);
  }
}
