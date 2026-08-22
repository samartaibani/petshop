import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AdoptionModalService } from '../../services/adoption-modal.service';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-adoption-detail',
  templateUrl: './adoption-detail.component.html',
  styleUrl: './adoption-detail.component.css'
})
export class AdoptionDetailComponent implements OnInit, OnDestroy {
  pet: any = null;
  loading: boolean = true;
  masterForm: any = null;
  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public auth: AuthService,
    private router: Router,
    private adoptionModalService: AdoptionModalService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPetDetail(id);
      this.loadMasterForm();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadPetDetail(id: string) {
    this.loading = true;
    forkJoin({
      pet: this.api.getProduct(id),
      subs: this.api.getSubCategories()
    }).subscribe({
      next: (res) => {
        const sub = res.subs.find(s => s.id === res.pet.subCategoryId);
        this.pet = { ...res.pet, breedName: sub ? sub.name : res.pet.breed };
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadMasterForm() {
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

  goBack() {
    this.router.navigate(['/adopt']);
  }

  openAdoptForm() {
    if (!this.auth.isAuthenticated()) {
      alert("Please login first to adopt a pet.");
      this.router.navigate(['/login']);
      return;
    }

    if (this.masterForm) {
      if (confirm(`We found your saved adoption profile! Would you like to submit a direct request for ${this.pet.name} using your profile details?`)) {
        const user = this.auth.getUser();
        const payload = {
          petId: this.pet.id || this.pet._id,
          userId: user?.uid,
          formData: this.masterForm.formData,
          userImage: this.masterForm.userImage,
          familyMembers: this.masterForm.familyMembers
        };
        this.api.createAdoptionRequest(payload).subscribe({
          next: () => {
            alert(`Success! Your request to adopt ${this.pet.name} has been sent. Track it in "My Adoptions".`);
          },
          error: (err) => {
            console.error(err);
            alert("Direct request failed. You might have already applied for this pet.");
          }
        });
        return;
      }
    }

    // Fallback to manual form
    this.adoptionModalService.openForm(this.pet);
  }
}
