import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-my-pets',
  templateUrl: './my-pets.component.html',
  styleUrls: ['./my-pets.component.css']
})
export class MyPetsComponent implements OnInit {
  pets: any[] = [];
  loading = true;
  user: any = null;
  selectedPetForPdf: any = null;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private pdfService: PdfService
  ) { }

  ngOnInit(): void {
    this.user = this.auth.getUser();
    if (this.user) {
      this.loadMyPets();
    } else {
      this.loading = false;
    }
  }

  loadMyPets() {
    this.api.getAdoptionRequests().subscribe({
      next: (res: any[]) => {
        // Filter for paid/completed adoptions belonging to this user
        this.pets = res.filter(r =>
          r.userId === this.user?.uid &&
          (r.status === 'Paid' || r.status === 'Completed')
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  downloadCertificate(pet: any) {
    this.selectedPetForPdf = pet;
    setTimeout(() => {
      this.pdfService.generateInvoice('certificate-content', `Premium-Certificate-${pet.petData?.name || 'Pet'}`);
    }, 100);
  }

  getTrackingStep(status: string): number {
    if (!status) return 0; // Processing
    const s = status.toLowerCase();
    if (s.includes('processing')) return 0;
    if (s.includes('out of shelter')) return 1;
    if (s.includes('transit')) return 2;
    if (s.includes('ready')) return 3;
    if (s.includes('hand')) return 4;
    return 0;
  }
}
