const CACHE_MANAGER_TOKEN = '__CACHE_MANAGER_TOKEN';

export const getCacheManagerToken = (cacheNamespace: string) => `${CACHE_MANAGER_TOKEN}_${cacheNamespace}`;
