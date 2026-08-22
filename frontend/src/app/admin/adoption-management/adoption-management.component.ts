import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PremiumSelectComponent } from '../../components/premium-select/premium-select.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-adoption-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumSelectComponent, RouterModule],
  templateUrl: './adoption-management.component.html',
  styleUrls: ['./adoption-management.component.css']
})
export class AdoptionManagementComponent implements OnInit {
  activeTab: 'pets' | 'requests' | 'adoptions' = 'requests';

  // Pets Data
  pets: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];
  filteredSubCategories: any[] = [];
  
  categoryOptions: { label: string, value: any }[] = [];
  breedOptions: { label: string, value: any }[] = [];

  healthStatusOptions = [
    { label: 'Excellent', value: 'Excellent' },
    { label: 'Good', value: 'Good' },
    { label: 'Requires Attention', value: 'Requires Attention' },
    { label: 'Recovering', value: 'Recovering' }
  ];

  statusOptions = [
    { label: 'Available', value: 'Available' },
    { label: 'Adopted', value: 'Adopted' },
    { label: 'Fostered', value: 'Fostered' }
  ];

  showAddPetModal = false;
  isEditMode = false;
  editingId: string | null = null;

  petData = {
    name: '',
    categoryId: '',
    subCategoryId: '',
    age: '',
    price: 0,
    description: '',
    healthStatus: 'Excellent',
    birthDate: '',
    dailyNeeds: '',
    documentation: '',
    sex: 'Male',
    neutered: 'Yes',
    temperament: '',
    energyLevel: 'Medium',
    goodWith: 'Kids & Dogs',
    training: 'Basic',
    status: 'Available'
  };

  sexOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' }
  ];

  neuteredOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' }
  ];

  energyLevelOptions = [
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' }
  ];

  trainingOptions = [
    { label: 'None', value: 'None' },
    { label: 'Basic', value: 'Basic' },
    { label: 'Advanced', value: 'Advanced' }
  ];

  goodWithOptions = [
    { label: 'Kids Only', value: 'Kids Only' },
    { label: 'Dogs Only', value: 'Dogs Only' },
    { label: 'Cats Only', value: 'Cats Only' },
    { label: 'Kids & Dogs', value: 'Kids & Dogs' },
    { label: 'All', value: 'All' }
  ];

  selectedPetImage: File | null = null;
  petImagePreview: string | ArrayBuffer | null = null;

  // Requests Data
  requests: any[] = [];
  groupedRequests: any[] = [];
  selectedPetRequests: any = null;
  showRequestModal = false;
  selectedRequest: any = null;
  completedAdoptions: any[] = [];

  deliveryStatusOptions = [
    { label: 'Processing', value: 'Processing' },
    { label: 'Out of Shelter', value: 'Out of Shelter' },
    { label: 'In Transit', value: 'In Transit' },
    { label: 'Ready for Pickup', value: 'Ready for Pickup' },
    { label: 'Final Handover', value: 'Handed Over' }
  ];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadRequests();
    this.loadPets();
    this.api.getCategories().subscribe(res => {
      this.categories = res;
      this.categoryOptions = res.map(c => ({ label: c.name, value: c.id }));
    });
    this.api.getSubCategories().subscribe(res => this.subCategories = res);
  }

  setTab(tab: 'pets' | 'requests' | 'adoptions') {
    this.activeTab = tab;
  }

  // --- PETS LOGIC ---
  loadPets() {
    this.api.getPets().subscribe((res: any[]) => {
      this.pets = res;
    });
  }

  onCategoryChange() {
    this.filteredSubCategories = this.subCategories.filter(s => s.categoryId === this.petData.categoryId);
    this.breedOptions = this.filteredSubCategories.map(s => ({ label: s.name, value: s.id }));
    this.petData.subCategoryId = ''; // reset breed
  }

  onPetImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPetImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.petImagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submitPet() {
    const formData = new FormData();
    formData.append('type', 'pet');

    // Convert petData to formData
    Object.keys(this.petData).forEach(key => {
      formData.append(key, (this.petData as any)[key]);
    });

    if (this.selectedPetImage) {
      formData.append('images', this.selectedPetImage);
    }

    if (this.isEditMode && this.editingId) {
      const rawData = { ...this.petData };
      this.api.updateProduct(this.editingId, rawData).subscribe({
        next: () => {
          this.closeModal();
          this.loadPets();
        },
        error: () => alert("Update failed")
      });
    } else {
      this.api.addProduct(formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadPets();
        },
        error: (err: any) => alert("Failed to add pet")
      });
    }
  }

  editPet(p: any) {
    this.isEditMode = true;
    this.editingId = p.id;
    this.openModal();

    this.petData = {
      name: p.name || '',
      categoryId: p.categoryId || '',
      subCategoryId: p.subCategoryId || '',
      age: p.age || '',
      price: p.price || 0,
      description: p.description || '',
      healthStatus: p.healthStatus || 'Excellent',
      birthDate: p.birthDate || '',
      dailyNeeds: p.dailyNeeds || '',
      documentation: p.documentation || '',
      sex: p.sex || 'Male',
      neutered: p.neutered || 'Yes',
      temperament: p.temperament || '',
      energyLevel: p.energyLevel || 'Medium',
      goodWith: p.goodWith || 'Kids & Dogs',
      training: p.training || 'Basic',
      status: p.status || 'Available'
    };
    this.petImagePreview = p.imageUrl || null;
    this.onCategoryChange(); // Load breeds for selected category
  }

  deletePet(id: string) {
    this.api.deleteProduct(id).subscribe(() => this.loadPets());
  }

  openModal() {
    this.showAddPetModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showAddPetModal = false;
    document.body.style.overflow = '';
    this.resetPetForm();
  }

  resetPetForm() {
    this.isEditMode = false;
    this.editingId = null;
    this.petData = {
      name: '',
      categoryId: '',
      subCategoryId: '',
      age: '',
      price: 0,
      description: '',
      healthStatus: 'Excellent',
      birthDate: '',
      dailyNeeds: '',
      documentation: '',
      sex: 'Male',
      neutered: 'Yes',
      temperament: '',
      energyLevel: 'Medium',
      goodWith: 'Kids & Dogs',
      training: 'Basic',
      status: 'Available'
    };
    this.selectedPetImage = null;
    this.petImagePreview = null;
  }

  getCategoryName(id: string) {
    return this.categories.find(c => c.id === id)?.name || 'Unknown';
  }

  getBreedName(id: string) {
    return this.subCategories.find(s => s.id === id)?.name || id;
  }

  // --- REQUESTS LOGIC ---
  loadRequests() {
    this.api.getAdoptionRequests().subscribe((res: any[]) => {
      this.requests = res;
      this.completedAdoptions = res.filter(r => r.status === 'Completed');
      this.groupRequestsByPet();
    });
  }

  groupRequestsByPet() {
    const groups: { [petId: string]: any } = {};

    this.requests.forEach(req => {
      const petId = req.petId || 'unknown';
      if (!groups[petId]) {
        groups[petId] = {
          petId: petId,
          petData: req.petData || { name: 'General/Unknown' },
          applications: []
        };
      }
      groups[petId].applications.push(req);
    });

    this.groupedRequests = Object.values(groups);

    // If we are currently viewing a specific pet's requests, update that list
    if (this.selectedPetRequests) {
      const updatedGroup = this.groupedRequests.find(g => g.petId === this.selectedPetRequests.petId);
      this.selectedPetRequests = updatedGroup || null;
    }
  }

  viewPetRequests(group: any) {
    this.selectedPetRequests = group;
  }

  backToPetList() {
    this.selectedPetRequests = null;
  }

  viewRequest(req: any) {
    this.selectedRequest = req;
    this.showRequestModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeRequestModal() {
    this.showRequestModal = false;
    this.selectedRequest = null;
    document.body.style.overflow = '';
  }

  updateRequestStatus(reqId: string, status: string) {
    if (confirm(`Finalize this application as ${status}?`)) {
      this.api.updateAdoptionStatus(reqId, status).subscribe({
        next: () => {
          this.loadRequests();

          if (status === 'Completed') {
            this.loadPets();
          }
        },
        error: () => alert("Status update failed")
      });
    }
  }

  updateDeliveryStatus(req: any, newStatus: any, destinationBranch?: string) {
    if (!newStatus) return;
    
    const updateData: any = { deliveryStatus: newStatus };
    
    // Default to city if 'Ready for Pickup' and no manual override provided
    if (newStatus === 'Ready for Pickup' && !destinationBranch && !req.destinationBranch) {
        updateData.destinationBranch = req.formData?.city || 'Default Branch';
    } else if (destinationBranch) {
        updateData.destinationBranch = destinationBranch;
    }

    this.api.updateAdoptionDelivery(req.id || req._id, updateData).subscribe({
        next: () => {
          req.deliveryStatus = newStatus;
          if (destinationBranch) req.destinationBranch = destinationBranch;
          else if (updateData.destinationBranch) req.destinationBranch = updateData.destinationBranch;
          
          if (newStatus === 'Handed Over') {
            req.status = 'Completed';
          }
          this.loadRequests();
        },
      error: () => alert('Failed to update delivery status')
    });
  }
}
