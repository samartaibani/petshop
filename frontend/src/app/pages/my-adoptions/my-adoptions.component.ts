import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AdoptionModalService, AdoptionModalMode } from '../../services/adoption-modal.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-adoptions',
  templateUrl: './my-adoptions.component.html',
  styleUrls: ['./my-adoptions.component.css']
})
export class MyAdoptionsComponent implements OnInit, OnDestroy {
  requests: any[] = [];
  masterForm: any = null;
  loading = true;
  user: any = null;
  private subs = new Subscription();

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private modalService: AdoptionModalService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.subs.add(
      this.auth.user$.subscribe(user => {
        this.user = user;
        if (user) {
          this.loadData(user.uid);
        } else {
          this.requests = [];
          this.masterForm = null;
        }
      })
    );

    this.subs.add(
      this.modalService.refresh$.subscribe(() => {
        const user = this.auth.getUser();
        if (user) this.loadData(user.uid);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadData(userId: string) {
    this.loading = true;
    this.api.getAdoptionRequests().subscribe({
      next: (res) => {
        this.requests = res;
        this.api.getMasterAdoptionForm().subscribe(form => {
          this.masterForm = form;
          this.loading = false;
        });
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(status: string) {
    switch (status) {
      case 'Approved': return 'badge bg-success shadow-sm';
      case 'Rejected': return 'badge bg-danger shadow-sm';
      case 'Pending': return 'badge bg-warning text-dark shadow-sm';
      case 'Paid': return 'badge bg-success shadow-sm';
      default: return 'badge bg-secondary shadow-sm';
    }
  }

  // --- Master Form Methods ---
  openMasterForm() {
    this.modalService.openForm(this.masterForm, !!this.masterForm, AdoptionModalMode.MASTER_FORM);
  }

  deleteMasterForm() {
    this.notification.confirm({
      title: 'Delete Profile',
      message: "Are you sure you want to delete your adoption form profile? This will not affect active requests, but you'll have to fill it again next time."
    }).subscribe(confirmed => {
      if (confirmed) {
        this.api.deleteMasterAdoptionForm(this.masterForm.id).subscribe({
          next: () => {
            this.notification.showSuccess("Form profile deleted.");
            this.masterForm = null;
          },
          error: err => this.notification.showError("Failed to delete.")
        });
      }
    });
  }

  // --- Request Methods ---
  editRequest(req: any) {
    this.modalService.openForm(req, true, AdoptionModalMode.REQUEST);
  }

  cancelRequest(req: any) {
    this.notification.confirm({
      title: 'Cancel Request',
      message: "Are you sure you want to cancel this adoption request?"
    }).subscribe(confirmed => {
      if (confirmed) {
        this.api.deleteAdoptionRequest(req.id).subscribe({
          next: () => {
            this.notification.showSuccess("Request cancelled.");
            this.requests = this.requests.filter(r => r.id !== req.id);
          },
          error: (err) => this.notification.showError("Failed to cancel request.")
        });
      }
    });
  }

  // --- Payment Methods ---
  selectedRequestForPayment: any = null;
  paymentMethod: 'Card' | 'UPI' = 'Card';
  isProcessingPayment = false;
  paymentDetails: any = {
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: ''
  };

  payFee(req: any) {
    this.selectedRequestForPayment = req;
    this.paymentMethod = 'Card'; // Reset default
    this.paymentDetails = { cardNumber: '', cardExpiry: '', cardCvv: '', upiId: '' };
  }

  closePaymentModal() {
    this.selectedRequestForPayment = null;
    this.isProcessingPayment = false;
  }

  hideImage(event: Event) {
    (event.target as HTMLElement).style.display = 'none';
  }

  submitPayment() {
    if (!this.selectedRequestForPayment || !this.user) return;

    // Basic Mock Validation
    if (this.paymentMethod === 'Card' && (!this.paymentDetails.cardNumber || !this.paymentDetails.cardExpiry)) {
      this.notification.showError("Please enter card details.");
      return;
    }
    if (this.paymentMethod === 'UPI' && !this.paymentDetails.upiId) {
      this.notification.showError("Please enter UPI ID.");
      return;
    }

    this.isProcessingPayment = true;

    const paymentData = {
      userId: this.user.uid,
      amount: this.selectedRequestForPayment.petData?.price || 0,
      paymentMethod: this.paymentMethod,
      transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      paymentDetails: this.paymentMethod === 'Card' ?
        { type: 'Card', last4: this.paymentDetails.cardNumber.slice(-4) } :
        { type: 'UPI', id: this.paymentDetails.upiId }
    };

    this.api.payAdoptionFee(this.selectedRequestForPayment.id, paymentData).subscribe({
      next: (res) => {
        this.isProcessingPayment = false;
        this.notification.showSuccess("Payment Successful!");

        // Update local object
        this.selectedRequestForPayment.status = 'Paid';
        this.selectedRequestForPayment.paymentStatus = true;

        this.closePaymentModal();
      },
      error: (err) => {
        this.isProcessingPayment = false;
        this.notification.showError("Payment failed: " + (err.error?.error || err.message));
        console.error(err);
      }
    });
  }
}
