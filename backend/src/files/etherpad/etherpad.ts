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
import { AxiosResponse, default as axios } from 'axios';
import { Utils } from 'src/utils';

const FormData = require('form-data');

export const ETHERPAD_MIMETYPE = 'application/x-etherpad';

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

  private async _callEtherpadApiFunction(
    functionName: string,
    padID: string,
    otherParams: any = undefined,
  ) {
    otherParams = otherParams || {};
    const etherpadRootApiURL = this.configService.get<string>(
      'ETHERPAD_ROOT_API_URL',
    );
    const response: AxiosResponse<EtherpadApiResponse> = await axios({
      method: 'GET',
      url: `${etherpadRootApiURL}/${functionName}`,
      validateStatus: () => true,
      params: {
        padID: padID,
        apikey: this.configService.get<string>('ETHERPAD_API_KEY'),
        ...otherParams,
      },
    });

    if (response.status >= 400) {
      throw new InternalServerErrorException(
        `etherpad ${functionName} API failed [${response.status}] '${response.data}'`,
      );
    }

    if (response.data.code !== ETHERPAD_API_RESPONSE_CODE_OK) {
      switch (response.data.message) {
        case 'padID does already exist': {
          throw new BadRequestException('padID does already exist');
        }
        case 'padID does not exist': {
          throw new NotFoundException('padID does not exist');
        }
        default: {
          throw new InternalServerErrorException(
            `etherpad ${functionName} API failed '${response.data.message}'`,
          );
        }
      }
    }

    return response.data;
  }

  async createEmptyPad(padID: string) {
    await this._callEtherpadApiFunction('createPad', padID);
  }

  async deletePad(padID: string) {
    await this._callEtherpadApiFunction('deletePad', padID);
  }

  async clearPadContent(padID: string) {
    await this._callEtherpadApiFunction('setHTML', padID, {
      html: '',
    });
  }

  async getUsersCountOnPad(padID: string): Promise<number> {
    const apiResponse = await this._callEtherpadApiFunction(
      'padUsersCount',
      padID,
    );
    return parseInt(apiResponse.data.padUsersCount, 10);
  }

  async getReadOnlyPadID(padID: string): Promise<string> {
    const apiResponse = await this._callEtherpadApiFunction(
      'getReadOnlyID',
      padID,
    );
    return apiResponse.data.readOnlyID;
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

  async exportPad(padID: string, format: EtherpadExportFormat) {
    const url = `${this.configService.get<string>(
      'ETHERPAD_ROOT_URL',
    )}/p/${padID}/export/${format}`;
    const response = await axios({
      method: 'get',
      validateStatus: () => true,
      url,
      responseType: 'stream',
    });

    if (response.status >= 400) {
      if (response.status === 404) {
        throw new NotFoundException(`pad '${padID}' don't exists`);
      } else {
        throw new InternalServerErrorException(
          `etherpad exportPad API failed '${response.data.message}'`,
        );
      }
    }

    return await Utils.readableToBuffer(response.data);
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

    const response = await axios({
      method: 'post',
      url: `${this.configService.get<string>(
        'ETHERPAD_ROOT_URL',
      )}/p/${padID}/import`,
      headers: formData.getHeaders(),
      data: formData,
      validateStatus: () => true,
    });

    if (response.status >= 400) {
      if (response.status === 404) {
        throw new NotFoundException(`pad '${padID}' don't exists`);
      } else {
        throw new InternalServerErrorException(
          `etherpad importPad API failed '${response.data.message}'`,
        );
      }
    }

    const importResponseRegex = /<script>document.addEventListener\('DOMContentLoaded', function\(\){ var impexp = window.parent.padimpexp.handleFrameCall\('([A-z]*)', '([A-z]*)'\); }\)<\/script>/;
    const importResponseRegexData = importResponseRegex.exec(response.data);
    if (!importResponseRegexData || importResponseRegexData.length !== 3) {
      throw new InternalServerErrorException(
        `etherpad importPad API failed [bad response format] '${response.data.message}'`,
      );
    }

    const importResponseStatus = importResponseRegexData[2];
    if (importResponseStatus !== 'ok') {
      throw new InternalServerErrorException(
        `etherpad import API failed ${importResponseStatus}`,
      );
    }
  }
}
