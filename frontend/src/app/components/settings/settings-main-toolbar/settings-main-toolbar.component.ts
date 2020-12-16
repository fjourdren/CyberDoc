import { Component, Output, EventEmitter, Input } from '@angular/core';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-settings-main-toolbar',
  templateUrl: './settings-main-toolbar.component.html',
  styleUrls: ['./settings-main-toolbar.component.scss'],
})
export class SettingsMainToolbarComponent {
  @Input() hideMenuButton: boolean;
  @Input() hideAppName: boolean;
  @Output() menuButtonClicked = new EventEmitter<void>();

  constructor(private usersService: UsersService) {}

  getCurrentUsername(): string {
    const user = this.usersService.getActiveUser();
    return `${user.firstname} ${user.lastname}`;
  }
}
