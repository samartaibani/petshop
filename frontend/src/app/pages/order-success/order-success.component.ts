import { Component } from '@angular/core';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.css']
})
export class OrderSuccessComponent {

  constructor(private pdfService: PdfService) { }

  downloadInvoice() {
    this.pdfService.generateInvoice('invoice', 'order-invoice');
  }
}
