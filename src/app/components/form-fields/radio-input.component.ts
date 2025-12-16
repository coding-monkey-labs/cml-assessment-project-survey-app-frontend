import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { QuestionOption } from '../../models/survey.model';

/**
 * Radio Input Component
 * Reusable radio button group for surveys
 * Implements ControlValueAccessor for reactive forms integration
 */
@Component({
  selector: 'app-radio-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-field radio-input-field">
      <label class="form-label">
        {{ label }}
        <span *ngIf="required" class="text-danger">*</span>
      </label>
      <div class="radio-options">
        <div
          *ngFor="let option of options; let i = index"
          class="form-check radio-option"
        >
          <input
            class="form-check-input"
            type="radio"
            [name]="fieldId"
            [id]="fieldId + '-' + i"
            [value]="option.value"
            [checked]="value === option.value"
            (change)="onOptionChange(option.value)"
            [disabled]="disabled"
          />
          <label class="form-check-label" [for]="fieldId + '-' + i">
            {{ option.label }}
          </label>
        </div>
      </div>
      <small *ngIf="helpText" class="form-text text-muted">{{ helpText }}</small>
    </div>
  `,
  styles: [`
    .form-field {
      margin-bottom: 1.5rem;
    }

    .form-label {
      font-weight: 500;
      margin-bottom: 0.75rem;
      color: #2c3e50;
      display: block;
    }

    .radio-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .radio-option {
      padding: 0.75rem;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      transition: background-color 0.2s, border-color 0.2s;
      cursor: pointer;
    }

    .radio-option:hover {
      background-color: #f8f9fa;
      border-color: #3498db;
    }

    .radio-option:has(input:checked) {
      background-color: #e3f2fd;
      border-color: #3498db;
    }

    .form-check-input {
      cursor: pointer;
      margin-top: 0.15rem;
    }

    .form-check-input:focus {
      border-color: #3498db;
      box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.15);
    }

    .form-check-label {
      cursor: pointer;
      margin-left: 0.5rem;
      user-select: none;
    }

    .text-danger {
      color: #e74c3c;
    }

    .form-text {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .form-check-input:disabled ~ .form-check-label {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioInputComponent),
      multi: true
    }
  ]
})
export class RadioInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() options: QuestionOption[] = [];
  @Input() required = false;
  @Input() helpText = '';
  @Input() fieldId = `radio-input-${Math.random().toString(36).substr(2, 9)}`;

  value = '';
  disabled = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onOptionChange(value: string): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
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
