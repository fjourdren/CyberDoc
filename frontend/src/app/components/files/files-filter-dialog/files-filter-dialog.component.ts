import { Component, HostListener, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  NO_DATEDIFF_DEFAULT,
  EMPTY_SEARCH_PARAMS,
  SearchParams,
  NO_TYPE_FILTER,
  FileTag,
} from 'src/app/models/files-api-models';
import {
  FilesUtilsService,
  FileType,
} from 'src/app/services/files-utils/files-utils.service';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-files-filter-dialog',
  templateUrl: './files-filter-dialog.component.html',
  styleUrls: ['./files-filter-dialog.component.css'],
})
export class FilesFilterDialogComponent {
  noTypeFilter = NO_TYPE_FILTER;

  // https://stackoverflow.com/questions/39372804/how-to-loop-through-enum-values-for-display-in-radio-buttons
  fileTypes: string[] = Object.keys(FileType);
  allTags: FileTag[] = [];
  selectedTags: FileTag[] = [];

  typeControl = new FormControl(NO_TYPE_FILTER);
  dateModifiedControl = new FormControl(NO_DATEDIFF_DEFAULT);

  constructor(
    private filesUtils: FilesUtilsService,
    private usersService: UsersService,
    public dialogRef: MatDialogRef<FilesFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public searchParams: SearchParams,
  ) {
    this.refreshAllTags();
    this.usersService.userUpdated().subscribe(() => this.refreshAllTags());

    if (!this.searchParams) {
      this.searchParams = EMPTY_SEARCH_PARAMS;
    }
    this.updateForm();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Enter') {
      this.onSearchBtnClick();
    }
  }

  refreshAllTags(): void {
    this.allTags = this.usersService.getActiveUser().tags;
  }

  updateForm(): void {
    this.typeControl.setValue(this.searchParams.type);
    this.dateModifiedControl.setValue(this.searchParams.dateDiff);
    this.selectedTags = this.allTags.filter(
      (tag) => this.searchParams.tagIDs.indexOf(tag._id) !== -1,
    );
  }

  getIconForFileType(type: string): string {
    return this.filesUtils.getFontAwesomeIcon(FileType[type]);
  }

  getTranslationForFileType(type: string): string {
    if (FileType[type] === FileType.Unknown) {
      return 'All types';
    } else {
      return this.filesUtils.fileTypeToString(FileType[type]);
    }
  }

  onResetBtnClick(): void {
    this.searchParams = EMPTY_SEARCH_PARAMS;
    this.updateForm();
  }

  onSearchBtnClick(): void {
    this.searchParams = {
      name: this.searchParams.name,
      dateDiff: this.dateModifiedControl.value,
      type: this.typeControl.value,
      tagIDs: this.selectedTags.map((tag) => tag._id),
    };
    this.dialogRef.close(this.searchParams);
  }

  onCancelBtnClicked(): void {
    this.dialogRef.close(null);
  }
}
