import { FilesService } from '../files.service';
import { ClientSession } from 'mongoose';
import { User } from '../../schemas/user.schema';
import { File } from '../../schemas/file.schema';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { default as axios } from 'axios';
import { Utils } from 'src/utils';

const FormData = require('form-data');

export const ETHERPAD_MIMETYPE = 'application/x-etherpad';
export const ETHERPAD_FILE_EXT = 'etherpad';

export enum EtherpadExportFormat {
  DOC = 'doc',
  ODT = 'odt',
  PDF = 'pdf',
  TXT = 'txt',
  ETHERPAD = 'etherpad',
}

export function getMimetypeForEtherpadExportFormat(
  format: EtherpadExportFormat,
) {
  switch (format) {
    case EtherpadExportFormat.DOC:
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml';
    case EtherpadExportFormat.ODT:
      return 'application/vnd.oasis.opendocument';
    case EtherpadExportFormat.PDF:
      return 'application/pdf';
    case EtherpadExportFormat.TXT:
      return 'text/plain';
    case EtherpadExportFormat.ETHERPAD:
      return ETHERPAD_MIMETYPE;
    default:
      throw new BadRequestException(`unknown format : ${format}`);
  }
}

const ETHERPAD_API_RESPONSE_CODE_OK = 0;
const ETHERPAD_API_RESPONSE_CODE_ERR = 1;

class EtherpadApiResponse {
  code: number = ETHERPAD_API_RESPONSE_CODE_OK | ETHERPAD_API_RESPONSE_CODE_ERR;
  message: string;
  data?: any;
}

export class Etherpad {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  async exportPad(padID: string, format: EtherpadExportFormat) {
    const url = `${this.configService.get<string>(
      'ETHERPAD_ROOT_URL',
    )}/p/${padID}/export/${format}`;
    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
    });

    if (response.status === 404) {
      throw new NotFoundException(`pad '${padID}' don't exists`);
    }

    return await Utils.readableToBuffer(response.data);
  }

  async createEmptyPad(padID: string, okIfAlreadyExists = false) {
    const createPadResponse = await axios.get<EtherpadApiResponse>(
      `${this.configService.get<string>('ETHERPAD_ROOT_API_URL')}/createPad`,
      {
        params: {
          padID: padID,
          apikey: this.configService.get<string>('ETHERPAD_API_KEY'),
        },
      },
    );

    if (createPadResponse.data.code !== ETHERPAD_API_RESPONSE_CODE_OK) {
      if (createPadResponse.data.message === 'padID does already exist') {
        if (!okIfAlreadyExists)
          throw new BadRequestException('padID does already exist');
        else return false;
      } else {
        throw new InternalServerErrorException(
          `etherpad createPad API failed ${createPadResponse.data.message}`,
        );
      }
    }

    return true;
  }

  async deletePad(padID: string) {
    const deletePadResponse = await axios.get<EtherpadApiResponse>(
      `${this.configService.get<string>('ETHERPAD_ROOT_API_URL')}/deletePad`,
      {
        params: {
          padID: padID,
          apikey: this.configService.get<string>('ETHERPAD_API_KEY'),
        },
      },
    );

    if (deletePadResponse.data.code !== ETHERPAD_API_RESPONSE_CODE_OK) {
      if (deletePadResponse.data.message === 'padID does not exist') {
        return;
      } else {
        throw new InternalServerErrorException(
          `etherpad deletePad API failed ${deletePadResponse.data.message}`,
        );
      }
    }
  }

  async clearPadContent(padID: string) {
    const setHTMLResponse = await axios.get<EtherpadApiResponse>(
      `${this.configService.get<string>('ETHERPAD_ROOT_API_URL')}/setHTML`,
      {
        params: {
          padID: padID,
          html: '',
          apikey: this.configService.get<string>('ETHERPAD_API_KEY'),
        },
      },
    );

    if (setHTMLResponse.data.code !== ETHERPAD_API_RESPONSE_CODE_OK) {
      if (setHTMLResponse.data.message === 'padID does not exist') {
        throw new NotFoundException(`pad ${padID} doesn't exist`);
      } else {
        throw new InternalServerErrorException(
          `etherpad setHTML API failed ${setHTMLResponse.data.message}`,
        );
      }
    }
  }

  async getUsersCountOnPad(padID: string): Promise<number> {
    const padUsersCountResponse = await axios.get<EtherpadApiResponse>(
      `${this.configService.get<string>(
        'ETHERPAD_ROOT_API_URL',
      )}/padUsersCount`,
      {
        params: {
          padID: padID,
          html: '',
          apikey: this.configService.get<string>('ETHERPAD_API_KEY'),
        },
      },
    );

    if (padUsersCountResponse.data.code !== ETHERPAD_API_RESPONSE_CODE_OK) {
      if (padUsersCountResponse.data.message === 'padID does not exist') {
        throw new NotFoundException(`pad ${padID} doesn't exist`);
      } else {
        throw new InternalServerErrorException(
          `etherpad padUsersCount API failed ${padUsersCountResponse.data.message}`,
        );
      }
    }

    return padUsersCountResponse.data.data.padUsersCount;
  }

  async syncPadToCyberDoc(
    mongoSession: ClientSession,
    user: User,
    userHash: string,
    cyberDocFile: File,
    padID: string,
  ) {
    const padContent = await this.exportPad(
      padID,
      EtherpadExportFormat.ETHERPAD,
    );
    await this.filesService.setFileContent(
      mongoSession,
      user,
      userHash,
      cyberDocFile,
      padContent,
    );
  }

  async syncPadFromCyberDoc(
    user: User,
    userHash: string,
    cyberDocFile: File,
    padID: string,
  ) {
    // We need to erase all contents from Etherpad before import
    await this.clearPadContent(padID);
    await this.importCyberDocFileToPad(user, userHash, cyberDocFile, padID);
  }

  async importCyberDocFileToPad(
    user: User,
    userHash: string,
    cyberDocFile: File,
    padID: string,
  ) {
    const fileContent = await this.filesService.getFileContent(
      user,
      userHash,
      cyberDocFile,
    );

    let filename = '';
    switch (cyberDocFile.mimetype) {
      case 'application/msword': {
        filename = 'file.doc';
        break;
      }
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        filename = 'file.docx';
        break;
      }
      case 'application/vnd.oasis.opendocument.text': {
        filename = 'file.odt';
        break;
      }
      case 'text/plain': {
        filename = 'file.txt';
        break;
      }
      case ETHERPAD_MIMETYPE: {
        filename = 'file.etherpad';
        break;
      }
      default: {
        throw new BadRequestException(
          `Unsupported mimetype ${cyberDocFile.mimetype}`,
        );
      }
    }

    const formData = new FormData();
    formData.append('file', fileContent, {
      filename,
      contentType: cyberDocFile.mimetype,
    });

    const importResponse = await axios({
      method: 'post',
      url: `${this.configService.get<string>(
        'ETHERPAD_ROOT_URL',
      )}/p/${padID}/import`,
      headers: formData.getHeaders(),
      data: formData,
    });

    const importResponseRegex = /<script>document.addEventListener\('DOMContentLoaded', function\(\){ var impexp = window.parent.padimpexp.handleFrameCall\('([A-z]*)', '([A-z]*)'\); }\)<\/script>/;
    const importResponseStatus = importResponseRegex.exec(
      importResponse.data,
    )[2];
    if (importResponseStatus !== 'ok') {
      throw new InternalServerErrorException(
        `etherpad import API failed ${importResponseStatus}`,
      );
    }
  }
}
