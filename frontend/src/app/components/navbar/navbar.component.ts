import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { AdoptionModalService } from '../../services/adoption-modal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  cartCount = 0;

  isUserMenuOpen = false;

  constructor(
    private auth: AuthService,
    private cartService: CartService,
    private router: Router,
    private eRef: ElementRef,
    public adoptionModalService: AdoptionModalService
  ) { }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
    }
  }

  ngOnInit(): void {
    // Auth State
    this.auth.user$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    // Role State
    this.auth.role$.subscribe(role => {
      this.isAdmin = role === 1;
    });

    // Cart Count
    this.cartService.cart$.subscribe(items => {
      this.cartCount = items.reduce((acc: any, item: any) => acc + item.quantity, 0);
    });
  }

  toggleUser(event: Event) {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeMenus() {
    this.isUserMenuOpen = false;
  }

  openGeneralForm() {
    this.closeMenus();
    this.adoptionModalService.openForm();
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.closeMenus();
      this.router.navigate(['/login']);
    });
  }
}
