// Cache des promesses pour les requêtes GET
const pendingRequests = new Map<string, Promise<any>>();

export function dedupeRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }
  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });
  pendingRequests.set(key, promise);
  return promise;
}