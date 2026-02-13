import { Component, inject } from '@angular/core';
import { NavbarLogo } from './navbar-logo/navbar-logo';
import { NavbarUserMenu } from './navbar-user-menu/navbar-user-menu';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [NavbarLogo, NavbarUserMenu],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService);
}
