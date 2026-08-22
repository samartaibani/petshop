import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  stats = {
    totalPets: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalCustomers: 0
  };
  loading = true;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.api.getPublicStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.loading = false;
      }
    });
  }
}
