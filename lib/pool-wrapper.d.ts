import * as pool from 'generic-pool';

export function createPool<T>(factory: pool.Factory<T>, options : pool.Options) : Pool<T>;

export class Pool<T> {
    constructor(options : pool.Options);
    acquire(priority ?: number) : Promise<T>;
    release(resource : T) : Promise<void>;
}
