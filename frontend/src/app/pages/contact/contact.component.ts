import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  constructor(private api: ApiService) { }

  onSubmit() {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    this.api.sendContactMessage(this.contactData).subscribe({
      next: (res) => {
        this.submitSuccess = true;
        this.isSubmitting = false;
        // Reset form
        this.contactData = {
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        };
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.error || 'Failed to send message. Please try again later.';
        console.error('Contact submission error:', err);
      }
    });
  }
}
