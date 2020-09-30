export function normalizePort(val: number|string): number {
    return (typeof val === 'string') ? parseInt(val, 10): val;
}