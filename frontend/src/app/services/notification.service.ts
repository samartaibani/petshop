import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private successSubject = new Subject<string>();
  success$: Observable<string> = this.successSubject.asObservable();

  private errorSubject = new Subject<string>();
  error$: Observable<string> = this.errorSubject.asObservable();

  private confirmSubject = new Subject<ConfirmData>();
  confirm$: Observable<ConfirmData> = this.confirmSubject.asObservable();

  private confirmResponseSubject = new Subject<boolean>();
  confirmResponse$: Observable<boolean> = this.confirmResponseSubject.asObservable();

  showSuccess(message: string = 'Action Successful') {
    this.successSubject.next(message);
  }

  showError(message: string = 'Something went wrong') {
    this.errorSubject.next(message);
  }

  confirm(data: ConfirmData): Observable<boolean> {
    this.confirmSubject.next(data);
    return this.confirmResponseSubject.asObservable();
  }

  sendConfirmResponse(response: boolean) {
    this.confirmResponseSubject.next(response);
  }
}
