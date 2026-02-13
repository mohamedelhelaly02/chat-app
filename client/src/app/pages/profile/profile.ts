import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './profile.html',
    styleUrl: './profile.css',
})
export class Profile {
    isEditing = signal(false);
    profileForm: FormGroup;
    showPassword = signal(false);

    profileData = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        bio: 'مرحباً، أنا أستخدم تطبيق ChatLink للتواصل',
        avatar: 'https://i.pravatar.cc/150?img=12',
        joinDate: '2024-01-15',
    };

    constructor(private fb: FormBuilder) {
        this.profileForm = this.fb.group({
            name: [this.profileData.name, [Validators.required, Validators.minLength(3)]],
            email: [this.profileData.email, [Validators.required, Validators.email]],
            phone: [this.profileData.phone, [Validators.required]],
            bio: [this.profileData.bio, [Validators.maxLength(150)]],
        });
    }

    startEditing() {
        this.isEditing.set(true);
    }

    cancelEditing() {
        this.isEditing.set(false);
        this.profileForm.reset({
            name: this.profileData.name,
            email: this.profileData.email,
            phone: this.profileData.phone,
            bio: this.profileData.bio,
        });
    }

    saveProfile() {
        if (this.profileForm.valid) {
            this.profileData.name = this.profileForm.value.name;
            this.profileData.email = this.profileForm.value.email;
            this.profileData.phone = this.profileForm.value.phone;
            this.profileData.bio = this.profileForm.value.bio;
            this.isEditing.set(false);
        }
    }

    changeAvatar(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.profileData.avatar = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    togglePasswordVisibility() {
        this.showPassword.update(value => !value);
    }

    get nameError(): string {
        const control = this.profileForm.get('name');
        if (control?.hasError('required')) {
            return 'الاسم مطلوب';
        }
        if (control?.hasError('minlength')) {
            return 'الاسم يجب أن يكون 3 أحرف على الأقل';
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

    get phoneError(): string {
        const control = this.profileForm.get('phone');
        if (control?.hasError('required')) {
            return 'رقم الهاتف مطلوب';
        }
        return '';
    }
}
