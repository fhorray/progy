import { createFormHookContexts, createFormHook } from '@tanstack/react-form';
import { lazy } from 'react';

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

// Fields
const InputField = lazy(() => import('./fields/input'));
const SelectField = lazy(() => import('./fields/select'));
const TextareaField = lazy(() => import('./fields/textarea'));

export const { useAppForm: useForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    InputField,
    SelectField,
    TextareaField,
  },
  formComponents: {},
});
