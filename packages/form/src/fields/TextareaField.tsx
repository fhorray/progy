'use client';

import { Textarea, Field, FieldDescription, FieldError, FieldLabel } from '@progy/ui';
import { useFieldContext } from '../use-form/context';
import { useStore } from '@tanstack/react-store';
import React from 'react';

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, ''> {
  label?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
}

const TextareaField = ({ label, icon, description, ...props }: TextareaProps) => {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state: any) => state.meta.errors);
  const Icon = icon;
  const isInvalid = field.state.meta.isTouched && errors.length > 0;

  return (
    <Field>
      {label && (
        <FieldLabel htmlFor={field.name}>
          {label}
          {props.required && '*'}
        </FieldLabel>
      )}

      <div className="relative w-full">
        {Icon && (
          <span className="absolute top-2.5 left-2 max-w-4 max-h-4 object-cover">
            <Icon className="w-4 h-4 opacity-45" />
          </span>
        )}

        <Textarea
          id={field.name}
          name={field.name}
          value={(field.state.value as string) ?? ''}
          onBlur={field.handleBlur}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          className={Icon ? "pl-8" : ""}
          {...props}
        />
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

export default TextareaField;
