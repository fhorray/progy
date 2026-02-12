import React, { createContext, useContext } from 'react';
import type { FormApi, FieldApi } from '@tanstack/react-form';

export function createFormHookContexts() {
  const FormContext = createContext<FormApi<any, any> | null>(null);
  const FieldContext = createContext<FieldApi<any, any, any, any> | null>(null);

  const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
      throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
  };

  const useFieldContext = <TData = any>() => {
    const context = useContext(FieldContext);
    if (!context) {
      throw new Error('useFieldContext must be used within a FieldProvider');
    }
    return context as FieldApi<any, any, any, any, TData>;
  };

  return {
    formContext: FormContext,
    useFormContext,
    fieldContext: FieldContext,
    useFieldContext,
  };
}

export const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts();
