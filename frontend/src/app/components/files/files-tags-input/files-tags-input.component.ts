import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { FileTag } from 'src/app/models/users-api-models';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-files-tags-input',
  templateUrl: './files-tags-input.component.html',
  styleUrls: ['./files-tags-input.component.css']
})
export class FilesTagsInputComponent {

  private _allTags: FileTag[];
  private _nodeTags: FileTag[];

  filteredTags$: Observable<FileTag[]>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagsCtrl = new FormControl();

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  @Output() nodeTagsChange = new EventEmitter<FileTag[]>();

  get nodeTags() {
    return this._nodeTags;
  }

  @Input()
  set nodeTags(val: FileTag[]) {
    this._nodeTags = val;
    if (this._allTags && this._nodeTags) this._filter("");
  }

  get allTags() {
    return this._allTags;
  }

  @Input()
  set allTags(val: FileTag[]) {
    this._allTags = val;
    if (this._allTags && this._nodeTags) this._filter("");
  }

  constructor() {
    this.filteredTags$ = this.tagsCtrl.valueChanges.pipe(map((tag: string | null) => {
      return tag ? this._filter(tag) : this._filter("");
    }));
  }

  add(event: MatChipInputEvent): void {
    this.tagsCtrl.setValue(null);
  }

  remove(tag: FileTag): void {
    const index = this._nodeTags.indexOf(tag);
    if (index >= 0) {
      this._nodeTags.splice(index, 1);
      this.nodeTagsChange.emit(this._nodeTags);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this._nodeTags.push(this._findTag(event.option.viewValue));
    this.nodeTagsChange.emit(this._nodeTags);
    this.tagInput.nativeElement.value = '';
    this.tagsCtrl.setValue(null);
  }

  private _filter(value: string | FileTag): FileTag[] {
    let filterValue: string;
    if (typeof value === "string") {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.name.toLowerCase();
    }

    const tags = this.allTags.filter(tag => this.nodeTags.find(item => {
      return item.id === tag.id
    }) == null);

    return tags.filter(tag => tag.name.toLowerCase().indexOf(filterValue) === 0);
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
    hexBackgroundColor = hexBackgroundColor.substring(1, 7); //remove # 
    const hRed = parseInt(hexBackgroundColor.substring(0, 2), 16);
    const hGreen = parseInt(hexBackgroundColor.substring(2, 4), 16);
    const hBlue = parseInt(hexBackgroundColor.substring(4, 6), 16);
    const cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;

    return (cBrightness > 130) ? "#000000" : "#ffffff"
  }
}
