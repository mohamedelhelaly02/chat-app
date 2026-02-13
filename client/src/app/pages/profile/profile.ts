import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeAvatarResponse, UserProfileResponse, UserService } from '../../services/user-service';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth-service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './profile.html',
    styleUrl: './profile.css',
})
export class Profile implements OnInit {
    private userService = inject(UserService);
    private fb = inject(FormBuilder);

    isEditing = signal(false);
    isLoading = signal(false);
    profileForm: FormGroup;
    showPassword = signal(false);

    profileData = signal<User>({
        _id: '',
        username: '',
        email: '',
        avatar: '',
        bio: '',
        online: false,
        lastSeen: '',
        createdAt: '',
        updatedAt: '',
    });

    constructor() {
        this.profileForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            bio: ['', [Validators.maxLength(150)]],
        });
    }

    ngOnInit() {
        this.loadUserProfile();
    }

    loadUserProfile() {
        this.isLoading.set(true);
        this.userService.getCurrentUserProfile().subscribe({
            next: (response: UserProfileResponse) => {
                console.log(response);
                this.profileData.set(response.data.user);
                this.profileForm.patchValue({
                    username: response.data.user.username,
                    email: response.data.user.email,
                    bio: response.data.user.bio,
                });
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            },
        });
    }

    startEditing() {
        this.isEditing.set(true);
    }

    cancelEditing() {
        this.isEditing.set(false);
        this.profileForm.reset({
            username: this.profileData().username,
            email: this.profileData().email,
            bio: this.profileData().bio,
        });
    }

    saveProfile() {
        if (this.profileForm.valid) {
            this.isLoading.set(true);
            const updatedData = {
                ...this.profileData(),
                ...this.profileForm.value,
            };

            // this.userService.updateProfile(updatedData).subscribe({
            //     next: (user: User) => {
            //         this.profileData.set(user);
            //         this.isEditing.set(false);
            //         this.isLoading.set(false);
            //     },
            //     error: () => {
            //         this.isLoading.set(false);
            //     },
            // });
        }
    }

    changeAvatar(event: any) {
        const selectedFile = event.target.files[0];
        console.log(selectedFile);
        if (selectedFile) {
            const formData = new FormData();
            formData.append('avatar', selectedFile);
            this.isLoading.set(true);
            this.userService.changeUserAvatar(formData).subscribe({
                next: (response: ChangeAvatarResponse) => {
                    this.isLoading.set(false);

                    this.profileData.update(prev => ({
                        ...prev,
                        avatar: response.data.avatar
                    }));
                },
                error: () => {
                    this.isLoading.set(false);
                }
            });
        }
    }

    togglePasswordVisibility() {
        this.showPassword.set(!this.showPassword());
    }

    get usernameError(): string {
        const control = this.profileForm.get('username');
        if (control?.hasError('required')) {
            return 'اسم المستخدم مطلوب';
        }
        if (control?.hasError('minlength')) {
            return 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
        }
        return '';
    }

    get emailError(): string {
        const control = this.profileForm.get('email');
        if (control?.hasError('required')) {
            return 'البريد الإلكتروني مطلوب';
        }
        if (control?.hasError('email')) {
            return 'البريد الإلكتروني غير صحيح';
        }
        return '';
    }
}
