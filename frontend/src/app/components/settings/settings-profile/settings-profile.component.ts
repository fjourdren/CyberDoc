import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { FileTag } from 'src/app/models/files-api-models';
import { SettingsDeleteTagDialogComponent } from '../settings-delete-tag-dialog/settings-delete-tag-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SettingsCreateEditTagDialogComponent } from '../settings-create-edit-tag-dialog/settings-create-edit-tag-dialog.component';
import { SecurityCheckDialogComponent } from '../../security-check-dialog/security-check-dialog.component';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users/users.service';
import { SettingsAskCurrentPasswordDialogComponent } from '../settings-ask-current-password-dialog/settings-ask-current-password-dialog.component';
import { User } from 'src/app/models/users-api-models';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-settings-profile',
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.css'],
})
export class SettingsProfileComponent {
  VALID_THEMES = [
    'deeppurple-amber',
    'indigo-pink',
    'pink-bluegrey',
    'purple-green',
  ];

  profileForm: FormGroup;
  loading = false;

  // tag list
  displayedColumns = ['tagcolor', 'name', 'editbutton', 'deletebutton'];
  dataSource = new MatTableDataSource<FileTag>([]);

  constructor(
    private usersService: UsersService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) {
    for (const theme of this.VALID_THEMES) {
      iconRegistry.addSvgIcon(
        theme,
        sanitizer.bypassSecurityTrustResourceUrl(
          `assets/theme-icons/${theme}.svg`,
        ),
      );
    }

    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      newEmail: ['', [Validators.required, Validators.email]],
      theme: ['', [Validators.required]],
    });

    this.refresh();
    this.usersService.userUpdated().subscribe(() => this.refresh());
  }

  refresh(): void {
    const user = this.usersService.getActiveUser();
    this.profileForm.get('firstName').setValue(user.firstname);
    this.profileForm.get('lastName').setValue(user.lastname);
    this.profileForm.get('newEmail').setValue(user.email);
    this.profileForm.get('theme').setValue(user.theme);
    this.dataSource.data = user.tags;
  }

  updateProfile() {
    this._setIsLoading(true);
    const emailChanged =
      this.profileForm.get('newEmail').value !==
      this.usersService.getActiveUser().email;

    let promise: Promise<User>;

    if (emailChanged) {
      this.dialog
        .open(SettingsAskCurrentPasswordDialogComponent, {
          maxWidth: '500px',
        })
        .afterClosed()
        .toPromise()
        .then((currentPassword) => {
          if (currentPassword) {
            promise = this.usersService
              .updateProfile(
                this.profileForm.get('firstName').value,
                this.profileForm.get('lastName').value,
                this.profileForm.get('newEmail').value,
                this.profileForm.get('theme').value,
                currentPassword,
                undefined,
                undefined,
              )
              .toPromise();
            this._handleUpdateProfilePromise(promise);
          } else {
            this._setIsLoading(false);
          }
        });
    } else {
      promise = this.usersService
        .updateProfile(
          this.profileForm.get('firstName').value,
          this.profileForm.get('lastName').value,
          this.profileForm.get('newEmail').value,
          this.profileForm.get('theme').value,
          undefined,
          undefined,
          undefined,
        )
        .toPromise();
      this._handleUpdateProfilePromise(promise);
    }
  }

  private _handleUpdateProfilePromise(promise: Promise<User>) {
    promise
      .then(() => {
        this._setIsLoading(false);
        this.snackBar.open('Profile updated', null, { duration: 5000 });
      })
      .catch((err) => {
        if (err instanceof HttpErrorResponse && err.status === 403) {
          this._setIsLoading(false);
          this.snackBar.open('[ERROR] Wrong password', null, {
            duration: 5000,
          });
        } else {
          throw err;
        }
      });
  }

  getThemeText(themeName: string) {
    return `themes.${themeName}`;
  }

  deleteAccount(): void {
    this.dialog
      .open(SecurityCheckDialogComponent, {
        maxWidth: '500px',
        data: {
          checkTwoFactor: true,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.usersService
            .deleteAccount()
            .toPromise()
            .then(() => {
              this.loading = false;
              this.router.navigate(['/logout']);
            });
        } else {
          this.loading = false;
        }
      });
  }

  addOrEditTag(tag: FileTag | undefined) {
    this.dialog.open(SettingsCreateEditTagDialogComponent, {
      minWidth: '300px',
      maxWidth: '500px',
      data: tag,
    });
  }

  deleteTag(tag: FileTag): void {
    this.dialog.open(SettingsDeleteTagDialogComponent, {
      maxWidth: '400px',
      data: tag,
    });
  }

  private _setIsLoading(isLoading: boolean) {
    this.loading = isLoading;
    if (this.loading) {
      this.profileForm.disable();
    } else {
      this.profileForm.enable();
      this.refresh();
    }
  }
}
