import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-files-main-toolbar',
  templateUrl: './files-main-toolbar.component.html',
  styleUrls: ['./files-main-toolbar.component.scss']
})
export class FilesMainToolbarComponent {

  @Input() hideMenuButton: boolean;
  @Output() menuButtonClicked = new EventEmitter<void>();
  
  constructor() { }

}
