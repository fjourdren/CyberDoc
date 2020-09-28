export function normalizePort(val: number|string): number {
    let port: number = (typeof val === 'string') ? parseInt(val, 10): val;
    return port;
}