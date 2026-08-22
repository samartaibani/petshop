import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from './notification.service';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(private notification: NotificationService) {
    // Load from local storage
    const stored = localStorage.getItem('cart');
    if (stored) {
      this.cartItems = JSON.parse(stored);
      this.cartSubject.next(this.cartItems);
    }
  }

  getCartItems() {
    return this.cartItems;
  }

  addToCart(product: any) {
    const existing = this.cartItems.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity < (existing.stock || 100)) { // Check stock if available
        existing.quantity += 1;
      } else {
        this.notification.showError('Cannot add more items. Stock limit reached.');
      }
    } else {
      this.cartItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        stock: product.stock, // Store stock
        type: product.type
      });
    }
    this.updateCart();
  }

  removeFromCart(productId: string) {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.updateCart();
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.cartItems.find(i => i.productId === productId);
    if (item) {
      if (quantity > item.stock) {
        this.notification.showError('Cannot increase quantity. Stock limit reached.');
        return;
      }
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
    }
    this.updateCart();
  }

  clearCart() {
    this.cartItems = [];
    this.updateCart();
  }

  getTotalAmount(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  private updateCart() {
    this.cartSubject.next(this.cartItems);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }
}
