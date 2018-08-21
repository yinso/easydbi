import * as Promise from 'bluebird';

export interface Factory<T> {
    create: () => Promise<T>;
    destroy: (client : T) => Promise<void>;
}

export interface PoolOptions {
    min: number;
    max: number;
}

export function createPool<T>(factory: Factory<T>, options : PoolOptions) : Pool<T>;

export class Pool<T> {
    constructor(options : PoolOptions);
    acquire(priority ?: number) : Promise<T>;
    release(resource : T) : Promise<void>;
}
