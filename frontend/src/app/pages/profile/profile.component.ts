import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { first } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  profileImage: string | null = null;
  selectedFile: File | null = null;
  msg = '';
  isUploading = false;

  // Password Reset States
  changePasswordForm: FormGroup;
  pwdMsg = '';
  isPwdLoading = false;

  // Address States
  addresses: any[] = [];
  addressForm: FormGroup;
  isSavingAddress = false;


  constructor(
    private api: ApiService, 
    private fb: FormBuilder, 
    private auth: AuthService,
    private notification: NotificationService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });

    this.changePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.addressForm = this.fb.group({
      houseNumber: ['', Validators.required],
      buildingName: ['', Validators.required],
      areaName: ['', Validators.required],
      cityName: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.api.getProfile().subscribe(res => {
      this.profileForm.patchValue({
        name: res.name || res.username || '',
        email: res.email,
        phone: res.phone || ''
      });
      this.profileImage = res.profileImage;
      this.addresses = res.addresses || [];
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      // Preview the image instantly
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isUploading = true;
      const formData = new FormData();
      formData.append('name', this.profileForm.get('name')?.value);
      formData.append('phone', this.profileForm.get('phone')?.value);

      if (this.selectedFile) {
        formData.append('profileImage', this.selectedFile);
      }

      this.api.updateProfile(formData).subscribe({
        next: (res) => {
          this.msg = 'Profile Updated Successfully!';
          if (res.profileImage) {
            this.profileImage = res.profileImage;
          }
          this.isUploading = false;
          setTimeout(() => this.msg = '', 3000); // clear message
        },
        error: (err) => {
          this.msg = "Error updating profile.";
          this.isUploading = false;
        }
      });
    }
  }

  // --- Password Reset ---
  changePassword() {
    if (this.changePasswordForm.valid) {
      this.isPwdLoading = true;
      const data = {
        newPassword: this.changePasswordForm.get('newPassword')?.value
      };

      this.api.changePassword(data).subscribe({
        next: (res) => {
          this.pwdMsg = "Password changed successfully!";
          this.changePasswordForm.reset();
          this.isPwdLoading = false;
          setTimeout(() => this.pwdMsg = '', 5000);
        },
        error: (err) => {
          this.pwdMsg = err.error?.error || "Failed to change password.";
          this.isPwdLoading = false;
        }
      });
    }
  }

  // --- Address Logic ---
  openAddressModal() {
    this.addressForm.reset();
    const modalEl = document.getElementById('addressModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  saveAddress() {
    if (this.addressForm.valid && this.addresses.length < 5 && !this.isSavingAddress) {
      this.isSavingAddress = true;
      const newAddresses = [...this.addresses, this.addressForm.value];
      this.api.updateAddresses(newAddresses).pipe(first()).subscribe({
        next: () => {
          this.addresses = newAddresses;
          this.addressForm.reset();
          this.isSavingAddress = false;
          const modalEl = document.getElementById('addressModal');
          if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal?.hide();
          }
          this.notification.showSuccess('Coordinate established successfully');
        },
        error: (err) => {
          this.notification.showError('Failed to save address');
          this.isSavingAddress = false;
        }
      });
    }
  }

  deleteAddress(index: number) {
    this.notification.confirm({
      title: 'Delete Address',
      message: 'Are you sure you want to delete this address?'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.addresses.splice(index, 1);
        this.api.updateAddresses(this.addresses).subscribe({
          next: () => this.notification.showSuccess('Address deleted successfully'),
          error: (err) => this.notification.showError('Failed to update address')
        });
      }
    });
  }

}
