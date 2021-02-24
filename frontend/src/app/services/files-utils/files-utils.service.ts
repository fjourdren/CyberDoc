import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export const DIRECTORY_MIMETYPE = 'application/x-dir';
export const ETHERPAD_MIMETYPE = 'application/x-etherpad';

export enum FileType {
  Unknown = 'Unknown',
  Folder = 'Folder',
  Audio = 'Audio',
  Video = 'Video',
  Image = 'Image',
  PDF = 'PDF',
  Text = 'Text',
  Document = 'Document',
  Spreadsheet = 'Spreadsheet',
  Presentation = 'Presentation',
  Archive = 'Archive',
  EtherPad = 'EtherPad',
}

const MIMETYPE_TO_FILETYPE_MAP = new Map<string | RegExp, FileType>([
  [DIRECTORY_MIMETYPE, FileType.Folder],
  [ETHERPAD_MIMETYPE, FileType.EtherPad],
  [new RegExp('audio/'), FileType.Audio],
  [new RegExp('video/'), FileType.Video],
  [new RegExp('image/'), FileType.Image],
  ['application/pdf', FileType.PDF],
  ['text/plain', FileType.Text],

  // https://stackoverflow.com/questions/4212861/what-is-a-correct-mime-type-for-docx-pptx-etc
  ['application/msword', FileType.Document],
  [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    FileType.Document,
  ],
  ['application/vnd.ms-excel', FileType.Spreadsheet],
  [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    FileType.Spreadsheet,
  ],
  ['application/vnd.ms-powerpoint', FileType.Presentation],
  [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    FileType.Presentation,
  ],
  [
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    FileType.Presentation,
  ],

  ['application/vnd.oasis.opendocument.text', FileType.Document],
  ['application/vnd.oasis.opendocument.spreadsheet', FileType.Spreadsheet],
  ['application/vnd.oasis.opendocument.presentation', FileType.Presentation],

  // https://en.wikipedia.org/wiki/List_of_archive_formats
  ['application/x-tar', FileType.Archive],
  ['application/vnd.rar', FileType.Archive],
  ['application/x-7z-compressed', FileType.Archive],
  ['application/x-gtar', FileType.Archive],
  ['application/zip', FileType.Archive],
  ['application/gzip', FileType.Archive],
  ['application/vnd.ms-cab-compressed', FileType.Archive],
]);

const FILETYPE_TO_FONTAWESOME_ICON = new Map<FileType, string>([
  [FileType.Folder, 'fa-folder'],
  [FileType.EtherPad, 'fa-file-signature'],
  [FileType.Audio, 'fa-file-audio'],
  [FileType.Video, 'fa-file-video'],
  [FileType.Image, 'fa-file-image'],
  [FileType.PDF, 'fa-file-pdf'],
  [FileType.Text, 'fa-file-alt'],
  [FileType.Document, 'fa-file-word'],
  [FileType.Spreadsheet, 'fa-file-excel'],
  [FileType.Presentation, 'fa-file-powerpoint'],
  [FileType.Archive, 'fa-file-archive'],
  [FileType.Unknown, 'fa-file'],
]);

const FILETYPE_TO_TRANSLATION = new Map<FileType, string>([
  [FileType.Folder, 'filetype.folder'],
  [FileType.EtherPad, 'filetype.etherpad'],
  [FileType.Audio, 'filetype.audio'],
  [FileType.Video, 'filetype.video'],
  [FileType.Image, 'filetype.image'],
  [FileType.PDF, 'filetype.pdf'],
  [FileType.Text, 'filetype.text'],
  [FileType.Document, 'filetype.document'],
  [FileType.Spreadsheet, 'filetype.spreadsheet'],
  [FileType.Presentation, 'filetype.presentation'],
  [FileType.Archive, 'filetype.archive'],
  [FileType.Unknown, 'filetype.unknown'],
]);

@Injectable({
  providedIn: 'root',
})
export class FilesUtilsService {
  getFileTypeForMimetype(mimetype: string): FileType {
    for (const [key, value] of MIMETYPE_TO_FILETYPE_MAP.entries()) {
      if (key instanceof RegExp && key.test(mimetype)) {
        return value;
      } else if (mimetype === key) {
        return value;
      }
    }

    return FileType.Unknown;
  }

  fileTypeToString(fileType: FileType): string {
    return FILETYPE_TO_TRANSLATION.get(fileType);
  }

  getFontAwesomeIcon(fileType: FileType): string {
    return FILETYPE_TO_FONTAWESOME_ICON.get(fileType);
  }

  canBeOpenedInApp(fileType: FileType): boolean {
    if (environment.disableEtherpad) {
      return fileType === FileType.Folder;
    }

    return (
      [
        FileType.Text,
        FileType.Document,
        FileType.Folder,
        FileType.EtherPad,
      ].indexOf(fileType) !== -1
    );
  }

  isFilePreviewAvailable(fileType: FileType): boolean {
    return (
      [
        FileType.Text,
        FileType.PDF,
        FileType.Document,
        FileType.Spreadsheet,
        FileType.Presentation,
        FileType.EtherPad,
      ].indexOf(fileType) !== -1
    );
  }

  isPDFExportAvailable(fileType: FileType): boolean {
    return (
      [
        FileType.Text,
        FileType.Document,
        FileType.Spreadsheet,
        FileType.Presentation,
        FileType.EtherPad,
      ].indexOf(fileType) !== -1
    );
  }
}
