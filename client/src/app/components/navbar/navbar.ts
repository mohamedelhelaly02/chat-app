import { Component, inject } from '@angular/core';
import { NavbarLogo } from './navbar-logo/navbar-logo';
import { NavbarUserMenu } from './navbar-user-menu/navbar-user-menu';
import { NavbarLogout } from './navbar-logout/navbar-logout';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [NavbarLogo, NavbarUserMenu, NavbarLogout],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService);
}
