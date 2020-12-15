import * as sharp from 'sharp';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { File } from 'src/schemas/file.schema';
import { GeneratePreviewOptions, generatePreview } from './filepreview';
import { promisify } from 'util';
import { extname, join } from 'path';
import {
  unlink as _unlink,
  readFile as _readFile,
  writeFile as _writeFile,
} from 'fs';

const unlink = promisify(_unlink);
const readFile = promisify(_readFile);
const writeFile = promisify(_writeFile);

@Injectable()
export class PreviewGenerator {
  async generatePngPreview(file: File, fileContent: Buffer): Promise<Buffer> {
    const extension = extname(file.name); // calculate extension
    const tmpFilename = file._id + extension;
    const tempInputFile = join('tmp', 'input', tmpFilename);
    const tempOutputImage = join('tmp', 'output', file._id + '.png');
    let contentOutputFile: Buffer;

    if (file.mimetype.startsWith('image/')) {
      contentOutputFile = fileContent;
    } else {
      // save input file in temp file
      await writeFile(tempInputFile, fileContent);

      // generate image and save it in a temp directory
      const options: GeneratePreviewOptions = {
        quality: 100,
        background: '#ffffff',
        pagerange: '1',
      };

      let fileType: 'other' | 'video' | 'image' | 'pdf' = 'other';
      if (file.mimetype.startsWith('video/')) fileType = 'video';
      else if (file.mimetype === 'application/pdf') fileType = 'pdf';

      try {
        await generatePreview(
          tempInputFile,
          fileType,
          tempOutputImage,
          options,
        );
      } catch (e) {
        throw new InternalServerErrorException(e);
      }

      contentOutputFile = await readFile(tempOutputImage);
      contentOutputFile = await sharp(contentOutputFile)
        .resize({ width: 300, height: 200 })
        .png()
        .toBuffer();

      // delete two temp files
      try {
        await unlink(tempInputFile);
      } catch (err) {}
      try {
        await unlink(tempOutputImage);
      } catch (err) {}
    }

    // create readable
    return await sharp(contentOutputFile)
      .resize({ width: 300, height: 200 })
      .png()
      .toBuffer();
  }
}
