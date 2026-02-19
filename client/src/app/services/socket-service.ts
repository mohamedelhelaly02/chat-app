import { Injectable, signal, WritableSignal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private readonly socketUrl = 'http://localhost:4000';
  private authService = inject(AuthService);
  isConnected: WritableSignal<boolean> = signal<boolean>(false);
  connectionError: WritableSignal<string | null> = signal<string | null>(null);


  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    const userId = this.authService.currentUser()?._id || '';

    this.socket = io(this.socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnection: true,
      query: {
        userId: userId
      }
    });


    this.setupEventListeners();

  }

  private setupEventListeners(): void {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);

      this.isConnected.set(true);
      this.connectionError.set(null);
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected.set(false);
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected.set(false);
      this.connectionError.set(error.message || 'Connection error');
    });
  }

  emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('socket is not connected');
    }
  }

  on<T>(eventName: string): Observable<T> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('Socket not initialized');
        return;
      }

      const handler = (data: T) => {
        observer.next(data);
      };

      this.socket.on(eventName, handler);

      return () => {
        this.socket?.off(eventName, handler);
      };
    });
  }

}
