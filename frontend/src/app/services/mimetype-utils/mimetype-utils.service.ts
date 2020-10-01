import { Injectable } from '@angular/core';
import { DIRECTORY_MIMETYPE } from 'src/app/models/files-api-models';

@Injectable({
  providedIn: 'root'
})
export class MimetypeUtilsService {

  getFileTypeForMimetype(mimetype: string): string {
    if (mimetype === DIRECTORY_MIMETYPE) {
      return "filetype.folder";
    } else if (mimetype.startsWith("audio/")) {
      return "filetype.audio";
    } else if (mimetype.startsWith("video/")) {
      return "filetype.video";
    } else if (mimetype.startsWith("image/")) {
      return "filetype.image";
    }

    switch (mimetype) {
      case "application/pdf":
        return "filetype.pdf";

      case "application/vnd.ms-powerpoint":
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return "filetype.powerpoint";

      case "application/vnd.oasis.opendocument.presentation":
        return "filetype.ooimpress";

      case "application/vnd.oasis.opendocument.text":
        return "filetype.oowriter"

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/msword":
        return "filetype.word";

      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/vnd.ms-excel":
        return "filetype.excel";

      case "application/vnd.oasis.opendocument.spreadsheet":
        return "filetype.oocalc"

      // https://en.wikipedia.org/wiki/List_of_archive_formats
      case "application/x-tar":
      case "application/vnd.rar":
      case "application/x-7z-compressed":
      case "application/x-gtar":
      case "application/zip":
      case "application/gzip":
      case "application/vnd.ms-cab-compressed":
        return "filetype.archive";

      default:
        return "filetype.unknown";
    }
  }

  getFontAwesomeIconForMimetype(mimetype: string): string {
    if (mimetype === DIRECTORY_MIMETYPE) {
      return "fa-folder";
    } else if (mimetype.startsWith("audio/")) {
      return "fa-file-audio";
    } else if (mimetype.startsWith("video/")) {
      return "fa-file-video";
    } else if (mimetype.startsWith("image/")) {
      return "fa-file-image";
    }

    switch (mimetype) {
      case "application/pdf":
        return "fa-file-pdf";

      case "application/vnd.ms-powerpoint":
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      case "application/vnd.oasis.opendocument.presentation":
        return "fa-file-powerpoint";

      case "application/vnd.oasis.opendocument.text":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/msword":
        return "fa-file-word";

      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/vnd.oasis.opendocument.spreadsheet":
      case "application/vnd.ms-excel":
        return "fa-file-excel";

      // https://en.wikipedia.org/wiki/List_of_archive_formats
      case "application/x-tar":
      case "application/vnd.rar":
      case "application/x-7z-compressed":
      case "application/x-gtar":
      case "application/zip":
      case "application/gzip":
      case "application/vnd.ms-cab-compressed":
        return "fa-file-archive";

      default:
        return "fa-file";
    }
  }
}
