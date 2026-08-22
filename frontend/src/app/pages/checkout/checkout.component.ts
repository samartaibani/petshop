import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  subtotal = 0;
  taxAmount = 0;
  shippingCost = 0;
  grandTotal = 0;
  checkoutForm: FormGroup;
  currentStep = 1; // 1: Shipping Address, 2: Shipping Method, 3: Review, 4: Payment
  paymentMethod: string = 'Card';
  addresses: any[] = [];
  selectedAddressIndex: number = 0;

  // Form Fields for Manual entry
  cardNumber: string = '';
  cardExp: string = '';
  cardCvv: string = '';
  upiId: string = '';

  constructor(
    private cart: CartService,
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private notification: NotificationService
  ) {
    this.checkoutForm = this.fb.group({
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cartItems = this.cart.getCartItems();
    this.subtotal = this.cart.getTotalAmount();
    // 18% GST (or Estimated tax as per mockup)
    this.taxAmount = Math.round(this.subtotal * 0.18);
    // Free Shipping default
    this.shippingCost = 0;
    this.grandTotal = this.subtotal + this.taxAmount + this.shippingCost;

    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    this.api.getProfile().subscribe(profile => {
      if (profile) {
        this.addresses = profile.addresses || [];
        if (this.addresses.length > 0) {
          this.selectAddress(0);
        }
      }
    });
  }

  selectAddress(index: number) {
    this.selectedAddressIndex = index;
    const addr = this.addresses[index];
    if (addr) {
      const formattedStr = `${addr.houseNumber}, ${addr.buildingName}, ${addr.areaName}, ${addr.cityName} - ${addr.pincode}`;
      this.checkoutForm.patchValue({ address: formattedStr });
    }
  }

  goToStep(step: number) {
    if (step === 2 && this.currentStep === 1) {
      if (this.addresses.length === 0 || this.checkoutForm.invalid) {
        return; // block if no address 
      }
    }
    this.currentStep = step;
  }

  selectShipping(cost: number) {
    this.shippingCost = cost;
    this.grandTotal = this.subtotal + this.taxAmount + this.shippingCost;
  }

  selectPayment(method: string) {
    this.paymentMethod = method;
  }

  validatePaymentAndProceed() {
    if (this.paymentMethod === 'Card') {
      if (!this.cardNumber || !this.cardExp || !this.cardCvv) {
        this.notification.showError("Please complete all credit card fields before proceeding.");
        return;
      }
    } else if (this.paymentMethod === 'UPI') {
      if (!this.upiId) {
        this.notification.showError("Please enter a valid UPI ID before proceeding.");
        return;
      }
    }
    // If validation passes (or COD selected):
    this.processPayment();
  }

  processPayment() {
    this.submitOrder(this.paymentMethod);
  }

  submitOrder(method: string) {
    const val = this.checkoutForm.value;
    const isPaid = method !== 'COD';

    this.auth.user$.subscribe(user => {
      if (user) {
        const orderData = {
          userId: user.uid,
          items: this.cartItems,
          totalAmount: this.grandTotal,
          paymentStatus: isPaid ? 'Paid' : 'Pending',
          paymentMethod: method,
          customerName: user.displayName || 'Customer',
          email: user.email || 'customer@example.com',
          phone: 'N/A',
          address: val.address
        };

        this.api.createOrder(orderData).subscribe({
          next: () => {
            this.cart.clearCart();
            // Redirect to Success Page
            this.router.navigate(['/order-success']);
          },
          error: (err) => {
            console.error(err);
            this.notification.showError("Order Failed: " + (err.error?.error || err.message));
          }
        });
      } else {
        this.notification.showError('Please login to place an order.');
        this.router.navigate(['/login']);
      }
    });
  }
}
