import { Component, ElementRef, HostListener, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { MustMatch } from './_helpers/must-match.validator';
import { SecurityCheckDialogComponent } from '../../security-check-dialog/security-check-dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

export interface DialogDevicesData {
    name: string;
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

    passwordStrength = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$._\-!%*?&])[A-Za-z\d$@$!%*?&].{8,}/;

    // Passwords
    isTextFieldType: boolean;
    isTextFieldType2: boolean;

    // Table
    displayedColumns: string[] = ['name', 'browser', 'OS', 'rename'];
    //dataSource: RespondShare[];
    dataSource = new MatTableDataSource([]);

    constructor(private userServiceProvider: UserServiceProvider,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private dialog: MatDialog) {
    }


    ngOnInit(): void {
        this.refreshDevice();

        this.passwordForm = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
            newPasswordConfirmation: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
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
        const refDialog = this.dialog.open(SettingsSecurityDevicesDialogComponent, {
            width: '500px',
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

@Component({
    selector: 'app-settings-security-devices-dialog',
    templateUrl: 'settings-security-devices-dialog.component.html',
    styleUrls: []
})
export class SettingsSecurityDevicesDialogComponent {
    nameAlreadyChoose = false;
    loading = false;
    input = new FormControl('', [Validators.required, this.noWhitespaceValidator]);
    @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;

    constructor(public dialogRef: MatDialogRef<SettingsSecurityDevicesDialogComponent>,
        private UserProvider: UserServiceProvider,
        @Inject(MAT_DIALOG_DATA) public data: DialogDevicesData) {
        this.input.setValue(this.data.name);
    }

    @HostListener("keydown", ['$event'])
    onKeyDown(evt: KeyboardEvent) {
        if (evt.key === "Enter") {
            this.onRenameBtnClicked();
        }
    }

    noWhitespaceValidator(control: FormControl) {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { 'whitespace': true };
    }

    onRenameBtnClicked() {
        if (!this.input.value) { return; }

        this.loading = true;
        this.input.disable();
        this.dialogRef.disableClose = true;
        this.UserProvider.default().renameUserDevice(this.data.name, this.input.value).toPromise().then(() => {
            this.loading = false;
            this.input.enable();
            this.dialogRef.disableClose = false;
            this.dialogRef.close(true);
        }, error => {
            this.loading = false;
            this.nameAlreadyChoose = true;
            this.input.enable();
        })
    }

    onCancelBtnClicked() {
        this.dialogRef.close(false);
    }
}