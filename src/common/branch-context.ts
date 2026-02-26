import { AsyncLocalStorage } from 'async_hooks';

export const branchContext = new AsyncLocalStorage<number>();

export function getBranchId(): number | undefined {
    return branchContext.getStore();
}
