const CACHE_TOKEN = '__HOST_CACHE_TOKEN';

export const getCacheToken = (cacheNamespace: string) => `${CACHE_TOKEN}_${cacheNamespace}`;
