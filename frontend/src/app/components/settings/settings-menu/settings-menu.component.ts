import { Component } from '@angular/core';
import { UserServiceProvider } from '../../../services/users/user-service-provider';

@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.css'],
})
export class SettingsMenuComponent {
  role: string;
  constructor(private userServiceProvider: UserServiceProvider) {
    this.role = userServiceProvider.default().getActiveUser().role;
  }
}
