import { Component } from '@angular/core';
import {
  DEFAULT_THEME,
  UsersService,
} from '../../services/users/users.service';

@Component({
  selector: 'app-password-recovery-page',
  templateUrl: './password-recovery-page.component.html',
  styleUrls: ['./password-recovery-page.component.scss'],
})
export class PasswordRecoveryPageComponent {
  constructor(private usersService: UsersService) {
    this.usersService.setTheme(DEFAULT_THEME);
  }
}
