import { Component, Output, EventEmitter, Input } from '@angular/core';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

@Component({
  selector: 'app-settings-main-toolbar',
  templateUrl: './settings-main-toolbar.component.html',
  styleUrls: ['./settings-main-toolbar.component.scss']
})
export class SettingsMainToolbarComponent {

  @Input() hideMenuButton: boolean;
  @Input() hideAppName: boolean;
  @Output() menuButtonClicked = new EventEmitter<void>();

  constructor(private userServiceProvider: UserServiceProvider) { }

  getCurrentUsername(): string {
    const user = this.userServiceProvider.default().getActiveUser();
    return `${user.firstname} ${user.lastname}`;
  }
}
