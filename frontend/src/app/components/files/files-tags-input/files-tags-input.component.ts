import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { AppUtilsService } from 'src/app/services/app-utils/app-utils.service';
import { FileTag } from 'src/app/models/files-api-models';

@Component({
  selector: 'app-files-tags-input',
  templateUrl: './files-tags-input.component.html',
  styleUrls: ['./files-tags-input.component.css'],
})
export class FilesTagsInputComponent {
  private _allTags: FileTag[] = [];
  private _selectedTags: FileTag[] = [];

  filteredTags$: Observable<FileTag[]>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagsCtrl = new FormControl();

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  @Output() tagAdded = new EventEmitter<FileTag>();
  @Output() tagRemoved = new EventEmitter<FileTag>();
  @Output() newTagCreated = new EventEmitter<string>();

  get selectedTags() {
    return this._selectedTags;
  }

  @Input()
  set selectedTags(val: FileTag[]) {
    this._selectedTags = val || [];
    this._filter('');
  }

  get allTags() {
    return this._allTags;
  }

  @Input()
  set allTags(val: FileTag[]) {
    this._allTags = val || [];
    this._filter('');
  }

  constructor(private appUtils: AppUtilsService) {
    this.filteredTags$ = this.tagsCtrl.valueChanges.pipe(
      map((tag: string | null) => {
        return tag ? this._filter(tag) : this._filter('');
      }),
    );
  }

  add(event: MatChipInputEvent): void {
    this.newTagCreated.emit(event.value);
    this.tagInput.nativeElement.value = '';
    this.tagsCtrl.setValue(null);
  }

  remove(tag: FileTag): void {
    const index = this._selectedTags.indexOf(tag);
    if (index >= 0) {
      this.tagRemoved.emit(tag);
      this._selectedTags.splice(index, 1);
    }
    this._filter('');
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const tag = this._findTag(event.option.viewValue);
    this.tagAdded.emit(tag);
    this._selectedTags.push(tag);
    this.tagInput.nativeElement.value = '';
    this.tagsCtrl.setValue(null);
    this._filter('');
  }

  private _filter(value: string | FileTag): FileTag[] {
    if (this._allTags == undefined || this._allTags.length === 0) return [];

    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.name.toLowerCase();
    }

    if (this._selectedTags == undefined || this._selectedTags.length === 0) {
      return this.allTags.filter(
        (tag) => tag.name.toLowerCase().indexOf(filterValue) === 0,
      );
    } else {
      const tags = this.allTags.filter(
        (tag) =>
          this.selectedTags.find((item) => {
            return item._id === tag._id;
          }) == null,
      );

      return tags.filter(
        (tag) => tag.name.toLowerCase().indexOf(filterValue) === 0,
      );
    }
  }

  private _findTag(tagName: string) {
    for (const tag of this.allTags) {
      if (tag.name.toLowerCase() === tagName.toLowerCase()) {
        return tag;
      }
    }
    return null;
  }

  computeTextColor(hexBackgroundColor: string) {
    return this.appUtils.computeTextColor(hexBackgroundColor);
  }
}
