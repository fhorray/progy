'use client';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn
} from '@progy/ui';

import { useFieldContext } from '../use-form/context';
import { useStore } from '@tanstack/react-store';
import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps
  extends Omit<React.ComponentProps<typeof Select>, 'onValueChange' | 'value'> {
  label?: string;
  description?: string;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
  required?: boolean;
}

const SelectField = ({
  label,
  description,
  required,
  placeholder = 'Select an option',
  options,
  disabled,
  className,
}: SelectFieldProps) => {
  const field = useFieldContext<string>();
  const value = (field.state.value as string) || '';
  const errors = useStore(field.store, (state: any) => state.meta.errors);

  const handleValueChange = (newValue: string) => {
    field.handleChange(newValue);
  };

  return (
    <Field>
      {label && (
        <FieldLabel htmlFor={field.name}>
          {label}
          {required && '*'}
        </FieldLabel>
      )}

      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn('w-full', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && (
        <FieldDescription className="text-sm opacity-45">
          {description}
        </FieldDescription>
      )}
      <FieldError
        errors={errors.map((e: any) => ({
          message: e?.message,
        }))}
      />
    </Field>
  );
};

export default SelectField;
