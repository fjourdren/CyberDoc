import { Readable } from "stream";

export function normalizePort(val: number|string): number {
    return (typeof val === 'string') ? parseInt(val, 10): val;
}

export function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve) => {
        const bufferArray: any[] = [];
        stream.on('data', function(chunk: any){  
            bufferArray.push(chunk);
        });

        stream.on('end', function(){
            const buffer = Buffer.concat(bufferArray);
            resolve(buffer);
        })
    });
}