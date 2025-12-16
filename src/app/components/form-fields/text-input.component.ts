import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

/**
 * Text Input Component
 * Reusable text input field for surveys
 * Implements ControlValueAccessor for reactive forms integration
 */
@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-field text-input-field">
      <label *ngIf="label" [for]="fieldId" class="form-label">
        {{ label }}
        <span *ngIf="required" class="text-danger">*</span>
      </label>
      <input
        [id]="fieldId"
        type="text"
        class="form-control"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [disabled]="disabled"
        [required]="required"
      />
      <small *ngIf="helpText" class="form-text text-muted">{{ helpText }}</small>
    </div>
  `,
  styles: [`
    .form-field {
      margin-bottom: 1.5rem;
    }

    .form-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .form-control {
      border-radius: 8px;
      border: 1px solid #dee2e6;
      padding: 0.75rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-control:focus {
      border-color: #3498db;
      box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.15);
      outline: none;
    }

    .form-control:disabled {
      background-color: #f8f9fa;
      cursor: not-allowed;
    }

    .text-danger {
      color: #e74c3c;
    }

    .form-text {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.875rem;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true
    }
  ]
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() helpText = '';
  @Input() fieldId = `text-input-${Math.random().toString(36).substr(2, 9)}`;

  value = '';
  disabled = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
