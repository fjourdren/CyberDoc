import { FilesService } from '../files.service';
import { ClientSession } from 'mongoose';
import { User } from '../../schemas/user.schema';
import { FILE, File } from '../../schemas/file.schema';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse, default as axios } from 'axios';

const FormData = require('form-data');

export enum EtherpadExportFormat {
  DOCX = 'docx',
  ODT = 'odt',
  PDF = 'pdf',
  TXT = 'txt',
  ETHERPAD = 'etherpad',
}

@Injectable()
export class EtherpadIntegration {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  async exportEtherpadFile(file: File, format: EtherpadExportFormat) {
    if (file.type !== FILE || file.mimetype !== 'application/x-etherpad')
      throw new BadRequestException(
        'This action is only available with etherpad files',
      );

    const response: AxiosResponse<ReadableStream> = await axios({
      method: 'get',
      url: `${this.configService.get<string>('ETHERPAD_ROOT_URL')}/p/${
        file._id
      }/export/${format}`,
      responseType: 'stream',
    });

    if (response.status !== 200)
      throw new InternalServerErrorException({
        message: 'export etherpad API failed',
        detail: response,
      });

    return response.data;
  }

  async prepareFileForEtherpad(
    mongoSession: ClientSession,
    user: User,
    userHash: string,
    file: File,
  ) {
    let axiosResponse: AxiosResponse;
    if (file.type !== FILE)
      throw new BadRequestException('This action is only available with files');

    let etherpadFileName = file.name;
    if (etherpadFileName.indexOf('.') !== -1) {
      etherpadFileName = etherpadFileName.substring(
        0,
        etherpadFileName.lastIndexOf('.'),
      );
    }
    etherpadFileName += '.etherpad';

    //Création du fichier Etherpad côté CyberDoc
    const etherpadFile = await this.filesService.create(
      mongoSession,
      user,
      etherpadFileName,
      'application/x-etherpad',
      file.parent_file_id,
    );

    //Création du fichier côté Etherpad
    axiosResponse = await axios({
      method: 'get',
      url: `${this.configService.get<string>(
        'ETHERPAD_ROOT_API_URL',
      )}/createPad`,
      params: {
        padID: etherpadFile._id,
        text: '',
        apikey: this.configService.get<string>('ETHERPAD_API_KEY'),
      },
      responseType: 'text',
    });

    if (axiosResponse.status !== 200)
      throw new InternalServerErrorException({
        message: 'createPad etherpad API failed',
        detail: axiosResponse,
      });

    //Conversion du fichier source en fichier Etherpad
    const fileContent = await this.filesService.getFileContent(
      user,
      userHash,
      file,
    );
    const formData = new FormData();
    formData.append('file', fileContent);

    axiosResponse = await axios({
      method: 'post',
      url: `${this.configService.get<string>('ETHERPAD_ROOT_URL')}/p/${
        etherpadFile._id
      }/import`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
      responseType: 'text',
    });

    if (axiosResponse.status !== 200)
      throw new InternalServerErrorException({
        message: 'import etherpad API failed',
        detail: axiosResponse,
      });

    return etherpadFile._id;
  }
}