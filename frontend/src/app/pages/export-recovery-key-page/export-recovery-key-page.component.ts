import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-export-recovery-key-page',
  templateUrl: './export-recovery-key-page.component.html',
  styleUrls: ['./export-recovery-key-page.component.scss']
})
export class ExportRecoveryKeyPageComponent {

  loading = false;
  keyIsDownloaded = false;

  constructor(private userServiceProvider: UserServiceProvider, private router: Router) {}

  downloadRecoveryKey() {
    this.loading = true;
    this.userServiceProvider.default().exportRecoveryKey().toPromise().then(recoveryKey => {
      this.loading = false;
      this.keyIsDownloaded = true;
      localStorage.setItem(environment.recoveryKeyDownloadedLocalStorageKey, "OK");
      const anchor = document.createElement('a');
      anchor.download = "recovery-key.txt";
      anchor.href = `data:text/plain,${recoveryKey}`;
      anchor.click();
      anchor.remove();
    });
  }

  goToApp(){
    this.router.navigate(['/']);
  }
}
