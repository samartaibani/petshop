import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { AdoptionModalService } from '../../services/adoption-modal.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: any;
  categories: any[] = [];
  selectedImage: string | null = null;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cart: CartService,
    public auth: AuthService,
    private adoptionModalService: AdoptionModalService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Fetch categories and subcategories
    this.api.getCategories().subscribe(cats => {
      this.categories = cats;
      this.api.getSubCategories().subscribe(subs => {
        const subCategories = subs;

        if (id) {
          this.api.getProduct(id).subscribe(res => {
            this.product = res;
            this.selectedImage = this.product.imageUrl || (this.product.images && this.product.images.length > 0 ? this.product.images[0] : null);

            // Map category name
            if (this.product.categoryId) {
              const cat = this.categories.find(c => c.id === this.product.categoryId);
              if (cat) this.product.categoryName = cat.name;
            }

            // Map breed name from subCategoryId
            if (this.product.subCategoryId) {
              const sub = subCategories.find(s => s.id === this.product.subCategoryId);
              if (sub) this.product.breedName = sub.name;
            }

            this.loadRatings(id);
            this.checkWishlistStatus(id);
            this.loadMasterForm();
          });
        }
      });
    });
  }

  changeImage(url: string) {
    this.selectedImage = url;
  }

  addToCart() {
    if (this.product) {
      if (this.product.type === 'pet') {
        this.openAdoptForm(this.product);
        return;
      }
      for (let i = 0; i < this.quantity; i++) {
        this.cart.addToCart(this.product);
      }
    }
  }

  // --- Adoption Logic ---
  masterForm: any = null;
  loadMasterForm() {
    const user = this.auth.getUser();
    if (user) {
      this.api.getMasterAdoptionForm().subscribe(form => this.masterForm = form);
    }
  }

  openAdoptForm(pet: any) {
    if (!this.auth.isAuthenticated()) {
      alert("Please login first to adopt a pet.");
      return;
    }

    if (this.masterForm) {
      const user = this.auth.getUser();
      const payload = {
        petId: pet.id || pet._id,
        userId: user?.uid,
        formData: this.masterForm.formData,
        userImage: this.masterForm.userImage,
        familyMembers: this.masterForm.familyMembers
      };
      this.api.createAdoptionRequest(payload).subscribe({
        next: () => {
          this.notification.showSuccess(`Request Sent Successfully for ${pet.name}`);
        },
        error: () => this.notification.showError("Direct request failed. You might have already applied.")
      });
      return;
    }

    // Fallback to global modal (assuming it's imported correctly in the module)
    // Actually, I should use AdoptionModalService
    this.adoptionModalService.openForm(pet);
  }

  // --- Ratings Logic ---
  ratings: any[] = [];
  newRatingValue: number = 5;
  newRatingMessage: string = '';

  loadRatings(productId: string) {
    this.api.getProductRatings(productId).subscribe(res => {
      this.ratings = res;
    });
  }

  submitRating() {
    if (!this.auth.isAuthenticated()) {
      this.notification.showError("Please login to submit a review.");
      return;
    }
    if (!this.product) return;

    const productId = this.product.id || this.product._id;
    this.api.addRating(productId, this.newRatingValue, this.newRatingMessage).subscribe(res => {
      this.notification.showSuccess('Review submitted successfully!');
      // Update local stats so we don't need to refresh entire page
      this.product.averageRating = res.averageRating;
      this.product.ratingCount = res.ratingCount;
      this.newRatingMessage = '';
      this.loadRatings(productId);
    }, err => {
      this.notification.showError('Failed to submit review');
      console.error(err);
    });
  }

  // --- Wishlist Logic ---
  isInWishlist: boolean = false;

  checkWishlistStatus(productId: string) {
    if (!this.auth.isAuthenticated()) return;
    this.api.getWishlist().subscribe(wishlist => {
      this.isInWishlist = wishlist.some(item => (item.product.id || item.product._id) === productId);
    });
  }

  toggleWishlist(product: any, event: Event) {
    event.stopPropagation();
    if (!this.auth.isAuthenticated()) {
      this.notification.showError("Please login to manage wishlist.");
      return;
    }
    const productId = product.id || product._id;
    if (this.isInWishlist) {
      this.api.removeFromWishlist(productId).subscribe(() => {
        this.isInWishlist = false;
        this.notification.showSuccess('Removed from wishlist');
      }, err => this.notification.showError('Failed to remove from wishlist'));
    } else {
      this.api.addToWishlist(productId).subscribe(() => {
        this.isInWishlist = true;
        this.notification.showSuccess('Added to wishlist');
      }, err => this.notification.showError('Failed to add to wishlist'));
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
