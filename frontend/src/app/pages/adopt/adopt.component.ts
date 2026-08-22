import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { AdoptionModalService } from '../../services/adoption-modal.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PremiumSelectComponent } from '../../components/premium-select/premium-select.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-adopt',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumSelectComponent, RouterLink],
  templateUrl: './adopt.component.html',
  styleUrls: ['./adopt.component.css']
})
export class AdoptComponent implements OnInit, OnDestroy {
  pets: any[] = [];
  filteredPets: any[] = [];
  masterForm: any = null;
  searchQuery: string = '';
  categories: any[] = [];
  categoryOptions: { label: string, value: any }[] = [];
  selectedCategoryId: string = '';
  private subs = new Subscription();

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private router: Router,
    private adoptionModalService: AdoptionModalService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadPets();
    this.subs.add(
      this.auth.user$.subscribe(user => {
        if (user) {
          this.api.getMasterAdoptionForm().subscribe(form => {
            this.masterForm = form;
          });
        }
      })
    );
  }

  loadCategories() {
    this.api.getCategories().subscribe(res => {
      this.categories = res;
      this.categoryOptions = [
        { label: '-- All Categories --', value: '' },
        ...res.map(c => ({ label: c.name, value: c.id }))
      ];
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadPets() {
    this.api.getSubCategories().subscribe(subs => {
      this.api.getPets().subscribe(res => {
        this.pets = res.filter(p => p.status !== 'Adopted').map(p => {
          const sub = subs.find(s => s.id === p.subCategoryId);
          return { ...p, breedName: sub ? sub.name : p.breed };
        });
        this.filteredPets = [...this.pets];
      });
    });
  }

  applyFilter() {
    let filtered = [...this.pets];

    if (this.selectedCategoryId) {
      filtered = filtered.filter(p => p.categoryId === this.selectedCategoryId);
    }

    if (this.searchQuery) {
      let q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.breedName && p.breedName.toLowerCase().includes(q)) ||
        (p.breed && p.breed.toLowerCase().includes(q))
      );
    }

    this.filteredPets = filtered;
  }

  openAdoptForm(pet: any) {
    if (!this.auth.isAuthenticated()) {
      alert("Please login first to adopt a pet.");
      this.router.navigate(['/login']);
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
        error: (err) => {
          console.error(err);
          alert("Direct request failed. You might have already applied for this pet.");
        }
      });
      return;
    }

    // Fallback to manual form
    this.adoptionModalService.openForm(pet);
  }
}
