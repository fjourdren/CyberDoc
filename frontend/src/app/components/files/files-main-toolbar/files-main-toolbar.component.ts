import { Component, Output, EventEmitter, Input } from '@angular/core';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

@Component({
  selector: 'app-files-main-toolbar',
  templateUrl: './files-main-toolbar.component.html',
  styleUrls: ['./files-main-toolbar.component.scss']
})
export class FilesMainToolbarComponent {

  @Input() hideMenuButton: boolean;
  @Input() hideAppName: boolean;
  @Output() menuButtonClicked = new EventEmitter<void>();
  
  constructor(private userServiceProvider: UserServiceProvider) { }

  getCurrentUsername(){
    const user = this.userServiceProvider.default().getActiveUser();
    return `${user.firstname} ${user.lastname}`;
  }

}
