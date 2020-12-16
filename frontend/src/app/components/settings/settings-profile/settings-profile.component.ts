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

@Component({
  selector: 'app-settings-profile',
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.scss'],
})
export class SettingsProfileComponent {
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
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      newEmail: ['', [Validators.required, Validators.email]],
    });

    this.refresh();
    this.usersService.userUpdated().subscribe(() => this.refresh());
  }

  refresh(): void {
    const user = this.usersService.getActiveUser();
    this.profileForm.get('firstName').setValue(user.firstname);
    this.profileForm.get('lastName').setValue(user.lastname);
    this.profileForm.get('newEmail').setValue(user.email);
    this.dataSource.data = user.tags;
  }

  updateProfile(): void {
    this.loading = true;
    if (
      this.profileForm.get('newEmail').value !==
      this.usersService.getActiveUser().email
    ) {
      // Changed email address
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
            if (res.xAuthTokenArray && res.xAuthTokenArray.length === 3) {
              // [password:smsOrApp:2faToken]
              this.usersService
                .updateProfile(
                  this.profileForm.get('firstName').value,
                  this.profileForm.get('lastName').value,
                  this.profileForm.get('newEmail').value,
                  res.xAuthTokenArray,
                )
                .toPromise()
                .then(() => {
                  this.usersService
                    .refreshActiveUser()
                    .toPromise()
                    .then(() => {
                      this.loading = false;
                      this.profileForm.enable();
                      this.snackBar.dismiss();
                      this.snackBar.open('Profile updated', null, {
                        duration: 1500,
                      });
                    });
                });
            } else {
              this.loading = false;
            }
          } else {
            this.loading = false;
          }
        });
    } else {
      // Same email address
      this.usersService
        .updateProfile(
          this.profileForm.get('firstName').value,
          this.profileForm.get('lastName').value,
          this.profileForm.get('newEmail').value,
          null,
        )
        .toPromise()
        .then(() => {
          this.usersService
            .refreshActiveUser()
            .toPromise()
            .then(() => {
              this.loading = false;
              this.profileForm.enable();
              this.snackBar.dismiss();
              this.snackBar.open('Profile updated', null, { duration: 1500 });
            });
        });
    }
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
          if (res.xAuthTokenArray && res.xAuthTokenArray.length === 3) {
            // password:appOrSms:2faToken
            this.usersService
              .deleteAccount(res.xAuthTokenArray)
              .toPromise()
              .then(() => {
                this.loading = false;
                this.router.navigate(['/logout']);
              });
          } else {
            this.loading = false;
          }
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
}
