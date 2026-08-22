import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { PremiumSelectComponent } from '../premium-select/premium-select.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdoptionModalService, AdoptionModalMode } from '../../services/adoption-modal.service';
import { compressImage } from '../../utils/image-utils';
import { Subject, takeUntil, first } from 'rxjs';


@Component({
  selector: 'app-adoption-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumSelectComponent],
  templateUrl: './adoption-form.component.html',
  styleUrls: ['./adoption-form.component.css']
})
export class AdoptionFormComponent implements OnInit, OnDestroy {
  @Input() pet: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  formData = {
    fullName: '',
    phone: '',
    address: '',
    email: '',
    occupation: '',
    city: '',
    houseType: 'Apartment',
    hasYard: false,
    hasFencedYard: false,
    otherPets: '',
    childrenInHome: false,
    experience: '',
    reason: '',
    canAffordVets: true,
    dailyRoutine: '',
    timeForPet: '',
    familyMembers: 1
  };

  userImage: string | null = null;

  submitting = false;

  houseTypeOptions = [
    { label: 'Apartment', value: 'Apartment' },
    { label: 'Independent House', value: 'Independent House' },
    { label: 'Villa / Farmhouse', value: 'Villa' }
  ];
  isEdit = false;
  mode: AdoptionModalMode = AdoptionModalMode.REQUEST;
  requestId: string | null = null; // Can also be masterFormId

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private modalService: AdoptionModalService
  ) { }

  ngOnInit(): void {
    this.modalService.mode$.pipe(takeUntil(this.destroy$)).subscribe(m => this.mode = m);
    this.modalService.isEdit$.pipe(takeUntil(this.destroy$)).subscribe(edit => this.isEdit = edit);
    this.modalService.requestData$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data) {
        this.requestId = data.id;
        this.formData = { ...data.formData };
        this.userImage = data.userImage || null;
        if (data.familyMembers) this.formData.familyMembers = data.familyMembers;
      } else {
        this.resetForm();
      }
    });

    // If it's a REQUEST and we're NOT editing, try to auto-fill from MASTER_FORM if available
    this.auth.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user && this.mode === AdoptionModalMode.REQUEST && !this.isEdit) {
        this.api.getMasterAdoptionForm().pipe(first()).subscribe(form => {
          if (form) {
            this.formData = { ...form.formData };
            this.userImage = form.userImage || null;
            if (form.familyMembers) this.formData.familyMembers = form.familyMembers;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetForm() {
    this.requestId = null;
    this.userImage = null;
    this.formData = {
      fullName: '',
      phone: '',
      address: '',
      email: '',
      occupation: '',
      city: '',
      houseType: 'Apartment',
      hasYard: false,
      hasFencedYard: false,
      otherPets: '',
      childrenInHome: false,
      experience: '',
      reason: '',
      canAffordVets: true,
      dailyRoutine: '',
      timeForPet: '',
      familyMembers: 1
    };
  }

  submit() {
    if (!this.formData.fullName || !this.formData.phone || !this.formData.address || !this.formData.city) {
      alert("Please fill out the essential fields (Name, Phone, Address, City).");
      return;
    }

    this.submitting = true;

    const payload = {
      userId: '', // to be filled
      formData: this.formData,
      userImage: this.userImage,
      familyMembers: this.formData.familyMembers
    };

    if (this.mode === AdoptionModalMode.MASTER_FORM) {
      this.handleMasterFormSubmit(payload);
    } else {
      this.handleRequestSubmit(payload);
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const originalBase64 = e.target.result;
        try {
          // Compress to max 600x600 with 0.6 quality for profile photos
          this.userImage = await compressImage(originalBase64, 600, 600, 0.6);
        } catch (error) {
          console.error("Compression failed, using original:", error);
          this.userImage = originalBase64;
        }
      };
      reader.readAsDataURL(file);
    }
  }


  private handleMasterFormSubmit(payload: any) {
    this.auth.user$.pipe(first()).subscribe(user => {
      if (user) {
        payload.userId = user.uid;
        if (this.isEdit && this.requestId) {
          this.api.updateMasterAdoptionForm(this.requestId, payload).pipe(first()).subscribe({
            next: () => {
              this.submitting = false;
              this.success.emit();
            },
            error: err => {
              console.error(err);
              this.submitting = false;
              alert("Update failed.");
            }
          });
        } else {
          this.api.saveMasterAdoptionForm(payload).pipe(first()).subscribe({
            next: () => {
              this.submitting = false;
              this.success.emit();
            },
            error: err => {
              console.error(err);
              this.submitting = false;
              alert("Failed to save. You might already have a form.");
            }
          });
        }
      } else {
        this.submitting = false;
      }
    });
  }

  private handleRequestSubmit(payload: any) {
    if (this.isEdit && this.requestId) {
      this.api.updateAdoptionRequest(this.requestId, payload).pipe(first()).subscribe({
        next: () => {
          this.submitting = false;
          this.success.emit();
        },
        error: (err) => {
          console.error(err);
          this.submitting = false;
          alert("Failed to update application.");
        }
      });
    } else {
      this.auth.user$.pipe(first()).subscribe(user => {
        if (user) {
          payload.userId = user.uid;
          payload.petId = this.pet ? (this.pet.id || this.pet._id) : 'General Interest';

          this.api.createAdoptionRequest(payload).pipe(first()).subscribe({
            next: () => {
              this.submitting = false;
              this.success.emit();
            },
            error: (err) => {
              console.error(err);
              this.submitting = false;
              alert("Failed to submit request.");
            }
          });
        } else {
          this.submitting = false;
        }
      });
    }
  }
}
