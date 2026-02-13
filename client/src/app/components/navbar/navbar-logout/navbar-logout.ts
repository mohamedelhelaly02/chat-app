import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth-service';

@Component({
    selector: 'app-navbar-logout',
    standalone: true,
    templateUrl: './navbar-logout.html',
    styleUrl: '../navbar.css',
})
export class NavbarLogout {
    authService = inject(AuthService);

    logout() {
        this.authService.logout().subscribe(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        });
    }
}
