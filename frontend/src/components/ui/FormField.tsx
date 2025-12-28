import { ReactNode } from 'react';
import './FormField.css';

interface FormFieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    required?: boolean;
    hint?: string;
    children: ReactNode;
}

/**
 * FormField Component
 * 
 * Wraps form inputs with labels and shows inline validation errors.
 * 
 * Usage:
 * ```tsx
 * <FormField label="Email" htmlFor="email" error={errors.email} required>
 *     <input id="email" type="email" ... />
 * </FormField>
 * ```
 */
export default function FormField({
    label,
    htmlFor,
    error,
    required,
    hint,
    children
}: FormFieldProps) {
    return (
        <div className={`form-field ${error ? 'form-field-error' : ''}`}>
            <label htmlFor={htmlFor} className="form-field-label">
                {label}
                {required && <span className="form-field-required">*</span>}
            </label>

            {children}

            {hint && !error && (
                <p className="form-field-hint">{hint}</p>
            )}

            {error && (
                <p className="form-field-error-message" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

// Commonly used validation functions
export const validators = {
    required: (value: string) =>
        !value?.trim() ? 'This field is required' : undefined,

    email: (value: string) =>
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Please enter a valid email' : undefined,

    minLength: (min: number) => (value: string) =>
        value.length < min ? `Must be at least ${min} characters` : undefined,

    maxLength: (max: number) => (value: string) =>
        value.length > max ? `Must be at most ${max} characters` : undefined,

    phone: (value: string) =>
        !/^[\d\s+\-()]+$/.test(value) ? 'Please enter a valid phone number' : undefined,

    match: (field: string, fieldName: string) => (value: string, allValues: Record<string, string>) =>
        value !== allValues[field] ? `Must match ${fieldName}` : undefined,
};
