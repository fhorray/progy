import { nanoquery } from '@nanostores/query';

export const [createFetcherStore, createMutatorStore, { invalidateKeys, revalidateKeys, mutateCache }] = nanoquery({
  fetcher: (...keys: any[]) => fetch(keys.join('')).then((r) => r.json()),
});
