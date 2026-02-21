import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private readonly socketUrl = 'http://localhost:4000';
  isConnected: WritableSignal<boolean> = signal<boolean>(false);
  connectionError: WritableSignal<string | null> = signal<string | null>(null);

  connect(accessToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('Already connected');
        resolve();
        return;
      }

      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }

      this.socket = io(this.socketUrl, {
        reconnection: true,
        autoConnect: true,
        reconnectionDelay: 1000,
        auth: {
          token: accessToken,
        },
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        this.isConnected.set(true);
        this.connectionError.set(null);
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected, reason:', reason);
        this.isConnected.set(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected.set(false);
        this.connectionError.set(error.message || 'Connection error');
        this.socket.disconnect();
        reject(error);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.isConnected.set(false);

      console.log('socket is disconnected successfully');
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket is not connected');
    }
  }

  on<T>(eventName: string): Observable<T> {
    return new Observable((observer) => {
      if (!this.socket) {
        const interval = setInterval(() => {
          if (this.socket) {
            clearInterval(interval);
            const handler = (data: T) => observer.next(data);
            this.socket.on(eventName, handler);
            observer.add(() => this.socket?.off(eventName, handler));
          }
        }, 50);

        return () => clearInterval(interval);
      }

      const handler = (data: T) => observer.next(data);
      this.socket.on(eventName, handler);

      return () => {
        this.socket?.off(eventName, handler);
      };
    });
  }
}
