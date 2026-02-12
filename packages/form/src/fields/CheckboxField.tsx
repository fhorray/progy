'use client';

import {
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@progy/ui';
import { useFieldContext } from '../use-form/context';
import { useStore } from '@tanstack/react-store';
import React from 'react';

interface CheckboxFieldProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Checkbox>, 'value' | 'checked' | 'onCheckedChange'> {
  label?: string;
  description?: string;
  required?: boolean;
}

const CheckboxField = ({
  label,
  description,
  required,
  className,
  ...props
}: CheckboxFieldProps) => {
  const field = useFieldContext<boolean>();
  const errors = useStore(field.store, (state: any) => state.meta.errors);

  return (
    <Field>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.name}
          checked={field.state.value}
          onCheckedChange={(checked: boolean | 'indeterminate') => field.handleChange(checked === true)}
          disabled={props.disabled}
          className={className}
          {...props}
        />
        {label && (
          <FieldLabel htmlFor={field.name} className="font-normal">
            {label}
            {required && '*'}
          </FieldLabel>
        )}
      </div>

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

export default CheckboxField;
