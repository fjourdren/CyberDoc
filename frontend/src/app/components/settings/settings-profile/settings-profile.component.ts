import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { FileTag } from 'src/app/models/files-api-models';
import { SettingsDeleteTagDialogComponent } from '../settings-delete-tag-dialog/settings-delete-tag-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SettingsCreateEditTagDialogComponent } from '../settings-create-edit-tag-dialog/settings-create-edit-tag-dialog.component';
import { SecurityCheckDialogComponent } from '../../security-check-dialog/security-check-dialog.component';

@Component({
    selector: 'app-settings-profile',
    templateUrl: './settings-profile.component.html',
    styleUrls: ['./settings-profile.component.scss']
})
export class SettingsProfileComponent {
    profileForm: FormGroup;
    loading = false;

    // tag list
    displayedColumns = ['tagcolor', 'name', 'editbutton', 'deletebutton'];
    dataSource = new MatTableDataSource<FileTag>([]);

    constructor(private userServiceProvider: UserServiceProvider,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private dialog: MatDialog) {
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            newEmail: ['', [Validators.required, Validators.email]]
        });

        this.refresh();
        this.userServiceProvider.default().userUpdated().subscribe(() => this.refresh());
    }

    refresh(): void {
        const user = this.userServiceProvider.default().getActiveUser();
        this.profileForm.get('firstName').setValue(user.firstname);
        this.profileForm.get('lastName').setValue(user.lastname);
        this.profileForm.get('newEmail').setValue(user.email);
        this.dataSource.data = user.tags;
    }

    updateProfile(): void {
        this.loading = true;
        if (this.profileForm.get('newEmail').value !== this.userServiceProvider.default().getActiveUser().email) { // Changed email address
            this.dialog.open(SecurityCheckDialogComponent, {
                maxWidth: '500px',
                data: {
                    checkTwoFactor: true
                }
            }).afterClosed().subscribe(xAuthTokenArray => {
                if (xAuthTokenArray && xAuthTokenArray.length === 3) { // [password:smsOrApp:2faToken]
                    this.userServiceProvider.default().updateProfile(
                        this.profileForm.get('firstName').value,
                        this.profileForm.get('lastName').value,
                        this.profileForm.get('newEmail').value,
                        xAuthTokenArray
                    ).toPromise().then(() => {
                        this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                            this.loading = false;
                            this.profileForm.enable();
                            this.snackBar.dismiss();
                            this.snackBar.open('Profile updated', null, { duration: 1500 });
                        });
                    });
                } else {
                    this.loading = false;
                }
            });
        } else { // Same email address
            this.userServiceProvider.default().updateProfile(
                this.profileForm.get('firstName').value,
                this.profileForm.get('lastName').value,
                this.profileForm.get('newEmail').value,
                null
            ).toPromise().then(() => {
                this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                    this.loading = false;
                    this.profileForm.enable();
                    this.snackBar.dismiss();
                    this.snackBar.open('Profile updated', null, { duration: 1500 });
                });
            });
        }
    }

    deleteAccount(): void {
        this.dialog.open(SecurityCheckDialogComponent, {
            maxWidth: '500px',
            data: {
                checkTwoFactor: true
            }
        }).afterClosed().subscribe(xAuthTokenArray => {
            if (xAuthTokenArray && xAuthTokenArray.length === 3) { // password:appOrSms:2faToken
                this.userServiceProvider.default().deleteAccount(xAuthTokenArray).toPromise();
            }
        });
    }

    addOrEditTag(tag: FileTag | undefined) {
        this.dialog.open(SettingsCreateEditTagDialogComponent, {
            minWidth: "300px",
            maxWidth: "500px",
            data: tag
        });
    }

    deleteTag(tag: FileTag): void {
        this.dialog.open(SettingsDeleteTagDialogComponent, {
            maxWidth: '400px',
            data: tag
        });
    }
}
