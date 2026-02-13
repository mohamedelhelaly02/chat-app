import { Component, input } from '@angular/core';
import { AuthUser } from '../../../models/auth-user.model';

@Component({
  selector: 'app-navbar-user-menu',
  templateUrl: './navbar-user-menu.html',
  styleUrl: '../navbar.css',
})
export class NavbarUserMenu {
  user = input.required<AuthUser | null>();

}
