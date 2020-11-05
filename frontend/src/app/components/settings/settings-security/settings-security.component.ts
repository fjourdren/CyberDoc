import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { MustMatch } from './_helpers/must-match.validator';
import { SecurityCheckDialogComponent } from '../../security-check-dialog/security-check-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SettingsRenameDeviceDialogComponent } from '../settings-rename-device-dialog/settings-rename-device-dialog.component';

function passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const password = control.value;

        if (!password) return {passwordValidator: {invalid: true}};
        if (!password.match(/[A-Z]/g)) return {passwordValidator: {invalid: true}};
        if (!password.match(/[a-z]/g)) return {passwordValidator: {invalid: true}};
        if (!password.match(/[0-9]/g)) return {passwordValidator: {invalid: true}};
        if (!password.replace(/[0-9a-zA-Z ]/g, "").length) return {passwordValidator: {invalid: true}};

        return null;
    };
}

@Component({
    selector: 'app-settings-security',
    templateUrl: './settings-security.component.html',
    styleUrls: ['./settings-security.component.scss']
})
export class SettingsSecurityComponent {
    loading = false;

    // Password
    passwordForm: FormGroup;
    hidePassword1 = true;
    hidePassword2 = true;
    hidePassword3 = true;

    // Passwords
    isTextFieldType: boolean;
    isTextFieldType2: boolean;

    // Table
    displayedColumns: string[] = ['name', 'browser', 'OS', 'rename'];
    dataSource = new MatTableDataSource([]);

    constructor(private userServiceProvider: UserServiceProvider,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private dialog: MatDialog) {
    }


    ngOnInit(): void {
        this.refreshDevice();

        this.passwordForm = this.fb.group({
            newPassword: ['', [Validators.required, passwordValidator()]],
            newPasswordConfirmation: ['', [Validators.required, passwordValidator()]],
            email: [this.userServiceProvider.default().getActiveUser().email, Validators.required]
        }, {
            validator: MustMatch('newPassword', 'newPasswordConfirmation')
        });
    }

    onSubmitPassword(): void {
        if (this.passwordForm.invalid) {
            return;
        }

        this.loading = true;
        this.dialog.open(SecurityCheckDialogComponent, {
            maxWidth: '500px'
        }).afterClosed().subscribe(isPasswordAndTwoFactorVerified => {
            if (isPasswordAndTwoFactorVerified) {
                this.userServiceProvider.default().updatePassword(
                    this.passwordForm.get('newPassword').value,
                    this.userServiceProvider.default().getActiveUser().email
                ).toPromise().then(() => {
                    this.loading = false;
                    this.snackBar.dismiss();
                    this.snackBar.open('Password updated', null, { duration: 1500 });
                    this.passwordForm.reset();
                });
            } else {
                this.loading = false;
            }
        });
    }

    public checkError = (controlName: string, errorName: string) => {
        return this.passwordForm.controls[controlName].hasError(errorName);
    }

    renameDevice(name: string): void {
        const refDialog = this.dialog.open(SettingsRenameDeviceDialogComponent, {
            width: '400px',
            data: {
                'name': name
            }
        });
        refDialog.afterClosed().toPromise().then(() => {
            this.refreshDevice();
        });
    }

    refreshDevice() {
        this.userServiceProvider.default().getUserDevices().toPromise().then((value) => {
            this.dataSource.data = value;
        });
    }
}