import {Component, Inject, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserServiceProvider} from "../../../../services/users/user-service-provider";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogData} from "../../../../pages/two-factor-register-page/two-factor-register-page.component";
import {TwoFactorDialogComponent} from "../two-factor-dialog/two-factor-dialog.component";

@Component({
    selector: 'app-delete-account-password-dialog',
    templateUrl: 'verify-password-dialog.component.html',
})
export class VerifyPasswordDialogComponent implements OnInit {
    passwordForm: FormGroup;
    hidePassword = true;
    loading = false;

    constructor(private fb: FormBuilder,
                private userServiceProvider: UserServiceProvider,
                private snackBar: MatSnackBar,
                private dialog: MatDialog,
                public verifyPasswordDialog: MatDialogRef<VerifyPasswordDialogComponent>) {
    }

    ngOnInit(): void {
        this.passwordForm = this.fb.group({
            password: [null, Validators.required]
        });
    }

    onSubmitPassword(): void {
        if (this.passwordForm.invalid) {
            return;
        }
        this.loading = true;
        this.userServiceProvider.default().validatePassword(this.passwordForm.get('password').value).toPromise().then(res => {
            if (res) {
                let refDialog = this.dialog.open(TwoFactorDialogComponent, {
                    width: '500px'
                });
                refDialog.afterOpened().toPromise().then(() => {
                    this.verifyPasswordDialog.close();
                })
                refDialog.afterClosed().toPromise().then(() => {
                    this.loading = false;
                });
            }
        }).catch(err => {
            this.loading = false;
            this.snackBar.open(err.error.msg, null, {duration: 2500});
        });
    }
}
