import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { AuthNavbar } from '../../components/auth-navbar/auth-navbar';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, Footer, AuthNavbar],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {

}
