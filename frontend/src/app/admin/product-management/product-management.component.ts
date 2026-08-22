import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PremiumSelectComponent } from '../../components/premium-select/premium-select.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PremiumSelectComponent, RouterModule],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  categoryOptions: { label: string, value: any }[] = [];
  filterCategoryOptions: { label: string, value: any }[] = [];
  productForm: FormGroup;
  isEditMode = false;
  editingId: string | null = null;
  selectedFiles: FileList | null = null;
  showForm = false;
  filterCategoryId = '';
  searchQuery = '';

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      type: ['food', Validators.required],
      name: ['', Validators.required],
      description: [''],
      price: [0, Validators.required],
      stock: [0, Validators.required],
      categoryId: ['', Validators.required],
      companyName: [''],
      expiryDate: [''],
      weight: [''],
      dietary: [''],
      foodType: [''],
      flavor: [''],
      dailyNeeds: [''],
      documentation: ['']
    });
  }

  dietaryOptions = [
    { label: 'Veg', value: 'Veg' },
    { label: 'Non-Veg', value: 'Non-Veg' }
  ];

  foodTypeOptions = [
    { label: 'Dry Food', value: 'Dry Food' },
    { label: 'Wet Food', value: 'Wet Food' },
    { label: 'Daily Food', value: 'Daily Food' },
    { label: 'Treats', value: 'Treats' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.api.getFood().subscribe(res => this.products = res);
    this.api.getCategories().subscribe(res => {
      this.categories = res;
      this.categoryOptions = res.map(c => ({ label: c.name, value: c.id }));
      this.filterCategoryOptions = [
        { label: 'All Categories', value: '' },
        ...this.categoryOptions
      ];
    });
  }

  get visibleProducts() {
    let filtered = this.products;
    if (this.filterCategoryId) {
      filtered = filtered.filter(p => p.categoryId === this.filterCategoryId);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
    }
    return filtered;
  }

  getCategoryName(id: string) {
    const c = this.categories.find(c => c.id === id);
    return c ? c.name : id;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formData = new FormData();
      Object.keys(this.productForm.value).forEach(key => {
        formData.append(key, this.productForm.value[key]);
      });

      if (this.selectedFiles && this.selectedFiles.length > 0) {
        for (let i = 0; i < this.selectedFiles.length; i++) {
          formData.append('images', this.selectedFiles[i]);
        }
      }

      if (this.isEditMode && this.editingId) {
        this.api.updateProduct(this.editingId, this.productForm.value).subscribe({
          next: () => {
            this.resetForm();
            this.loadData();
          }
        });
      } else {
        this.api.addProduct(formData).subscribe({
          next: () => {
            this.resetForm();
            this.loadData();
          }
        });
      }
    }
  }

  edit(p: any) {
    this.isEditMode = true;
    this.editingId = p.id;
    this.showForm = true;
    this.productForm.patchValue({
      type: p.type || 'food',
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      categoryId: p.categoryId,
      companyName: p.companyName,
      expiryDate: p.expiryDate,
      weight: p.weight,
      dietary: p.dietary,
      foodType: p.foodType,
      flavor: p.flavor,
      dailyNeeds: p.dailyNeeds,
      documentation: p.documentation
    });
  }

  delete(id: string) {
    this.api.deleteProduct(id).subscribe(() => this.loadData());
  }

  resetForm() {
    this.isEditMode = false;
    this.editingId = null;
    this.productForm.reset({ type: 'food' });
    this.selectedFiles = null;
    this.showForm = false;
  }
}
