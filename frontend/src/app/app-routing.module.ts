import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
// Admin
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ProductManagementComponent } from './admin/product-management/product-management.component';
import { CategoryManagementComponent } from './admin/category-management/category-management.component';
import { OrderManagementComponent } from './admin/order-management/order-management.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { AdoptComponent } from './pages/adopt/adopt.component';
import { AdoptionManagementComponent } from './admin/adoption-management/adoption-management.component';
import { MyAdoptionsComponent } from './pages/my-adoptions/my-adoptions.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdoptionDetailComponent } from './pages/adoption-detail/adoption-detail.component';
import { MyPetsComponent } from './pages/my-pets/my-pets.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'adopt', component: AdoptComponent },
  { path: 'adopt/:id', component: AdoptionDetailComponent },

  // User Protected
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'order-success', component: OrderSuccessComponent, canActivate: [AuthGuard] },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'my-adoptions', component: MyAdoptionsComponent, canActivate: [AuthGuard] },
  { path: 'my-pets', component: MyPetsComponent, canActivate: [AuthGuard] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [AuthGuard] },

  // Admin Protected
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductManagementComponent },
      { path: 'categories', component: CategoryManagementComponent },
      { path: 'orders', component: OrderManagementComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'adoptions', component: AdoptionManagementComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
