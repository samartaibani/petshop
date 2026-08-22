import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Auth: Send Token & Get Profile/Role
  loginBackend(idToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { idToken });
  }

  registerBackend(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  // Products
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }
  getPets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products?type=pet`);
  }
  getFood(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products?type=food`);
  }
  getProduct(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`);
  }
  addProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, formData);
  }
  updateProduct(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${id}`, data);
  }
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  // Categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }
  addCategory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, data);
  }
  updateCategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${id}`, data);
  }
  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  // SubCategories
  getSubCategories(catId?: string): Observable<any[]> {
    let url = `${this.apiUrl}/subcategories`;
    if (catId) url += `?categoryId=${catId}`;
    return this.http.get<any[]>(url);
  }
  addSubCategory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/subcategories`, data);
  }
  updateSubCategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/subcategories/${id}`, data);
  }
  deleteSubCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subcategories/${id}`);
  }

  // Orders
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, orderData);
  }
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`);
  }
  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/orders/${id}`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  // Wishlist
  getWishlist(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/wishlist`);
  }
  addToWishlist(productId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/wishlist`, { productId });
  }
  removeFromWishlist(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/wishlist/${productId}`);
  }

  // Users
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/profile`);
  }
  updateProfile(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/profile`, formData);
  }
  updateAddresses(addresses: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/addresses`, { addresses });
  }
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }
  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/change-password`, data);
  }

  // Ratings
  addRating(productId: string, rating: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ratings`, { productId, rating, message });
  }

  getProductRatings(productId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ratings/${productId}`);
  }

  // Stats
  getPublicStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  // Contact
  sendContactMessage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact`, data);
  }

  // Adoptions
  createAdoptionRequest(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/adoptions`, data);
  }

  getAdoptionRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/adoptions`);
  }

  updateAdoptionStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/adoptions/${id}/status`, { status });
  }

  updateAdoptionDelivery(id: string, deliveryData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/adoptions/${id}/delivery`, deliveryData);
  }

  updateAdoptionRequest(id: string, formData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/adoptions/${id}`, { formData });
  }

  deleteAdoptionRequest(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/adoptions/${id}`);
  }

  payAdoptionFee(id: string, paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/adoptions/${id}/pay`, paymentData);
  }

  // Master Adoption Forms (Table: adoption_forms)
  getMasterAdoptionForm(): Observable<any> {
    return this.http.get(`${this.apiUrl}/adoption-forms`);
  }

  saveMasterAdoptionForm(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/adoption-forms`, data);
  }

  updateMasterAdoptionForm(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/adoption-forms/${id}`, data);
  }

  deleteMasterAdoptionForm(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/adoption-forms/${id}`);
  }
}

