import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalOrders = 0;
  totalProducts = 0;
  totalUsers = 0;
  totalRevenue = 0;
  totalAdoptions = 0;
  recentOrders: any[] = [];
  recentAdoptions: any[] = [];
  categories: any[] = [];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    // Standard Metrics
    this.api.getProducts().subscribe(products => this.totalProducts = products.length);
    this.api.getAllUsers().subscribe(users => this.totalUsers = users.length);
    this.api.getCategories().subscribe(cats => this.categories = cats);
    
    this.api.getAdoptionRequests().subscribe(adoptions => {
      this.totalAdoptions = adoptions.length;
      this.recentAdoptions = adoptions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
    });

    this.api.getOrders().subscribe(orders => {
      this.totalOrders = orders.length;
      this.totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
      this.recentOrders = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
    });
  }
}
