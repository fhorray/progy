import React from 'react';
import { useForm as useTanstackForm } from '@tanstack/react-form';
import type { FormOptions } from '@tanstack/react-form';

export function createFormHook({
  fieldContext,
  formContext,
  fieldComponents,
}: {
  fieldContext: React.Context<any>;
  formContext: React.Context<any>;
  fieldComponents?: Record<string, any>;
}) {
  const useAppForm = <TFormData, TFormValidator extends any | undefined = undefined>(
    opts?: any
  ): any => {
    const form = useTanstackForm(opts);

    const OriginalField = form.Field;

    const Field = (props: any) => {
      return (
        <OriginalField {...props}>
          {(fieldApi: any) => (
            <fieldContext.Provider value={fieldApi}>
              {typeof props.children === 'function'
                ? props.children(fieldApi)
                : props.children
              }
            </fieldContext.Provider>
          )}
        </OriginalField>
      );
    };

    return {
      ...form,
      Field,
    };
  };

  const withForm = (Component: any) => (props: any) => <Component {...props} />;

  return { useAppForm, withForm };
}
