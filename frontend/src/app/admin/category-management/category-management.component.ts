import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PremiumSelectComponent } from '../../components/premium-select/premium-select.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PremiumSelectComponent, RouterModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  categories: any[] = [];
  subCategories: any[] = [];
  categoryOptions: { label: string, value: any }[] = [];
  selectedCategoryId: string = 'all';

  categoryForm: FormGroup;
  subCategoryForm: FormGroup;
  isEditMode = false;
  editingId: string | null = null;
  isSubEditMode = false;
  subEditingId: string | null = null;

  showForm = false;
  showSubForm = false;
  errorMsg = '';
  activeView: 'categories' | 'subcategories' = 'categories';

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.subCategoryForm = this.fb.group({
      categoryId: ['', Validators.required],
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.api.getCategories().subscribe(res => {
      this.categories = res;
      this.categoryOptions = [
        { label: 'All Categories', value: 'all' },
        ...res.map(c => ({ label: c.name, value: c.id }))
      ];
    });
    this.api.getSubCategories().subscribe(res => this.subCategories = res);
  }

  get filteredSubCategories() {
    if (this.selectedCategoryId === 'all') {
      return this.subCategories;
    }
    return this.subCategories.filter(sub => sub.categoryId === this.selectedCategoryId);
  }

  setView(view: 'categories' | 'subcategories') {
    this.activeView = view;
  }

  getCategoryName(id: string) {
    const c = this.categories.find(c => c.id === id);
    return c ? c.name : id;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.showSubForm = false;
    if (!this.showForm) this.resetForm();
  }

  toggleSubForm() {
    this.showSubForm = !this.showSubForm;
    this.showForm = false;
    if (!this.showSubForm) this.resetSubForm();
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      if (this.isEditMode && this.editingId) {
        this.api.updateCategory(this.editingId, this.categoryForm.value).subscribe(() => {
          this.loadData();
          this.toggleForm();
        });
      } else {
        this.api.addCategory(this.categoryForm.value).subscribe(() => {
          this.loadData();
          this.toggleForm();
        });
      }
    }
  }

  onSubmitSub() {
    if (this.subCategoryForm.valid) {
      if (this.isSubEditMode && this.subEditingId) {
        this.api.updateSubCategory(this.subEditingId, this.subCategoryForm.value).subscribe(() => {
          this.loadData();
          this.toggleSubForm();
        });
      } else {
        this.api.addSubCategory(this.subCategoryForm.value).subscribe(() => {
          this.loadData();
          this.toggleSubForm();
        });
      }
    }
  }

  edit(cat: any) {
    this.isEditMode = true;
    this.editingId = cat.id;
    this.showForm = true;
    this.categoryForm.patchValue({ name: cat.name });
  }

  editSub(sub: any) {
    this.isSubEditMode = true;
    this.subEditingId = sub.id;
    this.showSubForm = true;
    this.subCategoryForm.patchValue({
      categoryId: sub.categoryId,
      name: sub.name
    });
  }

  delete(id: string) {
    this.api.deleteCategory(id).subscribe(() => this.loadData());
  }

  deleteSub(id: string) {
    this.api.deleteSubCategory(id).subscribe(() => this.loadData());
  }

  resetForm() {
    this.isEditMode = false;
    this.editingId = null;
    this.categoryForm.reset();
  }

  resetSubForm() {
    this.isSubEditMode = false;
    this.subEditingId = null;
    this.subCategoryForm.reset();
  }
}
