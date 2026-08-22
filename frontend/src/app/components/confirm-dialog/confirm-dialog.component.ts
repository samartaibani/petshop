import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ConfirmData } from '../../services/notification.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
  animations: [
    trigger('overlayFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalSlide', [
      transition(':enter', [
        style({ transform: 'translateY(20px) scale(0.95)', opacity: 0 }),
        animate('0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', 
          style({ transform: 'translateY(10px) scale(0.98)', opacity: 0 }))
      ])
    ])
  ]
})
export class ConfirmDialogComponent implements OnInit {
  data: ConfirmData | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.confirm$.subscribe(data => {
      this.data = data;
      document.body.style.overflow = 'hidden';
    });
  }

  onConfirm() {
    this.notificationService.sendConfirmResponse(true);
    this.close();
  }

  onCancel() {
    this.notificationService.sendConfirmResponse(false);
    this.close();
  }

  private close() {
    this.data = null;
    document.body.style.overflow = '';
  }
}
