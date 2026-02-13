import { Component, inject, input } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { NgClass } from '@angular/common';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-sidebar-header',
    templateUrl: './sidebar-header.html',
    styleUrl: './sidebar-header.css',
    imports: [NgClass],
})
export class SidebarHeader {
    readonly user = input.required<User | null>();
    authService = inject(AuthService);
}
