import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  wishlistItems: any[] = [];
  loading: boolean = true;

  constructor(
    private api: ApiService, 
    private cart: CartService, 
    private router: Router,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist() {
    this.loading = true;
    this.api.getWishlist().subscribe({
      next: (res) => {
        this.wishlistItems = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load wishlist:', err);
        this.loading = false;
      }
    });
  }

  removeFromWishlist(item: any) {
    const productId = item.product.id || item.product._id;
    this.api.removeFromWishlist(productId).subscribe(() => {
      this.wishlistItems = this.wishlistItems.filter(w => w.wishlistId !== item.wishlistId);
      this.notification.showSuccess('Removed from wishlist.');
    }, err => this.notification.showError('Failed to remove item'));
  }

  addToCart(item: any) {
    this.cart.addToCart(item.product);
  }

  goToDetail(product: any) {
    const id = product.id || product._id;
    this.router.navigate(['/products', id]);
  }

  getStarsArr(rating: number = 0): number[] {
    const stars = [0, 0, 0, 0, 0];
    for (let i = 0; i < 5; i++) {
      if (rating >= i + 1) {
        stars[i] = 1; // Full star
      } else if (rating > i) {
        stars[i] = 0.5; // Half star
      }
    }
    return stars;
  }
}
