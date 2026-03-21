import { Component, input, signal, WritableSignal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToastMessage {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toast.html',
    styleUrl: './toast.css',
})
export class Toast {
    toastMessage = input.required<ToastMessage | null>();
    isVisible: WritableSignal<boolean> = signal<boolean>(false);

    constructor() {
        effect(() => {
            const message = this.toastMessage();
            if (message) {
                this.isVisible.set(true);
                const duration = message.duration || 3000;
                setTimeout(() => {
                    this.isVisible.set(false);
                }, duration);
            }
        });
    }

    getIcon(): string {
        const message = this.toastMessage();
        if (!message) return '';

        switch (message.type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    }
}
