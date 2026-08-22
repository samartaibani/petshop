import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdoptionManagementComponent } from './adoption-management.component';

describe('AdoptionManagementComponent', () => {
  let component: AdoptionManagementComponent;
  let fixture: ComponentFixture<AdoptionManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdoptionManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdoptionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
