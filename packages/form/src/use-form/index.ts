import { createFormHook } from './createFormHook';
import { lazy } from 'react';
import { fieldContext, formContext } from './context';

// Fields
const InputField = lazy(() => import('../fields/InputField'));
const SelectField = lazy(() => import('../fields/SelectField'));
const TextareaField = lazy(() => import('../fields/TextareaField'));
const CheckboxField = lazy(() => import('../fields/CheckboxField'));

export const { useAppForm: useForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    InputField,
    SelectField,
    TextareaField,
    CheckboxField,
  },
});

export * from './context';
