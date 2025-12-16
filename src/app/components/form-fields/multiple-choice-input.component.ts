import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { QuestionOption } from '../../models/survey.model';

/**
 * Multiple Choice Input Component
 * Reusable checkbox group for surveys
 * Implements ControlValueAccessor for reactive forms integration
 */
@Component({
  selector: 'app-multiple-choice-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-field multiple-choice-field">
      <label class="form-label">
        {{ label }}
        <span *ngIf="required" class="text-danger">*</span>
      </label>
      <div class="checkbox-options">
        <div
          *ngFor="let option of options; let i = index"
          class="form-check checkbox-option"
        >
          <input
            class="form-check-input"
            type="checkbox"
            [id]="fieldId + '-' + i"
            [value]="option.value"
            [checked]="isSelected(option.value)"
            (change)="onOptionChange(option.value, $event)"
            [disabled]="disabled"
          />
          <label class="form-check-label" [for]="fieldId + '-' + i">
            {{ option.label }}
          </label>
        </div>
      </div>
      <small *ngIf="helpText" class="form-text text-muted">{{ helpText }}</small>
      <small *ngIf="selectedCount > 0" class="form-text text-primary">
        {{ selectedCount }} option(s) selected
      </small>
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

    .checkbox-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .checkbox-option {
      padding: 0.75rem;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      transition: background-color 0.2s, border-color 0.2s;
      cursor: pointer;
    }

    .checkbox-option:hover {
      background-color: #f8f9fa;
      border-color: #3498db;
    }

    .checkbox-option:has(input:checked) {
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

    .text-primary {
      color: #3498db;
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
      useExisting: forwardRef(() => MultipleChoiceInputComponent),
      multi: true
    }
  ]
})
export class MultipleChoiceInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() options: QuestionOption[] = [];
  @Input() required = false;
  @Input() helpText = '';
  @Input() fieldId = `multiple-choice-${Math.random().toString(36).substr(2, 9)}`;

  value: string[] = [];
  disabled = false;

  onChange: (value: string[]) => void = () => {};
  onTouched: () => void = () => {};

  get selectedCount(): number {
    return this.value.length;
  }

  isSelected(optionValue: string): boolean {
    return this.value.includes(optionValue);
  }

  onOptionChange(optionValue: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.value = [...this.value, optionValue];
    } else {
      this.value = this.value.filter(v => v !== optionValue);
    }

    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: string[]): void {
    this.value = value || [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
