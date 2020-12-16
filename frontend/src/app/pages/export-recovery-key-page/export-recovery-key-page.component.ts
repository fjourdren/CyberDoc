import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-export-recovery-key-page',
  templateUrl: './export-recovery-key-page.component.html',
  styleUrls: ['./export-recovery-key-page.component.scss'],
})
export class ExportRecoveryKeyPageComponent {
  loading = false;
  keyIsDownloaded = false;

  constructor(private usersService: UsersService, private router: Router) {}

  downloadRecoveryKey() {
    this.loading = true;
    this.usersService
      .exportRecoveryKey()
      .toPromise()
      .then((recoveryKey) => {
        this.loading = false;
        this.keyIsDownloaded = true;
        const anchor = document.createElement('a');
        anchor.download = 'recovery-key.txt';
        anchor.href = `data:text/plain,${recoveryKey}`;
        anchor.click();
        anchor.remove();
      });
  }

  goToApp() {
    this.router.navigate(['/']);
  }
}
