import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Toast, ToastMessage } from '../../components/toast/toast';
import { SocketService } from '../../services/socket-service';

@Component({
  selector: 'app-blank-layout',
  imports: [RouterOutlet, Navbar, Footer, Toast],
  templateUrl: './blank-layout.html',
  styleUrl: './blank-layout.css',
})
export class BlankLayout implements OnInit {
  protected readonly socketService: SocketService = inject(SocketService);
  toastMessage: WritableSignal<ToastMessage | null> = signal<ToastMessage | null>(null);

  ngOnInit(): void {

    this.socketService.on('user:online').subscribe((data: any) => {
      this.toastMessage.set({
        message: `${data.username} is now online`,
        type: 'success',
        duration: 3000,
      });
    });

    this.socketService.on('user:statusChanged').subscribe((data: any) => {
      console.log('User status changed:', data);

      if (data.online) {
        this.toastMessage.set({
          message: `${data.username} is now online`,
          type: 'success',
          duration: 3000,
        });
      } else {
        this.toastMessage.set({
          message: `${data.username} went offline`,
          type: 'info',
          duration: 3000,
        });
      }

    });
  }
}
