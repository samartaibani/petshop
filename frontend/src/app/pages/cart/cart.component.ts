import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  total = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(data => {
      this.items = data;
      this.total = this.cartService.getTotalAmount();
    });
  }

  increase(id: string, qty: number) {
    this.cartService.updateQuantity(id, qty + 1);
  }

  decrease(id: string, qty: number) {
    this.cartService.updateQuantity(id, qty - 1);
  }

  remove(id: string) {
    this.cartService.removeFromCart(id);
  }

  clear() {
    this.cartService.clearCart();
  }
}
