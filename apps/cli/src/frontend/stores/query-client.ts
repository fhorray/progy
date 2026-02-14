
import { nanoquery } from '@nanostores/query';

export const [createFetcherStore, createMutatorStore, { invalidateKeys, revalidateKeys, mutateCache }] = nanoquery({
  fetcher: async (...keys) => {
    const url = keys.join('');
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    return res.json();
  },
});
