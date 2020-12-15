import { Readable } from 'stream';

export class Utils {
  private constructor() {}

  static stringToReadable(str: string): Readable {
    const readable = new Readable();
    readable.push(str);
    readable.push(null);
    return readable;
  }

  static async readableToBuffer(readable: Readable): Promise<Buffer> {
    return new Promise((resolve) => {
      const bufferArray = [];
      readable.on('data', function (chunk: any) {
        bufferArray.push(chunk);
      });

      readable.on('end', function () {
        const buffer = Buffer.concat(bufferArray);
        resolve(buffer);
      });
    });
  }
}
