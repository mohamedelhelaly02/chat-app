import { Component, inject, input } from '@angular/core';
import { AuthUser } from '../../../models/auth-user.model';
import { AuthService } from '../../../services/auth-service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-sidebar-header',
    templateUrl: './sidebar-header.html',
    styleUrl: './sidebar-header.css',
    imports: [NgClass],
})
export class SidebarHeader {
    readonly user = input.required<AuthUser | null>();
    authService = inject(AuthService);
}
