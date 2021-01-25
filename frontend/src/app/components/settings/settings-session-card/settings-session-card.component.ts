import { Component } from '@angular/core';
import { Session } from '../../../models/users-api-models';
import { UsersService } from '../../../services/users/users.service';

@Component({
  selector: 'app-settings-session-card',
  templateUrl: './settings-session-card.component.html',
  styleUrls: ['./settings-session-card.component.css'],
})
export class SettingsSessionCardComponent {
  sessions: Session[] = [];
  loading = false;

  constructor(private usersService: UsersService) {
    this.refresh();
  }

  terminateSession(hashedJWT: string) {
    this.loading = true;
    this.usersService
      .terminateSession(hashedJWT)
      .toPromise()
      .then(() => {
        this.loading = false;
        this.refresh();
      });
  }

  refresh() {
    this.usersService
      .getActiveSessions()
      .toPromise()
      .then((sessions) => (this.sessions = sessions));
  }
}
