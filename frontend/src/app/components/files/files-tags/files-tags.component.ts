import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileTag, User } from 'src/app/models/users-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { FilesCreateTagDialogComponent } from '../files-create-tag-dialog/files-create-tag-dialog.component';

interface _InternalFileTag extends FileTag {
  textColor: string;
}

@Component({
  selector: 'app-files-tags',
  templateUrl: './files-tags.component.html',
  styleUrls: ['./files-tags.component.css']
})
export class FilesTagsComponent {

  private _node: CloudNode;
  loading = false;
  user: User;

  fileTags: _InternalFileTag[];
  allTags: _InternalFileTag[];
  filteredTags$: Observable<_InternalFileTag[]>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagsCtrl = new FormControl();

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  get node() {
    return this._node;
  }

  @Input()
  set node(node: CloudNode) {
    this._node = node;
    if (!node) return;

    const tags: _InternalFileTag[] = [];
    for (const tag of this.user.fileTags) {
      if (node.tagIDs.indexOf(tag.id) !== -1) tags.push({
        ...tag,
        textColor: this._computeTextColor(tag.hexColor)
      } as _InternalFileTag);
    }

    this.fileTags = tags;
    this._filter("");
  }

  constructor(private fsProvider: FileSystemProvider,
    private userServiceProvider: UserServiceProvider,
    private dialog: MatDialog
  ) {
    this.user = userServiceProvider.default().getActiveUser();
    this.allTags = this.user.fileTags.map(item => ({ ...item, textColor: this._computeTextColor(item.hexColor) } as _InternalFileTag));

    this.filteredTags$ = this.tagsCtrl.valueChanges.pipe(map((tag: string | null) => {
      return tag ? this._filter(tag) : this._filter("");
    }));

    this.fileTags = [];
    this._filter("");
  }

  add(event: MatChipInputEvent): void {
    this.tagsCtrl.setValue(null);
  }

  remove(tag: _InternalFileTag): void {
    const index = this.fileTags.indexOf(tag);
    if (index >= 0) {
      this.fileTags.splice(index, 1);
    }

    this.loading = true;
    this.fsProvider.default().editTags(this.node.id, this.fileTags.map(tag => tag.id)).toPromise().then(() => this.loading = false);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fileTags.push(this._findTag(event.option.viewValue));
    this.tagInput.nativeElement.value = '';
    this.tagsCtrl.setValue(null);

    this.loading = true;
    this.fsProvider.default().editTags(this.node.id, this.fileTags.map(tag => tag.id)).toPromise().then(() => this.loading = false);
  }

  private _filter(value: string | _InternalFileTag): _InternalFileTag[] {
    let filterValue: string;
    if (typeof value === "string") {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.name.toLowerCase();
    }

    const tags = this.allTags.filter(tag => this.fileTags.find(item => {
      return item.id === tag.id
    }) == null);

    return tags.filter(tag => tag.name.toLowerCase().indexOf(filterValue) === 0);
  }

  createNewTag() {
    this.dialog.open(FilesCreateTagDialogComponent, {
      maxWidth: "400px"
    }).afterClosed().toPromise().then(()=>{
      this.user = this.userServiceProvider.default().getActiveUser();
      this.allTags = this.user.fileTags.map(item => ({ ...item, textColor: this._computeTextColor(item.hexColor) } as _InternalFileTag));  
    })
  }

  private _findTag(tagName: string) {
    for (const tag of this.allTags) {
      if (tag.name.toLowerCase() === tagName.toLowerCase()) {
        return tag;
      }
    }
    return null;
  }

  private _computeTextColor(hexBackgroundColor: string) {
    hexBackgroundColor = hexBackgroundColor.substring(1, 7); //remove # 
    const hRed = parseInt(hexBackgroundColor.substring(0, 2), 16);
    const hGreen = parseInt(hexBackgroundColor.substring(2, 4), 16);
    const hBlue = parseInt(hexBackgroundColor.substring(4, 6), 16);
    const cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;

    return (cBrightness > 130) ? "#000000" : "#ffffff"
  }

}
