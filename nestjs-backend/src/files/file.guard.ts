import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FilesService } from './files.service';

@Injectable()
export class FileGuard implements CanActivate {

  constructor(
    private filesService: FilesService
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    let fileID: string;
    if (request.params && request.params.fileID) {
      fileID = request.params.fileID;
    }

    if (!fileID) {
      throw new BadRequestException("Missing file ID");
    }

    return this.filesService.findOne(fileID).then(file => {
      if (!file) throw new NotFoundException("File not found");
      request.file = file;
      return true;
    });
  }
}
