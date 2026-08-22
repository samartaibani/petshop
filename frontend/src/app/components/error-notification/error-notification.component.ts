import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-error-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-notification.component.html',
  styleUrls: ['./error-notification.component.css'],
  animations: [
    trigger('popInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%) scale(0.8)', opacity: 0 }),
        animate('0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
          style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', 
          style({ transform: 'translateY(-100%) scale(0.9)', opacity: 0 }))
      ])
    ])
  ]
})
export class ErrorNotificationComponent implements OnInit {
  message: string | null = null;
  isVisible = false;
  private timeoutId: any;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.error$.subscribe(msg => {
      this.message = msg;
      this.isVisible = true;

      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.isVisible = false;
      }, 5000);
    });
  }

  close() {
    this.isVisible = false;
  }
}
