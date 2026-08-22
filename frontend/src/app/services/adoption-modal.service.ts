import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export enum AdoptionModalMode {
  REQUEST = 'REQUEST',
  MASTER_FORM = 'MASTER_FORM'
}

@Injectable({
  providedIn: 'root'
})
export class AdoptionModalService {
  private isVisibleSubject = new BehaviorSubject<boolean>(false);
  private selectedPetSubject = new BehaviorSubject<any>(null);
  private isEditSubject = new BehaviorSubject<boolean>(false);
  private requestDataSubject = new BehaviorSubject<any>(null);
  private modeSubject = new BehaviorSubject<AdoptionModalMode>(AdoptionModalMode.REQUEST);
  private refreshSubject = new Subject<void>();

  isVisible$: Observable<boolean> = this.isVisibleSubject.asObservable();
  selectedPet$: Observable<any> = this.selectedPetSubject.asObservable();
  isEdit$: Observable<boolean> = this.isEditSubject.asObservable();
  requestData$: Observable<any> = this.requestDataSubject.asObservable();
  mode$: Observable<AdoptionModalMode> = this.modeSubject.asObservable();
  refresh$: Observable<void> = this.refreshSubject.asObservable();

  constructor() { }

  openForm(petOrRequest: any = null, isEdit: boolean = false, mode: AdoptionModalMode = AdoptionModalMode.REQUEST) {
    this.modeSubject.next(mode);
    if (isEdit) {
      this.isEditSubject.next(true);
      this.requestDataSubject.next(petOrRequest);
      this.selectedPetSubject.next(petOrRequest?.petData || null);
    } else {
      this.isEditSubject.next(false);
      this.selectedPetSubject.next(petOrRequest);
      this.requestDataSubject.next(null);
    }
    this.isVisibleSubject.next(true);
  }

  closeForm() {
    this.isVisibleSubject.next(false);
    this.selectedPetSubject.next(null);
    this.isEditSubject.next(false);
    this.requestDataSubject.next(null);
  }

  notifySuccess() {
    this.refreshSubject.next();
  }
}
