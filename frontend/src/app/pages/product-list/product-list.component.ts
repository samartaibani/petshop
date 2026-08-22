import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PremiumSelectComponent } from '../../components/premium-select/premium-select.component';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumSelectComponent, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = 'All';
  searchQuery: string = '';
  currentType: string = 'all'; // 'pet', 'food', or 'all'

  // Pending filter states before Apply is clicked
  draftCategory: string = 'All';
  draftSortBy: string = '';
  draftSearchQuery: string = '';
  appliedSortBy: string = '';

  sortOptions = [
    { label: 'Default Selection', value: '' },
    { label: 'Price: High to Low', value: 'high-low' },
    { label: 'Price: Low to High', value: 'low-high' },
    { label: 'Most Rated', value: 'most-rated' }
  ];

  constructor(
    private api: ApiService,
    private cart: CartService,
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    // Listen to query parameters to filter by 'type'
    this.route.queryParams.subscribe(params => {
      this.currentType = params['type'] || 'all';
      this.applyFilters();
    });

    this.api.getProducts().subscribe(res => {
      this.products = res;
      this.applyFilters();
    });

    this.api.getCategories().subscribe(res => {
      this.categories = res;
    });

    if (this.auth.isAuthenticated()) {
      this.api.getWishlist().subscribe(res => {
        this.wishlistIds = res.map(item => item.product.id || item.product._id);
      }, err => {
        console.error('Failed to load wishlist', err);
      });
    }
  }

  wishlistIds: string[] = [];

  isInWishlist(productId: string): boolean {
    return this.wishlistIds.includes(productId);
  }

  toggleWishlist(product: any, event: Event) {
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.notification.showError('Please log in to add items to wishlist.');
      this.router.navigate(['/login']);
      return;
    }

    const productId = product.id || product._id;
    if (this.isInWishlist(productId)) {
      this.api.removeFromWishlist(productId).subscribe(() => {
        this.wishlistIds = this.wishlistIds.filter(id => id !== productId);
        this.notification.showSuccess('Removed from wishlist.');
      }, err => this.notification.showError('Failed to remove from wishlist'));
    } else {
      this.api.addToWishlist(productId).subscribe(() => {
        this.wishlistIds.push(productId);
        this.notification.showSuccess('Added to wishlist!');
      }, err => this.notification.showError('Failed to add to wishlist'));
    }
  }

  filterCategory(catId: string) {
    this.draftCategory = catId;
  }

  setDraftSort(sort: string) {
    this.draftSortBy = sort;
  }

  submitFilters() {
    this.selectedCategory = this.draftCategory;
    this.searchQuery = this.draftSearchQuery;
    this.appliedSortBy = this.draftSortBy;
    this.applyFilters();
  }

  applyFilters() {
    let temp = [...this.products];

    // Exclude live pets from the general products list
    if (this.currentType === 'all') {
      temp = temp.filter(p => p.type !== 'pet');
    } else {
      temp = temp.filter(p => p.type === this.currentType);
    }

    if (this.selectedCategory !== 'All') {
      temp = temp.filter(p => p.categoryId === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      temp = temp.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sorting Logic
    if (this.appliedSortBy === 'high-low') {
      temp.sort((a, b) => b.price - a.price);
    } else if (this.appliedSortBy === 'low-high') {
      temp.sort((a, b) => a.price - b.price);
    } else if (this.appliedSortBy === 'most-rated') {
      temp.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    this.filteredProducts = temp;
  }

  getCategoryName(id: string) {
    if (id === 'All') return 'All Products';
    const c = this.categories.find(c => c.id === id);
    return c ? c.name : 'Category';
  }

  getProductCountByCategory(catId: string): number {
    return this.products.filter(p => p.categoryId === catId).length;
  }

  addToCart(product: any) {
    this.cart.addToCart(product);
  }

  goToDetail(product: any) {
    const id = product.id || product._id;
    if (id) {
      this.router.navigate(['/products', id]);
    } else {
      console.error('Product ID not found', product);
      this.notification.showError('Error: Product Details not available');
    }
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

