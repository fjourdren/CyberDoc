import { Component } from '@angular/core';
import { UsersService } from '../../../services/users/users.service';
import { User } from '../../../models/users-api-models';
import { FileSystemService } from '../../../services/filesystems/file-system.service';

@Component({
  selector: 'app-files-space-info',
  templateUrl: './files-space-info.component.html',
  styleUrls: ['./files-space-info.component.css'],
})
export class FilesSpaceInfoComponent {
  user: User;
  storageSpacePercent: number;

  constructor(
    private userService: UsersService,
    private fsService: FileSystemService,
  ) {
    this.refresh();
    this.userService.userUpdated().subscribe(() => this.refresh());
    this.fsService.refreshNeeded().subscribe(() =>
      this.userService
        .refreshActiveUser()
        .toPromise()
        .then(() => {}),
    );
  }

  refresh() {
    this.user = this.userService.getActiveUser();
    this.storageSpacePercent = Math.min(
      (this.user.usedSpace / this.user.availableSpace) * 100,
      100,
    );
  }
}
