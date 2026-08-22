import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PremiumSelectComponent } from '../../components/premium-select/premium-select.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumSelectComponent, RouterModule],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css']
})
export class OrderManagementComponent implements OnInit {
  orders: any[] = [];
  statusOptions: string[] = ['Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled'];
  statusOptionsMapped: { label: string, value: any }[] = [];
  users: any[] = [];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadOrders();
    this.statusOptionsMapped = this.statusOptions.map(s => ({
      label: s,
      value: s
    }));
  }

  loadOrders() {
    this.api.getOrders().subscribe(res => this.orders = res);
    this.api.getAllUsers().subscribe(res => this.users = res);
  }

  getUserName(uid: string) {
    const u = this.users.find(x => x.uid === uid);
    return u ? u.name : uid;
  }

  // Helper for Status Badge Color
  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'badge bg-warning text-dark';
      case 'Confirmed': return 'badge bg-info text-dark';
      case 'Processing': return 'badge bg-primary';
      case 'Delivered': return 'badge bg-success';
      case 'Cancelled': return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  }

  // Helper for Payment Status Badge
  getPaymentClass(status: string): string {
    return status === 'Paid' ? 'badge bg-success' : 'badge bg-warning text-dark';
  }

  // Helper for Payment Method Label (Optional separate styling)
  getMethodClass(method: string): string {
    if (method === 'COD') return 'badge bg-dark';
    if (method === 'Card') return 'badge bg-primary';
    return 'badge bg-secondary';
  }

  // Lock logic: If Delivered, Disable actions (or whatever the final status is)
  isLocked(order: any): boolean {
    return order.status === 'Delivered' || order.status === 'Cancelled';
  }

  // Update Status
  updateStatus(id: string, status: string) {
    if (this.isLocked(this.orders.find(o => o.id === id))) return;

    this.api.updateOrderStatus(id, status).subscribe(() => {
      setTimeout(() => {
        this.loadOrders();
      }, 500);
    });
  }

  deleteOrder(id: string) {
    if (confirm('Delete this order? This action cannot be undone.')) {
      this.api.deleteOrder(id).subscribe(() => {
        this.loadOrders();
      });
    }
  }
}
