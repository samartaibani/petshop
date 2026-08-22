import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-premium-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PremiumSelectComponent),
      multi: true
    }
  ],
  templateUrl: './premium-select.component.html',
  styleUrls: ['./premium-select.component.css']
})
export class PremiumSelectComponent implements ControlValueAccessor {
  @Input() options: { label: string, value: any }[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() label: string = '';
  @Input() customClass: string = '';

  isOpen = false;
  selectedValue: any = null;
  selectedLabel: string = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private elementRef: ElementRef) {}

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: { label: string, value: any }) {
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;
    this.onChange(this.selectedValue);
    this.onTouched();
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.selectedValue = value;
    const option = this.options.find(o => o.value === value);
    this.selectedLabel = option ? option.label : '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
