import { Readable } from 'stream';

export class Utils {
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

  static getFileExtension(fileName: string) {
    return fileName.substring(fileName.lastIndexOf('.') + 1);
  }

  static replaceFileExtension(originalFileName: string, newExtension?: string) {
    if (originalFileName.indexOf('.') !== -1) {
      originalFileName = originalFileName.substring(
        0,
        originalFileName.lastIndexOf('.'),
      );
    }
    if (newExtension) {
      originalFileName += `.${newExtension}`;
    }
    return originalFileName;
  }
}
