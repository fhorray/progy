import { nanoquery } from '@nanostores/query';

export const [createFetcherStore, createMutatorStore, { invalidateKeys, revalidateKeys, mutateCache }] = nanoquery({
  fetcher: (...keys: string[]) => fetch(keys.join('')).then(async (r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  }),
});
