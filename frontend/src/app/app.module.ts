import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './services/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AdminNavbarComponent } from './components/admin-navbar/admin-navbar.component';
import { FooterComponent } from './components/footer/footer.component';
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
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ProductManagementComponent } from './admin/product-management/product-management.component';
import { CategoryManagementComponent } from './admin/category-management/category-management.component';
import { OrderManagementComponent } from './admin/order-management/order-management.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AdoptComponent } from './pages/adopt/adopt.component';
import { AdoptionManagementComponent } from './admin/adoption-management/adoption-management.component';
import { MyAdoptionsComponent } from './pages/my-adoptions/my-adoptions.component';
import { AdoptionFormComponent } from './components/adoption-form/adoption-form.component';
import { SuccessNotificationComponent } from './components/success-notification/success-notification.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ErrorNotificationComponent } from './components/error-notification/error-notification.component';
import { AdoptionDetailComponent } from './pages/adoption-detail/adoption-detail.component';
import { MyPetsComponent } from './pages/my-pets/my-pets.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AdminNavbarComponent,
    FooterComponent,
    HomeComponent,
    ProductDetailComponent,
    CartComponent,
    CheckoutComponent,
    OrderSuccessComponent,
    ProfileComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    UserManagementComponent,
    PaymentComponent,
    AboutComponent,
    ContactComponent,
    MyAdoptionsComponent,
    AdoptionDetailComponent,
    MyPetsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ProductListComponent,
    ProductManagementComponent,
    CategoryManagementComponent,
    OrderManagementComponent,
    AdoptComponent,
    AdoptionManagementComponent,
    AdoptionFormComponent,
    MyOrdersComponent,
    WishlistComponent,
    SuccessNotificationComponent,
    ConfirmDialogComponent,
    ErrorNotificationComponent,
    BrowserAnimationsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
