import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PdfService } from '../../services/pdf.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  orders: any[] = [];
  selectedOrderForPdf: any = null;

  constructor(
    private api: ApiService,
    private pdfService: PdfService,
    public auth: AuthService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.api.getOrders().subscribe(res => {
      this.orders = res;
    });
  }

  downloadInvoice(order: any) {
    this.selectedOrderForPdf = order;
    // Wait for view to update then print
    setTimeout(() => {
      this.pdfService.generateInvoice('invoice-content', `invoice-${order.id}`);
      // this.selectedOrderForPdf = null; // Keep it or hide it? 
    }, 100);
  }

  cancelOrder(id: string) {
    this.notification.confirm({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.api.deleteOrder(id).subscribe(() => {
          this.notification.showSuccess('Order cancelled successfully.');
          // Refresh list
          this.api.getOrders().subscribe(res => this.orders = res);
        });
      }
    });
  }
}
